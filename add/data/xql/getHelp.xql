xquery version "3.1";
(:
 : For LICENSE-Details please refer to the LICENSE file in the root directory of this repository.
 :)


(: IMPORTS ================================================================= :)

import module namespace eutil = "http://www.edirom.de/xquery/eutil" at "../xqm/eutil.xqm";


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


(: QUERY BODY ============================================================== :)

let $lang := request:get-parameter('lang', 'en')

let $idPrefix := request:get-parameter('idPrefix', '')

let $base := eutil:get-app-collection()

let $baseXslt := $base ||'/data/xslt/'

let $docUri := string-join(($base,concat('help/help_', $lang, '.xml')), '/')

let $contextPath :=
    if(starts-with(document-uri($doc), '/db')) then
        substring-after(document-uri($doc), '/db')
    else document-uri($doc)

let $contextPath := substring-before($contextPath, concat('help/help_', $lang, '.xml'))

let $contextPath := request:get-context-path() || $contextPath

let $xsl := doc('../xslt/edirom_langReplacement.xsl')

let $doc := 
    transform:transform($doc, $xsl,
        <parameters>
            <param name="base" value="{$baseXslt}"/>
            <param name="lang" value="{$lang}"/>
        </parameters>
    )

let $xsl := doc('../xslt/tei/profiles/edirom-body/teiBody2HTML.xsl')

let $doc :=
    transform:transform($doc, $xsl,
        <parameters>
            <param name="base" value="{$baseXslt}"/>
            <param name="lang" value="{$lang}"/>
            <param name="tocDepth" value="1"/>
            <param name="contextPath" value="{$contextPath}"/>
            (: == passing empty value for docUri (XSLT expects xs:anyURI, but ExtJS view does not provide value) -> github#480 == :)
            <param name="docUri" value="{$docUri}"/>
        </parameters>
    )

return
    transform:transform($doc, doc('../xslt/edirom_idPrefix.xsl'),
        <parameters>
            <param name="idPrefix" value="{$idPrefix}"/>
        </parameters>
    )
