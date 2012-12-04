xquery version "1.0";
(: daniel: returns the source's title :)

declare namespace request="http://exist-db.org/xquery/request";
declare namespace mei="http://www.edirom.de/ns/mei";

declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";

let $id := request:get-parameter('id', '')
let $coll := '/db/contents/sources'
let $mei := xcollection($coll)//mei:source/id($id)/root()
 
return
    $mei//mei:source/id($id)/mei:titlestmt/data(mei:title)