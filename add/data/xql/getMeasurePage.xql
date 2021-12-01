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

  ID: $Id: getMeasurePage.xql 1254 2012-02-01 14:07:25Z daniel $
:)

declare namespace request="http://exist-db.org/xquery/request";
declare namespace mei="http://www.music-encoding.org/ns/mei";
declare namespace xlink="http://www.w3.org/1999/xlink";

declare namespace xmldb="http://exist-db.org/xquery/xmldb";

declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";

declare function local:findMeasure($mei, $movementId, $measureIdName) {
    let $m := $mei/id($measureIdName)
    return
        if($m)
        then($m)
        else(
            ($mei/id($movementId)//mei:measure[@n eq $measureIdName])[1]
        )
};

declare function local:getMeasure($mei, $measure, $movementId) as xs:string {
    
    let $measureId := $measure/string(@xml:id)
    let $zoneId := substring-after($measure/string(@facs), '#')
    let $zone := $mei/id($zoneId)
    let $surface := $zone/parent::mei:surface
    let $graphic := $surface/mei:graphic[@type='facsimile']
    
    return
    
        concat('{',
            'measureId:"', $measureId, '",',
            'zoneId:"', $zoneId, '",',
            'pageId:"', $surface/string(@xml:id), '", ',
            'movementId:"', $movementId, '",',
            'path: "', $graphic/string(@target), '", ',
            'width: "', $graphic/string(@width), '", ',
            'height: "', $graphic/string(@height), '", ',
            'ulx: "', $zone/string(@ulx), '", ',
            'uly: "', $zone/string(@uly), '", ',
            'lrx: "', $zone/string(@lrx), '", ',
            'lry: "', $zone/string(@lry), '"',
        '}')
};

let $id := request:get-parameter('id', '')
let $measureIdName := request:get-parameter('measure', '')
let $movementId := request:get-parameter('movementId', '')
let $measureCount := request:get-parameter('measureCount', '1')

let $mei := doc($id)/root()

let $measure := local:findMeasure($mei, $movementId, $measureIdName)
let $extraMeasures := for $i in (2 to xs:integer($measureCount))
                      let $m := $measure/following-sibling::mei:measure[$i - 1] (: TODO: following-sibling könnte problematisch sein, da so section-Grenzen nicht überwunden werden :)
                      return
                        if($m)then(local:getMeasure($mei, $m, $movementId))else() 

return
    concat('[',
        string-join((local:getMeasure($mei, $measure, $movementId), $extraMeasures), ','),
    ']')