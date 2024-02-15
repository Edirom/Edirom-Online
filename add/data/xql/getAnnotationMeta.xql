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

  ID: $Id: getAnnotationMeta.xql 1324 2012-05-15 13:59:35Z daniel $
:)

(:~
    Returns the HTML for a specific annotation for an AnnotationView.
    
    @author <a href="mailto:kepper@edirom.de">Johannes Kepper</a>
:)
import module namespace annotation="http://www.edirom.de/xquery/annotation" at "../xqm/annotation.xqm";
import module namespace source="http://www.edirom.de/xquery/source" at "../xqm/source.xqm";
import module namespace eutil="http://www.edirom.de/xquery/util" at "../xqm/util.xqm";
import module namespace functx = "http://www.functx.com" at "../xqm/functx-1.0-nodoc-2007-01.xq";

declare namespace request="http://exist-db.org/xquery/request";
declare namespace mei="http://www.music-encoding.org/ns/mei";
declare namespace exist="http://exist.sourceforge.net/NS/exist";

declare namespace xmldb="http://exist-db.org/xquery/xmldb";

declare option exist:serialize "method=xhtml media-type=text/html omit-xml-declaration=yes indent=yes";

let $lang := request:get-parameter('lang', '')
let $uri := request:get-parameter('uri', '')
let $docUri := substring-before($uri, '#')
let $internalId := substring-after($uri, '#')
let $doc := doc($docUri)
let $annot := $doc/id($internalId)
let $workID := substring-before(functx:substring-after-last($docUri, '/'), '.xml')

let $participants := annotation:getParticipants($annot)

let $priority := annotation:getPriority($annot)
let $priorityLabel := if ($lang = 'de')
                        then('Priorität')
                        else('Priority')

let $categories := annotation:getCategoriesAsArray($annot)
let $categoriesLabel := if ($lang = 'de')
                        then (if(count($categories) gt 1)then('Kategorien')else('Kategorie'))
                        else(if(count($categories) gt 1)then('Categories')else('Category'))

let $sources := eutil:getDocumentsLabelsAsArray($participants)
let $sourcesLabel := if ($lang = 'de')
                        then (if(count($sources) gt 1)then('Quellen')else('Quelle'))
                        else(if(count($sources) gt 1)then('Sources')else('Source'))

let $sigla := source:getSiglaAsArray($participants, $workID)
let $siglaLabel := if ($lang = 'de')
                        then (if(count($sigla) gt 1)then('Siglen')else('Siglum'))
                        else(if(count($sigla) gt 1)then('Sources')else('Source'))
                        
let $annotIDlabel := if ($lang = 'de')
                            then ('Anm.-ID')
                            else ('Annot.-ID')

return

    <div class="annotView">
        <div class="metaBox">
            <div class="property priority">
                <div class="key">{$priorityLabel}</div>
                <div class="value">{$priority}</div>
            </div>
            <div class="property categories">
                <div class="key">{$categoriesLabel}</div>
                <div class="value">{string-join($categories, ', ')}</div>
            </div>
            <!--<div class="property sourceLabel">
                <div class="key">{$sourcesLabel}</div>
                <div class="value">{string-join($sources, ', ')}</div>
            </div>-->
            <div class="property sourceSiglums">
                <div class="key">{$siglaLabel}</div>
                <div class="value">{string-join($sigla, ', ')}</div>
            </div>
            <div class="property annotID">
                <div class="key">{$annotIDlabel}</div>
                <div class="value">{$internalId}</div>
            </div>
        </div>
    </div>
    