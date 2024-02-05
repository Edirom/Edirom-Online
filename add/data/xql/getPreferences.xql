xquery version "3.1";
(:
For LICENSE-Details please refer to the LICENSE file in the root directory of this repository.
:)

(:~
 : Returns preferences as JSON or XML.
 :
 : @author <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
 :)

(: IMPORTS ================================================================= :)

import module namespace edition = "http://www.edirom.de/xquery/edition" at "../xqm/edition.xqm";

(: NAMESPACE DECLARATIONS ================================================== :)

declare namespace request = "http://exist-db.org/xquery/request";

(: OPTION DECLARATIONS ===================================================== :)

declare option exist:serialize "method=xhtml media-type=text/html omit-xml-declaration=yes indent=yes";

(: QUERY BODY ============================================================== :)

let $mode := request:get-parameter('mode', '')
let $edition := request:get-parameter('edition', '')

(:let $base := concat('file:', system:get-module-load-path()):)
(:let $file := doc(concat($base, '/../prefs/edirom-prefs.xml')):)
let $file := doc('../prefs/edirom-prefs.xml')

let $projectFile := doc(edition:getPreferencesURI($edition))

return
    if ($mode = 'json') then (
        concat(
            '{',
                string-join((
                    for $entry in $file//entry
                    return
                        concat('"', $entry/string(@key), '":"', $entry/string(@value), '"'),
                    for $entry in $projectFile//entry
                    return
                        concat('"', $entry/string(@key), '":"', $entry/string(@value), '"')
                ), ','),
            '}'
        )
    ) else
        ($file)
