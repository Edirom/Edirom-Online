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

import module namespace eutil="http://www.edirom.de/xquery/eutil" at "/db/apps/Edirom-Online/data/xqm/eutil.xqm";

(: NAMESPACE DECLARATIONS ================================================== :)

declare namespace mei="http://www.music-encoding.org/ns/mei";
declare namespace xhtml="http://www.w3.org/1999/xhtml";

(: FUNCTION DECLARATIONS =================================================== :)

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
declare function measure:makeMeasureLabelCritical($measure as node(), $measureLabel as xs:string)  as element(xhtml:span) {

    let $measureParentElem := local-name($measure/parent::node())
    return
        if($measureParentElem = 'supplied') then (
            <xhtml:span class="supplied">{'[' || $measureLabel || ']'}</xhtml:span>
        ) else if($measureParentElem = 'del') then (
            <xhtml:span class="del">{$measureLabel}</xhtml:span>
        ) else (
            <xhtml:span>{$measureLabel}</xhtml:span>
        )
};

(:~
 : Returns a label for a measure (range)
 :
 : @param $measure The measure to be processed
 : @return A span containing the label
 :)
declare function measure:getMeasureLabel($measure as element(mei:measure)) as element(xhtml:span) {

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
                    <xhtml:span>{$measureLabel}</xhtml:span>
            ) else if ($measureZoneRefCount gt 1) then (
                for $label in $measuresZoneRef
                return
                    measure:makeMeasureLabelCritical($label, $label/string(@label))
            ) else if ($measure//mei:multiRest) then (
                <xhtml:span>{$measureLabel || '–' || (number($measureLabel) + number($measure//mei:multiRest/@num) - 1)}</xhtml:span>
            ) else (
                measure:makeMeasureLabelCritical($measure, $measureLabel)
            )
        ) else if($measure/parent::mei:reg) then (
            for $measure in $measuresZoneRef
            return
                measure:getRegMeasureLabel($measure/parent::mei:reg)
        ) else (
            <xhtml:span>noLabel</xhtml:span>
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
declare function measure:joinMeasureLabels($labels as node()*) as element(xhtml:span) {

    <xhtml:span>{
        for $label at $pos in functx:distinct-deep($labels)
        return
            if($pos = 1) then (
                $label
            ) else(
                '/',$label
            )
    }</xhtml:span>
};

(:~
 : Returns a label for a regularized measure (range)
 :
 : @param $reg The reg element (containing measure) to be processed
 : @return The label as string
 :)
declare function measure:getRegMeasureLabel($reg as node()) as element(xhtml:span) {

    let $measures := $reg/mei:measure
    let $measuresCount := count($measures)
    let $measureStart := $measures[1]
    let $measureStop := $measures[$measuresCount]
    let $measureLabel := measure:getMeasureLabelAttr($measureStart) || '–' || measure:getMeasureLabelAttr($measureStop)
    return
        <xhtml:span>{$measureLabel}</xhtml:span>
};

(:~
 : Returns the value of a (multi) measure rest
 :
 : @param $measure The measure to be processed
 : @return The value of the rest as string
 :)
declare function measure:getMRest($measure as element(mei:measure)) as xs:string {

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
 : E.g., for a measure with the label "3-5" this function will return "3,4,5";
 : for a measure with the n attribute "4a" this function will return "4a". 
 :
 : @param $measure The measure to be processed
 : @return A sequence of measure numbers or labels
 :)
declare function measure:analyzeLabel($measure as element(mei:measure)) as xs:string* {
    if($measure/@label)
    then (
        if (matches($measure/@label, '^\d+[\-–]\d+$'))
        then (
            let $first := functx:substring-before-match($measure/@label, '[\-–]') => number()
            let $last := functx:substring-after-match($measure/@label, '[\-–]') => number()
            let $steps := ($last - $first + 1) => xs:integer()
            for $i in 1 to $steps
            return
                string($first + $i - 1)
        )
        else $measure/@label => data()
    )
    else $measure/@n => data()
};

(:~
 : Resolvs multi-measure rests
 :
 : @param $mdiv The mdiv to be processed
 : @param $measureN The number of the measure to be resolved
 : @return The measures covered by the multi-measure rest
 :)
(: This does not work, see discussion at https://github.com/Edirom/Edirom-Online/pull/302  :)
(:
declare function measure:resolveMultiMeasureRests($mdiv as node(), $measureN as xs:string) as node()* {
    let $measureNNumber := number($measureN)
    return
        if ($mdiv//mei:measure[.//mei:multiRest][@label]) then (
            $mdiv//mei:measure[.//mei:multiRest][number(substring-before(@label, '–')) <= $measureNNumber][.//mei:multiRest/number(@num) gt number($measureNNumber - substring-before(@label, '–'))]
        ) else (
            $mdiv//mei:measure[.//mei:multiRest][number(@n) lt $measureNNumber][.//mei:multiRest/number(@num) gt ($measureNNumber - number(@n))]
        )
};
:)

(:~
 : Finds all measures on a page.
 :
 : @param $mei The sourcefile
 : @param $surface The surface to look at
 : @returns A sequence of map objects with measure information
 :)
declare function measure:getMeasuresOnPage($mei as document-node()?, $surface as element(mei:surface)) as map(*)* {

    for $zone in $surface/mei:zone[@type='measure'][@xml:id]
    (: do we need to compute an id for zones without @xml:id? :)
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
