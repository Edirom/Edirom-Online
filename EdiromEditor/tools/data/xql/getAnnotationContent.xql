xquery version "1.0";
(: johannes: xquery to get the content of an annotation :)

declare namespace request="http://exist-db.org/xquery/request";
declare namespace mei="http://www.edirom.de/ns/mei";
declare namespace image="http://www.edirom.de/ns/image";

declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";

let $id := request:get-parameter('id', '')
let $coll := '/db/contents/works'
let $annot := xcollection($coll)//mei:annot/id($id)
let $text := $annot/mei:p/text()
return
    normalize-space(string($text))