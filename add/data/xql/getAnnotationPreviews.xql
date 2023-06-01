xquery version "3.1";
(:
For LICENSE-Details please refer to the LICENSE file in the root directory of this repository.
:)

(:~
    Returns the HTML for a specific annotation for an AnnotationView.

    @author <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
    @author <a href="mailto:bohl@edirom.de">Benjamin W. Bohl</a>
:)

declare namespace mei = "http://www.music-encoding.org/ns/mei";
declare namespace request = "http://exist-db.org/xquery/request";
declare namespace output = "http://www.w3.org/2010/xslt-xquery-serialization";

import module namespace source = "http://www.edirom.de/xquery/source" at "../xqm/source.xqm";
import module namespace teitext = "http://www.edirom.de/xquery/teitext" at "../xqm/teitext.xqm";
import module namespace eutil = "http://www.edirom.de/xquery/util" at "../xqm/util.xqm";

declare option output:method "json";
declare option output:media-type "application/json";

declare variable $lang := request:get-parameter('lang', '');
declare variable $edition := request:get-parameter('edition', '');
declare variable $imageserver := eutil:getPreference('image_server', $edition);
declare variable $uri := request:get-parameter('uri', '');
declare variable $imageBasePath := if ($imageserver = 'leaflet')
then
    (eutil:getPreference('leaflet_prefix', $edition))
else
    (eutil:getPreference('image_prefix', $edition));

declare function local:getParticipants($annot as element()) as map(*)* {

    let $participants := tokenize($annot/string(@plist), ' ')
    let $docs := distinct-values(for $p in $participants
    return
        substring-before($p, '#'))
    return
        for $doc in $docs
            order by $doc
        return
            if (source:isSource($doc))
            then
                (local:getSourceParticipants($participants[starts-with(., $doc)], $doc))

            else
                if (teitext:isText($doc))
                then
                    (local:getTextParticipants($participants[starts-with(., $doc)], $doc))

                else
                    ()
};

declare function local:getTextParticipants($participants as xs:string*, $doc as xs:string) as map(*)* {

    for $participant in $participants
    let $id := substring-after($participant, '#')
    let $hiddenData := concat('uri:', $doc, '__$$__participantId:', $id)
    return
        map {
            'type': 'text',
            'label': 'Textstelle',
            'mdiv': '',
            'part': '',
            'page': '',
            'source': teitext:getLabel($doc, $edition),
            'siglum': '',
            'digilibBaseParams': '',
            'digilibSizeParams': '',
            'hiddenData': $hiddenData,
            'content': normalize-space(local:getTextNoteContent($doc, $id)),
            'linkUri': $participant
        }
};

declare function local:getTextNoteContent($doc as xs:string, $id as xs:string) as xs:string {
    let $elem := doc($doc)/id($id)
    let $content := data($elem)
    return
        if (string-length($content) gt 0)
        then
            ($content)
        else
            (local:getTextNotePrecedingContent($elem))
};

declare function local:getTextNotePrecedingContent($elem as element()) as xs:string {
    let $preceding := $elem/preceding-sibling::*[1]
    let $content := data($preceding)
    return
        if (string-length($content) gt 0)
        then
            ($content)
        else
            (local:getTextNotePrecedingContent($preceding))
};

declare function local:getSourceParticipants($participants as xs:string*, $doc as xs:string) as map(*)* {

    let $combs := local:groupParticipants($participants, $doc)

    return

        for $comb in distinct-values($combs)
        let $partIndices := tokenize($comb, '-')

        let $elems :=
        for $p in distinct-values($partIndices)
        let $relevant.participant := $participants[starts-with(., $doc)][number($p)]
        let $element.id := substring-after($relevant.participant, '#')
        let $elem := local:getElement($relevant.participant)
        (:return if(exists($elem)) then(local-name($elem)) else($relevant.participant):)
            where exists($elem)
            order by count($elem/preceding::*)
        return
            $elem

            where count($elems) gt 0

        let $zones := for $elem in $elems
        return
            local:getZone($elem)

        let $type := local:getType($zones)
        let $label := local:getItemLabel($elems)

        let $mdiv := '' (: TODO if($elem/ancestor-or-self::mei:mdiv) then($elem/ancestor-or-self::mei:mdiv/@label) else(''):)
        let $page := if ($zones[1]/parent::mei:surface/@label != '') then
            ($zones[1]/parent::mei:surface/string(@label))
        else
            ($zones[1]/parent::mei:surface/string(@n))
        let $sourceLabel := source:getLabel($doc, $edition)
        let $siglum := ($elems[1]/root()//mei:*[@type eq 'siglum'])[1]/text()

        let $part := string-join(distinct-values(for $e in $elems
        return
            $e/ancestor::mei:part/string(@label)), '-')

        let $graphic := $zones[1]/../mei:graphic[@type = 'facsimile']
        let $imgWidth := number($graphic/@width)
        let $imgHeight := number($graphic/@height)

        let $digilibBaseParams := local:getImageAreaPath($imageBasePath, $graphic)
        let $rect := local:getBoundingZone($zones)

        let $digilibSizeParams := local:getImageAreaParams($rect, $imgWidth, $imgHeight)

        let $hiddenData := map {
            'width': number($rect/@lrx) - number($rect/@ulx),
            'height': number($rect/@lry) - number($rect/@uly),
            'x': number($rect/@ulx),
            'y': number($rect/@uly),
            'origH': $imgHeight,
            'origW': $imgWidth
        }

        let $linkUri := concat('xmldb:exist://', document-uri($graphic/root()), '#', local:getSourceLinkTarget($elems, $zones))

        return
            map {
                'type': $type,
                'label': $label,
                'mdiv': $mdiv,
                'part': $part,
                'page': $page,
                'source': $sourceLabel,
                'siglum': $siglum,
                'digilibBaseParams': $digilibBaseParams,
                'digilibSizeParams': $digilibSizeParams,
                'hiddenData': $hiddenData,
                'content': '',
                'linkUri': $linkUri
            }
};

declare function local:getSourceLinkTarget($elems as node()*, $zones as node()*) as xs:string {
    if (local-name($elems[1]) eq 'zone')
    then
        ($elems[1]/string(@xml:id))
    else
        if (count($elems) > 1)
        then
            (
            let $elemsSorted := for $elem in $elems
                order by count($elem/preceding::*)
            return
                $elem
            return
                concat($elemsSorted[1]/@xml:id, '?tstamp2=', (count($elems) - 1), 'm+0')
            )
        else
            ($elems[1]/string(@xml:id))

};

declare function local:groupParticipants($participants as xs:string*, $doc as xs:string) as xs:string* {

    let $elems := for $p in $participants
    let $id := substring-after($p, '#')
    return
        doc($doc)/id($id)

    let $zones := for $elem in $elems
    return
        local:getZone($elem)

    let $combs := for $p at $i in $participants
    return
        local:getCombinations($elems, $zones, $i, count($zones))

    return
        reverse(
        for $comb at $i in reverse($combs)
        let $contained := for $n in (1 to count($combs) - $i)
        return
            if (contains($combs[$n], $comb))
            then
                (1)
            else
                (0)
        return
            if (exists(index-of($contained, 1)))
            then
                ()
            else
                ($comb)
        )
};

declare function local:getCombinations($elems as element()*, $zones as element()*, $i as xs:int, $total as xs:int) as xs:string {

    let $currentZone := $zones[$i]
    let $currentElem := $elems[$i]
    return
        if (local-name($currentElem) eq 'measure' or local-name($currentElem) eq 'staff')
        then
            (
            string-join((
            string($i),
            for $n in ($i + 1 to $total)
            return
                if ((local-name($elems[$n]) eq 'measure' or local-name($elems[$n]) eq 'staff') and local:compareZones($currentZone, $zones[$n]))
                then
                    (local:getCombinations($elems, $zones, $n, $total))
                else
                    ()
            ), '-')
            )
        else
            (
            string($i)
            )
};

declare function local:compareZones($zone1 as element(), $zone2 as element()) as xs:boolean {

    let $samePage := deep-equal($zone1/.., $zone2/..)
    let $overlapping := not(number($zone1/@ulx) gt number($zone2/@lrx) or number($zone1/@lrx) lt number($zone2/@ulx) or number($zone1/@uly) gt number($zone2/@lry) or number($zone1/@lry) lt number($zone2/@uly))
    return
        $samePage and $overlapping
};

declare function local:getElement($uri as xs:string) as element()? {
    let $doc := substring-before($uri, '#')
    let $id := substring-after($uri, '#')

    return
        doc($doc)/id($id)
};

(: TODO: in Modul auslagern :)
(:~
    Gets the zone holding the graphical representation of an element

    @param $elem The element for which the graphical representation shall be found

    @return The zone element
:)
declare function local:getZone($elem as element()) as element()? {
    if ($elem/@facs)
    then
        (
        let $zoneId := replace($elem/@facs, '^#', '')
        return
            $elem/root()/id($zoneId)
        )
    else
        (
        $elem
        )
};

(:~
 : Returns type of a zone
 :)
declare function local:getType($zones as element()*) as xs:string {
    $zones[1]/@type (: TODO: besser machen :)
};

declare function local:getBoundingZone($zones as element()*) as element() {
    <mei:zone
        ulx="{min($zones/@ulx)}"
        uly="{min($zones/@uly)}"
        lrx="{max($zones/@lrx)}"
        lry="{max($zones/@lry)}"/>
};

(: TODO: in Modul auslagern :)
(:~

:)
declare function local:getImageAreaPath($basePath as xs:string, $graphic as element()?) as xs:string {

    let $imagePath := string($graphic/@target)
    let $imgWidth := number($graphic/@width)
    let $imgHeight := number($graphic/@height)
    let $isAbsolute := starts-with($imagePath, 'http')

    let $fields := if ($imageserver = 'leaflet') then
        (substring-before($imagePath, '.'))
    else
        ()

    return
        if ($isAbsolute)
        then
            $imagePath
        else
            switch ($imageserver)
                case 'leaflet'
                    return
                        concat($basePath, $fields)
                case 'openseadragon'
                    return
                        concat($basePath, translate($imagePath, '/', '!'))
                default return
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
    let $language := eutil:getLanguage($edition)
    return
        string-join(
        for $type in distinct-values(for $elem in $elems
        return
            local-name($elem))
        let $items := for $elem in $elems
        return
            if (local-name($elem) eq $type) then
                ($elem)
            else
                ()
        let $itemLabelMultiRestSensitive := if ($items[1]//mei:multiRest)
        then
            ($items[1]/@n || '–' || number($items[1]/@n) + number($items[1]//mei:multiRest/@num) - 1)
        else
            ($items[1]/@n)
        return
            if (local-name($items[1]) eq 'measure')
            then
                (
                if (count($items) gt 1)
                then
                    (eutil:getLanguageString('Bars_from_to', ($items[1]/@n, $items[last()]/@n), $language))
                else
                    (eutil:getLanguageString('Bar_n', $itemLabelMultiRestSensitive, $language))
                )
            else
                if (local-name($items[1]) eq 'staff')
                (: TODO: $itemLabelMultiRestSensitive also for staffs? :)
                then
                    (
                    if (count($items) gt 1)
                    then
                        (

                        let $measureNs := distinct-values($items/ancestor::mei:measure/@n)

                        let $label := if ($lang = 'de')
                        then
                            (if (count($measureNs) gt 1) then
                                (concat('Takte ', $measureNs[1], '-', $measureNs[last()]))
                            else
                                (concat('Takt ', $measureNs[1])))
                        else
                            (if (count($measureNs) gt 1) then
                                (concat('Bars ', $measureNs[1], '-', $measureNs[last()]))
                            else
                                (concat('Bar ', $measureNs[1])))

                        return

                            concat($label, ' (', string-join($items/preceding::mei:staffDef[@n = $items[1]/@n][1]/@label.abbr, ', '), ')')

                        )
                    else
                        (concat('Takt ', $items[1]/ancestor::mei:measure/@n, ' (', $items[1]/preceding::mei:staffDef[@n = $items[1]/@n][1]/@label.abbr, ')'))
                    )
                else
                    if (local-name($items[1]) eq 'zone')
                    then
                        (
                        if (count($items) gt 1)
                        then
                            ((:Dieser Fall sollte nicht vorkommen, da freie zones nicht zusammengefasst werden dürfen:) )
                        else
                            (concat('Ausschnitt (S. ', $items[1]/parent::mei:surface/@n, ')'))
                        )
                    else
                        ()
        , ' ')

};

let $docUri := substring-before($uri, '#')
let $internalId := substring-after($uri, '#')
let $doc := doc($docUri)
let $annot := $doc/id($internalId)

let $map := map {
    'success': true(),
    'participants': array {local:getParticipants($annot)}
}

return
    $map
