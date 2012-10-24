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
let $docUri := if(contains($uri, '#')) then(substring-before($uri, '#')) else($uri)
let $internalId := if(contains($uri, '#')) then(substring-after($uri, '#')) else()

let $doc := doc($docUri)
let $internal := $doc/id($internalId)

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
          ",internalId:'", $internalId, 
          "',internalIdType:'", $internalIdType, "'}")