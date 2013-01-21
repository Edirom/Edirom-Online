xquery version "1.0";
(: joachim: saves an object :)

declare namespace request="http://exist-db.org/xquery/request";
declare namespace util="http://exist-db.org/xquery/util";
declare namespace xlink="http://www.w3.org/1999/xlink";

let $xqueryupdate := request:get-parameter('updates', '')
let $namespace := util:declare-namespace('', resolve-uri(request:get-parameter('namespace', ''), ''))

return 
    util:eval($xqueryupdate)
