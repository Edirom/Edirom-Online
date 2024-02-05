xquery version "3.1";

(:
 : Copyright: For LICENSE-Details please refer to the LICENSE file in the root directory of this repository.
 :)

(: IMPORTS ================================================================= :)

import module namespace httpclient = "http://exist-db.org/xquery/httpclient";

(: NAMESPACE DECLARATIONS ================================================== :)

declare namespace html = "http://www.w3.org/1999/xhtml";

(: QUERY BODY ============================================================== :)

let $sessionId := request:get-parameter('sessionId', '')
let $test := httpclient:head(xs:anyURI('http://textgridlab.org/1.0/tgcrud/rest/textgrid:208dw/data?sessionId=' || $sessionId), false(), ())
let $status := $test/root()/httpclient:response/string(@statusCode)
let $status := response:set-status-code(xs:int($status))
return
    $status
