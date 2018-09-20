xquery version "3.1";
(:
  Edirom Online
  Copyright (C) 2014 The Edirom Project
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
: Returns the ID of the first work of an Edition if the given ID is not valid.
:
: @author <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
:)

declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";

let $uri := request:get-parameter('uri', '')
let $workId := request:get-parameter('workId', '')

let $api := 'http://nashira.upb.de:5001/works'
let $json := json-doc($api)
let $workIds := array:for-each($json, function($work) {
        xs:string(map:get($work, 'id'))
    })

return
    if($workId = $workIds)
    then($workId)
    else(array:get($workIds, 1))