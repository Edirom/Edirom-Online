xquery version "3.1";
(:
 : For LICENSE-Details please refer to the LICENSE file in the root directory of this repository.
 :)

(: IMPORTS ================================================================= :)

import module namespace functx = "http://www.functx.com";

(: NAMESPACE DECLARATIONS ================================================== :)

declare namespace mei = "http://www.music-encoding.org/ns/mei";
declare namespace output = "http://www.w3.org/2010/xslt-xquery-serialization";

declare namespace request = "http://exist-db.org/xquery/request";
declare namespace xlink = "http://www.w3.org/1999/xlink";
declare namespace xmldb = "http://exist-db.org/xquery/xmldb";

(: OPTION DECLARATIONS ===================================================== :)

declare option output:method "json";
declare option output:media-type "application/json";

(: QUERY BODY ============================================================== :)

let $id := request:get-parameter('id', '')
let $measureId := request:get-parameter('measureId', '')

let $measureCount :=
    if (contains($measureId, 'tstamp2=')) then
        (number(substring-before(substring-after($measureId, 'tstamp2='), 'm')) + 1)
    else
        (1)

let $measureId :=
    if (contains($measureId, '?')) then
        (substring-before($measureId, '?'))
    else
        ($measureId)

let $mei := doc($id)/root()

let $movementId := $mei/id($measureId)/ancestor::mei:mdiv[1]/string(@xml:id)

(: Specific handling of virtual measure IDs for parts in OPERA project :)
let $movementId :=
    if (starts-with($measureId, 'measure_') and $mei//mei:parts) then
        (functx:substring-before-last(substring-after($measureId, 'measure_'), '_'))
    else
        ($movementId)

return
    map {
        'measureId': $measureId,
        'movementId': $movementId,
        'measureCount': $measureCount
    }
