xquery version "3.1";
(:
 : For LICENSE-Details please refer to the LICENSE file in the root directory of this repository.
 :)

(: NAMESPACE DECLARATIONS ================================================== :)

declare namespace request = "http://exist-db.org/xquery/request";
declare namespace xmldb = "http://exist-db.org/xquery/xmldb";

(: OPTION DECLARATIONS ===================================================== :)

declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";

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
