xquery version "1.0";
(: johannes: tab for XML :)

declare namespace request="http://exist-db.org/xquery/request";
declare namespace mei="http://www.edirom.de/ns/mei";

declare option exist:serialize "method=xhtml media-type=text/html omit-xml-declaration=no indent=yes 
        doctype-public=-//W3C//DTD&#160;XHTML&#160;1.0&#160;Strict//EN
        doctype-system=http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd";


let $id := request:get-parameter('id', '')
let $coll := '/db/contents/sources'
let $mdivs := xcollection($coll)//mei:source/id($id)/root()//mei:mdiv

return

<div>
	<div class="ediromSourceToolbar" id="sourceXMLToolbar">
        <div class="saveButton inactive"> </div>
    </div>
	
	<div style="clear: both"></div>
</div>
