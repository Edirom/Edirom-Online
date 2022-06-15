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

  ID: $Id: getOverlays.xql 1273 2012-03-09 16:27:21Z daniel $
:)

declare namespace request="http://exist-db.org/xquery/request";
declare namespace mei="http://www.music-encoding.org/ns/mei";
declare namespace xlink="http://www.w3.org/1999/xlink";

declare namespace xmldb="http://exist-db.org/xquery/xmldb";
declare namespace output = "http://www.w3.org/2010/xslt-xquery-serialization";

declare option output:method "text";
declare option output:media-type "text/plain";

let $uri := request:get-parameter('uri', '')
let $mei := doc($uri)/root()

let $ret := for $overlay in $mei//mei:annot[@type = 'overlay']
            return
                map {
                    'id': $overlay/string(@xml:id),
                    'name': string($overlay/mei:title)
                }

let $array := array { $ret }
let $options :=
    map {
        'method': 'json',
        'media-type': 'text/plain'
    }
    
return serialize($array, $options)