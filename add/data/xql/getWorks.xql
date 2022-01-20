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

  ID: $Id: getWorks.xql 1324 2012-05-15 13:59:35Z daniel $
:)

(:~
: Returns a JSON representation of all Works inside an Edition.
:
: @author <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
:)

import module namespace edition="http://www.edirom.de/xquery/edition" at "../xqm/edition.xqm";
import module namespace work="http://www.edirom.de/xquery/work" at "../xqm/work.xqm";

declare namespace request="http://exist-db.org/xquery/request";

declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";

let $uri := request:get-parameter('editionId', '')
let $workUris := edition:getWorkUris($uri)

return
    concat('[',
	    string-join(
	       
	       for $workUri in $workUris
	       return work:toJSON($workUri, $uri)
	       
	    , ','),
    ']')