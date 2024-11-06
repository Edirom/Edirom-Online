xquery version "3.1";
(:
 : For LICENSE-Details please refer to the LICENSE file in the root directory of this repository.
 :)

(: IMPORTS ================================================================= :)

import module namespace functx = "http://www.functx.com";

import module namespace eutil = "http://www.edirom.de/xquery/util" at "/db/apps/Edirom-Online/data/xqm/util.xqm";

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

declare function local:getMeasures($mei as node(), $mdivID as xs:string) as array(*)* {
    array {
    if ($mei//mei:parts) then (
        let $mdiv := $mei/id($mdivID)
        let $measureNs :=
            if ($mdiv//mei:measure/@label) then (
                let $labels := $mdiv//mei:measure/@label/string()
                for $label in $labels
                let $labelsAnalyzed :=
                    if (contains($label, '–')) then (
                        (:substring-before($label, '–'):)
                        let $first := substring-before($label, '–')
                        let $last := substring-after($label, '–')
                        let $steps := xs:integer(number($last) - number($first) + number(1))
                        for $i in 1 to $steps
                        return
                            string(number($first) + $i - 1)
                    ) else
                        ($label)
                return
                    $labelsAnalyzed
            ) else
                ($mdiv//mei:measure/@n)
        
        let $measureNsDistinct := distinct-values(eutil:sort-as-numeric-alpha($measureNs))
        
        return
            for $measureN in $measureNsDistinct
            let $measureNNumber := number($measureN)
            let $measures :=
                if ($mdiv//mei:measure/@label) then
                    ($mdiv//mei:measure[.//mei:multiRest][number(substring-before(@label, '–')) <= $measureNNumber][.//mei:multiRest/number(@num) gt ($measureNNumber - number(substring-before(@label, '–')))])
                else
                    ($mdiv//mei:measure[.//mei:multiRest][number(@n) lt $measureNNumber][.//mei:multiRest/number(@num) gt ($measureNNumber - number(@n))])
            let $measures :=
                for $part in $mdiv//mei:part
                let $partMeasures :=
                    if ($part//mei:measure/@label) then
                        ($part//mei:measure[@label = $measureN][1])
                    else
                        ($part//mei:measure[@n = $measureN][1])
                for $measure in $partMeasures | $measures[ancestor::mei:part = $part]
                let $voiceRef := $part//mei:staffDef/string(@decls)
                return
                    map {
                        "id": $measure/string(@xml:id),
                        "voice": $voiceRef,
                        "partLabel": eutil:getPartLabel($measure, 'measure')
                    }
            return
                map {
                    "id": 'measure_' || $mdiv/@xml:id || '_' || $measureN,
                    "measures": $measures,
                    "mdivs": $mdiv/string(@xml:id),
                    "name": $measureN
                }
    ) else (
        if ($mei/id($mdivID)//mei:measure[@label]) then (
            for $measureN in $mei/id($mdivID)//mei:measure/data(@label)
            let $measures := $mei/id($mdivID)//mei:measure[@label = $measureN]
            let $measure := $measures[1]
            (:let $measureLabel := if(exists($measure/@label) and not(contains($measure/@label,'/'))) then($measure/@label) else($measure/@n):)
            return
                map {
                    "id": $measure/string(@xml:id),
                    "measures": array { map { "id": $measure/string(@xml:id), "voice": "score"} },
                    "mdivs": array { $measure/ancestor::mei:mdiv[1]/string(@xml:id) }, (: TODO :)
                    "name": $measureN (: Hier Unterscheiden wg. Auftakt. :)
                }
        ) else (
            for $measureN in $mei/id($mdivID)//mei:measure/data(@n)
            let $measures := $mei/id($mdivID)//mei:measure[@n = $measureN]
            let $measure := $measures[1]
            (:let $measureLabel := if(exists($measure/@label) and not(contains($measure/@label,'/'))) then($measure/@label) else($measure/@n):)
            return
                map {
                    "id": $measure/string(@xml:id),
                    "measures": array { map { "id": $measure/string(@xml:id), "voice": "score"} },
                    "mdivs": array { $measure/ancestor::mei:mdiv[1]/string(@xml:id) }, (: TODO :)
                    "name": $measureN (: Hier Unterscheiden wg. Auftakt. :)
                }
        )
    )
    }
};

(: QUERY BODY ============================================================== :)

let $uri := request:get-parameter('uri', '')
let $mdivID := request:get-parameter('mdiv', '')
let $mei := doc($uri)/root()

return
    local:getMeasures($mei, $mdivID)
