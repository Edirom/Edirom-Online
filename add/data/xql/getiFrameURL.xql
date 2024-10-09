xquery version "3.1";
(:
 : For LICENSE-Details please refer to the LICENSE file in the root directory of this repository.
 :)

(: NAMESPACE DECLARATIONS ================================================== :)

declare namespace output = "http://www.w3.org/2010/xslt-xquery-serialization";
declare namespace request = "http://exist-db.org/xquery/request";

(: OPTION DECLARATIONS ===================================================== :)

declare option output:media-type "text/plain";
declare option output:method "text";

(: QUERY BODY ============================================================== :)

let $uri := request:get-parameter('uri', '')
let $uri :=
    replace($uri,
        'xmldb:exist:///db/',
        concat(
            request:get-scheme(),
            '://',
            request:get-server-name(),
            ':',
            request:get-server-port(),
            '/'
        )
    )
    
return
    if (contains(request:get-url(), '/exist/')) then
        (replace($uri, '/apps', '/exist/apps'))
    else
        ($uri)
