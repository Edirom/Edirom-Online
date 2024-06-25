xquery version "3.1";
(:
 : For LICENSE-Details please refer to the LICENSE file in the root directory of this repository.
 :)

(: NAMESPACE DECLARATIONS ================================================== :)

declare namespace mei = "http://www.music-encoding.org/ns/mei";
declare namespace output = "http://www.w3.org/2010/xslt-xquery-serialization";
declare namespace request = "http://exist-db.org/xquery/request";
declare namespace xlink = "http://www.w3.org/1999/xlink";
declare namespace xmldb = "http://exist-db.org/xquery/xmldb";

(: OPTION DECLARATIONS ===================================================== :)

declare option output:method "text";
declare option output:media-type "text/plain";

(: QUERY BODY ============================================================== :)

let $uri := request:get-parameter('uri', '')
let $mei := doc($uri)/root()

let $ret :=
    for $movement in $mei//mei:mdiv
    return
        map {
            'id': $movement/string(@xml:id),
            'name': $movement/string(@label)
        }

let $array := array {$ret}

let $options :=
    map {
        'method': 'json',
        'media-type': 'text/plain'
    }

return
    serialize($array, $options)
