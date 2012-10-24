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

  ID: $Id: getInternalIdType.xql 1289 2012-03-26 13:11:43Z daniel $
:)

declare namespace request="http://exist-db.org/xquery/request";

declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";

let $uri := request:get-parameter('uri', '')
let $docUri := if(contains($uri, '#')) then(substring-before($uri, '#')) else($uri)
let $internalId := if(contains($uri, '#')) then(substring-after($uri, '#')) else()

let $doc := doc($docUri)
let $internal := $doc/id($internalId)

return
    if(exists($internal))
    then(local-name($internal))
    else('unknown')
