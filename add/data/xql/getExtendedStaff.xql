xquery version "3.0";

declare namespace request="http://exist-db.org/xquery/request";
declare namespace mei="http://www.music-encoding.org/ns/mei";
declare namespace tei="http://www.tei-c.org/ns/1.0";
declare namespace xmldb="http://exist-db.org/xquery/xmldb";
declare namespace system="http://exist-db.org/xquery/system";
declare namespace transform="http://exist-db.org/xquery/transform";

declare option exist:serialize "method=xml media-type=text/plain omit-xml-declaration=yes indent=yes";

(:let $path := request:get-parameter('path', '')
let $staffID := request:get-parameter('staffID', '')
let $id_prefix := request:get-parameter('id_prefix', '')
let $endPageName := request:get-parameter('endPageName','')
let $docPath := concat($freidi-pmd:ce-data, substring-before($path,'_'),'/', substring-before($staffID,'_measure'),'.xml')
let $pageName := tokenize($path,'/')[last()]:)
(:  :let $endPagePath := replace($path,$pageName,$endPageName):)
(:let $xslbase := concat(replace(system:get-module-load-path(), 'embedded-eXist-server', ''), '/../xsl/')

let $doc := doc($docPath)

let $snippet := transform:transform($doc, doc($xslbase || 'stripPage2staff.xsl'), <parameters><param name="staffID" value="{$staffID}"/><param name="id_prefix" value="{$id_prefix}"/><param name="path" value="{$path}"/><param name="endPageName" value="{$endPageName}"/></parameters>)
let $preparedSnippet := transform:transform($snippet, doc($xslbase || 'prepareRendering.xsl'), <parameters></parameters>):)
let $uri := request:get-parameter('uri', '')
let $preparedSnippet := doc($uri)

(:let $pb.before := $preparedSnippet//mei:surface[@n]

let $snippet := <controlEvents>{
                                for $elem in $preparedSnippet//mei:measure[preceding::mei:surface[1]/@xml:id = $pb.before/@xml:id]
                                return
                                    $elem

                             }</controlEvents>:)

(:let $preparedSnippet :=doc("http://localhost:8080/exist/rest/db/contents/sources/edirom_source_01b5977f-4075-4373-a709-5e762b81e8ca.xml"):)
return 
    $preparedSnippet