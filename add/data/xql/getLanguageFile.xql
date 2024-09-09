xquery version "3.1";
(:
 : For LICENSE-Details please refer to the LICENSE file in the root directory of this repository.
 :)

(:~
 : Returns a language file as JSON or XML.
 :
 : @author <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
 :)

(: IMPORTS ================================================================= :)

import module namespace edition = "http://www.edirom.de/xquery/edition" at "../xqm/edition.xqm";

(: NAMESPACE DECLARATIONS ================================================== :)

declare namespace output = "http://www.w3.org/2010/xslt-xquery-serialization";
declare namespace request = "http://exist-db.org/xquery/request";

(: OPTION DECLARATIONS ===================================================== :)

declare option output:media-type "text/html";
declare option output:method "xhtml";
declare option output:indent "yes";
declare option output:omit-xml-declaration "yes";

(: QUERY BODY ============================================================== :)

let $lang := request:get-parameter('lang', '')
let $mode := request:get-parameter('mode', '')
let $edition := request:get-parameter('edition', '')

(:let $base := concat('file:', system:get-module-load-path())
let $file := doc(concat($base, '/../locale/edirom-lang-', $lang, '.xml'))
:)
let $file := doc(concat('../locale/edirom-lang-', $lang, '.xml'))
let $projectFile := doc(edition:getLanguageFileURI($edition, $lang))

return
    if ($mode = 'json') then (
        concat(
            '{',
            'lang: "', $file/langFile/lang/text(), '",',
            'version: "', $file/langFile/version/text(), '",',
            'keys: {',
                string-join((
                    for $entry in $file//entry
                    return
                        concat('"', $entry/string(@key), '":"', $entry/string(@value), '"'),
                    for $entry in $projectFile//entry
                    return
                        concat('"', $entry/string(@key), '":"', $entry/string(@value), '"')
                ), ','),
            '}',
            '}'
        )
    ) else
        ($file)
