xquery version "3.1";
(:
 : For LICENSE-Details please refer to the LICENSE file in the root directory of this repository.
 :)

(:~
: Returns a JSON representation of an Edition.
:
: @author <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
:)

(: IMPORTS ================================================================= :)

import module namespace edition = "http://www.edirom.de/xquery/edition" at "../xqm/edition.xqm";

(: OPTION DECLARATIONS ===================================================== :)

declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";

(: QUERY BODY ============================================================== :)

let $uri := request:get-parameter('id', '')
return
    (:TODO use map an serialization options :)
    edition:toJSON($uri)
