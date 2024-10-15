xquery version "3.1";
(:
 : For LICENSE-Details please refer to the LICENSE file in the root directory of this repository.
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

declare function local:findMeasure($mei, $movementId, $measureIdName) as element(mei:measure)? {
    let $m := $mei/id($measureIdName)
    return
        if ($m) then
            ($m)
        else
            (($mei/id($movementId)//mei:measure[@n eq $measureIdName])[1])
};

declare function local:getMeasure($mei, $measure, $movementId) as map(*) {
    let $measureId := $measure/string(@xml:id)
    let $zoneId := substring-after($measure/string(@facs), '#')
    let $zone := $mei/id($zoneId)
    let $surface := $zone/parent::mei:surface
    let $graphic := $surface/mei:graphic[@type = 'facsimile']
    return
        map {
            "measureId": $measureId,
            "zoneId": $zoneId,
            "pageId": $surface/string(@xml:id),
            "movementId": $movementId,
            "path": $graphic/string(@target),
            "width": $graphic/string(@width),
            "height": $graphic/string(@height),
            "ulx": $zone/string(@ulx),
            "uly": $zone/string(@uly),
            "lrx": $zone/string(@lrx),
            "lry": $zone/string(@lry)
        }
};

(: QUERY BODY ============================================================== :)

let $id := request:get-parameter('id', '')
let $measureIdName := request:get-parameter('measure', '')
let $movementId := request:get-parameter('movementId', '')
let $measureCount := request:get-parameter('measureCount', '1')

let $mei := doc($id)/root()

let $measure := local:findMeasure($mei, $movementId, $measureIdName)
let $extraMeasures :=
    for $i in (2 to xs:integer($measureCount))
    let $m := $measure/following-sibling::mei:measure[$i - 1] (: TODO: following-sibling könnte problematisch sein, da so section-Grenzen nicht überwunden werden :)
    return
        if ($m) then
            ($m)
        else
            ()
        
(: Extra measure parts :)
let $extraMeasuresParts :=
    for $exm in $measure | $extraMeasures
    return
        $exm/following-sibling::mei:measure[(exists(@label) and @label = $exm/@label) or (not(exists(@label)) and @n = $exm/@n)]

return
    array {
        local:getMeasure($mei, $measure, $movementId),
        for $m in $extraMeasures
        return
            local:getMeasure($mei, $m, $movementId),
        for $m in $extraMeasuresParts
        return
            local:getMeasure($mei, $m, $movementId)
    }
