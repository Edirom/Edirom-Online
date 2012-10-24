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
            ($mei/id($movementId)//mei:measure[@n=$measureIdName])[1]
        )
};

let $id := request:get-parameter('id', '')
let $measureIdName := request:get-parameter('measure', '')
let $movementId := request:get-parameter('movementId', '')

let $mei := doc($id)/root()

let $measure := local:findMeasure($mei, $movementId, $measureIdName)
let $measureId := $measure/string(@xml:id)
let $zoneId := substring-after($measure/string(@facs), '#')
let $pageId := $mei/id($zoneId)/parent::mei:surface/string(@xml:id)

return
    concat('{',
        'measureId:"', $measureId, '",',
        'zoneId:"', $zoneId, '",',
        'pageId:"', $pageId, '"',
    '}')