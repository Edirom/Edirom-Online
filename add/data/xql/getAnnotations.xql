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

  ID: $Id: getAnnotations.xql 1324 2012-05-15 13:59:35Z daniel $
:)

(:~
: Returns a JSON representation of all Annotations of a document.
:
: @author <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
:)

import module namespace annotation = "http://www.edirom.de/xquery/annotation" at "../xqm/annotation.xqm";


declare namespace request = "http://exist-db.org/xquery/request";
declare namespace mei = "http://www.music-encoding.org/ns/mei";
declare namespace output = "http://www.w3.org/2010/xslt-xquery-serialization";

declare option output:method "text";
declare option output:media-type "text/plain";

let $edition := request:get-parameter('edition', '')
let $uri := request:get-parameter('uri', '')
let $uri := if (contains($uri, '#')) then
    (substring-before($uri, '#'))
else
    ($uri)

let $map :=
map {
    'success': true(),
    'total': count(doc($uri)//mei:annot[@type = 'editorialComment']),
    'annotations': array {annotation:annotationsToJSON($uri, $edition)}
}
let $options :=
map {
    'method': 'json',
    'media-type': 'text/plain'
}

return
    serialize($map, $options)
