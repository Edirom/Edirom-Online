xquery version "3.0";
(:
  Edirom Online
  Copyright (C) 2011 The Edirom Project
  http://www.edirom.de

  Edirom Online is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  Edirom Online is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with Edirom Online.  If not, see <http://www.gnu.org/licenses/>.

  ID: $Id: getSummary.xql 1455 2012-10-11 10:42:55Z daniel $
:)

import module namespace eutil="http://www.edirom.de/xquery/util" at "../xqm/util.xqm";
import module namespace edition="http://www.edirom.de/xquery/edition" at "../xqm/edition.xqm";

declare namespace request="http://exist-db.org/xquery/request";
declare namespace mei="http://www.music-encoding.org/ns/mei";
declare namespace tei="http://www.tei-c.org/ns/1.0";
declare namespace edirom_image="http://www.edirom.de/ns/image";
declare namespace xmldb="http://exist-db.org/xquery/xmldb";

declare option exist:serialize "method=xhtml media-type=text/html omit-xml-declaration=yes indent=yes";

declare variable $imageWidth := 400;

declare function local:generateRespSentence($names) {
    string-join(
        for $name in $names
        return
            if(matches($name, '(s|z)$'))
            then(concat($name, "'"))
            else(concat($name, 's'))
     , ' und ')
};

declare function local:getSourceSummary($doc, $facsBasePath, $server) {
    let $work := doc($doc//mei:relation[@rel='isEmbodimentOf'][1]/substring-before(@target, '#'))
    let $title := $work//mei:work/mei:titleStmt/mei:title[1]/text()
    let $resp := local:generateRespSentence($work//mei:work/mei:titleStmt/mei:respStmt/*[local-name() != 'resp']/text())
    let $expression := $work/id($doc//mei:relation[@rel='isEmbodimentOf'][1]/substring-after(@target, '#'))/string(@label)
    return

    <div class="summaryViewSource">
        <h1>
            {
                if($doc//mei:source/mei:titleStmt/mei:title[@type eq 'main'])
                then($doc//mei:source/mei:titleStmt/mei:title[@type eq 'main'][1]//text())
                else($doc//mei:source/mei:titleStmt/mei:title[1]//text())
            }
            {
                if($doc//mei:source//mei:identifier[@type eq 'siglum'])
                then(concat(' ', $doc//mei:source//mei:identifier[@type eq 'siglum'][1]//text()))
                else()
            }
        </h1>
        
        <div class="metaData">
            
            <div class="work metaRow">
                Zur Fassung "{$expression}" von {$resp} "{$title}".
            </div>
            
            {
                for $name in $doc//mei:source/mei:titleStmt/mei:respStmt/mei:*[local-name() eq 'persName' or local-name() eq 'name']
                return
                    <div class="resp metaRow">
                        <div class="key">
                        {
                            if($name/@role)
                            then($name/string(@role))
                            else(string('Responsible'))
                        }
                        </div>
                        <div class="value">{$name/text()}</div>
                    </div>
                    
            }
            
            {
                for $date in $doc//mei:source/mei:pubStmt/mei:date | $doc//mei:source/mei:history/mei:creation/mei:date[1]
                return
                    <div class="dating metaRow">
                        <div class="key">Dating</div>
                        <div class="value">{local:getDateValue($date)}</div>
                    </div>
                    
            }
            
            {
                (: probably a Manuscript… :)
                if(count($doc//mei:source/mei:itemList/mei:item) eq 1)
                then(
                    for $item in $doc//mei:source/mei:itemList/mei:item
                    return
                        if($item/mei:physDesc/mei:repository)
                        then(
                            <div class="library metaRow">
                                <div class="key">Repository</div>
                                <div class="value">
                                {
                                    $item/mei:physDesc/mei:repository[1]/text(),
                                    if($item/mei:physDesc/mei:physLoc)
                                    then(
                                        <br/>,$item/mei:physDesc/mei:physLoc[1]/text()
                                    )
                                    else()
                                }
                                </div>
                            </div>
                        )
                        else()
                )
                else()
            }

            {
                if($doc//mei:source/mei:pubStmt//mei:*[@role eq 'publisher'])
                then(
                    <div class="publisher metaRow">
                        <div class="key">Publisher</div>
                        <div class="value">{$doc//mei:source/mei:pubStmt//mei:*[@role eq 'publisher'][1]/text()}</div>
                    </div>
                )
                else()
            }
            
            {
                if($doc//mei:source/mei:physDesc/mei:plateNum)
                then(
                    <div class="plateNum metaRow">
                    <div class="key">Plate number</div>
                    <div class="value">{$doc//mei:source/mei:physDesc/mei:plateNum[1]/text()}</div>
                </div>
                )
                else()
            }

        </div>

        {
            if($doc//mei:source//mei:titlePage/@facs)
            then(
            	if($server = 'digilib') then (           	
        		<div class="titlePage">
                    <img src="{local:getImagePath($facsBasePath, $doc//mei:source//mei:titlePage[1]/@facs, $imageWidth)}"/>
                </div>
            	)
                else()
            )
            else if($doc//mei:facsimile/mei:surface/mei:graphic)
            then(
            if($server = 'digilib') then ( 
            	<div class="titlePage">
                    <img src="{local:getImagePath($facsBasePath, $doc//mei:facsimile/mei:surface[1]/mei:graphic[1]/@target, $imageWidth)}"/>
                </div>
            	)
                else()
            )
            else if($doc//mei:source//mei:titlePage)
            then(
                <div class="titlePage">
                    (: TODO: transformieren :)
                    {$doc//mei:source//mei:titlePage[1]/text()}
                </div>
            )
            else()
        }
    </div>
};

declare function local:getImagePath($basePath, $uri, $width) {
    if(starts-with($uri, 'xmldb:exist'))
    then(
        let $imagePath := doc($uri)/edirom_image:image/@file
        return
            concat($basePath, $imagePath, '?dw=', $width, '&amp;amp;mo=fit')
    )
    else(
        concat($basePath, $uri, '?dw=', $width, '&amp;amp;mo=fit')
    )
};

declare function local:getDateValue($date) {
    
    if($date/@reg)
    then($date/string(@reg)) (: TODO: prettify date :)
    
    else if($date/@startdate and $date/@enddate)
    then(concat('From ', $date/@startdate, ' until ', $date/@enddate))
    
    else if($date/@notbefore and $date/@notafter)
    then(concat('Not before ', $date/@notbefore, ', not after ', $date/@notafter))
    
    else if($date/@startdate and $date/@notafter)
    then(concat('From ', $date/@startdate, ', not after ', $date/@notafter))
        
    else if($date/@notbefore and $date/@enddate)
    then(concat('Not before ', $date/@notbefore, ', until ', $date/@enddate))
    
    else if($date/@startdate)
    then(concat('From ', $date/@startdate))
    
    else if($date/@enddate)
    then(concat('Until ', $date/@enddate))
    
    else if($date/@notbefore)
    then(concat('Not before ', $date/@notbefore))
    
    else if($date/@notafter)
    then(concat('Not after ', $date/@notafter))
    
    else if(local-name($date) eq 'date')
    then($date/text())
    
    else(string(""))
};

declare function local:getTeiDateValue($date) {
    
    if($date/@when)
    then($date/string(@when)) (: TODO: prettify date :)
    
    else if($date/@from and $date/@to)
    then(concat('From ', $date/@from, ' to ', $date/@to))
    
    else if($date/@notBefore and $date/@notAfter)
    then(concat('Not before ', $date/@notbefore, ', not after ', $date/@notafter))
    
    else if($date/@from and $date/@notAfter)
    then(concat('From ', $date/@from, ', not after ', $date/@notAfter))
        
    else if($date/@notBefore and $date/@to)
    then(concat('Not before ', $date/@notBefore, ', to ', $date/@to))
    
    else if($date/@from)
    then(concat('From ', $date/@from))
    
    else if($date/@to)
    then(concat('Until ', $date/@to))
    
    else if($date/@notBefore)
    then(concat('Not before ', $date/@notBefore))
    
    else if($date/@notAfter)
    then(concat('Not after ', $date/@notAfter))
    
    else if(local-name($date) eq 'date')
    then($date/text())
    
    else(string(""))
};

declare function local:getWorkSummary($doc, $docUri) {
    <div class="summaryViewWork">
        <div class="titleBox">
            
            <div class="resps">
            {
                for $resp in $doc//mei:work/mei:titleStmt/mei:respStmt/mei:*[not(local-name() eq 'resp') and @role]
                return (
                    <div class="label">{concat(upper-case(substring($resp/@role,1,1)),substring($resp/@role,2))}</div>,
                    <div class="name">{$resp/text()}</div>
                )
            }
            </div>
            
            <h1>
            {
                if($doc//mei:work/mei:titleStmt/mei:title[@type eq 'main'])
                then($doc//mei:work/mei:titleStmt/mei:title[@type eq 'main'][1]//text())
                else($doc//mei:work/mei:titleStmt/mei:title[1]//text())
            }
            </h1>
            
            <div class="identifiers">
            {
                for $ident in $doc//mei:work/mei:identifier
                return 
                    <div class="identifier">
                        <div class="label">{concat(upper-case(substring($ident/@type,1,1)),substring($ident/@type,2))}</div>
                        <div class="value">{$ident/text()}</div>
                    </div>
            }
            </div>
            
        </div>    
    
        <div class="expressions">
        {
            for $expression in $doc//mei:work/mei:expressionList/mei:expression
            let $label := $expression/string(@label)
            let $target := concat($docUri, '#', $expression/@xml:id)
            let $manifestations := for $source in //mei:relation[@target = $target and @rel = 'isEmbodimentOf']/root()
                                    return
                                        <div class="manifestation">{$source//mei:source/mei:titleStmt/mei:title[1]/text()}</div>
            return
                <div class="expression"><h1>{$label}</h1><div class="manifestations">{$manifestations}</div></div>
        }
        </div>
    </div>
};

declare function local:getTextSummary($doc, $facsBasePath){
(:title resp repository/bibl dating:)
    let $title := $doc//tei:titleStmt/tei:title[1]/text()
    return
     <div class="summaryViewText">
        <h1>
            {
                if(false()(:$doc//tei:titleStmt/tei:title[@level eq 'a' or @level eq 'm']:)) (: TODO: Prüfen, warum die Abfrage nicht mehr klappt:)
                then(string-join($doc//tei:titleStmt/tei:title[@level eq 'a' or @level eq 'm']//text(), '. '))
                else($title)
            }
        </h1>
        
        <div class="metaData">
        {
            if($doc//tei:titleStmt/tei:title[@level eq 's'])
            then(
                <div class="series metaRow">
                    <div class="key">Reihe</div>
                    <div class="value">                       
                        {$doc//tei:titleStmt/tei:title[@level eq 's']//text()}
                   </div>
                </div>
            )
            else()
        }
        
        {
            if($doc//tei:titleStmt/tei:editor)
            then(
                <div class="editor metaRow">
                    <div class="key">{if(count($doc//tei:titleStmt/tei:editor) gt 1)then('Herausgeber')else('Herausgeber')}</div>(:TODO: get keyValue:)
                    <div class="value">                       
                        {$doc//tei:titleStmt/tei:title[@level eq 's']//text()}
                   </div>
                </div>
            )
            else()
        }
         
        {
            for $respStmt in $doc//tei:editionStmt/tei:respStmt
            return
                <div class="resp metaRow">
                    <div class="key">
                    {
                        if($respStmt/tei:resp != '')
                        then($respStmt/data(tei:resp))
                        else(string('Responsible'))
                    }
                    </div>
                    <div class="value">
                    {
                        for $name at $i in $respStmt/tei:*[local-name() eq 'persName' or local-name() eq 'name' or local-name() eq 'orgName']
                        let $numNames := count($respStmt/tei:*[local-name() eq 'persName' or local-name() eq 'name' or local-name() eq 'orgName'])
                        return
                            if($i < $numNames)
                            then($name, ', ')
                            else($name)
                    }
                    </div>
                </div>
                
        }
        
        {
            for $date in $doc//tei:publicationStmt/tei:date
            return
                <div class="dating metaRow">
                    <div class="key">Dating</div>
                    <div class="value">{local:getTeiDateValue($date)}</div>
                </div>
                
        }
        
        {
            if($doc//tei:sourceDesc/tei:msDesc//tei:repository)
            then(
                        <div class="library metaRow">
                            <div class="key">Repository</div>
                            <div class="value">
                            {
                                $doc//tei:sourceDesc/tei:msDesc//tei:repository/text()
                            }
                            </div>
                        </div>
            )
            else(),
            if($doc//tei:sourceDesc/tei:msDesc//tei:idno)
            then(
                        <div class="library metaRow">
                            <div class="key">Signatur</div>
                            <div class="value">
                            {
                                $doc//tei:sourceDesc/tei:msDesc//tei:idno/text()
                            }
                            </div>
                        </div>
            )
            else()
        }

        {
            if($doc//tei:publicationStmt/tei:publisher)
            then(
                <div class="publisher metaRow">
                    <div class="key">Publisher</div>
                    <div class="value">{$doc//tei:publicationStmt/tei:publisher[1]/text()}</div>
                </div>
            )
            else()
        }
        </div>
        
        {(:TODO: facsimile auswerten:)
            if($doc//tei:titlePage)
            then(
                <div class="titlePage">
                    {(: TODO: transformieren :)$doc//tei:text//tei:titlePage/text()}
                </div>
            )
            else()
        }

    </div>
};

declare function local:getImagePath($server, $edition) {
	(:let $server :=  eutil:getPreference('image_server', request:get-parameter('edition', '')) :)
	
	 let $i_path := if($server = 'leaflet')
             then (eutil:getPreference('leaflet_prefix', $edition))
            else(eutil:getPreference('image_prefix', $edition))
                            
     return $i_path
     
};

declare function local:getImagePathLeaflet($doc) {
  if($doc//mei:source//mei:titlePage/@facs)
            then(
            	let $tile_path := $doc//mei:source//mei:titlePage[1]/@facs
            	return $tile_path
            )
            else if($doc//mei:facsimile/mei:surface/mei:graphic)
            then(
            	let $tile_path := $doc//mei:facsimile/mei:surface[1]/mei:graphic[1]/@target
            	let $width := $doc//mei:facsimile/mei:surface[1]/mei:graphic[1]/@width
            	let $height := $doc//mei:facsimile/mei:surface[1]/mei:graphic[1]/@height
            	return concat($tile_path, '§', $width, '§', $height)
            
            )
            else() 
};

declare function local:getOutput($doc, $imagePrefix, $server, $imagePath, $type, $docUri){
	let $test := <div>
	<div>{
		if($type = 'work')then(local:getWorkSummary($doc, $docUri))
		else(local:getSourceSummary($doc, $imagePrefix, $server))
}</div>
	<p>{$imagePath}</p></div>
	return $test
};


let $uri := request:get-parameter('uri', '')
let $type := request:get-parameter('type', '')
let $docUri := if(contains($uri, '#')) then(substring-before($uri, '#')) else($uri)
let $doc := eutil:getDoc($docUri)
let $edition := request:get-parameter('edition', '')
let $server :=  eutil:getPreference('image_server', $edition) 
let $imagePrefix := local:getImagePath($server, $edition)
(:eutil:getPreference('image_prefix', request:get-parameter('edition', '')):)
let $imagePath := local:getImagePathLeaflet($doc)
(:$doc//mei:facsimile/mei:surface[1]/mei:graphic[1]/@target:)
(:local:getImagePathLeaflet($imagePrefix, $doc//mei:facsimile/mei:surface[1]/mei:graphic[1]/@target):)

return
    if($type = 'work')
    then(
		if($server = 'leaflet')
    		then(local:getOutput($doc, $imagePrefix, $server, $imagePath, $type, $docUri))
    		else(local:getWorkSummary($doc, $docUri))

	)
    else if($type = 'source')
    then(
    	if($server = 'leaflet')
    	then(local:getOutput($doc, $imagePrefix, $server, $imagePath, $type, $docUri))
    	else(local:getSourceSummary($doc, $imagePrefix, $server))
    )
    else if($type = 'text')
    then(local:getTextSummary($doc, $imagePrefix))
    else()
