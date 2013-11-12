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

import module namespace functx = "http://www.functx.com" at "../xqm/functx-1.0-nodoc-2007-01.xq";

declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";

let $id := request:get-parameter('id', '')
let $measureId := request:get-parameter('measureId', '')
let $measureCount := if(contains($measureId, 'tstamp2='))then(number(substring-before(substring-after($measureId, 'tstamp2='), 'm')) + 1)else(1)
let $measureId := if(contains($measureId, '?'))then(substring-before($measureId, '?'))else($measureId)

let $mei := doc($id)/root()
let $movementId := $mei/id($measureId)/ancestor::mei:mdiv[1]/@xml:id

(: Specific handling of virtual measure IDs for parts in OPERA project :)
let $movementId := if(starts-with($measureId, 'measure_') and $mei//mei:parts)
                   then(
                        functx:substring-before-last(substring-after($measureId, 'measure_'), '_')
                    )
                    else($movementId)

return
    concat('{',
        'measureId:"', $measureId, '",',
        'movementId:"', $movementId, '",',
        'measureCount:"', $measureCount, '"',
    '}')