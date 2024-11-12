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

  ID: $Id: annotation.xqm 1455 2012-10-11 10:42:55Z daniel $
:)


(:~
: This module provides library functions for Annotations
:
: @author <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
: @author <a href="mailto:nikolaos.beer@uni-paderborn.de">Nikolaos Beer</a>
:)
module namespace annotation = "http://www.edirom.de/xquery/annotation";

import module namespace eutil="http://www.edirom.de/xquery/util" at "../xqm/util.xqm";
import module namespace edition="http://www.edirom.de/xquery/edition" at "../xqm/edition.xqm";

import module namespace console="http://exist-db.org/xquery/console";

declare namespace request="http://exist-db.org/xquery/request";
declare namespace mei="http://www.music-encoding.org/ns/mei";
declare namespace system="http://exist-db.org/xquery/system";
declare namespace transform="http://exist-db.org/xquery/transform";

declare namespace conf="https://www.maxreger.info/conf";
import module namespace mrpShared="https://www.maxreger.info/mrpShared" at "../../../mrpApp/modules/mrpShared.xqm";

declare function local:getLocalizedTitle($node) {
  let $lang := request:get-parameter('lang', '')
  let $nodeName := local-name($node)
  return
      if ($lang = $node/mei:title/@xml:lang)
      then $node/mei:title[@xml:lang = $lang]/text()
      else $node/mei:title[1]/text()

};

declare function local:getLocalizedName($node) {
  let $lang := request:get-parameter('lang', '')
  let $nodeName := local-name($node)
  return
      if ($lang = $node/mei:name/@xml:lang)
      then $node/mei:name[@xml:lang = $lang]/text()
      else $node/mei:name[1]/text()

};

(:~
: Returns an array containing filter options
:
: @param $uri The document to process
: @return The array
:
: @author <a href="mailto:nikolaos.beer@uni-paderborn.de">Nikolaos Beer</a>
:)
declare function annotation:annotationsGetOptions($uri as xs:string) {
    let $options :=
        if (contains($uri, '?'))
        then (tokenize(substring-after($uri, '?'), '&amp;'))
        else ()
    let $options :=
        if ($options)
        then (
            for $option in $options
            let $optionName := substring-before($option, '=')
            let $optionValue := substring-after($option, '=')
            return
                [$optionName, $optionValue]
        )
        else ()
    return
        $options
};

(:~
: Returns an string naming the filter option value
:
: @param $options The options array
: @param $option The string naming the option to filter (type, category, priority of annot)
: @return The string
:
: @author <a href="mailto:nikolaos.beer@uni-paderborn.de">Nikolaos Beer</a>
:)
declare function annotation:validateAnnotationOptions($options, $option) {
    for $opt in $options
    where array:get($opt, 1) = $option
    return
        array:get($opt, 2)
};

(:~
: Returns collection of filterd annotations
:
: @param $uri The document to process
: @param $optionAnnotType The annot type
: @param $optionAnnotCategory The annot category
: @param $optionAnnotPriority The annot priority
: @return The string
:
: @author <a href="mailto:nikolaos.beer@uni-paderborn.de">Nikolaos Beer</a>
:)
declare function annotation:filterAnnotations($uri, $optionAnnotType, $optionAnnotCategory, $optionAnnotPriority) {
    doc($uri)//mei:annot[
                if ($optionAnnotType) then (@type = $optionAnnotType) else (@type = 'editorialComment')][
                if ($optionAnnotCategory) then (contains(./mei:ptr[@type = 'categories']/@target, $optionAnnotCategory)) else (.)][
                if ($optionAnnotPriority) then (contains(./mei:ptr[@type = 'priority']/@target, $optionAnnotPriority)) else (.)]
};

(:~
: Returns a JSON representation of all Annotations of a document
:
: @param $uri The document to process
: @return The JSON representation
:)
declare function annotation:annotationsToJSON($uri as xs:string) as xs:string {
    
    let $options := annotation:annotationsGetOptions($uri)
    let $optionAnnotType := annotation:validateAnnotationOptions($options, 'annotType')
    let $optionAnnotCategory := annotation:validateAnnotationOptions($options, 'annotCategory')
    let $optionAnnotPriority := annotation:validateAnnotationOptions($options, 'annotPriority')
    
    let $annos := annotation:filterAnnotations($uri, $optionAnnotType, $optionAnnotCategory, $optionAnnotPriority)
    return
        string-join(
            for $anno in $annos
            return annotation:toJSON($anno)
        , ',')
};


(:~
: Returns a JSON representation of an Annotation
:
: @param $anno The Annotation to process
: @return The JSON representation
:)
declare function annotation:toJSON($anno as element()) as xs:string {
    let $id := $anno/@xml:id
    let $title := normalize-space(local:getLocalizedTitle($anno))
    let $doc := $anno/root()
    let $workID := $doc/mei:mei/@xml:id/string()
    let $prio := local:getLocalizedName($doc/id(substring($anno/mei:ptr[@type = 'priority']/@target,2)))
    let $pList := distinct-values(tokenize($anno/@plist, ' '))
    let $pList := for $p in $pList 
                    return if ( contains($p, '#'))
                                then (substring-before($p, '#'))
                                else $p
    
    let $pListAsSourceIDs := 
        for $p in distinct-values($pList)
        let $pDoc := doc($p)
        where not($pDoc//mei:availability[@type = 'rwaOnline'] = 'hidden')
        return $pDoc//@xml:id[1]
    let $configResource := doc('xmldb:exist:///db/apps/mriExistDBconf/config.xml')
    let $mrpUrl := $configResource//conf:mrpURL
    let $lang := mrpShared:get-lang()
    let $getAnnotationSiglaAsArrayUrl := concat($mrpUrl, '/cat/rest/getAnnotationSiglaAsArray.xql?workID=', $workID, '&amp;sourceIDs[]=', string-join($pListAsSourceIDs, '&amp;sourceIDs[]='), '&amp;lang=', $lang)
    let $queryResult := hc:send-request(<hc:request href="{$getAnnotationSiglaAsArrayUrl}" method="get"/>)[2]
    let $sigla := $queryResult
    
    let $catURIs := tokenize(replace($anno/mei:ptr[@type = 'categories']/@target,'#',''),' ')
    let $cats := string-join(
                    for $u in $catURIs
                    return local:getLocalizedName($doc/id($u)) 
                 , ', ')
    let $count := count($anno/preceding-sibling::mei:annot) + 1
    
    return
        concat('{ "id": "', $id, 
            '", "title": "', $title, 
            '", "categories": "', $cats,
            '", "priority": "', $prio,
            '", "pos": "', $count,
            '", "sigla": "', $sigla,
            '" }', '')
};

(:~
: Returns a HTML representation of an Annotation's content
:
: @param $anno The Annotation to process
: @param $idPrefix A prefix for all ids (because of uniqueness in application)
: @return The HTML representation
:)
declare function annotation:getContent($anno as element(), $idPrefix as xs:string) {
    let $p := $anno/mei:p
    
    (:let $xsltBase := concat('file:', system:get-module-load-path(), '/../xslt/'):)
    let $xsltBase := concat(replace(system:get-module-load-path(), 'embedded-eXist-server', ''), '/../xslt/') (: TODO: Prüfen, wie wir an dem replace vorbei kommen:)
    
    let $html := transform:transform($p,concat($xsltBase,'meiP2html_rwaOnline.xsl'),
    <parameters><param name="idPrefix" value="{$idPrefix}"/><param name="imagePrefix" value="{eutil:getPreference('image_prefix', request:get-parameter('edition', ''))}"/></parameters>)
    return
    
        $html
};

(:~
: Returns an Annotation's priority
:
: @param $anno The Annotation to process
: @return The priority
:)
declare function annotation:getPriority($anno as element()) as xs:string {
    
    let $uri := $anno/mei:ptr[@type eq 'priority']/string(@target)
    
    let $doc := if(starts-with($uri,'#'))
                then($anno/root())
                else(doc(substring-before($uri,'#')))
                
    let $locId := substring-after($uri,'#')
    
    let $elem := $doc/id($locId)
    
    return
        if(local-name($elem) eq 'term')
        then(local:getLocalizedName($elem))
        else($locId)
};

(:~
: Returns Annotation's categories
:
: @param $anno The Annotation to process
: @return The categories (as comma separated string)
:)
declare function annotation:getCategories($anno as element()) as xs:string {
    
    string-join(annotation:getCategoriesAsArray($anno), ', ')
};

(:~
: Returns an array of Annotation's categories
:
: @param $anno The Annotation to process
: @return The categories (as comma separated string)
:)
declare function annotation:getCategoriesAsArray($anno as element()) as xs:string* {
    
    let $uris := tokenize($anno/mei:ptr[@type eq 'categories']/string(@target),' ')
    
    let $string := for $uri in $uris 
                   let $doc := if(starts-with($uri,'#'))
                               then($anno/root())
                               else(doc(substring-before($uri,'#')))
                   let $locID := substring-after($uri,'#')
                   let $elem := $doc/id($locID)
                   return
                       if(local-name($elem) eq 'term')
                       then(local:getLocalizedName($elem))
                       else($locID)
    
    return $string
};

(:~
: Returns a list of URIs addressed by an Annotation
:
: @param $anno The Annotation to process
: @return The list
:)
declare function annotation:getParticipants($anno as element()) as xs:string* {
    
    let $ps := tokenize($anno/@plist, ' ')
    let $uris := distinct-values(for $uri in $ps return substring-before($uri,'#'))
    
    return $uris
};