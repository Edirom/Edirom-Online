xquery version "3.1";
(:
 : For LICENSE-Details please refer to the LICENSE file in the root directory of this repository.
 :)

(: IMPORTS ================================================================= :)

import module namespace eutil = "http://www.edirom.de/xquery/util" at "../xqm/util.xqm";

(: NAMESPACE DECLARATIONS ================================================== :)

declare namespace mei = "http://www.music-encoding.org/ns/mei";
declare namespace request = "http://exist-db.org/xquery/request";

(: OPTION DECLARATIONS ===================================================== :)

declare option exist:serialize "method=xml media-type=text/xml omit-xml-declaration=no indent=yes";

(: QUERY BODY ============================================================== :)

let $uri := request:get-parameter('uri', '')
let $internalId := request:get-parameter('internalId', '')
let $doc := eutil:getDoc($uri)/root()
let $internal := $doc/id($internalId)

return
    if (exists($internal)) then
        ($internal)
    else
        ($doc)
