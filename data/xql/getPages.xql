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

  ID: $Id: getPages.xql 1268 2012-03-02 09:46:28Z johannes $
:)

declare namespace request="http://exist-db.org/xquery/request";
declare namespace mei="http://www.music-encoding.org/ns/mei";
declare namespace img="http://www.edirom.de/ns/image";

declare namespace xmldb="http://exist-db.org/xquery/xmldb";

declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";

let $uri := request:get-parameter('uri', '')
let $mei := doc($uri)/root()

let $ret := for $surface in $mei//mei:surface
            (:let $image := doc($surface/mei:graphic[@type='facsimile']/string(@target))/img:image:)
            let $graphic := $surface/mei:graphic[@type='facsimile']
            return
                concat('{',
                    'id: "', $surface/string(@xml:id), '", ',
                    'path: "', $graphic/string(@target), '", ',
                    'name: "', $surface/string(@n), '", ',
                    'width: "', $graphic/string(@width), '", ',
                    'height: "', $graphic/string(@height), '"',
                '}')

return concat('[', string-join($ret, ','), ']')
