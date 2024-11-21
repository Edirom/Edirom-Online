xquery version "3.1";
(:
 : For LICENSE-Details please refer to the LICENSE file in the root directory of this repository.
 :)

(:~
: Returns a JSON representation of all Annotations of a document.
:
: @author <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
:)

(: IMPORTS ================================================================= :)

import module namespace annotation = "http://www.edirom.de/xquery/annotation" at "../xqm/annotation.xqm";

(: NAMESPACE DECLARATIONS ================================================== :)

declare namespace request = "http://exist-db.org/xquery/request";
declare namespace mei = "http://www.music-encoding.org/ns/mei";
declare namespace output = "http://www.w3.org/2010/xslt-xquery-serialization";

(: OPTION DECLARATIONS ===================================================== :)

declare option output:method "json";
declare option output:media-type "application/json";

let $edition := request:get-parameter('edition', '')
let $uri := request:get-parameter('uri', '')

let $uri :=
    if (contains($uri, '#')) then
        (substring-before($uri, '#'))
    else
        ($uri)

let $map :=
    map {
        'success': true(),
        'total': count(doc($uri)//mei:annot[@type = 'editorialComment']),
        'annotations': array {annotation:annotationsToJSON($uri, $edition)}
    }

return
    $map
