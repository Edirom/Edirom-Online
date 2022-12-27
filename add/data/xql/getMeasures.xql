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
import module namespace measure = "http://www.edirom.de/xquery/measure" at "/db/apps/Edirom-Online/data/xqm/measure.xqm";

declare function local:getMeasures($mei as node(), $mdivID as xs:string) as xs:string* {
    
    if($mei//mei:parts)
    then(
        let $mdiv := $mei/id($mdivID)
        let $measureNs := for $measure in $mdiv//mei:measure
                            return measure:analyzeLabels($measure)
                          
        let $measureNsDistinct := distinct-values(eutil:sort-as-numeric-alpha($measureNs))
        return
            for $measureN in $measureNsDistinct
            let $measures := measure:resolveMultiMeasureRests($mdiv, $measureN)
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
                    'mdivs: ["', $mdiv/@xml:id, '"], ',
                    'name: "', $measureN, '"',
                '}')
    )
    
    else(
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

let $uri := request:get-parameter('uri', '')
let $mdivID := request:get-parameter('mdiv', '')
let $mei := doc($uri)/root()

let $ret := local:getMeasures($mei, $mdivID)

return
    '[' || string-join($ret, ',') || ']'