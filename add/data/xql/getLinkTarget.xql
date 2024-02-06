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

  ID: $Id: getLinkTarget.xql 1334 2012-06-14 12:40:33Z daniel $
:)

import module namespace eutil="http://www.edirom.de/xquery/util" at "../xqm/util.xqm";

declare namespace request="http://exist-db.org/xquery/request";
declare namespace mei="http://www.music-encoding.org/ns/mei";
declare namespace tei="http://www.tei-c.org/ns/1.0";
declare namespace xmldb="http://exist-db.org/xquery/xmldb";
declare namespace conf="https://www.maxreger.info/conf";

declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";

import module namespace functx = "http://www.functx.com" at "../xqm/functx-1.0-nodoc-2007-01.xq";

declare variable $lang := request:get-parameter('lang', '');

declare function local:getLocalizedMEITitle($node) {
  let $nodeName := local-name($node)
  let $titleMain := ($node/mei:title[@xml:lang = $lang]/mei:title[@type='main']/text() |  $node/mei:title[@xml:lang = $lang]/mei:titlePart[@type='main']/text())
  let $titlePerf := $node/mei:title[@xml:lang = $lang]/mei:title[@type='perf']/text()
  let $identifierOpus := $node/../mei:identifier[@type='opus']/text()
  let $identifierWoo := $node/../mei:identifier[@type='woo']/text()
  let $identifierNo := $node/../mei:identifier[@type='no']/text()
  let $identifierGenre := $node/../mei:identifier[@type='genre']/text()
  let $titleNew := if($identifierOpus and $identifierNo)
                    then(concat($titleMain,' op. ',$identifierOpus,' Nr.',$identifierNo))
                    else  if($identifierOpus)
                    then(concat($titleMain,' op. ',$identifierOpus))
                    else if($identifierWoo and $identifierNo)
                    then(concat($titleMain,' WoO ',$identifierGenre,'/',$identifierWoo,' Nr.',$identifierNo))
                    else if($identifierWoo)
                    then(concat($titleMain,' WoO ',$identifierGenre,'/',$identifierWoo))
                    else()
  return
      if ($titleNew)
      then ($titleNew)
      else if ($lang = $node/mei:title/@xml:lang)
      then ($node/mei:title[@xml:lang = $lang]/text())
      else ($node/mei:title[1]/text())
};

declare function local:getLocalizedTEITitle($node) {
  let $nodeName := local-name($node)
  return
      if ($lang = $node/tei:title/@xml:lang)
      then $node/tei:title[@xml:lang = $lang]/text()
      else $node/tei:title[1]/text()

};


declare function local:getViews($type, $docUri, $doc) {
    
    string-join((
        (: SummaryView :)
(:        concat("{type:'summaryView',uri:'", $docUri, "'}"),:)
        
        (: HeaderView :)
(:        if($doc//mei:meiHead or $doc//tei:teiHeader) then(concat("{type:'headerView',uri:'", $docUri, "'}")) else(),:)

        (: SourceDescriptionView :)
(:        if($doc//mei:annot[@type='descLink']) then(concat("{type:'textView', label: 'Quellenbeschreibung', uri:'", ($doc//mei:annot[@type='descLink'])[1]/@plist, "'}")) else(),:)
        
        (: SourceView :)
        if($doc//mei:facsimile//mei:graphic[@type='facsimile']) then(concat("{type:'sourceView', defaultView:true, uri:'", $docUri, "'}")) else(),

        (: AudioView :)
(:        if($doc//mei:recording) then(concat("{type:'audioView', defaultView:true, uri:'", $docUri, "'}")) else(),:)

		(: VerovioView :)
(:        if($doc//mei:body//mei:measure and $doc//mei:body//mei:note) then(concat("{type:'verovioView',uri:'", $docUri, "'}")) else(),:)

        (: TextView :)
        if($doc//tei:body[matches(.//text(), '[^\s]+')]) then(concat("{type:'textView', defaultView:true, uri:'", $docUri, "'}")) else(),
        
        (: Music TextView :)
(:        if($doc//mei:div[1][matches(.//text(), '[^\s]+')]) then(concat("{type:'textView', defaultView:true, uri:'", $docUri, "'}")) else(),:)

        (: SourceView :)
        if($doc//tei:facsimile//tei:graphic) then(concat("{type:'facsimileView', uri:'", $docUri, "'}")) else(),

        (: TextFacsimileSplitView :)
(:        if($doc//tei:facsimile//tei:graphic and $doc//tei:pb[@facs]) then(concat("{type:'textFacsimileSplitView', uri:'", $docUri, "'}")) else(),:)

        (: AnnotationView :)
        if($doc//mei:annot[@type='editorialComment']) then(concat("{type:'annotationView', defaultView:true, uri:'", $docUri, "'}")) else(),
        
        (: SearchView :)
(:        if($doc//mei:note) then(concat("{type:'searchView',uri:'", $docUri, "'}")) else(),
:)

        (: iFrameView, RWA :)
        if($type = 'html') then(concat("{type:'iFrameView', label: '", 'HTML' ,"' ,uri:'", $docUri, "'}")) else(),
        
        (: iFrameView, generic :)
(:        if($type = 'html') then(concat("{type:'iFrameView', label: '", $doc//head/data(title) ,"' ,uri:'", $docUri, "'}")) else(),:)
        
        (: XmlView :)
(:        concat("{type:'xmlView',uri:'", $docUri, "'}"),:)

        (: SourceDescriptionView :)
        if($doc//mei:annot[@type='descLink']) then(concat("{type:'xmlView', label: 'XML Quellenbeschreibung', uri:'", ($doc//mei:annot[@type='descLink'])[1]/@plist, "'}")) else()
    ), ',')
};

let $workID := request:get-parameter('workId', '')

let $uri := request:get-parameter('uri', '')
let $uriParams := if(contains($uri, '?')) then(substring-after($uri, '?')) else('')
let $uri := if(contains($uri, '?')) then(replace($uri, '[?&amp;](term|path)=[^&amp;]*', '')) else($uri)
let $docUri := if(contains($uri, '#')) then(substring-before($uri, '#')) else($uri)
let $internalId := if(contains($uri, '#')) then(substring-after($uri, '#')) else()
let $internalIdParam := if(contains($internalId, '?')) then(concat('?', substring-after($internalId, '?'))) else('')
let $internalId := if(contains($internalId, '?')) then(substring-before($internalId, '?')) else($internalId)

let $term := if(contains($uriParams, 'term='))then(substring-after($uriParams, 'term='))else()
let $term := if(contains($term, '&amp;'))then(substring-before($term, '&amp;'))else($term)

let $path := if(contains($uriParams, 'path='))then(substring-after($uriParams, 'path='))else()
let $path := if(contains($path, '&amp;'))then(substring-before($path, '&amp;'))else($path)

let $doc := eutil:getDoc($docUri)
let $internal := $doc/id($internalId)

(: Specific handling of virtual measure IDs for parts in OPERA project :)
let $internal := if(exists($internal))then($internal)else(
                        if(starts-with($internalId, 'measure_') and $doc//mei:parts)
                        then(
                            let $mdivId := functx:substring-before-last(substring-after($internalId, 'measure_'), '_')
                            let $measureN := functx:substring-after-last($internalId, '_')
                            return
                                ($doc/id($mdivId)//mei:measure[@n eq $measureN])[1]
                        )
                        else($internal)
                    )

let $type := 
             (: Work :)
             if(exists($doc//mei:mei) and exists($doc//mei:work) and not(exists($doc//mei:perfMedium)))
             then(string('work'))
             
             (: Recording :)
             else if(exists($doc//mei:mei) and exists($doc//mei:recording))
             then(string('recording'))
             
             (: Source / Score :)
             else if(exists($doc//mei:mei) and exists($doc//mei:source))
             then(string('source'))
             
             
             (: Text :)
             else if(exists($doc/tei:TEI))
             then(string('text'))
             
             (: HTML :)
             else if(exists($doc/html))
             then(string('html'))
             
             else if(contains($docUri, '.html'))
             then(string('html'))
             
             else if(contains($docUri, '$encyclo'))
             then(string('html'))
             
             else(string('unknown'))
             
let $configResource := doc('xmldb:exist:///db/apps/mriExistDBconf/config.xml')
let $mrpUrl := $configResource//conf:mrpURL
let $getEdiromObjectWindowTitleUrl := concat($mrpUrl, '/cat/rest/getEdiromObjectWindowTitle.xql?workID=', $workID, '&amp;sourceID=', substring-before(functx:substring-after-last($uri, '/'), '.xml'), '&amp;lang=', $lang)


let $title := (: Work :)
              if(exists($doc//mei:mei) and exists($doc//mei:work) and not(exists($doc//mei:perfMedium)))
              (: RWA specific implementation, starts here: :)
              then(if ($lang = 'de') then('Lesarten') else ('Critical remarks'))
              (: RWA specific implementation, ends here. :)
              (:then(local:getLocalizedMEITitle($doc//mei:work/mei:titleStmt)[1]):)
              
              (: Recording :)
              else if(exists($doc//mei:mei) and exists($doc//mei:recording))
              then(local:getLocalizedMEITitle($doc//mei:fileDesc/mei:titleStmt[1]))
              
              (: Edition :)
              else if (exists($doc//mei:mei) and starts-with($doc//mei:mei/@xml:id, 'rwa_edition'))
              then(normalize-space(local:getLocalizedMEITitle($doc//mei:source/mei:titleStmt[1])))
              
              (: Source :)
              else if(exists($doc//mei:mei) and (exists($doc//mei:source) or exists($doc//mei:manifestation)))
              (: then(concat(normalize-space(local:getLocalizedMEITitle($doc//mei:source/mei:titleStmt[1])),' | ',normalize-space($doc//mei:source//mei:identifier[@type='shelfmark']))) :)
              then(hc:send-request(<hc:request href="{$getEdiromObjectWindowTitleUrl}" method="get"/>)[2])
              
              (: Text :)
              else if(exists($doc/tei:TEI))
              then(local:getLocalizedTEITitle($doc//tei:fileDesc/tei:titleStmt[1]))
              
              else if($type = 'html' and contains($docUri, 'rwaEncyclo'))
              then(if ($lang = 'de') then('Umfeld der Werke') else ('Context of the Works'))
              
              else if($type = 'html' and contains($docUri, 'rwaTextComp'))
              then(if ($lang =  'de') then('Textvergleich') else ('Text comparison'))
              
              (: HTML :)
              else if($type = 'html')
              then($doc//head/data(title))
             
              else(string('unknown'))
              
let $internalIdType := if(exists($internal))
                       then(local-name($internal))
                       else('unknown')

return 
    concat("{",
          "type:'", $type, 
          "',title:'", $title, 
          "',doc:'", $docUri,
          "',views:[", local:getViews($type, $docUri, $doc), "]",
          ",internalId:'", $internalId, $internalIdParam, 
          "',term:'", $term,
          "',path:'", $path,
          "',internalIdType:'", $internalIdType, "'}")