xquery version "3.0";

declare namespace html="http://www.w3.org/1999/xhtml";
declare namespace h="http://exist-db.org/xquery/httpclient";

let $sessionId := request:get-parameter('sessionId', '')

let $test := httpclient:head(xs:anyURI('http://textgridlab.org/1.0/tgcrud/rest/textgrid:208dw/data?sessionId=' || $sessionId),
                    false(), ())

let $status := $test/root()/httpclient:response/string(@statusCode)
let $status := response:set-status-code(xs:int($status))

return
    $status