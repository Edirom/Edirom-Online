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

declare namespace request="http://exist-db.org/xquery/request";
declare namespace mei="http://www.music-encoding.org/ns/mei";
declare namespace xlink="http://www.w3.org/1999/xlink";

declare namespace xmldb="http://exist-db.org/xquery/xmldb";

import module namespace functx="http://www.functx.com";
import module namespace console="http://exist-db.org/xquery/console";

declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";

declare function local:getMeasures($mei as node(), $mdivID as xs:string) as xs:string* {
    
    if($mei//mei:parts)
    then(
        let $mdiv := $mei/id($mdivID)
        let $measuresNotDel := $mdiv//mei:measure[not(parent::mei:del)] (: all measures except those which are surrounded by <del> :)
        let $allEverMentionedMeasureLabels := 
            if ($measuresNotDel/@label)
            then (
                let $labels := $measuresNotDel/@label/string()
                for $label in $labels
                    let $label := functx:substring-before-if-contains(functx:substring-after-if-contains($label, '('), ')')
                    let $labelsAnalyzed := 
                        if (contains($label, '–'))
                        then ((:substring-before($label, '–'):)
                            let $first := substring-before($label, '–')
                            let $last := substring-after($label, '–')
                            let $steps := xs:integer(number($last) - number($first) + number(1))
                            for $i in 1 to $steps
                            return
                                string(number($first) + $i - 1)
                        )
                        else ($label)
                    return
                        $labelsAnalyzed
            )
            else ($measuresNotDel/@n)
        let $allEverMentionedMeasureLabelsDistinct := distinct-values(functx:sort-as-numeric($allEverMentionedMeasureLabels))
        
        let $parts := $mdiv//mei:part
        for $mentionedMeasureLabel in $allEverMentionedMeasureLabelsDistinct
            let $resultMeasures := 
                for $part in $parts
                let $partMeasures := $part//mei:measure[not(parent::mei:del)][
                    if (contains(@label, '–'))
                    then (
                        number(substring-before(functx:substring-before-if-contains(functx:substring-after-if-contains(@label, '('), ')'), '–')) <= number($mentionedMeasureLabel) and 
                        number(substring-after(functx:substring-before-if-contains(functx:substring-after-if-contains(@label, '('), ')'), '–'))  >= number($mentionedMeasureLabel)
                    )
                    else (
                        number(functx:substring-before-if-contains(functx:substring-after-if-contains(@label, '('), ')')) = number($mentionedMeasureLabel)
                    )
                ]
                return
                    if (count($partMeasures) > 1)
                    then (
                        concat('{id: "', $partMeasures[1]/@xml:id, '?tstamp2=', count($partMeasures) - 1, 'm+0', '", voice: "', $partMeasures[1]/ancestor::mei:part//mei:staffDef/@decls, '", partLabel: "', $mei/id(substring-after($partMeasures[1]/ancestor::mei:part//mei:staffDef/@decls,'#'))/@label, '"}')
                    )
                    else if (count($partMeasures) = 1)
                    then (
                        concat('{id: "', $partMeasures[1]/@xml:id, '", voice: "', $partMeasures[1]/ancestor::mei:part//mei:staffDef/@decls, '", partLabel: "', $mei/id(substring-after($partMeasures[1]/ancestor::mei:part//mei:staffDef/@decls,'#'))/@label, '"}')
                    )
                    else ()
            return concat('{',
                'id: "measure_', $mdiv/@xml:id, '_', $mentionedMeasureLabel, '", ',
                'measures: [', string-join($resultMeasures, ','), '], ',
                'mdivs: ["', $mdiv/@xml:id, '"], ', (: TODO :)
                'name: "', $mentionedMeasureLabel, '"',
            '}')
    )
    (: no <part>s :)
    else (
        for $measure in $mei/id($mdivID)//mei:measure
        let $measureLabel := if(exists($measure/@label) and not(contains($measure/@label,'/'))) then($measure/@label) else($measure/@n)
        return
            concat('{',
                'id: "', $measure/@xml:id, '", ',
                'measures: [{id:"', $measure/@xml:id, '", voice: "score"}], ',
                'mdivs: ["', $measure/ancestor::mei:mdiv[1]/@xml:id, '"], ', (: TODO :)
                'name: "', functx:substring-before-if-contains(functx:substring-after-if-contains($measureLabel, '('), ')'), '"', (: Hier Unterscheiden wg. Auftakt. :)
            '}')
    )
};

let $uri := request:get-parameter('uri', '')
let $mdivID := request:get-parameter('mdiv', '')
let $mei := doc($uri)/root()

let $ret := local:getMeasures($mei, $mdivID)

return concat('[', string-join($ret, ','), ']')