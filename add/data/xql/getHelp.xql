xquery version "3.1";
(:
For LICENSE-Details please refer to the LICENSE file in the root directory of this repository.
:)

(: OPTION DECLARATIONS ===================================================== :)

declare option exist:serialize "method=xhtml media-type=text/html omit-xml-declaration=yes indent=yes";

(: QUERY BODY ============================================================== :)

let $lang := request:get-parameter('lang', 'en')
let $idPrefix := request:get-parameter('idPrefix', '')

let $base := replace(system:get-module-load-path(), 'embedded-eXist-server', '') (:TODO:)

let $doc := doc(concat('../../help/help_', $lang, '.xml'))

let $xsl := doc('../xslt/edirom_langReplacement.xsl')
let $doc := 
    transform:transform($doc, $xsl,
        <parameters>
            <param name="base" value="{concat($base, '/../xslt/')}"/>
            <param name="lang" value="{$lang}"/>
        </parameters>
    )

let $xsl := doc('../xslt/teiBody2HTML.xsl')
let $doc :=
    transform:transform($doc, $xsl,
        <parameters>
            <param name="base" value="{concat($base, '/../xslt/')}"/>
            <param name="lang" value="{$lang}"/>
            <param name="tocDepth" value="1"/>
            <param name="graphicsPrefix" value="help/"/>
        </parameters>
    )

return
    transform:transform($doc, doc('../xslt/edirom_idPrefix.xsl'),
        <parameters>
            <param name="idPrefix" value="{$idPrefix}"/>
        </parameters>
    )

