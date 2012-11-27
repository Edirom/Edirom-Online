xquery version "3.0";

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

import module namespace functx="http://www.functx.com" at '../modules/functx-1.0-nodoc-2007-01.xq';

declare namespace mei="http://www.music-encoding.org/ns/mei";
declare namespace tei="http://www.tei-c.org/ns/1.0";

let $objects := collection('/db/contents')//tei:TEI | collection('/db/contents')//mei:mei
return

<objects>
    <total>{count($objects)}</total>
    <success>true</success>
    {
    
    for $object in $objects
    let $uri := document-uri($object/root())
    let $filename := functx:substring-after-last($uri, '/')
    let $creation := xmldb:created(functx:substring-before-last($uri, '/'))
    return
        <object>
            <filename>{$filename}</filename>
            <uri>{$uri}</uri>
            <creation>{$creation}</creation>
        </object>
    }
</objects>