xquery version "3.1";
(:
For LICENSE-Details please refer to the LICENSE file in the root directory of this repository.
:)

(:~
: Returns the ID of the first work of an Edition if the given ID is not valid.
:
: @author <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
:)

(: IMPORTS ========================================================= :)

import module namespace work = "http://www.edirom.de/xquery/work" at "../xqm/work.xqm";

(: NAMESPACE DECLARATIONS ========================================== :)

declare namespace edirom = "http://www.edirom.de/ns/1.3";

(: OPTION DECLARATIONS ============================================= :)

declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";

(: QUERY BODY ============================================================== :)

let $uri := request:get-parameter('uri', '')
let $workId := request:get-parameter('workId', '')
return
    if (doc($uri)//edirom:work[@xml:id = $workId]) then
        ($workId)
    else
        (work:findWorkID($uri))
