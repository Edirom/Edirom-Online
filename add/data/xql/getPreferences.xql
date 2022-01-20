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

  ID: $Id: getPreferences.xql 1455 2012-10-11 10:42:55Z daniel $
:)

(:~
    Returns preferences as JSON or XML.
    
    @author <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
:)

declare namespace request="http://exist-db.org/xquery/request";

import module namespace edition="http://www.edirom.de/xquery/edition" at "../xqm/edition.xqm";

declare option exist:serialize "method=xhtml media-type=text/html omit-xml-declaration=yes indent=yes";

let $mode := request:get-parameter('mode', '')
let $edition := request:get-parameter('edition', '')

(:let $base := concat('file:', system:get-module-load-path()):)
(:let $file := doc(concat($base, '/../prefs/edirom-prefs.xml')):)
let $file := doc('../prefs/edirom-prefs.xml')

let $projectFile := doc(edition:getPreferencesURI($edition))

return
    if($mode = 'json')
    then(
        concat('{',
            string-join((
                for $entry in $file//entry
                return
                    concat('"', $entry/string(@key), '":"', $entry/string(@value), '"')

                ,
                for $entry in $projectFile//entry
                return
                    concat('"', $entry/string(@key), '":"', $entry/string(@value), '"')
            ), ','),
        '}')
    )
    else($file)
    