xquery version "3.1";
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

  ID: $Id: getAnnotationPreviews.xql 1455 2012-10-11 10:42:55Z daniel $
:)

(:~
    Returns the HTML for a specific annotation for an AnnotationView.
    
    @author <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
:)
import module namespace annotation="http://www.edirom.de/xquery/annotation" at "../xqm/annotation.xqm";
import module namespace source="http://www.edirom.de/xquery/source" at "../xqm/source.xqm";
import module namespace teitext="http://www.edirom.de/xquery/teitext" at "../xqm/teitext.xqm";
import module namespace eutil = "http://www.edirom.de/xquery/util" at "../xqm/util.xqm";
import module namespace edition="http://www.edirom.de/xquery/edition" at "../xqm/edition.xqm";
import module namespace mriSource="https://maxreger.info/mriSource" at "/db/apps/mriCat/modules/mriSource.xqm";


import module namespace functx = "http://www.functx.com" at "../xqm/functx-1.0-nodoc-2007-01.xq";

import module namespace console="http://exist-db.org/xquery/console";

declare namespace exist="http://exist.sourceforge.net/NS/exist";
declare namespace request="http://exist-db.org/xquery/request";
declare namespace mei="http://www.music-encoding.org/ns/mei";
declare namespace conf="https://www.maxreger.info/conf";

declare namespace xmldb="http://exist-db.org/xquery/xmldb";

declare option exist:serialize "method=xhtml media-type=text/html omit-xml-declaration=yes indent=yes";

declare variable $lang := request:get-parameter('lang', '');

declare variable $imageWidth := 600;
declare variable $imageBasePath := eutil:getPreference('image_prefix', request:get-parameter('edition', ''));

declare function local:getParticipants($annot as element()) as xs:string* {
    
    let $participants := tokenize($annot/string(@plist), ' ')
    let $docs := distinct-values(for $p in $participants return substring-before($p, '#'))
    return
        for $doc in $docs
        return
            
            if(source:isSource($doc))
            then(local:getSourceParticipants($participants[starts-with(., $doc)], $doc))
            
            else if(teitext:isText($doc))
            then(local:getTextParticipants($participants[starts-with(., $doc)], $doc))
            
            else()
};

declare function local:getTextParticipants($participants as xs:string*, $doc as xs:string) as xs:string* {

    for $participant in $participants
    let $id := substring-after($participant, '#')
    let $hiddenData := concat('uri:', $doc, '__$$__participantId:', $id)
    return
        local:toJSON('text', 'Textstelle', (), (), (), teitext:getLabel($doc), (), (), (), $hiddenData, normalize-space(local:getTextNoteContent($doc, $id)), $participant) (: TODO: "Textstelle" durch sinnvolleres ersetzen :)
};

declare function local:getTextNoteContent($doc as xs:string, $id as xs:string) as xs:string {
    let $elem := doc($doc)/id($id)
    let $content := data($elem)
    return
        if(string-length($content) gt 0)
        then($content)
        else(local:getTextNotePrecedingContent($elem))
};

declare function local:getTextNotePrecedingContent($elem as element()) as xs:string {
    let $preceding := $elem/preceding-sibling::*[1]
    let $content := data($preceding)
    return
        if(string-length($content) gt 0)
        then($content)
        else(local:getTextNotePrecedingContent($preceding))
};

declare function local:getSourceParticipants($participants as xs:string*, $doc as xs:string) as xs:string* {
        let $uri := request:get-parameter('uri', '') (: TODO remove temporary workaround :)
        let $docUri := substring-before($uri, '.xml#')
        let $workID := functx:substring-after-last($docUri, '/')
       
        let $combs := local:groupParticipants($participants, $doc)
        
        return
            
            for $comb in distinct-values($combs)
            let $partIndices := tokenize($comb,'-')
            let $elems := for $p in distinct-values($partIndices)
                            let $elem := local:getElement($participants[starts-with(., $doc)][number($p)])
                            order by count($elem/preceding::*)
                            return $elem
            let $zones := for $elem in $elems return local:getZone($elem)
            
            let $type := local:getType($zones)
            let $label := local:getItemLabel($elems)
            let $mdiv := ''(: TODO if($elem/ancestor-or-self::mei:mdiv) then($elem/ancestor-or-self::mei:mdiv/@label) else(''):)
            let $page := if($zones[1]/parent::mei:surface/@label != '') then($zones[1]/parent::mei:surface/@label) else($zones[1]/parent::mei:surface/@n)
            
            let $sourceID := functx:substring-after-last(substring-before($doc, '.xml'), '/')
            let $sourceIdent := mriSource:getTitleData($sourceID, $workID, $lang)
            let $sourceType      := $sourceIdent?type
            let $sourceSiglum    := $sourceIdent?siglum
            
            let $source := $sourceType
            let $siglum := $sourceSiglum
            let $part := string-join(distinct-values(for $e in $elems return $e/ancestor::mei:part/@label),'-')
            
            let $graphic := $zones[1]/../mei:graphic[@type = 'facsimile']
            let $imgWidth := number($graphic/@width)
            let $imgHeight := number($graphic/@height)
    
            let $digilibBaseParams := local:getImageAreaPath($imageBasePath, $graphic)
            
            let $rect := local:getBoundingZone($zones)
            
            let $digilibSizeParams := local:getImageAreaParams($rect, $imgWidth, $imgHeight)
            let $hiddenData := concat('{width:', number($rect/@lrx) - number($rect/@ulx), ', height:', number($rect/@lry) - number($rect/@uly), ', x:', number($rect/@ulx), ', y:', number($rect/@uly), '}')
            let $linkUri := concat('xmldb:exist://', document-uri($graphic/root()), '#', local:getSourceLinkTarget($elems, $zones))
            
            where not($elems[1]/root()//mei:availability[@type = 'rwaOnline'] = 'hidden')
            
            return
                local:toJSON($type, $label, $mdiv, $part, $page, $source, $siglum, $digilibBaseParams, $digilibSizeParams, $hiddenData, (), $linkUri)
};

declare function local:getSourceLinkTarget($elems as node()*, $zones as node()*) as xs:string {
    if(local-name($elems[1]) eq 'zone')
    then($elems[1]/string(@xml:id))
    else if(count($elems) > 1)
    then(
        let $elemsSorted := for $elem in $elems
                            order by count($elem/preceding::*)
                            return $elem
        return concat($elemsSorted[1]/@xml:id, '?tstamp2=', (count($elems) -1), 'm+0') 
    )
    else($elems[1]/string(@xml:id))
    
};

declare function local:groupParticipants($participants as xs:string*, $doc as xs:string) as xs:string* {

    let $elems := for $p in $participants
                    let $id := substring-after($p, '#')
                    return doc($doc)/id($id)
                    
    let $zones := for $elem in $elems
                    return local:getZone($elem)
    
    let $combs := for $p at $i in $participants
                  return 
                    local:getCombinations($elems, $zones, $i, count($zones))
        
    return
        reverse(
            for $comb at $i in reverse($combs)
            let $contained := for $n in (1 to count($combs) - $i)
                                return
                                    if(contains($combs[$n], $comb))
                                    then(1)
                                    else(0)
            return
                if(exists(index-of($contained, 1)))
                then()
                else($comb)
        )
};

declare function local:getCombinations($elems as element()*, $zones as element()*, $i as xs:int, $total as xs:int) as xs:string {
    
    let $currentZone := $zones[$i]
    let $currentElem := $elems[$i]
    return
        if(local-name($currentElem) eq 'measure' or local-name($currentElem) eq 'staff')
        then(
            string-join((
                string($i),
                for $n in ($i + 1 to $total)
                return
                    if((local-name($elems[$n]) eq 'measure' or local-name($elems[$n]) eq 'staff') and local:compareZones($currentZone, $zones[$n]))
                    then(local:getCombinations($elems, $zones, $n, $total))
                    else()
            ),'-')
        )
        else(
            string($i)
        )
};

declare function local:compareZones($zone1 as element(), $zone2 as element()) as xs:boolean {

    let $samePage := deep-equal($zone1/.., $zone2/..)
    let $overlapping := not(number($zone1/@ulx) gt number($zone2/@lrx) or number($zone1/@lrx) lt number($zone2/@ulx) or number($zone1/@uly) gt number($zone2/@lry) or number($zone1/@lry) lt number($zone2/@uly))
    return
        $samePage and $overlapping
};

declare function local:getElement($uri as xs:string) as element() {
    let $doc := substring-before($uri, '#')
    let $id := substring-after($uri, '#')
    
    return doc($doc)/id($id)
};

(: TODO: in Modul auslagern :)
(:~
    Gets the zone holding the graphical representation of an element
    
    @param $elem The element for which the graphical representation shall be found
    
    @return The zone element
:)
declare function local:getZone($elem as element()) as element()? {
    if($elem/@facs)
    then(
        let $zoneId := replace($elem/@facs, '^#', '')
        return $elem/root()/id($zoneId)
    )
    else(
        $elem
    )
};

declare function local:getType($zones as element()*) as xs:string {
    $zones[1]/@type (: TODO: besser machen :)
};

declare function local:getBoundingZone($zones as element()*) as element() {
    <mei:zone ulx="{min($zones/@ulx)}" uly="{min($zones/@uly)}" lrx="{max($zones/@lrx)}" lry="{max($zones/@lry)}"/>
};

(: TODO: in Modul auslagern :)
(:~
    
:)
declare function local:getImageAreaPath($basePath as xs:string, $graphic as element()?) as xs:string {
    
    let $imagePath := $graphic/@target
    let $imgWidth := number($graphic/@width)
    let $imgHeight := number($graphic/@height)
    
    return
        concat($basePath, $imagePath, '?')
};

(: TODO: in Modul auslagern :)
(:~
    This function generates an image path for a specific zone on an image.
    Based on a path prefix and a width.
    
    @param $basePath The base path prefix for the image databse
    @param $zone The zone with coordiantes on the image
    @param $width The width the image should be loaded with
    
    @return A URL pointing to an image based as xs:string
:)
declare function local:getImageAreaParams($zone as element()?, $imgWidth as xs:int, $imgHeight as xs:int) as xs:string {
    let $graphic := $zone/../mei:graphic[@type = 'facsimile']
    
    let $imgX := number($zone/@ulx)
    let $imgY := number($zone/@uly)
    let $w := number($zone/@lrx) - number($zone/@ulx)
    let $h := number($zone/@lry) - number($zone/@uly)
    
    let $wx := $imgX div $imgWidth
    let $wy := $imgY div $imgHeight
    let $ww := $w div $imgWidth
    let $wh := $h div $imgHeight
    
    return
        concat('&amp;amp;wx=', $wx, '&amp;amp;wy=', $wy, '&amp;amp;ww=', $ww, '&amp;amp;wh=', $wh, '&amp;amp;mo=fit')
};

declare function local:getItemLabel($elems as element()*) as xs:string {
    
    string-join(
    for $type in distinct-values(for $elem in $elems return local-name($elem))
    let $items := for $elem in $elems return if(local-name($elem) eq $type) then($elem) else()
        return 
            if(local-name($items[1]) eq 'measure')
            then(
                if(count($items) gt 1)
                then(eutil:getLanguageString('Bars_from_to', ($items[1]/@n, $items[last()]/@n)))
                else(eutil:getLanguageString('Bar_n', ($items[1]/@n)))
            )
            else
            
            if(local-name($items[1]) eq 'staff')
            then(
                if(count($items) gt 1)
                then(
                    
                    let $measureNs := distinct-values($items/ancestor::mei:measure/@n)
                    
                    let $label := if ($lang = 'de') 
                                    then (if(count($measureNs) gt 1) then (concat('Takte ',$measureNs[1], '-', $measureNs[last()])) else (concat('Takt ', $measureNs[1])))
                                    else (if(count($measureNs) gt 1) then (concat('Bars ',$measureNs[1], '-', $measureNs[last()])) else (concat('Bar ', $measureNs[1])))
                                    
                    return 
                
                        concat($label, ' (', string-join($items/preceding::mei:staffDef[@n = $items[1]/@n][1]/@label.abbr,', '),')')
                
                )
                else(concat('Takt ',$items[1]/ancestor::mei:measure/@n, ' (', $items[1]/preceding::mei:staffDef[@n = $items[1]/@n][1]/@label.abbr,')'))
            )
            else
            
            if(local-name($items[1]) eq 'zone')
            then(
                if(count($items) gt 1)
                then((:Dieser Fall sollte nicht vorkommen, da freie zones nicht zusammengefasst werden dürfen:))
                else(concat('Ausschnitt (S. ',$items[1]/parent::mei:surface/@n,')'))
            )
            else()
    ,' ')        
                        
};

(:declare function local:toJSON($type as xs:string, $label as xs:string, $mdiv as xs:string?, $part as xs:string?, 
    $page as xs:string?, $source as xs:string, $siglum as xs:string?, $digilibBaseParams as xs:string?, 
    $digilibSizeParams as xs:string?, $hiddenData as xs:string?, $content as xs:string?, $linkUri as xs:string?) as xs:string {
    
    concat(
        '{"type":"',$type,
        '","label":"',$label,
        '","mdiv":"',$mdiv,
        '","part":"',$part,
        '","page":"',$page,
        '","source":"',$source,
        '","siglum":"',$siglum,
        '","digilibBaseParams":"',$digilibBaseParams,
        '","digilibSizeParams":"',$digilibSizeParams,
        '","hiddenData":"',$hiddenData,
        '","content":"',$content,
        '","linkUri":"',$linkUri,
        '"}'
    )
};:)

(: Test: single url for images in annotation view :)

declare function local:toJSON($type as xs:string, $label as xs:string, $mdiv as xs:string?, $part as xs:string?, 
    $page as xs:string?, $source as xs:string, $siglum as xs:string?, $digilibBaseParams as xs:string?, 
    $digilibSizeParams as xs:string?, $hiddenData as xs:string?, $content as xs:string?, $linkUri as xs:string?) as xs:string {
        
        let $configResource := doc('xmldb:exist:///db/apps/mriExistDBconf/config.xml')
        let $sourcesRestricted := doc($configResource//conf:sourcesRestricted/text())//mei:source/@corresp/string()
        let $docuservLockedSourcePath := $configResource//conf:docuservLockedSourcePath/text()
        let $docuservURL := $configResource//conf:docuservURL/string()
        let $env := $configResource//conf:env/text()
        let $digilibURL :=
            if ($env = ('dev', 'stage'))
            then (concat($digilibBaseParams, 'dw=600&amp;amp;dh=600', $digilibSizeParams))
            else if (exists($sourcesRestricted) and not(functx:contains-any-of($digilibBaseParams, ($sourcesRestricted))))
            then (concat($digilibBaseParams, 'dw=600&amp;amp;dh=600', $digilibSizeParams))
            else (concat($docuservURL, $docuservLockedSourcePath, '?dw=600&amp;dh=600&amp;mo=fit'))
        let $single-serv-registerURL := $configResource//conf:single-serv-registerURL/string()
        let $singel-serv-resolveURL := $configResource//conf:single-serv-resolveURL/string()
        let $docuservURLinternal := $configResource//conf:docuservURLinternal/string()
        let $singleURL := 
            if (matches($digilibBaseParams, 'music/editions/'))
                            then 
                                try {
                                    (
                                        let $random := util:uuid()
                                        let $internalDigiLibURL := replace($digilibURL, $docuservURL, $docuservURLinternal)
                                        let $registerURL := concat($single-serv-registerURL, '?token=', $random, '&amp;url=', encode-for-uri($internalDigiLibURL))
                                        let $dummy := hc:send-request(<hc:request href="{$registerURL}" method="get"/>)
                                        return
                                            concat($singel-serv-resolveURL, '?token=', $random)
                                    )
                                } catch *{
                                    
                                    ''
                                }
                                
                            else (replace($digilibURL, 'http:', 'http:'))
        return
            concat(
                '{"type":"',$type,
                '","label":"',$label,
                '","mdiv":"',$mdiv,
                '","part":"',$part,
                '","page":"',$page,
                '","source":"',$source,
                '","siglum":"',$siglum,
                '","digilibURL":"', $singleURL,
                '","hiddenData":"',$hiddenData,
                '","content":"',$content,
                '","linkUri":"',$linkUri,
                '"}'
            )
};

let $uri := request:get-parameter('uri', '')
let $docUri := substring-before($uri, '#')
let $internalId := substring-after($uri, '#')
let $doc := doc($docUri)
let $annot := $doc/id($internalId)

return
    concat('{"success": "true", "participants": [', string-join(local:getParticipants($annot),','), ']}')
