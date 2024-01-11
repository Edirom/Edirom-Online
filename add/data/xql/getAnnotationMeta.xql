xquery version "3.1";

(:
For LICENSE-Details please refer to the LICENSE file in the root directory of this repository.
:)

(:~
    Returns the HTML for a specific annotation for an AnnotationView.

    @author <a href="mailto:kepper@edirom.de">Johannes Kepper</a>
:)

(: IMPORTS ========================================================= :)

import module namespace annotation = "http://www.edirom.de/xquery/annotation" at "../xqm/annotation.xqm";
import module namespace eutil = "http://www.edirom.de/xquery/util" at "../xqm/util.xqm";
import module namespace source = "http://www.edirom.de/xquery/source" at "../xqm/source.xqm";

(: NAMESPACE DECLARATIONS ========================================== :)

declare namespace edirom_image = "http://www.edirom.de/ns/image";
declare namespace exist = "http://exist.sourceforge.net/NS/exist";
declare namespace mei = "http://www.music-encoding.org/ns/mei";
declare namespace request = "http://exist-db.org/xquery/request";

declare namespace xmldb = "http://exist-db.org/xquery/xmldb";
declare namespace output = "http://www.w3.org/2010/xslt-xquery-serialization";

(: OPTION DECLARATIONS ============================================= :)

declare option output:method "xhtml";
declare option output:media-type "text/html";

let $lang := request:get-parameter('lang', '')
let $edition := request:get-parameter('edition', '')
let $uri := request:get-parameter('uri', '')
let $docUri := substring-before($uri, '#')
let $internalId := substring-after($uri, '#')
let $doc := doc($docUri)
let $annot := $doc/id($internalId)

let $participants := annotation:getParticipants($annot)

let $priority := annotation:getPriorityLabel($annot)
let $priorityLabel := switch ($priority)
    case ""
        return
            ()
    default return
        eutil:getLanguageString('view.window.AnnotationView_Priority', ())

let $categories := annotation:getCategoriesAsArray($annot)
let $categoriesLabel := switch (count($categories))
    case 0
        return
            ()
    case 1
        return
            eutil:getLanguageString('view.window.AnnotationView_Category', ())
    default return
        eutil:getLanguageString('view.window.AnnotationView_Categories', ())

let $sources := eutil:getDocumentsLabelsAsArray($participants, $edition)
let $sourcesLabel := if (count($sources) gt 1)
then
    (eutil:getLanguageString('view.window.AnnotationView_Sources', ()))
else
    (eutil:getLanguageString('view.window.AnnotationView_Source', ()))

let $sigla := source:getSiglaAsArray($participants)
let $siglaLabel := switch (count($sigla))
    case 0
        return
            ()
    case 1
        return
            eutil:getLanguageString('view.window.AnnotationView_Source', ()) (:TODO check for lang key:)
    default return
        eutil:getLanguageString('view.window.AnnotationView_Sources', ())
let $annotIDlabel := eutil:getLanguageString('view.window.AnnotationView_AnnotationID', ())

return
    
    <div
        class="annotView">
        <div
            class="metaBox">
            <div
                class="property priority">
                <div
                    class="key">{$priorityLabel}</div>
                <div
                    class="value">{$priority}</div>
            </div>
            <div
                class="property categories">
                <div
                    class="key">{$categoriesLabel}</div>
                <div
                    class="value">{string-join($categories, ', ')}</div>
            </div>
            <!--<div class="property sourceLabel">
                <div class="key">{$sourcesLabel}</div>
                <div class="value">{string-join($sources, ', ')}</div>
            </div>-->
            <div
                class="property sourceSiglums">
                <div
                    class="key">{$siglaLabel}</div>
                <div
                    class="value">{string-join($sigla, ', ')}</div>
            </div>
            <div
                class="property annotID">
                <div
                    class="key">{$annotIDlabel}</div>
                <div
                    class="value">{$internalId}</div>
            </div>
        </div>
    </div>
