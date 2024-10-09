xquery version "3.1";
(:
 : For LICENSE-Details please refer to the LICENSE file in the root directory of this repository.
 :)

(: IMPORTS ================================================================= :)

import module namespace edition = "http://www.edirom.de/xquery/edition" at "../xqm/edition.xqm";
import module namespace eutil = "http://www.edirom.de/xquery/util" at "../xqm/util.xqm";

(: NAMESPACE DECLARATIONS ================================================== :)

declare namespace output = "http://www.w3.org/2010/xslt-xquery-serialization";
declare namespace request = "http://exist-db.org/xquery/request";
declare namespace system = "http://exist-db.org/xquery/system";
declare namespace transform = "http://exist-db.org/xquery/transform";

(: OPTION DECLARATIONS ===================================================== :)

declare option output:media-type "text/html";
declare option output:method "xhtml";
declare option output:indent "yes";
declare option output:omit-xml-declaration "yes";

(: VARIABLE DECLARATIONS =================================================== :)

declare variable $edition := request:get-parameter('edition', '');
declare variable $imageserver := eutil:getPreference('image_server', $edition);

declare variable $imagePrefix :=
    if ($imageserver = 'leaflet') then
        (eutil:getPreference('leaflet_prefix', $edition))
    else
        (eutil:getPreference('image_prefix', $edition));

(: QUERY BODY ============================================================== :)

let $uri := request:get-parameter('uri', '')
let $selectionId := request:get-parameter('selectionId', '')
let $subtreeRoot := request:get-parameter('subtreeRoot', '')
let $idPrefix := request:get-parameter('idPrefix', '')

let $base := concat('file:', system:get-module-load-path())

let $doc := doc($uri)/root()
let $xsl := '../xslt/reduceToSelection.xsl'

let $doc :=
    transform:transform($doc, $xsl,
        <parameters>
            <param name="selectionId" value="{$selectionId}"/>
            <param name="subtreeRoot" value="{$subtreeRoot}"/>
        </parameters>
    )

let $doc := $doc/root()

let $xslInstruction := $doc//processing-instruction(xml-stylesheet)

let $xslInstruction :=
    for $i in serialize($xslInstruction, ())
    return
        if (matches($i, 'type="text/xsl"')) then
            (substring-before(substring-after($i, 'href="'), '"'))
        else
        ()

(:let $imagePrefix := eutil:getPreference('image_prefix', request:get-parameter('edition', '')):)

let $xsl :=
    if ($xslInstruction) then
        (doc($xslInstruction))
    else
        ('../xslt/teiBody2HTML.xsl')

let $params := (
    <param name="base" value="{concat($base, '/../xslt/')}"/>,
    <param name="idPrefix" value="{$idPrefix}"/>
)

return
    if ($xslInstruction) then
        (transform:transform($doc/root(), $xsl, <parameters>{$params}</parameters>))
    else
        (transform:transform($doc/root(), $xsl, <parameters>{$params}<param name="graphicsPrefix" value="{$imagePrefix}"/></parameters>))
