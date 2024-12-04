xquery version "3.1";
(:
 : For LICENSE-Details please refer to the LICENSE file in the root directory of this repository.
 :)

(:~
 : This module provides library functions for Sources
 :
 : @author Dennis Ried
 :)
module namespace measure = "http://www.edirom.de/xquery/measure";

(: IMPORTS ================================================================= :)

import module namespace functx="http://www.functx.com";

import module namespace eutil="http://www.edirom.de/xquery/util" at "/db/apps/Edirom-Online/data/xqm/util.xqm";

(: NAMESPACE DECLARATIONS ================================================== :)

declare namespace mei="http://www.music-encoding.org/ns/mei";

(: FUNCTION DECLARATIONS =================================================== :)

(:~
 : Returns maps for each measure containing measure ID, measures (if multiRest), mdiv ID and a label
 :
 : @param $mei the mei file
 : @param $mdivID the ID of the mdiv
 : @return Maps (as strings)
 :)
declare function measure:getMeasures($mei as node(), $mdivID as xs:string) as xs:string* {

    if($mei//mei:parts) then (
        let $mdiv := $mei/id($mdivID)

        let $measureNs :=
            for $measure in $mdiv//mei:measure
            return measure:analyzeLabels($measure)

        let $measureNsDistinct := distinct-values(eutil:sort-as-numeric-alpha($measureNs))

        return
            for $measureN in $measureNsDistinct
            let $measures := measure:resolveMultiMeasureRests($mdiv, $measureN)

            let $measures :=
                for $part in $mdiv//mei:part
                let $partMeasures :=
                    if($part//mei:measure/@label) then (
                        $part//mei:measure[@label = $measureN][1]
                    ) else (
                        $part//mei:measure[@n = $measureN][1]
                    )
                for $measure in $partMeasures | $measures[ancestor::mei:part = $part]
                let $voiceRef := $part//mei:staffDef/@decls
                return
                    concat(
                        '{id:"', $measure/@xml:id, '",
                        voice: "', $voiceRef, '",
                        partLabel: "', eutil:getPartLabel($measure, 'measure'),
                    '"}')
            return
                concat('{',
                    'id: "measure_', $mdiv/@xml:id, '_', $measureN, '", ',
                    'measures: [', string-join($measures, ','), '], ',
                    'mdivs: ["', $mdiv/@xml:id, '"], ',
                    'name: "', $measureN, '"',
                '}')
    ) else (
        for $measure in $mei/id($mdivID)//mei:measure
        let $hasLabel := exists($measure[@label])
        let $attr := if($hasLabel)then('label')else('n')
        let $measures := $mei/id($mdivID)//mei:measure[@*[local-name() = $attr] = $measure/@*[local-name() = $attr]]
        let $measure := $measures[1]
        let $measureLabel := measure:getMeasureLabelAttr($measure)
        return
            concat('{',
                'id: "', $measure/@xml:id, '", ',
                'measures: [{id:"', $measure/@xml:id, '", voice: "score"}], ',
                'mdivs: ["', $measure/ancestor::mei:mdiv[1]/@xml:id, '"], ',
                'name: "', $measureLabel, '"',
            '}')
    )
};

(:~
 : Returns a label for a measure, taken either from the `@label` attribute 
 : if present or the `@n` attribute otherwise. 
 :
 : @param $measure The measure to be processed
 : @return the string value of the `@label` or the `@n` attribute if present, the empty sequence otherwise.
 :)
declare function measure:getMeasureLabelAttr($measure as element(mei:measure)) as xs:string? {

    if(exists($measure[@label])) then (
        $measure/@label => data()
    ) else (
        $measure/@n => data()
    )
};

(:~
 : Adds diacritical characters
 :
 : @param $measure The measure to be processed
 : @param $measureLabel The label of the measure
 : @return A span containing the label
 :)
declare function measure:makeMeasureLabelCritical($measure as node(), $measureLabel as xs:string)  as node() {

    let $measureParentElem := local-name($measure/parent::node())
    return
        if($measureParentElem = 'supplied') then (
            <span class="supplied">{'[' || $measureLabel || ']'}</span>
        ) else if($measureParentElem = 'del') then (
            <span class="del">{$measureLabel}</span>
        ) else (
            <span>{$measureLabel}</span>
        )
};

(:~
 : Returns a label for a measure (range)
 :
 : @param $measure The measure to be processed
 : @return A span containing the label
 :)
declare function measure:getMeasureLabel($measure as node()) as node() {

    let $measureLabel := measure:getMeasureLabelAttr($measure)
    let $measureID := $measure/@xml:id
    let $measureFacs := $measure/@facs
    let $measuresZoneRef := $measure/ancestor::mei:mdiv//mei:measure[@facs = $measureFacs]
    let $measureZoneRefCount := count($measuresZoneRef)

    let $measureLabels :=
        if(not($measure/parent::mei:reg)) then (
            if(($measureZoneRefCount gt 1) and ($measure//mei:multiRest)) then (
                for $measure in $measuresZoneRef
                let $measureLabel := measure:getMeasureLabelAttr($measure)
                let $measureLabel := measure:makeMeasureLabelCritical($measure, $measureLabel)
                let $measureLabel := ($measureLabel || '–' || number($measureLabel) + number($measure//mei:multiRest/@num) - 1)
                return
                    <span>{$measureLabel}</span>
            ) else if ($measureZoneRefCount gt 1) then (
                for $label in $measuresZoneRef
                return
                    measure:makeMeasureLabelCritical($label, $label/string(@label))
            ) else if ($measure//mei:multiRest) then (
                <span>{$measureLabel || '–' || (number($measureLabel) + number($measure//mei:multiRest/@num) - 1)}</span>
            ) else (
                measure:makeMeasureLabelCritical($measure, $measureLabel)
            )
        ) else if($measure/parent::mei:reg) then (
            for $measure in $measuresZoneRef
            return
                measure:getRegMeasureLabel($measure/parent::mei:reg)
        ) else (
            <span>noLabel</span>
        )

    return
        measure:joinMeasureLabels($measureLabels)
};

(:~
 : Returns a label for a measure (range)
 :
 : @param $labels The measure to be processed
 : @return A span containing the joined label
 :)
declare function measure:joinMeasureLabels($labels as node()*) as node() {

    <span>{
        for $label at $pos in functx:distinct-deep($labels)
        return
            if($pos = 1) then (
                $label
            ) else(
                '/',$label
            )
    }</span>
};

(:~
 : Returns a label for a regularized measure (range)
 :
 : @param $reg The reg element (containing measure) to be processed
 : @return The label as string
 :)
declare function measure:getRegMeasureLabel($reg as node()) as node() {

    let $measures := $reg/mei:measure
    let $measuresCount := count($measures)
    let $measureStart := $measures[1]
    let $measureStop := $measures[$measuresCount]
    let $measureLabel := measure:getMeasureLabelAttr($measureStart) || '–' || measure:getMeasureLabelAttr($measureStop)
    return
        <span>{$measureLabel}</span>
};

(:~
 : Returns the value of a (multi) measure rest
 :
 : @param $measure The measure to be processed
 : @return The value of the rest as string
 :)
declare function measure:getMRest($measure) as xs:string {

    if($measure//mei:mRest) then (
        string('1')
    ) else if($measure//mei:multiRest) then(
        $measure//mei:multiRest/string(@num)
    ) else (
        string('0')
    )
};

(:~
 : Returns resolved labels
 :
 : @param $measure The measure to be processed
 : @return An array of strings
 :)
declare function measure:analyzeLabels($measure as node()) as xs:string* {

    let $labels := $measure/@label

    let $labelsAnalyzed :=
        for $label in $labels
        return
            if (contains($label, '–')) then (
                let $first := substring-before($label, '–')
                let $last := substring-after($label, '–')
                let $steps := xs:integer(number($last) - number($first) + number(1))
                for $i in 1 to $steps
                return string(number($first) + $i - 1)
            ) else ($label)

      return
        if($labels) then (
            $labelsAnalyzed
        ) else (
            $measure/@n
        )
};

(:~
 : Resolvs multi-measure rests
 :
 : @param $mdiv The mdiv to be processed
 : @param $measureN The number of the measure to be resolved
 : @return The measures coverd by the multi-measure rest
 :)
declare function measure:resolveMultiMeasureRests($mdiv as node(), $measureN as xs:string) as node()* {
    let $measureNNumber := $measureN/number()
    return
        if ($mdiv//mei:measure[.//mei:multiRest][@label]) then (
            $mdiv//mei:measure[.//mei:multiRest][substring-before(@label, '–')/number() <= $measureNNumber][.//mei:multiRest/@num/number() gt ($measureNNumber - substring-before(@label, '–')/number())]
        ) else (
            $mdiv//mei:measure[.//mei:multiRest][@n/number() lt $measureNNumber][.//mei:multiRest/@num/number() gt ($measureNNumber - @n/number())]
        )
};

(:~
 : Finds all measures on a page.
 :
 : @param $mei The sourcefile
 : @param $surface The surface to look at
 : @returns A list of json objects with measure information
 :)
declare function measure:getMeasuresOnPage($mei as node(), $surface as node()) as map(*)* {

    for $zone in $surface/mei:zone[@type='measure']
    let $zoneRef := concat('#', $zone/@xml:id)
    (:
     : The first predicate with `contains` is just a rough estimate to narrow down the result set.
     : It uses the index and is fast while the second (exact) predicate is generally too slow
     :)
    let $measures := $mei//mei:measure[contains(@facs, $zoneRef)][$zoneRef = tokenize(@facs, '\s+')]
    return
        for $measure in $measures
        let $measureLabel := measure:getMeasureLabel($measure)
        return
            map {
                'zoneId': $zone/string(@xml:id),
                'ulx': $zone/string(@ulx),
                'uly': $zone/string(@uly),
                'lrx': $zone/string(@lrx),
                'lry': $zone/string(@lry),
                'id': $measure/string(@xml:id),
                'name': $measureLabel,
                'type': $measure/string(@type),
                'rest': measure:getMRest($measure)
            }
};
