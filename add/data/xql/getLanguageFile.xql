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
declare namespace response = "http://exist-db.org/xquery/response";

(: OPTION DECLARATIONS ===================================================== :)

declare option output:media-type "application/xml";
declare option output:method "xml";
declare option output:indent "yes";

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
        let $serializationParameters := "method=text media-type=application/json encoding=utf-8"
        let $outputOptions :=
            <output:serialization-parameters>
                <output:method>json</output:method>
            </output:serialization-parameters>
        let $data := 
            map {
                "lang": $file/langFile/lang => normalize-space(),
                "version": $file/langFile/version => normalize-space(),
                "keys": map:merge((
                    $file//entry ! map:entry(./string(@key), ./string(@value)), 
                    $projectFile//entry ! map:entry(./string(@key), ./string(@value))
                ))
            }
        return
            response:stream($data => serialize($outputOptions), $serializationParameters)
    ) else
        ($file)
