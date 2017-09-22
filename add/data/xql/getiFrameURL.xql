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

return
    replace($uri, 'xmldb:exist:///db/', concat('http://', request:get-server-name(), ':', request:get-server-port(), '/exist/'))