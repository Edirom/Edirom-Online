xquery version "3.1";

(:
 : Copyright: For LICENSE-Details please refer to the LICENSE file in the root directory of this repository.
 :)

(:~
    Returns a list of participants of a specific annotation.

    @author <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
:)

(: NAMESPACE DECLARATIONS ================================================== :)

declare namespace request = "http://exist-db.org/xquery/request";
declare namespace output = "http://www.w3.org/2010/xslt-xquery-serialization";

(: OPTION DECLARATIONS ===================================================== :)

declare option output:method "text";
declare option output:media-type "text/html";

let $uri := request:get-parameter('uri', '')
let $docUri := substring-before($uri, '#')
let $internalId := substring-after($uri, '#')
let $doc := doc($docUri)
let $annot := $doc/id($internalId)
let $participants := $annot/string(@plist)

let $map := map {
    'success': true(),
    'participants': $participants
}

let $options :=
map {
    'method': 'json',
    'media-type': 'text/plain'
}

return
    serialize($map, $options)
