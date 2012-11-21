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

  ID: $Id: getMeasuresOnPage.xql 1273 2012-03-09 16:27:21Z daniel $
:)

(:~
    Returns a JSON sequence with all measures on a specific page.
    
    @author <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
:)

declare namespace request="http://exist-db.org/xquery/request";
declare namespace mei="http://www.music-encoding.org/ns/mei";
declare namespace xlink="http://www.w3.org/1999/xlink";

declare namespace xmldb="http://exist-db.org/xquery/xmldb";

declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";

(:~
    Finds all measures on a page.
    
    @param $mei The sourcefile
    @param $surface The surface to look at
    @returns A list of json objects with measure information
:)
declare function local:getMeasures($mei as node(), $surface as node()) as xs:string* {

    for $zone in $surface/mei:zone[@type='measure']
    let $measure := $mei//mei:measure[@facs=concat('#', $zone/@xml:id)]
    return
        concat('{',
            'zoneId: "', $zone/string(@xml:id), '", ',
            'ulx: "', $zone/string(@ulx), '", ',
            'uly: "', $zone/string(@uly), '", ',
            'lrx: "', $zone/string(@lrx), '", ',
            'lry: "', $zone/string(@lry), '", ',
            'id: "', $measure/string(@xml:id), '", ',
            'name: "', $measure/string(@n), '", ',
            'type: "', $measure/string(@type), '", ',
            'rest: "', local:getMRest($measure), '"',
        '}')
};

declare function local:getMRest($measure) {
    if($measure//mei:mRest)
    then(string('1'))
    else if($measure//mei:multiRest)
    then($measure//mei:multiRest/string(@num))
    else(string('0'))
};

let $uri := request:get-parameter('uri', '')
let $surfaceId := request:get-parameter('pageId', '')

let $mei := doc($uri)/root()
let $surface := $mei/id($surfaceId)

return (
    string('['),
    		(: TODO: berlegen, wie die Staff-spezifischen Ausschnitte angezeigt werden sollen :)
        string-join(local:getMeasures($mei, $surface), ','),
    string(']')
)