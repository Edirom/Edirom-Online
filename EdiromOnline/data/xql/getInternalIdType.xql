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
declare namespace mei="http://www.music-encoding.org/ns/mei";

import module namespace functx = "http://www.functx.com" at "../xqm/functx-1.0-nodoc-2007-01.xq";

declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";

let $uri := request:get-parameter('uri', '')
let $docUri := if(contains($uri, '#')) then(substring-before($uri, '#')) else($uri)
let $internalId := if(contains($uri, '#')) then(substring-after($uri, '#')) else()
let $internalId := if(contains($internalId, '?')) then(substring-before($internalId, '?')) else($internalId)

let $doc := doc($docUri)
let $internal := $doc/id($internalId)

(: Specific handling of virtual measure IDs for parts in OPERA project :)
let $internal := if(exists($internal))then($internal)else(
                        if(starts-with($internalId, 'measure_') and $doc//mei:parts)
                        then(
                            let $mdivId := functx:substring-before-last(substring-after($internalId, 'measure_'), '_')
                            let $measureN := functx:substring-after-last($internalId, '_')
                            return
                                ($doc/id($mdivId)//mei:measure[@n eq $measureN])[1]
                        )
                        else($internal)
                    )

return
    if(exists($internal))
    then(local-name($internal))
    else('unknown')
