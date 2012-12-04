xquery version "1.0";
(: daniel: returns the works's title :)

declare namespace request="http://exist-db.org/xquery/request";
declare namespace mei="http://www.edirom.de/ns/mei";

declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";

let $id := request:get-parameter('id', '')
let $coll := '/db/contents/works'
let $mei := xcollection($coll)//mei:meicorpus/id($id)/root()
 
return
    $mei//mei:meihead[@type eq 'corpus']/mei:filedesc/mei:titlestmt/mei:title/text()