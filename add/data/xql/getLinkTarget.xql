xquery version "3.1";
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

import module namespace source="http://www.edirom.de/xquery/source" at "../xqm/source.xqm";
import module namespace work="http://www.edirom.de/xquery/work" at "../xqm/work.xqm";
import module namespace teitext="http://www.edirom.de/xquery/teitext" at "../xqm/teitext.xqm";
import module namespace eutil="http://www.edirom.de/xquery/util" at "../xqm/util.xqm";

declare namespace request="http://exist-db.org/xquery/request";
declare namespace mei="http://www.music-encoding.org/ns/mei";
declare namespace tei="http://www.tei-c.org/ns/1.0";
declare namespace xmldb="http://exist-db.org/xquery/xmldb";
declare namespace html="http://www.w3.org/1999/xhtml";
declare namespace output = "http://www.w3.org/2010/xslt-xquery-serialization";
declare namespace map="http://www.w3.org/2005/xpath-functions/map";
declare namespace f="http://local.link";

import module namespace functx = "http://www.functx.com" at "../xqm/functx-1.0-nodoc-2007-01.xq";

declare option output:method "text";
declare option output:media-type "text/plain";

declare variable $lang := request:get-parameter('lang', '');

declare function local:getView($type as xs:string, $docUri as xs:string, $doc as node()+) as map(*)? {
    let $baseMap := map {
        'type': substring-after($type,'_'),
        'uri': if($type = ('mei_textView', 'desc_xmlView')) then string(($doc//mei:annot[@type='descLink'])[1]/@plist) else $docUri
    }
    
    (: optionally set label for some views:)
    let $labeled.map :=
        if($type = 'mei_textView')
        then(map:put($baseMap, 'label', 'Quellenbeschreibung'))
        else if($type = 'desc_xmlView')
        then(map:put($baseMap, 'label', 'XML Quellenbeschreibung'))
        else($baseMap)
    
    (: whether to set the view as default view:)
    let $defaultViewed.map := 
        if($type = ('mei_sourceView', 
                    'mei_audioView', 
                    'tei_textView', 
                    'tei_facsimileView', 
                    'tei_textFacsimileSplitView', 
                    'mei_annotationView',
                    'mei_verovioView'))
        then(map:put($labeled.map, 'defaultView', true()))
        else($labeled.map)
        
        
    (: xpath check whether any given view is supported :)
    let $hasView :=
        if($type = 'desc_summaryView')
        then(true())
        
        else if($type = 'desc_headerView')
        then(exists($doc//mei:meiHead or $doc//tei:teiHeader))
        
        else if($type = 'mei_textView')
        then(exists($doc//mei:annot[@type='descLink']))
        
        else if($type = 'mei_sourceView')
        then(exists($doc//mei:facsimile//mei:graphic[@type='facsimile']))
        
        else if($type = 'mei_audioView')
        then(exists($doc//mei:recording))
        
        else if($type = 'mei_verovioView')
        then(exists($doc//mei:body//mei:measure) and exists($doc//mei:body//mei:note))
        
        else if($type = 'tei_textView')
        then(exists($doc//tei:body[matches(.//text(), '[^\s]+')]))
        
        else if($type = 'tei_facsimileView')
        then(exists($doc//tei:facsimile//tei:graphic))
        
        else if($type = 'tei_textFacsimileSplitView')
        then(exists($doc//tei:facsimile//tei:graphic) and exists($doc//tei:pb[@facs]))
        
        else if($type = 'mei_annotationView')
        then(exists($doc//mei:annot[@type='editorialComment']))
        
        else if($type = 'xml_xmlView')
        then(true())
        
        else if($type = 'desc_xmlView')
        then(exists($doc//mei:annot[@type='descLink']))
        
        else(false())
    
    return
        if($hasView)
        then($defaultViewed.map)
        else()
};

declare function local:getViews($type as xs:string, $docUri as xs:string, $doc as node()+) as map(*)* {
    
    let $views := (
        (:'desc_summaryView',:)
        (:'desc_headerView',:)
        'mei_textView',
        'mei_sourceView',
        'mei_audioView',
        'mei_verovioView',
        'tei_textView',
        'tei_facsimileView',
        'tei_textFacsimileSplitView',
        'mei_annotationView',
        'xml_xmlView',
        'desc_xmlView'
    )
    
    let $maps :=
        for $view in $views
        return local:getView($view, $docUri, $doc)
        
    return $maps
};

declare function local:getWindowTitle($doc as node()+, $type as xs:string) as xs:string {
  (: Work :)
  if(exists($doc//mei:mei) and exists($doc//mei:workDesc/mei:work) and not(exists($doc//mei:perfMedium)))
  then(eutil:getLocalizedTitle(($doc//mei:work)[1]/mei:titleStmt[1], $lang))
  else if(exists($doc/root()/mei:work))
  then(eutil:getLocalizedTitle($doc/root()/mei:work, $lang))
  
  (: Recording :)
  else if(exists($doc//mei:mei) and exists($doc//mei:recording))
  then(eutil:getLocalizedTitle($doc//mei:fileDesc/mei:titleStmt[1], $lang))

  (: Source / Score :)
  else if($type = 'source' and exists($doc//mei:manifestation/mei:titleStmt))
  then(string-join((eutil:getLocalizedTitle(($doc//mei:manifestation)[1]/mei:titleStmt[1], $lang),
                    ($doc//mei:manifestation)[1]//mei:identifier[lower-case(@type)='shelfmark'][1]), ' | ')
       => normalize-space())
  else if($type = 'source' and exists($doc//mei:source/mei:titleStmt))
  then(string-join((eutil:getLocalizedTitle(($doc//mei:source)[1]/mei:titleStmt[1], $lang),
                    ($doc//mei:source)[1]//mei:identifier[lower-case(@type)='shelfmark'][1]), ' | ')
       => normalize-space())
  
  (: MEI fallback if no title is found :)
  else if(exists($doc//mei:mei) and exists(($doc//mei:titleStmt)[1]))
  then(eutil:getLocalizedTitle(($doc//mei:titleStmt)[1], $lang))
  
  (: Text :)
  else if(exists($doc/tei:TEI))
  then(eutil:getLocalizedTitle($doc//tei:fileDesc/tei:titleStmt[1], $lang))
  
  (: HTML :)
  else if($type = 'html')
  then($doc//head/data(title))
 
  else(string('unknown'))
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

let $doc := eutil:getDoc($docUri)
let $internal := $doc/id($internalId)

let $edition := request:get-parameter('edition', '')

(: Specific handling of virtual measure IDs for parts in OPERA project :)
let $internal :=
    if(exists($internal))
    then($internal)
    else(
        if(starts-with($internalId, 'measure_') and $doc//mei:parts)
        then(
            
            let $mdivId := functx:substring-before-last(substring-after($internalId, 'measure_'), '_')
            let $measureN := functx:substring-after-last($internalId, '_')
            return
                ($doc/id($mdivId)//mei:measure[@n eq $measureN])[1]
        )
        else($internal)
    )

let $type := (: Work :)
             if(exists($doc//mei:mei) and exists($doc//mei:work) and not(exists($doc//mei:perfMedium)))
             then(string('work'))
             
             (: Recording :)
             else if(exists($doc//mei:mei) and exists($doc//mei:recording))
             then(string('recording'))
             
             (: Source / Score :)
             else if(source:isSource($docUri))
             then(string('source'))
             
             (: Text :)
             else if(exists($doc/tei:TEI))
             then(string('text'))
             
             (: HTML :)
             else if(exists($doc/html) or exists($doc/html:html))
             then(string('html'))
             
             else if(contains($docUri, '.html'))
             then(string('html'))
             
             else(string('unknown'))
             
let $internalIdType := if(exists($internal))
                       then(local-name($internal))
                       else('unknown')

let $map :=
    map {
        'type': $type,
        'title': local:getWindowTitle($doc, $type),
        'doc': $docUri,
        'views': array {local:getViews($type, $docUri, $doc)},
        'internalId': $internalId || $internalIdParam,
        'term': $term,
        'path': $path,
        'internalIdType': $internalIdType
    }

let $options :=
    map {
        'method': 'json',
        'media-type': 'text/plain'
    }

return serialize($map, $options)
