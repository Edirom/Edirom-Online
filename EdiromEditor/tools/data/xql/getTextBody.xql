xquery version "1.0";
(: johannes: returns a complete text object :)

declare namespace request="http://exist-db.org/xquery/request";
declare namespace tei="http://www.tei-c.org/ns/1.0";
declare namespace image="http://www.edirom.de/ns/image";

declare option exist:serialize "method=xml media-type=text/xml omit-xml-declaration=yes indent=yes";
  

let $id := request:get-parameter('id', '-1')
let $coll := '/db/contents/texts'
let $tei := xcollection($coll)//tei:TEI/id($id)/root()
let $appVersion := request:get-parameter('appVersion', '')

return(<?xml-stylesheet type="text/css" href="/text/TextView/css/edirom_tei/edirom_tei.css?{$appVersion}"?>,
       $tei)
