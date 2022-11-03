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
  along with Edirom Online.  If not, see <http://www.gnu.org/licenses/>.
:)

import module namespace kwic="http://exist-db.org/xquery/kwic";

declare namespace tei="http://www.tei-c.org/ns/1.0";
declare namespace mei="http://www.music-encoding.org/ns/mei";
declare namespace request="http://exist-db.org/xquery/request";

(:declare option exist:serialize "method=xhtml media-type=text/html omit-xml-declaration=yes indent=yes";:)

declare variable $lang := request:get-parameter('lang', '');

declare function local:getLocalizedMEITitle($node) {
  let $nodeName := local-name($node)
  return
      if ($lang = $node/mei:title/@xml:lang)
      then $node/mei:title[@xml:lang = $lang]/text()
      else $node/mei:title[1]/text()

};

declare function local:getLocalizedTEITitle($node) {
  let $nodeName := local-name($node)
  return
      if ($lang = $node/tei:title/@xml:lang)
      then $node/tei:title[@xml:lang = $lang]/text()
      else $node/tei:title[1]/text()

};

declare function local:filter($node as node(), $mode as xs:string) as xs:string? {
  if ($mode eq 'before') then 
      concat($node, ' ')
  else 
      concat(' ', $node)
};

declare function local:getPath($node as node()) as xs:string {
    let $localName := local-name($node)
    let $parentPath := if($node/..)then(local:getPath($node/..))else('')
    return
    concat($parentPath, '/', $localName, '[', count($node/preceding-sibling::*[local-name(.) eq $localName]) + 1, ']')
};

let $term := request:get-parameter('term', '')

let $trans :=   <xsl:stylesheet  xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="2.0">
                    <!--<xsl:output encoding="UTF-8" media-type="text/xhmtl" method="xhtml" omit-xml-declaration="yes" indent="yes"/>-->
                    <xsl:template match="/">
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
        if(string-length($term) gt 0)
        then(
            collection('/db/contents/edition-rwa')//tei:text[ft:query(., $term)]/ancestor::tei:TEI
            | collection('/db/contents/edition-rwa')//tei:title[ft:query(., $term)]/ancestor::tei:TEI
            | collection('/db/contents/edition-rwa')//mei:mei[ft:query(., $term)]
            | collection('/db/contents/edition-rwa')//mei:title[ft:query(., $term)]/ancestor::mei:mei
            | collection('/db/contents/edition-rwa')//mei:annot[ft:query(., $term)][@type eq 'editorialComment']
            | collection('db/contents/edition-rwa')//mei:annot[contains(@xml:id, $term)]
        )
        else()
    
    return (
        
        if(count($search) gt 0)
        then( if ($lang = 'de')
                then(<div class="searchResultOverview">Die Suche ergab Treffer in <span class="num">{count($search)}</span> Objekten:</div>)
                else (<div class="searchResultOverview">Hits in <span class="num">{count($search)}</span> objects:</div>)
        )
        else( if ($lang = 'de')
                then(<div class="searchResultOverview">Die Suche ergab keine Treffer.</div>)
                else(<div class="searchResultOverview">No match found.</div>)
        )
        ,
    
    for $hit in $search
        
    let $expanded := kwic:expand($hit)
    let $hitCount := count($expanded//*[./exist:match])
    let $doc := $hit/root()
    let $uri := document-uri($doc)
    let $title := (: Annotation :)
              if(local-name($hit) eq 'annot')
              then(local:getLocalizedMEITitle($hit))
              (: Work :)
              else if(exists($doc//mei:mei) and exists($doc//mei:work))
              then(local:getLocalizedMEITitle($doc//mei:work/mei:titleStmt))
              (: Source / Score :)
              else if(exists($doc//mei:mei) and exists($doc//mei:source))
              then(local:getLocalizedMEITitle($doc//mei:source/mei:titleStmt))
              (: Text :)
              else if(exists($doc/tei:TEI))
              then(local:getLocalizedTEITitle($doc//tei:titleStmt))
              else(string('unknown'))
    order by ft:score($hit) descending
    return
(:   loadLink('xmldb:exist://{$uri}{if(local-name($hit) eq 'annot')then(concat('#', $hit/@xml:id))else()}?term={replace($term, '"', '\\"')}'); :)
    
        <div class="searchResultDoc">
            <div class="doc"><span class="resultTitle" onclick="{
                if (contains($uri, 'edition-rwa/texts/' ))
                then (concat('loadLink(&apos;xmldb:exist:///db/apps/rwaEncyclo/$encyclo/', substring-after($uri, 'edition-rwa/texts/'), '?term=', replace($term, '"', '\\"'), '&apos;, {})'))
                else(concat('loadLink(&apos;xmldb:exist://', $uri,
                    if(local-name($hit) eq 'annot')
                    then(concat('#', $hit/@xml:id))
                    else(), '?term=', replace($term, '"', '\\"'),'&apos;);'))}">{$title}</span><span class="resultCount">{
                    if ($lang = 'de')
                    then(concat('(', $hitCount, ' Treffer', ')'))
                    else(concat('(', $hitCount, ' hit', if($hitCount gt 1)then('s')else(''), ')'))}</span></div>
        {(
            for $match at $i in $expanded//*[./exist:match]
            let $path := local:getPath($match)
            let $internalId := if(local-name($hit) eq 'annot')then($hit/@xml:id)else if($match/@xml:id)then($match/@xml:id)else()
            return
                <div class="hitP" style="{if($i gt 3)then('display:none;')else('')}">{
                kwic:get-summary($match, ($match/exist:match)[1], <config width="100" link="{
                if (contains($uri, 'edition-rwa/texts/' ))
                then (concat('loadLink(&apos;xmldb:exist:///db/apps/rwaEncyclo/$encyclo/', substring-after($uri, 'edition-rwa/texts/'), '?path=', $path, '&amp;term=', replace($term, '"', '\\"'), '&apos;, {})')) else (concat('loadLink(&apos;xmldb:exist://', $uri, if($internalId)then(concat('#', $internalId))else(), '?path=', $path, '&amp;term=', replace($term, '"', '\\"'),'&apos;);')) }" />,
                    util:function(xs:QName("local:filter"), 2))
               }</div>
            ,
            if($hitCount gt 3)
            then(<div class="showMore" onclick="$(this).parent().find('div').show(); $(this).hide();">{if ($lang = 'de') then ('Alle Treffer zeigen') else ('show all hits')}</div>)
            else()
        )}</div>
        )
    }
    </div>
    
return
    transform:transform($return, $trans, ())