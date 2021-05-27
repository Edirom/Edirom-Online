xquery version "3.0";
(:
  Edirom Online
  Copyright (C) 2016 The Edirom Project
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

  ID: $Id: getiFrameURL.xql 1455 2012-10-11 10:42:55Z daniel $
:)

declare namespace request="http://exist-db.org/xquery/request";
declare namespace xmldb="http://exist-db.org/xquery/xmldb";

declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";

let $uri := request:get-parameter('uri', '')

(: RWA specific implementation, starts here: :)
let $RWAconfigDoc := doc('xmldb:exist:///db/apps/mriExistDBconf/config.xml')
let $RWAOnlineURL := $RWAconfigDoc//rwaOnlineURL
(: RWA specific implementation, ends here. :)

return
    (: RWA specific implementation, starts here: :)
    if (starts-with($uri, 'xmldb:exist:///db/apps/rwaTextComp/'))
    then (concat($RWAOnlineURL, substring-after($uri, 'apps/')))
    else if (starts-with($uri, 'xmldb:exist:///db/apps/'))
    then (replace($uri, 'xmldb:exist:///db/', concat('http://', request:get-server-name(), ':', request:get-server-port(), '/exist/')))
    else ()
    (: RWA specific implementation, ends here. :)
    
    (:    replace($uri, 'xmldb:exist:///db/', concat('http://', request:get-server-name(), ':', request:get-server-port(), '/exist/')):)