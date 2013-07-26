xquery version "1.0";
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

  ID: $Id: getLinkTarget.xql 1334 2012-06-14 12:40:33Z daniel $
:)

declare namespace request="http://exist-db.org/xquery/request";
declare namespace mei="http://www.music-encoding.org/ns/mei";
declare namespace tei="http://www.tei-c.org/ns/1.0";
declare namespace xmldb="http://exist-db.org/xquery/xmldb";

declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";

import module namespace functx = "http://www.functx.com" at "../xqm/functx-1.0-nodoc-2007-01.xq";

declare function local:getViews($type, $docUri, $doc) {
    
    string-join((
        (: SummaryView :)
        concat("{type:'summaryView',uri:'", $docUri, "'}"),
        
        (: HeaderView :)
        if($doc//mei:meiHead or $doc//tei:teiHeader) then(concat("{type:'headerView',uri:'", $docUri, "'}")) else(),

        (: SourceView :)
        if($doc//mei:facsimile//mei:graphic[@type='facsimile']) then(concat("{type:'sourceView',uri:'", $docUri, "'}")) else(),

        (: TextView :)
        if($doc//tei:body[matches(.//text(), '[^\s]+')]) then(concat("{type:'textView',uri:'", $docUri, "'}")) else(),

        (: AnnotationView :)
        if($doc//mei:annot[@type='editorialComment']) then(concat("{type:'annotationView',uri:'", $docUri, "'}")) else(),
        
        (: RenderingView :)
(:        if($doc//mei:note) then(concat("{type:'renderingView',uri:'", $docUri, "'}")) else(),:)
        
        (: SearchView :)
(:        if($doc//mei:note) then(concat("{type:'searchView',uri:'", $docUri, "'}")) else(),
:)
        (: XmlView :)
        concat("{type:'xmlView',uri:'", $docUri, "'}")
    ), ',')
};


let $uri := request:get-parameter('uri', '')
let $uriParams := if(contains($uri, '?')) then(substring-after($uri, '?')) else('')
let $uri := if(contains($uri, '?')) then(replace($uri, '[?&amp;](term|path)=[^&amp;]*', '')) else($uri)
let $docUri := if(contains($uri, '#')) then(substring-before($uri, '#')) else($uri)
let $internalId := if(contains($uri, '#')) then(substring-after($uri, '#')) else()
let $internalIdParam := if(contains($internalId, '?')) then(concat('?', substring-after($internalId, '?'))) else('')
let $internalId := if(contains($internalId, '?')) then(substring-before($internalId, '?')) else($internalId)

let $term := if(contains($uriParams, 'term='))then(substring-after($uriParams, 'term='))else()
let $term := if(contains($term, '&amp;'))then(substring-before($term, '&amp;'))else($term)

let $path := if(contains($uriParams, 'path='))then(substring-after($uriParams, 'path='))else()
let $path := if(contains($path, '&amp;'))then(substring-before($path, '&amp;'))else($path)

let $doc := doc($docUri)
let $internal := $doc/id($internalId)

(: Specific handling of virtual measure IDs for parts in OPERA project :)
let $internal := if(exists($internal))then($internal)else(
                        if(starts-with($internalId, 'measure_') and $doc//mei:parts)
                        then(
                            let $mdivId := functx:substring-before-last(substring-after($internalId, 'measure_'), '_')
                            let $measureN := functx:substring-after-last($internalId, '_')
                            return
                                ($doc/id($mdivId)//mei:measure[@n eq $measureN])[1]
                        )
                        else($internal)
                    )

let $type := 
             (: Work :)
             if(exists($doc//mei:mei) and exists($doc//mei:work))
             then(string('work'))
             
             (: Source / Score :)
             else if(exists($doc//mei:mei) and exists($doc//mei:source))
             then(string('source'))
             
             
             (: Text :)
             else if(exists($doc/tei:TEI))
             then(string('text'))
             
             else(string('unknown'))
             
let $title := (: Work :)
              if(exists($doc//mei:mei) and exists($doc//mei:work))
              then($doc//mei:work/mei:titleStmt/data(mei:title[1]))
              
              (: Source / Score :)
              else if(exists($doc//mei:mei) and exists($doc//mei:source))
              then($doc//mei:source/mei:titleStmt/data(mei:title[1]))
              
              (: Text :)
              else if(exists($doc/tei:TEI))
              then($doc//tei:titleStmt/data(tei:title[1]))
             
              else(string('unknown'))
              
let $internalIdType := if(exists($internal))
                       then(local-name($internal))
                       else('unknown')

return 
    concat("{",
          "type:'", $type, 
          "',title:'", $title, 
          "',doc:'", $docUri,
          "',views:[", local:getViews($type, $docUri, $doc), "]",
          ",internalId:'", $internalId, $internalIdParam, 
          "',term:'", $term,
          "',path:'", $path,
          "',internalIdType:'", $internalIdType, "'}")