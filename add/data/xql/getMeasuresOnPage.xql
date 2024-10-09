xquery version "3.1";
(:
 : For LICENSE-Details please refer to the LICENSE file in the root directory of this repository.
 :)

(:~
    Returns a JSON sequence with all measures on a specific page.

    @author <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
:)

(: NAMESPACE DECLARATIONS ================================================== :)

declare namespace mei = "http://www.music-encoding.org/ns/mei";
declare namespace output = "http://www.w3.org/2010/xslt-xquery-serialization";
declare namespace request = "http://exist-db.org/xquery/request";
declare namespace xlink = "http://www.w3.org/1999/xlink";
declare namespace xmldb = "http://exist-db.org/xquery/xmldb";

(: OPTION DECLARATIONS ===================================================== :)

declare option output:method "json";
declare option output:media-type "application/json";

(: FUNCTION DECLARATIONS =================================================== :)

(:~
    Finds all measures on a page.

    @param $mei The sourcefile
    @param $surface The surface to look at
    @returns A list of json objects with measure information
:)
declare function local:getMeasures($mei as node(), $surface as node()) as map(*)* {
    
    for $zone in $surface/mei:zone[@type = 'measure']
    let $zoneRef := concat('#', $zone/@xml:id)
    (:
        The first predicate with `contains` is just a rough estimate to narrow down the result set.
        It uses the index and is fast while the second (exact) predicate is generally too slow
    :)
    let $measures := $mei//mei:measure[contains(@facs, $zoneRef)][$zoneRef = tokenize(@facs, '\s+')]
    return
        for $measure in $measures
        let $measureLabel :=
            if ($measure/@label) then
                ($measure/string(@label))
            else
                ($measure/string(@n))
        let $measureLabel :=
            if ($measure//mei:multiRest) then
                ($measureLabel || '–' || number($measureLabel) + number($measure//mei:multiRest/@num) - 1)
            else
                ($measureLabel)
        return
            map {
                'zoneId': $zone/string(@xml:id),
                'ulx': $zone/string(@ulx),
                'uly': $zone/string(@uly),
                'lrx': $zone/string(@lrx),
                'lry': $zone/string(@lry),
                'id': $measure/string(@xml:id),
                'name': $measureLabel,
                'type': $measure/string(@type),(: where is measure type being used :)
                'rest': local:getMRest($measure)
            }
};

declare function local:getMRest($measure) {
    
    if ($measure//mei:mRest) then
        (string('1'))
    else if ($measure//mei:multiRest) then
        ($measure//mei:multiRest/string(@num))
    else
        (string('0'))
};

(: QUERY BODY ============================================================== :)

let $uri := request:get-parameter('uri', '')

let $surfaceId := request:get-parameter('pageId', '')

let $mei := doc($uri)/root()

let $surface := $mei/id($surfaceId)

return
    array {
        (: TODO: überlegen, wie die Staff-spezifischen Ausschnitte angezeigt werden sollen :)
        local:getMeasures($mei, $surface)
    }
