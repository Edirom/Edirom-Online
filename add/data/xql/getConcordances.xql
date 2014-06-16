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

  ID: $Id: getConcordances.xql 1219 2012-01-20 08:33:28Z daniel $
:)


declare namespace request="http://exist-db.org/xquery/request";
declare namespace mei="http://www.music-encoding.org/ns/mei";
declare namespace edirom="http://www.edirom.de/ns/1.3";
declare namespace xlink="http://www.w3.org/1999/xlink";

declare namespace xmldb="http://exist-db.org/xquery/xmldb";

declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";

declare function local:getGroups($parent) {
    if($parent/edirom:groups)
    then(
        concat('{', 'label: "', $parent/edirom:groups/string(@label), '", groups: [', local:getSingleGroups($parent/edirom:groups), ']}')
    )
    else(string('null'))
};

declare function local:getSingleGroups($parent) {
    string-join(
        for $group in $parent/edirom:group
        return
                concat('
                {',
                    'name: "', $group/string(@name), '", ',
                    'connections: ', local:getConnections($group),
                '}')
    , ',')
};

declare function local:getConnections($parent) {
    if($parent/edirom:connections)
    then(
        concat('{', 'label: "', $parent/edirom:connections/string(@label), '", connections: [', local:getSingleConnections($parent/edirom:connections), ']}')
    )
    else(string('null'))
};

declare function local:getSingleConnections($parent) {
    string-join(
        for $connection in $parent/edirom:connection
        return
                concat('
                {',
                    'name: "', $connection/string(@name), '", ',
                    'plist: "', $connection/@plist, '"',
                '}')
    , ',')
};

let $id := request:get-parameter('id', '')
let $mei := doc($id)/root()
let $workId := request:get-parameter('workId', '')
let $work := $mei/id($workId)
let $concordances := $work//edirom:concordance

return (
    concat('[',

    string-join(
        for $concordance in $concordances
        return
                concat('
                {',
                    'name: "', $concordance/string(@name), '", ',
                    'groups: ', local:getGroups($concordance), ', ',
                    'connections: ', local:getConnections($concordance),
                '}')
    , ','),

    ']')
)
