xquery version "3.1";
(:
 : For LICENSE-Details please refer to the LICENSE file in the root directory of this repository.
 :)

(: IMPORTS ================================================================= :)

import module namespace eutil = "http://www.edirom.de/xquery/util" at "../xqm/util.xqm";

(: NAMESPACE DECLARATIONS ================================================== :)

declare namespace img = "http://www.edirom.de/ns/image";
declare namespace mei = "http://www.music-encoding.org/ns/mei";
declare namespace output = "http://www.w3.org/2010/xslt-xquery-serialization";
declare namespace request = "http://exist-db.org/xquery/request";
declare namespace tei = "http://www.tei-c.org/ns/1.0";
declare namespace xmldb = "http://exist-db.org/xquery/xmldb";

(: OPTION DECLARATIONS ===================================================== :)

declare option output:method "json";
declare option output:media-type "application/json";

(: QUERY BODY ============================================================== :)

let $uri := request:get-parameter('uri', '')
let $mei := eutil:getDoc($uri)

let $ret :=
    for $surface in $mei//mei:surface
    (:let $image := doc($surface/mei:graphic[@type='facsimile']/string(@target))/img:image:)
    let $graphic := $surface/mei:graphic[@type = 'facsimile']
    return
        map {
            'id': $surface/string(@xml:id),
            'path': $graphic/string(@target),
            'name': $surface/string(@n),
            'width': $graphic/string(@width),
            'height': $graphic/string(@height)
        }

let $ret :=
    if (count($ret) = 0) then (
        for $surface in $mei//tei:surface
        let $graphic := $surface/tei:graphic[1]
        return
            map {
                'id': $surface/string(@xml:id),
                'path': $graphic/string(@url),
                'name': $surface/string(@n),
                'width': replace($graphic/string(@width), 'px', ''),
                'height': replace($graphic/string(@height), 'px', '')
            }
    ) else
    ($ret)

return
    $ret
