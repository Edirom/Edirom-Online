xquery version "3.1";
(:
For LICENSE-Details please refer to the LICENSE file in the root directory of this repository.
:)

(:~
: Returns a JSON representation of all Works inside an Edition.
:
: @author <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
:)

(: IMPORTS ========================================================= :)

import module namespace edition = "http://www.edirom.de/xquery/edition" at "../xqm/edition.xqm";
import module namespace work = "http://www.edirom.de/xquery/work" at "../xqm/work.xqm";

(: NAMESPACE DECLARATIONS ========================================== :)

declare namespace request = "http://exist-db.org/xquery/request";

(: OPTION DECLARATIONS ============================================= :)

declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";

(: QUERY BODY ============================================================== :)

let $uri := request:get-parameter('editionId', '')
let $workUris := edition:getWorkUris($uri)

return
    concat(
        '[',
        string-join(
            for $workUri in $workUris
            return
                work:toJSON($workUri, $uri)
        , ','),
    ']')
