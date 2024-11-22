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
: @author <a href="mailto:nikolaos.beer@uni-paderborn.de">Nikolaos Beer</a>
:)

import module namespace console="http://exist-db.org/xquery/console";

declare namespace request="http://exist-db.org/xquery/request";
declare namespace mei="http://www.music-encoding.org/ns/mei";

declare namespace conf="https://www.maxreger.info/conf";

declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";

let $uri := request:get-parameter('uri', '')

let $configResource := doc('xmldb:exist:///db/apps/mriExistDBconf/config.xml')
let $rwaOnlineUrl := $configResource//conf:rwaOnlineURL
let $getAnnotationsRequestURL := concat($rwaOnlineUrl, '/resources/xql/getAnnotations.xql?uri=', $uri)
let $queryResult := hc:send-request(<hc:request href="{$getAnnotationsRequestURL}" method="get"/>)[2]

return 
    $queryResult