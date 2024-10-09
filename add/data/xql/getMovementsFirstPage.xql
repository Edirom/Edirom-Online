xquery version "3.1";
(:
 : For LICENSE-Details please refer to the LICENSE file in the root directory of this repository.
 :)

(: NAMESPACE DECLARATIONS ================================================== :)

declare namespace mei = "http://www.music-encoding.org/ns/mei";
declare namespace output = "http://www.w3.org/2010/xslt-xquery-serialization";
declare namespace request = "http://exist-db.org/xquery/request";

(: OPTION DECLARATIONS ===================================================== :)

declare option output:media-type "text/plain";
declare option output:method "text";

(: QUERY BODY ============================================================== :)

let $uri := request:get-parameter('uri', '')
let $movementId := request:get-parameter('movementId', '')

let $mei := doc($uri)/root()

let $zoneId := ($mei/id($movementId)//mei:measure)[1]/string(@facs)

let $zoneId :=
    if (starts-with($zoneId, '#')) then
        (substring($zoneId, 2))
    else
        ($zoneId)

return
    $mei/id($zoneId)/parent::mei:surface/string(@xml:id)
