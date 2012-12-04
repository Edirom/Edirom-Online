xquery version "1.0";
(: daniel: returns the text's title :)

declare namespace request="http://exist-db.org/xquery/request";
declare namespace tei="http://www.tei-c.org/ns/1.0";

declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";

let $id := request:get-parameter('id', '')
let $coll := '/db/contents/texts'
let $tei := xcollection($coll)//tei:TEI/id($id)/root()
 
return
    $tei//tei:teiHeader//tei:title[1]/text()