xquery version "3.0";

import module namespace eutil="http://www.edirom.de/xquery/util" at "../xqm/util.xqm";
import module namespace edition="http://www.edirom.de/xquery/edition" at "../xqm/edition.xqm";

declare namespace request="http://exist-db.org/xquery/request";

declare namespace tei="http://www.tei-c.org/ns/1.0";

declare option exist:serialize "method=xhtml media-type=text/html omit-xml-declaration=yes indent=yes";

let $uri := request:get-parameter('uri', '')
let $idPrefix := request:get-parameter('idPrefix', '')
let $term := request:get-parameter('term', '')
let $path := request:get-parameter('path', '')
let $page := request:get-parameter('page', '')
let $stage := request:get-parameter('stage', '')

let $uri := if($stage != '' and $stage != 'genesis')
            then(replace($uri, '.xml', '_' || $stage || '.xml'))
            else($uri)

let $doc := eutil:getDoc($uri)/root()

let $xslInstruction := $doc//processing-instruction(xml-stylesheet)
let $xslInstruction := for $i in util:serialize($xslInstruction, ())
                        return
                        if(matches($i, 'type="text/xsl"'))
                        then(substring-before(substring-after($i, 'href="'), '"'))
                        else()


let $doc := if($term eq '')then($doc)else($doc//tei:text[ft:query(., $term)]/ancestor::tei:TEI)
let $doc := if($term eq '')then($doc)else(util:expand($doc))

let $doc := if($page eq '')then($doc)else(
    let $pb1 := $doc//tei:pb[@facs eq '#' || $page]/@n
    let $pb2 := ($doc//tei:pb[@facs eq '#' || $page]/following::tei:pb)[1]/@n
    return
        transform:transform($doc, doc('../xslt/reduceToPage.xsl'), <parameters><param name="pb1" value="{$pb1}"/><param name="pb2" value="{$pb2}"/></parameters>)
)

let $base := replace(system:get-module-load-path(), 'embedded-eXist-server', '') (:TODO:)

let $imagePrefix := eutil:getPreference('image_prefix', request:get-parameter('edition', ''))

let $xsl := if($xslInstruction)then($xslInstruction)else('../xslt/teiBody2HTML.xsl')

let $params := (<param name="base" value="{concat($base, '/../xslt/')}"/>,
    <param name="textType" value="{if(contains($uri, 'referenceSources'))then('freidi_reference')else if(contains($uri, 'librettoSources'))then('freidi_libretto')else('text')}"/>)
    
let $doc := if($xslInstruction)then(transform:transform($doc, doc($xsl), <parameters>{$params}</parameters>))
    else(transform:transform($doc, doc($xsl), <parameters>{$params}<param name="graphicsPrefix" value="{$imagePrefix}"/></parameters>))
    
let $doc := if($stage = 'genesis')then(transform:transform($doc, doc('../xslt/textStages.xsl'), <parameters>{$params}<param name="graphicsPrefix" value="{$imagePrefix}"/></parameters>))else($doc)
    
return
    
    transform:transform($doc, doc('../xslt/edirom_idPrefix.xsl'), <parameters><param name="idPrefix" value="{$idPrefix}"/></parameters>)
