xquery version "1.0";
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

declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";

declare function local:getMeasures($mei as node(), $mdivID as xs:string) as xs:string* {
    
    if($mei//mei:parts)
    then(
        let $mdiv := $mei/id($mdivID)
        return
            for $measureN in distinct-values($mdiv//mei:measure/@n)
            let $measureNNumber := number($measureN)
            let $measures := $mdiv//mei:measure[.//mei:multiRest][number(@n) lt $measureNNumber][.//mei:multiRest/number(@num) gt ($measureNNumber - number(@n))]
            let $measures := for $measure in $mdiv//mei:measure[@n = $measureN] | $measures 
                                return
                                    concat('{id:"', $measure/@xml:id, '", voice: "', $measure/ancestor::mei:part//mei:staffDef/@decls, '"}')
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
        return
            concat('{',
                'id: "', $measure/@xml:id, '", ',
                'measures: [{id:"', $measure/@xml:id, '", voice: "score"}], ',
                'mdivs: ["', $measure/ancestor::mei:mdiv[1]/@xml:id, '"], ', (: TODO :)
                'name: "', $measure/@n, '"',
            '}')
    )
};

let $uri := request:get-parameter('uri', '')
let $mdivID := request:get-parameter('mdiv', '')
let $mei := doc($uri)/root()

let $ret := local:getMeasures($mei, $mdivID)

return concat('[', string-join($ret, ','), ']')