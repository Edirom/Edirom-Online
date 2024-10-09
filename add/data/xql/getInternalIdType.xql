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

(: OPTION DECLARATIONS ===================================================== :)

declare option output:media-type "text/plain";
declare option output:method "text";

(: QUERY BODY ============================================================== :)

let $uri := request:get-parameter('uri', '')
let $docUri :=
    if (contains($uri, '#')) then
        (substring-before($uri, '#'))
    else
        ($uri)
let $internalId :=
    if (contains($uri, '#')) then
        (substring-after($uri, '#'))
    else
        ()
let $internalId :=
    if (contains($internalId, '?')) then
        (substring-before($internalId, '?'))
    else
        ($internalId)
let $doc := doc($docUri)
let $internal := $doc/id($internalId)

(: Specific handling of virtual measure IDs for parts in OPERA project :)
let $internal :=
    if (exists($internal)) then
        ($internal)
    else (
        if (starts-with($internalId, 'measure_') and $doc//mei:parts) then (
            let $mdivId := functx:substring-before-last(substring-after($internalId, 'measure_'), '_')
            let $measureN := functx:substring-after-last($internalId, '_')
            return (
                if ($doc/id($mdivId)//mei:measure/@label) then
                    $doc/id($mdivId)//mei:measure[@label eq $measureN][1]
                else
                    $doc/id($mdivId)//mei:measure[@n eq $measureN][1]
            )
        ) else
            ($internal)
    )

return
    if (exists($internal)) then
        (local-name($internal))
    else
        ('unknown')
