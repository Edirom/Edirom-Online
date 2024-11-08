xquery version "3.1";
(:
 : For LICENSE-Details please refer to the LICENSE file in the root directory of this repository.
 :)

(: IMPORTS ================================================================= :)

import module namespace kwic = "http://exist-db.org/xquery/kwic";
import module namespace transform="http://exist-db.org/xquery/transform";

import module namespace edition = "http://www.edirom.de/xquery/edition" at "../xqm/edition.xqm";
import module namespace eutil = "http://www.edirom.de/xquery/util" at "../xqm/util.xqm";

(: NAMESPACE DECLARATIONS ================================================== :)

declare namespace mei = "http://www.music-encoding.org/ns/mei";
declare namespace output = "http://www.w3.org/2010/xslt-xquery-serialization";
declare namespace request = "http://exist-db.org/xquery/request";
declare namespace tei = "http://www.tei-c.org/ns/1.0";

(: OPTION DECLARATIONS ===================================================== :)

declare option output:method "xhtml";
declare option output:media-type "text/html";

(: FUNCTION DECLARATIONS =================================================== :)

(:~
 : Callback function for `kwic:get-summary`
 : Contrary to the documentation at https://exist-db.org/exist/apps/doc/kwic (1Q18)
 : this function has to return a node(), see https://github.com/eXist-db/exist/issues/4239
 :)
declare function local:filter($node as node(), $mode as xs:string) as node()? {
    if ($mode eq 'before') then
        text { concat($node, ' ') }
    else
        text { concat(' ', $node) }
};

declare function local:getPath($node as node()) as xs:string {
    let $localName := local-name($node)
    let $parentPath :=
        if ($node/..) then
            (local:getPath($node/..))
        else
            ('')
    return
        concat($parentPath, '/', $localName, '[', count($node/preceding-sibling::*[local-name(.) eq $localName]) + 1, ']')
};

(: QUERY BODY ============================================================== :)

let $lang := request:get-parameter('lang', '')
let $edition := request:get-parameter('edition', '')
let $term := request:get-parameter('term', '')

let $trans :=
    <xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="2.0">
        <!--<xsl:output encoding="UTF-8" media-type="text/xhmtl" method="xhtml" omit-xml-declaration="yes" indent="yes"/>-->
        <xsl:template
            match="/">
            <xsl:apply-templates/>
        </xsl:template>
        <xsl:template match="a">
            <xsl:variable name="elem" select="."/>
            <span class="hit" onclick="{{$elem/string(@href)}}">
                <xsl:apply-templates/>
            </span>
        </xsl:template>
        <xsl:template match="element() | @*">
            <xsl:copy>
                <xsl:apply-templates select="@* | node()"/>
            </xsl:copy>
        </xsl:template>
    </xsl:stylesheet>

let $return :=
    <div class="searchResult">{
        
        let $search :=
            if (string-length($term) gt 0) then (
                edition:collection($edition)//tei:text[ft:query(., $term)]/ancestor::tei:TEI
                | edition:collection($edition)//tei:title[ft:query(., $term)]/ancestor::tei:TEI
                | edition:collection($edition)//mei:mei[ft:query(., $term)]
                | edition:collection($edition)//mei:title[ft:query(., $term)]/ancestor::mei:mei
                | edition:collection($edition)//mei:annot[ft:query(., $term)][@type eq 'editorialComment']
                | edition:collection($edition)//mei:annot[contains(@xml:id, $term)]
            ) else
                ()
        return (
            
            if (count($search) gt 0) then (
                if ($lang = 'de') then
                    (<div class="searchResultOverview">Die Suche ergab Treffer in <span class="num">{count($search)}</span> Objekten:</div>)
                else
                    (<div class="searchResultOverview">Hits in <span class="num">{count($search)}</span> objects:</div>)
            ) else (
                if ($lang = 'de') then
                    (<div class="searchResultOverview">Die Suche ergab keine Treffer.</div>)
                else
                    (<div class="searchResultOverview">No match found.</div>)
            ),
            
            for $hit in $search
            let $expanded := kwic:expand($hit)
            let $hitCount := count($expanded//*[./exist:match])
            let $doc := $hit/root()
            let $uri := document-uri($doc)
            let $title := (: Annotation :)
                if (local-name($hit) eq 'annot') then
                    (eutil:getLocalizedTitle($hit, $lang))
                
                (: Work :)
                else if (exists($doc//mei:mei) and exists($doc//mei:work)) then
                    (eutil:getLocalizedTitle($doc//mei:work/mei:titleStmt, $lang))
                
                (: Source / Score :)
                else if (exists($doc//mei:mei) and exists($doc//mei:source)) then
                    (eutil:getLocalizedTitle($doc//mei:source/mei:titleStmt, $lang))
                
                (: Text :)
                else if (exists($doc/tei:TEI)) then
                    (eutil:getLocalizedTitle($doc//tei:titleStmt, $lang))
                
                else
                    (string('unknown'))
            
            order by ft:score($hit) descending
            return
                <div class="searchResultDoc">
                    <div class="doc"><span class="resultTitle" onclick="loadLink('xmldb:exist://{$uri}{
                            if (local-name($hit) eq 'annot') then
                                (concat('#', $hit/@xml:id))
                            else
                                ()
                                }?term={replace($term, '"', '\\"')}');">{$title}</span><span
                            class="resultCount">{
                                if ($lang = 'de') then
                                    (concat('(', $hitCount, ' Treffer', ')'))
                                else
                                    (concat('(', $hitCount, ' hit', if ($hitCount gt 1) then
                                        ('s')
                                    else
                                        (''), ')'))
                            }</span></div>
                    {
                        (
                        for $match at $i in $expanded//*[./exist:match]
                        let $path := local:getPath($match)
                        let $internalId :=
                            if (local-name($hit) eq 'annot') then
                                ($hit/@xml:id)
                            else if ($match/@xml:id) then
                                ($match/@xml:id)
                            else
                                ()
                        
                        return
                            <div class="hitP"
                                style="{
                                        if ($i gt 3) then
                                            ('display:none;')
                                        else
                                            ('')
                                    }">{
                                    kwic:get-summary($match, ($match/exist:match)[1], <config width="100" link="loadLink('xmldb:exist://{$uri}{
                                                if ($internalId) then
                                                    (concat('#', $internalId))
                                                else
                                                    ()
                                            }?path={$path}&amp;term={replace($term, '"', '\\"')}');"/>,
                                    local:filter#2
                                    )
                                }</div>
                        ,
                        if ($hitCount gt 3) then
                            (<div class="showMore" onclick="$(this).parent().find('div').show(); $(this).hide();">{
                                    if ($lang = 'de') then
                                        ('Alle Treffer zeigen')
                                    else
                                        ('show all hits')
                                }</div>)
                        else
                            ()
                        )
                    }</div>
            )
    }
</div>

return
    transform:transform($return, $trans, ())
