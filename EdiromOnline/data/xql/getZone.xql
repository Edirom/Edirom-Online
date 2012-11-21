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

(:~
    Returns a JSON representation of a zone.
    
    @author <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
:)

declare namespace request="http://exist-db.org/xquery/request";
declare namespace mei="http://www.music-encoding.org/ns/mei";
declare namespace xlink="http://www.w3.org/1999/xlink";

declare namespace xmldb="http://exist-db.org/xquery/xmldb";

declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";


let $uri := request:get-parameter('uri', '')
let $zoneId := request:get-parameter('zoneId', '')

let $mei := doc($uri)/root()
let $zone := $mei/id($zoneId)

return (
    concat('{',
        'zoneId: "', $zone/string(@xml:id), '", ',
        'pageId: "', $zone/../string(@xml:id), '", ',
        'ulx: "', $zone/string(@ulx), '", ',
        'uly: "', $zone/string(@uly), '", ',
        'lrx: "', $zone/string(@lrx), '", ',
        'lry: "', $zone/string(@lry), '"',
    '}')
)