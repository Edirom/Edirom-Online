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

:)


(:~
: This module provides library functions for Sources
:
: @author Dennis Ried
:)
module namespace measure = "http://www.edirom.de/xquery/measure";

declare namespace mei="http://www.music-encoding.org/ns/mei";

import module namespace eutil="http://www.edirom.de/xquery/util" at "/db/apps/Edirom-Online/data/xqm/util.xqm";
import module namespace functx="http://www.functx.com";

(:~
: Returns an attribute from a measure for labeling 
:
: @param $measure The measure to be processed
: @return Attribute Label or N
:)
declare function measure:getMeasureLabelAttr($measure as node()){
    if(exists($measure[@label]))
    then($measure/@label)
    else($measure/@n)
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
        if($measureParentElem = 'supplied')
        then(<span class="supplied">{'[' || $measureLabel || ']'}</span>)
        else if($measureParentElem = 'del')
        then(<span class="del">{$measureLabel}</span>)
        else(<span>{$measureLabel}</span>)
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
        if(not($measure/parent::mei:reg))
        then(
             if(($measureZoneRefCount gt 1) and ($measure//mei:multiRest))
             then(for $measure in $measuresZoneRef
                    let $measureLabel := measure:getMeasureLabelAttr($measure)
                    let $measureLabel := measure:makeMeasureLabelCritical($measure, $measureLabel)
                    let $measureLabel := ($measureLabel || '–' || number($measureLabel) + number($measure//mei:multiRest/@num) - 1)
                    return
                        <span>{$measureLabel}</span>
                 )
             else if ($measureZoneRefCount gt 1)
             then(for $label in $measuresZoneRef
                    return
                        measure:makeMeasureLabelCritical($label, $label/string(@label)))
             else(measure:makeMeasureLabelCritical($measure, $measureLabel))
        )
        else if($measure/parent::mei:reg)
        then(for $measure in $measuresZoneRef
                return
                    measure:getRegMeasureLabel($measure/parent::mei:reg))
        else(<span>noLabel</span>)
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
    <span>{for $label at $pos in functx:distinct-deep($labels)
            return
                if($pos = 1)
                then($label)
                else('/',$label)
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
declare function measure:getMRest($measure) {
    if($measure//mei:mRest)
    then(string('1'))
    else if($measure//mei:multiRest)
    then($measure//mei:multiRest/string(@num))
    else(string('0'))
};

(:~
: Returns resolved labels
:
: @param $measure The measure to be processed
: @return An array of strings
:)
declare function measure:analyzeLabels($measure as node()) {
    let $labels := $measure/@label
    let $labelsAnalyzed := for $label in $labels
                               return
                                    if (contains($label, '–'))
                                    then (let $first := substring-before($label, '–')
                                          let $last := substring-after($label, '–')
                                          let $steps := xs:integer(number($last) - number($first) + number(1))
                                          for $i in 1 to $steps return string(number($first) + $i - 1))
                                    else ($label)
      return
        if($labels)
        then($labelsAnalyzed)
        else ($measure/@n)
};

declare function measure:resolveMultiMeasureRests($mdiv as node(), $measureN as xs:string) {
    let $measureNNumber := number($measureN)
    return
        if ($mdiv//mei:measure/@label)
        then ($mdiv//mei:measure[.//mei:multiRest][number(substring-before(@label, '–')) <= $measureNNumber][.//mei:multiRest/number(@num) gt ($measureNNumber - number(substring-before(@label, '–')))])
        else ($mdiv//mei:measure[.//mei:multiRest][number(@n) lt $measureNNumber][.//mei:multiRest/number(@num) gt ($measureNNumber - number(@n))])
};