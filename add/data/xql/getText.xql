xquery version "3.0";
(:
  Edirom Online
  Copyright (C) 2011 The Edirom Project
  http://www.edirom.de

  Edirom Online is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  Edirom Online is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with Foobar.  If not, see <http://www.gnu.org/licenses/>.

  ID: $Id: getText.xql 1456 2012-10-11 12:50:05Z niko $
:)
import module namespace eutil="http://www.edirom.de/xquery/util" at "../xqm/util.xqm";
import module namespace edition="http://www.edirom.de/xquery/edition" at "../xqm/edition.xqm";

declare namespace request="http://exist-db.org/xquery/request";
declare namespace tei="http://www.tei-c.org/ns/1.0";
declare namespace xhtml="http://www.w3.org/1999/xhtml";

declare option exist:serialize "method=xhtml media-type=text/html omit-xml-declaration=yes indent=yes";
(:declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";:)

let $uri := request:get-parameter('uri', '')
let $idPrefix := request:get-parameter('idPrefix', '')
let $term := request:get-parameter('term', '')
let $path := request:get-parameter('path', '')
let $page := request:get-parameter('page', '')
let $doc := eutil:getDoc($uri)/root()
let $contextPath := request:get-context-path()

let $xslInstruction := $doc//processing-instruction(xml-stylesheet)
let $xslInstruction := for $i in fn:serialize($xslInstruction, ())
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

let $edition := request:get-parameter('edition', '')
let $imageserver :=  eutil:getPreference('image_server', $edition)
let $imagePrefix := if($imageserver = 'leaflet')
	then(eutil:getPreference('leaflet_prefix', $edition))
	else(eutil:getPreference('image_prefix', $edition))

(:let $imagePrefix := eutil:getPreference('image_prefix', request:get-parameter('edition', '')):)

let $xsl := if($xslInstruction)then($xslInstruction)else('../xslt/teiBody2HTML.xsl')

let $params := (
                (: parameters for Edirom-Online :)
                <param name="lang" value="{eutil:getLanguage($edition)}"/>,
                <param name="docUri" value="{$uri}"/>,
                <param name="contextPath" value="{$contextPath}"/>,
                (: parameters for the TEI Stypesheets :)
                <param name="autoHead" value="'false'"/>,
                <param name="autoToc" value="'false'"/>,
                <param name="base" value="{concat($base, '/../xslt/')}"/>,
                <param name="footnoteBackLink" value="true"/>,
                <param name="graphicsPrefix" value="{$imagePrefix}"/>,(:TODO frm XSLT <param name="graphicsPrefix"/>:)
                <param name="numberHeadings" value="'false'"/>,
                <param name="pageLayout" value="'CSS'"/>
                )
    
let $doc := if($xslInstruction)then(transform:transform($doc, doc($xsl), <parameters>{$params}</parameters>))
    else(transform:transform($doc, doc($xsl), <parameters>{$params}</parameters>))

let $doc := transform:transform($doc, doc('../xslt/edirom_idPrefix.xsl'), <parameters><param name="idPrefix" value="{$idPrefix}"/></parameters>)

let $body := $doc//xhtml:body

return
    element div {
        for $attribute in $body/@* return $attribute,
        for $node in $body/node() return $node 
    }