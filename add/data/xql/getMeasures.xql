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

declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";

declare function local:getMeasures($mei as node(), $mdivID as xs:string) as xs:string* {
    
    if($mei//mei:parts)
    then(
        let $mdiv := $mei/id($mdivID)
        let $measureNs := if ($mdiv//mei:measure/@label)
                            then (
                                let $labels := $mdiv//mei:measure/@label/string()
                                for $label in $labels
                                let $labelsAnalyzed := if (contains($label, '–'))
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
                            else ($mdiv//mei:measure/@n)
        let $log := console:log(concat('labels: ', string-join($measureNs, ', ')))
        let $measureNsDistinct := distinct-values(functx:sort-as-numeric($measureNs))
        let $log := console:log(concat('distinct: ', string-join($measureNsDistinct, ', ')))
        return
            for $measureN in $measureNsDistinct
            let $measureNNumber := number($measureN)
            let $measures := if ($mdiv//mei:measure/@label)
                                then ($mdiv//mei:measure[.//mei:multiRest][number(substring-before(@label, '–')) <= $measureNNumber][.//mei:multiRest/number(@num) gt ($measureNNumber - number(substring-before(@label, '–')))])
                                else ($mdiv//mei:measure[.//mei:multiRest][number(@n) lt $measureNNumber][.//mei:multiRest/number(@num) gt ($measureNNumber - number(@n))])
            let $measures := if ($mdiv//mei:measure/@label)
                                then (
                                    for $measure in $mdiv//mei:measure[@label = $measureN] | $measures 
                                    return
                                        concat('{id:"', $measure/@xml:id, '", voice: "', $measure/ancestor::mei:part//mei:staffDef/@decls, '"}')
                                )
                                else (
                                    for $measure in $mdiv//mei:measure[@n = $measureN] | $measures 
                                    return
                                        concat('{id:"', $measure/@xml:id, '", voice: "', $measure/ancestor::mei:part//mei:staffDef/@decls, '"}')
                                )
            return
                concat('{',
                    'id: "measure_', $mdiv/@xml:id, '_', $measureN, '", ',
                    'measures: [', string-join($measures, ','), '], ',
                    'mdivs: ["', $mdiv/@xml:id, '"], ', (: TODO :)
                    'name: "', $measureN, '"',
                '}')
    )
    
    else(
        for $measure in $mei/id($mdivID)//mei:measure
        let $measureLabel := if(exists($measure/@label) and not(contains($measure/@label,'/'))) then($measure/@label) else($measure/@n)
        return
            concat('{',
                'id: "', $measure/@xml:id, '", ',
                'measures: [{id:"', $measure/@xml:id, '", voice: "score"}], ',
                'mdivs: ["', $measure/ancestor::mei:mdiv[1]/@xml:id, '"], ', (: TODO :)
                'name: "', $measureLabel, '"', (: Hier Unterscheiden wg. Auftakt. :)
            '}')
    )
};

let $uri := request:get-parameter('uri', '')
let $mdivID := request:get-parameter('mdiv', '')
let $mei := doc($uri)/root()

let $ret := local:getMeasures($mei, $mdivID)

return concat('[', string-join($ret, ','), ']')