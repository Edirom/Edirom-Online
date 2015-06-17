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
: Returns the URI of the first found Edition.
:
: @author <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
:)

import module namespace edition="http://www.edirom.de/xquery/edition" at "../xqm/edition.xqm";

declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";

let $uri := request:get-parameter('uri', '')
return
    if(doc-available($uri))
    then($uri)
    else(edition:findEdition())