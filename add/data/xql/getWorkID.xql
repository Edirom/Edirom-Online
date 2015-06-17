xquery version "3.0";
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

import module namespace work="http://www.edirom.de/xquery/work" at "../xqm/work.xqm";

declare namespace edirom="http://www.edirom.de/ns/1.3";

declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";

let $uri := request:get-parameter('uri', '')
let $workId := request:get-parameter('workId', '')
return
    if(doc($uri)//edirom:work[@xml:id = $workId])
    then($workId)
    else(work:findWorkID($uri))