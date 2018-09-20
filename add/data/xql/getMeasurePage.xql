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

declare function local:getBoundingBox($vertices, $width, $height) {
    let $xValues := array:for-each($vertices, function($vertex) {
                    map:get($vertex, 'x')
                })
    let $yValues := array:for-each($vertices, function($vertex) {
                    map:get($vertex, 'y')
                })
    let $ulx := round(min($xValues) * 0.01 * $width)
    let $uly := round(min($yValues) * 0.01 * $height)
    let $lrx := round(max($xValues) * 0.01 * $width)
    let $lry := round(max($yValues) * 0.01 * $height)
    return concat('ulx: "', $ulx, '", ',
                  'uly: "', $uly, '", ',
                  'lrx: "', $lrx, '", ',
                  'lry: "', $lry, '"')
};

let $id := request:get-parameter('id', '')
let $measureIdName := request:get-parameter('measure', '')
let $movementId := request:get-parameter('movementId', '')
let $measureCount := request:get-parameter('measureCount', '1')

return
    if(starts-with($id, 'xmldb:exist://'))
    then (
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
    )
    else (
    
        if($measureCount = '1')
        then(    
            let $api := 'http://nashira.upb.de:5001/measure/' || $measureIdName
            let $measure := json-doc($api)
            let $api := 'http://nashira.upb.de:5001/image/' || map:get($measure, 'imageId')
            let $page := json-doc($api)
            let $boundingBox := local:getBoundingBox(map:get($measure, 'vertices'), map:get($page, 'width'), map:get($page, 'height'))
            let $ret := concat('{',
                            'measureId:"', $measureIdName, '",',
                            'zoneId:"zone-', $measureIdName, '",',
                            'pageId:"', map:get($measure, 'imageId'), '", ',
                            'movementId:"', $movementId, '",',
                            'path: "', map:get($page, 'imagepath'), '", ',
                            'width: "', map:get($page, 'width'), '", ',
                            'height: "', map:get($page, 'height'), '", ',
                            $boundingBox,
                        '}')
                        
            return concat('[', $ret, ']')
            
            (:{
              "id": 0,
              "vertices": [
                {
                  "x": 0,
                  "y": 0
                }
              ],
              "segmentId": 0,
              "imageId": 0,
              "name": "string"
            }:)
            
            
        )else (
            (:let $api := 'http://nashira.upb.de:5001/segment/' || $movementId || '/measures'
            let $measures := json-doc($api)
            let $ret := array:for-each($measures, function($measure) {
                    concat('{',
                        'id: "', map:get($measure, 'id'), '", ',
                        'measures: [{id:"', map:get($measure, 'id'), '", voice: "score"}], ',
                        'mdivs: ["', $mdivID, '"], ',
                        'name: "', map:get($measure, 'name'), '"',
                    '}')
                }):)
            concat('[', ']')
        )
    )