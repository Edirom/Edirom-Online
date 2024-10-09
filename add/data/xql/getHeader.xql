xquery version "3.1";
(:
 : For LICENSE-Details please refer to the LICENSE file in the root directory of this repository.
 :)

(: IMPORTS ================================================================= :)

import module namespace eutil = "http://www.edirom.de/xquery/util" at "../xqm/util.xqm";

(: NAMESPACE DECLARATIONS ================================================== :)

declare namespace mei = "http://www.music-encoding.org/ns/mei";
declare namespace output = "http://www.w3.org/2010/xslt-xquery-serialization";
declare namespace request = "http://exist-db.org/xquery/request";
declare namespace system = "http://exist-db.org/xquery/system";
declare namespace tei = "http://www.tei-c.org/ns/1.0";
declare namespace transform = "http://exist-db.org/xquery/transform";
declare namespace xmldb = "http://exist-db.org/xquery/xmldb";

(: OPTION DECLARATIONS ===================================================== :)

declare option output:media-type "text/html";
declare option output:method "xhtml";
declare option output:indent "yes";
declare option output:omit-xml-declaration "yes";

(: QUERY BODY ============================================================== :)

let $uri := request:get-parameter('uri', '')
let $type := request:get-parameter('type', '')
let $docUri :=
    if (contains($uri, '#')) then
        (substring-before($uri, '#'))
    else
        ($uri)
let $doc := eutil:getDoc($docUri)
let $lang := request:get-parameter('lang', 'de')

let $base := concat(replace(system:get-module-load-path(), 'embedded-eXist-server', ''), '/../xslt/') (: TODO: Prüfen, wie wir an dem replace vorbei kommen:)

return
    if ($type = 'work') then (
        transform:transform($doc, concat($base, 'meiHead2HTML.xsl'),
            <parameters>
                <param name="base" value="{$base}"/>
                <param name="lang" value="{$lang}"/>
            </parameters>
        )
    ) else if ($type = 'source') then (
        transform:transform($doc, concat($base, 'meiHead2HTML.xsl'),
            <parameters>
                <param name="base" value="{$base}"/>
                <param name="lang" value="{$lang}"/>
            </parameters>
        )
    ) else if ($type = 'recording') then (
        transform:transform($doc, concat($base, 'meiHead2HTML.xsl'),
            <parameters>
                <param name="base" value="{$base}"/>
                <param name="lang" value="{$lang}"/>
            </parameters>
        )
    ) else if ($type = 'text') then (
        transform:transform($doc, concat($base, 'teiHeader2HTML.xsl'),
            <parameters>
                <param name="base" value="{$base}"/>
                <param name="lang" value="{$lang}"/>
            </parameters>
        )
    ) else
        ()
