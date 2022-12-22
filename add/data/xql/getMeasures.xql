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
import module namespace eutil = "http://www.edirom.de/xquery/util" at "/db/apps/Edirom-Online/data/xqm/util.xqm";

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
        let $measureNsDistinct := distinct-values(eutil:sort-as-numeric-alpha($measureNs))
        return
            for $measureN in $measureNsDistinct
            let $measureNNumber := number($measureN)
            let $measures := if ($mdiv//mei:measure/@label)
                                then ($mdiv//mei:measure[.//mei:multiRest][number(substring-before(@label, '–')) <= $measureNNumber][.//mei:multiRest/number(@num) gt ($measureNNumber - number(substring-before(@label, '–')))])
                                else ($mdiv//mei:measure[.//mei:multiRest][number(@n) lt $measureNNumber][.//mei:multiRest/number(@num) gt ($measureNNumber - number(@n))])
            let $measures := for $part in $mdiv//mei:part
                                let $partMeasures := if($part//mei:measure/@label)
                                                     then($part//mei:measure[@label = $measureN][1])
                                                     else($part//mei:measure[@n = $measureN][1])
                                for $measure in $partMeasures | $measures[ancestor::mei:part = $part]
                                    let $voiceRef := $part//mei:staffDef/@decls
                                    return
                                        concat('{id:"', $measure/@xml:id, '",
                                        voice: "', $voiceRef,
                                        '", partLabel: "', eutil:getPartLabel($measure, 'measure'),
                                        '"}')
            return
                concat('{',
                    'id: "measure_', $mdiv/@xml:id, '_', $measureN, '", ',
                    'measures: [', string-join($measures, ','), '], ',
                    'mdivs: ["', $mdiv/@xml:id, '"], ', (: TODO :)
                    'name: "', $measureN, '"',
                '}')
    )
    
    else(
    
        if($mei/id($mdivID)//mei:measure[@label])
        then(
             for $measureN in $mei/id($mdivID)//mei:measure/@label
                let $measures := $mei/id($mdivID)//mei:measure[@label = $measureN]
                let $measure := $measures[1]
                (:let $measureLabel := if(exists($measure/@label) and not(contains($measure/@label,'/'))) then($measure/@label) else($measure/@n):)
                return
                    concat('{',
                        'id: "', $measure/@xml:id, '", ',
                        'measures: [{id:"', $measure/@xml:id, '", voice: "score"}], ',
                        'mdivs: ["', $measure/ancestor::mei:mdiv[1]/@xml:id, '"], ', (: TODO :)
                        'name: "', $measureN, '"', (: Hier Unterscheiden wg. Auftakt. :)
                    '}')
        )
        else(
    
            for $measureN in $mei/id($mdivID)//mei:measure/data(@n)
                let $measures := $mei/id($mdivID)//mei:measure[@n = $measureN]
                let $measure := $measures[1]
                (:let $measureLabel := if(exists($measure/@label) and not(contains($measure/@label,'/'))) then($measure/@label) else($measure/@n):)
                return
                    concat('{',
                        'id: "', $measure/@xml:id, '", ',
                        'measures: [{id:"', $measure/@xml:id, '", voice: "score"}], ',
                        'mdivs: ["', $measure/ancestor::mei:mdiv[1]/@xml:id, '"], ', (: TODO :)
                        'name: "', $measureN, '"', (: Hier Unterscheiden wg. Auftakt. :)
                    '}')
        )
    )
};

let $uri := request:get-parameter('uri', '')
let $mdivID := request:get-parameter('mdiv', '')
let $mei := doc($uri)/root()

let $ret := local:getMeasures($mei, $mdivID)

return concat('[', string-join($ret, ','), ']')