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

declare namespace tei = "http://www.tei-c.org/ns/1.0";

declare namespace xhtml = "http://www.w3.org/1999/xhtml";

(: OPTION DECLARATIONS ===================================================== :)

declare option output:method "xhtml";

declare option output:media-type "text/html";

declare option output:omit-xml-declaration "yes";

declare option output:indent "yes";

(: QUERY BODY ============================================================== :)

let $uri := request:get-parameter('uri', '')
let $idPrefix := request:get-parameter('idPrefix', '')
let $term := request:get-parameter('term', '')
let $path := request:get-parameter('path', '')
let $page := request:get-parameter('page', '')
let $doc := eutil:getDoc($uri)/root()
let $contextPath := request:get-context-path()
let $xslInstruction := $doc//processing-instruction(xml-stylesheet)

let $xslInstruction :=
    for $i in fn:serialize($xslInstruction, ())
    return
        if (matches($i, 'type="text/xsl"')) then
        (substring-before(substring-after($i, 'href="'), '"'))
    else
        ()

let $doc :=
    if ($term eq '') then
        ($doc)
    else
        ($doc//tei:text[ft:query(., $term)]/ancestor::tei:TEI)

let $doc :=
    if ($term eq '') then
        ($doc)
    else
        (util:expand($doc))

let $doc :=
    if ($page eq '') then
        ($doc)
    else (
        let $pb1 := $doc//tei:pb[@facs eq '#' || $page]/@n
        let $pb2 := ($doc//tei:pb[@facs eq '#' || $page]/following::tei:pb)[1]/@n
        
        return
            transform:transform($doc, doc('../xslt/reduceToPage.xsl'),
                <parameters>
                    <param name="pb1" value="{$pb1}"/>
                    <param name="pb2" value="{$pb2}"/>
                </parameters>
            )
    )

let $base := replace(system:get-module-load-path(), 'embedded-eXist-server', '')
let $edition := request:get-parameter('edition', '')
let $imageserver := eutil:getPreference('image_server', $edition)

let $imagePrefix :=
    if ($imageserver = 'leaflet') then
    (eutil:getPreference('leaflet_prefix', $edition))
    else
        (eutil:getPreference('image_prefix', $edition))

let $xsl :=
    if ($xslInstruction) then
        ($xslInstruction)
    else
        ('../xslt/tei/Stylesheets/html/html.xsl')

(:TODO introduce injection-point for tei-stylesheet parameters :)
let $params := (
    (: parameters for Edirom-Online :)
    <param name="lang" value="{eutil:getLanguage($edition)}"/>,
    <param name="docUri" value="{$uri}"/>,
    <param name="contextPath" value="{$contextPath}"/>,
    (: parameters for the TEI Stypesheets :)
    <param name="autoHead" value="false"/>,
    <param name="autoToc" value="false"/>,
    <param name="base" value="{concat($base, '/../xslt/')}"/>,
    <param name="documentationLanguage" value="{eutil:getLanguage($edition)}"/>,
    <param name="footnoteBackLink" value="true"/>,
    <param name="graphicsPrefix" value="{$imagePrefix}"/>, (:TODO from XSLT <param name="graphicsPrefix"/>:)
    <param name="numberHeadings" value="false"/>,
    <param name="pageLayout" value="CSS"/>
)

let $doc := transform:transform($doc, doc($xsl), <parameters>{$params}</parameters>)

(: Do a second transformation to add edirom online ID prefixes for unique ID values if object is open mutiple times :)
let $xsl := '../xslt/edirom_idPrefix.xsl'

let $params := (
    <param name="idPrefix" value="{$idPrefix}"/>
)

let $doc := transform:transform($doc, doc($xsl), <parameters>{$params}</parameters>)

let $body := $doc//xhtml:body

return
    element div {
        for $attribute in $body/@*
        return
            $attribute,
        for $node in $body/node()
        return
            $node
    }
