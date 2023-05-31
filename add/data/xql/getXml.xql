xquery version "3.1";
(:
For LICENSE-Details please refer to the LICENSE file in the root directory of this repository. 
:)


declare namespace mei="http://www.music-encoding.org/ns/mei";
declare namespace output = "http://www.w3.org/2010/xslt-xquery-serialization";

import module namespace request = "http://exist-db.org/xquery/request";

import module namespace eutil="http://www.edirom.de/xquery/util" at "../xqm/util.xqm";

declare option output:method "xml";
declare option output:media-type "text/xml";
declare option output:omit-xml-declaration "no";
declare option output:indent "yes";

let $uri := request:get-parameter('uri', '')
let $internalId := request:get-parameter('internalId', '')
let $doc := eutil:getDoc($uri)/root()
let $internal := $doc/id($internalId)

return
    if(exists($internal))
    then($internal)
    else($doc)