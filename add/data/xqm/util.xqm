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

  ID: $Id: util.xqm 1334 2012-06-14 12:40:33Z daniel $
:)

(:~
: This module provides library utility functions
:
: @author <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
: @author <a href="mailto:roewenstrunk@edirom.de">Nikolaos Beer</a>
: @author <a href="mailto:bohl@edirom.de">Benjamin W. Bohl</a>
:)

module namespace eutil = "http://www.edirom.de/xquery/util";

import module namespace work="http://www.edirom.de/xquery/work" at "work.xqm";
import module namespace source="http://www.edirom.de/xquery/source" at "source.xqm";
import module namespace teitext="http://www.edirom.de/xquery/teitext" at "teitext.xqm";
import module namespace edition="http://www.edirom.de/xquery/edition" at "../xqm/edition.xqm";
import module namespace functx = "http://www.functx.com";
import module namespace annotation="http://www.edirom.de/xquery/annotation" at "../xqm/annotation.xqm";

declare namespace request="http://exist-db.org/xquery/request";
declare namespace system="http://exist-db.org/xquery/system";
declare namespace util="http://exist-db.org/xquery/util";
declare namespace mei="http://www.music-encoding.org/ns/mei";
declare namespace tei="http://www.tei-c.org/ns/1.0";
declare namespace edirom="http://www.edirom.de/ns/1.3";

(:~
: Returns the namespace (standardized prefix)
:
: @param $node The node to be processed
: @return The namespace (prefix)
:)

declare function eutil:getNamespace($node as node()) as xs:string {
  switch (namespace-uri($node))
    case 'http://www.music-encoding.org/ns/mei' return 'mei'
    case 'http://www.tei-c.org/ns/1.0' return 'tei'
    case 'http://www.edirom.de/ns/1.3' return 'edirom'
    default return 'unknown'
};

(:~
: Returns a localized string
:
: @param $node The node to be processed
: @return The string
:)

declare function eutil:getLocalizedName($node, $lang) {

let $name :=
    if ($node/mei:title)
    then (
        if ($lang = $node/mei:title/@xml:lang)
        then $node/mei:title[@xml:lang = $lang]/text()
        else $node/mei:title[1]/text()
    )
    else if ($node/mei:name)
    then (
        if ($lang = $node/mei:name/@xml:lang)
        then $node/mei:name[@xml:lang = $lang]/text()
        else $node/mei:name[1]/text()
    )
    else if ($node/edirom:names)
        then (
            if ($lang = $node/edirom:names/edirom:name/@xml:lang)
            then $node/edirom:names/edirom:name[@xml:lang = $lang]/node()
            else $node/edirom:names/edirom:name[1]/node()
    )
    else if (local-name($node) = 'annot' and $node/@type = 'editorialComment')
        then(annotation:generateTitle($node))
    else (normalize-space($node))
return
    if($node/edirom:names)
    then($name)
    else($name => string-join(' ') => normalize-space())
};

(:~
: Returns a localized string
:
: @param $node The node to be processed
: @param $lang Optional parameter for lang selection
: @return The string (normalized space)
:)

declare function eutil:getLocalizedTitle($node as node(), $lang as xs:string?) as xs:string {

  let $namespace := eutil:getNamespace($node)
  
  let $titleMEI := if ($lang != '' and $lang = $node/mei:title/@xml:lang and not($node/mei:title/mei:titlePart))
                   then ($node/mei:title[@xml:lang = $lang]//text() => string-join() => normalize-space())
                   else if ($lang != '' and $lang = $node/mei:title/@xml:lang and $node/mei:title/mei:titlePart)
                   then ($node/mei:title[@xml:lang = $lang]/mei:titlePart[1]//text() => string-join() => normalize-space())
                   else (($node//mei:title)[1]//text() => string-join() => normalize-space())
  
  let $titleTEI := if ($lang != '' and $lang = $node/tei:title/@xml:lang)
                   then $node/tei:title[@xml:lang = $lang]/text()
                   else $node/tei:title[1]/text()
  
  return
      if ($namespace = 'mei')
      then($titleMEI)
      else if ($namespace = 'tei')
      then($titleTEI)
      else('unknown')

};
(:~
: Returns a document
:
: @param $uri The URIs of the documents to process
: @return The document
:)
declare function eutil:getDoc($uri) {

    if(starts-with($uri, 'textgrid:'))
    then(
        let $session := request:get-cookie-value('edirom_online_textgrid_sessionId')
        return
            doc('http://textgridlab.org/1.0/tgcrud/rest/' || $uri || '/data?sessionId=' || $session)
    )
    else(
        doc($uri)
    )
};

(:~
: Returns a comma separated list of document labels
:
: @param $docs The URIs of the documents to process
: @return The labels
:)
declare function eutil:getDocumentsLabels($docs as xs:string*, $edition as xs:string) as xs:string {

    string-join(
        eutil:getDocumentsLabelsAsArray($docs, $edition)
    , ', ')
};

(:~
: Returns an array of document labels
:
: @param $docs The URIs of the documents to process
: @return The labels
:)
declare function eutil:getDocumentsLabelsAsArray($docs as xs:string*, $edition as xs:string) as xs:string* {

    for $doc in $docs
    return
        eutil:getDocumentLabel($doc, $edition)
};

(:~
: Returns a document's label
:
: @param $doc The URIs of the document to process
: @return The label
:)
declare function eutil:getDocumentLabel($doc as xs:string, $edition as xs:string) as xs:string {
    
    if(work:isWork($doc))
    then(work:getLabel($doc, $edition))
    
    else if(source:isSource($doc))
    then(source:getLabel($doc, $edition))
    
    else if(teitext:isText($doc))
    then(teitext:getLabel($doc, $edition))

    else('')
};

(:~
: Returns a part's label (translated if available)
:
: @author Dennis Ried
: @param $partID The xml:id of the Part's node() to process
: @return The label (translated if available)
:)
declare function eutil:getPartLabel($measureOrPerfRes as node(), $type as xs:string) as xs:string {
            (: request:get-parameter('lang', '') doesn't work?? [DeRi]:)
let $lang := if(request:get-parameter('lang', '') = '')
             then('de')
             else(request:get-parameter('lang', '')) 
let $part := $measureOrPerfRes/ancestor::mei:part
let $voiceRef := $part//mei:staffDef/@decls
let $voiceID := substring-after($voiceRef, '#')

let $perfResLabel := if($type eq 'measure')
                     then($measureOrPerfRes/ancestor::mei:mei/id($voiceID)/@label)
                     else($measureOrPerfRes/@label)
let $dictKey := 'perfMedium.perfRes.' || functx:substring-before-if-contains($perfResLabel,'.')
let $label := if(eutil:getLanguageString($dictKey, (), $lang))
              then(eutil:getLanguageString($dictKey, (), $lang))
              else($perfResLabel)
let $numbering := for $i in subsequence(tokenize($perfResLabel,'\.'),2)
                    where matches($i, '([0-9])|([ivxIVX])')
                    return
                        upper-case($i)
return
    normalize-space(string-join(($label, $numbering),' '))
};

(:~
: Returns a language specific string
:
: @param $key The key to search for
: @param $values The values to include into the string
: @return The string
:)
declare function eutil:getLanguageString($key as xs:string, $values as xs:string*) as xs:string {

    eutil:getLanguageString($key, $values, eutil:getLanguage(''))
};

(:~
: Returns a language specific string from the locale/edirom-lang files
:
: @param $key The key to search for
: @param $values The values to include into the string
: @param $lang The language
: @return The string
:)
declare function eutil:getLanguageString($key as xs:string, $values as xs:string*, $lang as xs:string) as xs:string {

    let $base := system:get-module-load-path()
    let $file := doc(concat($base, '/../locale/edirom-lang-', $lang, '.xml'))
    
    let $string := $file//entry[@key = $key]/string(@value)
    let $string := functx:replace-multi($string, for $i in (0 to (count($values) - 1)) return concat('\{',$i,'\}'), $values)
                        
    return
        $string
};

(:~
: Return a value of preference to key
:
: @param $key The key to search for
: @return The string
:)
declare function eutil:getPreference($key as xs:string, $edition as xs:string?) as xs:string {

     let $file := doc('../prefs/edirom-prefs.xml')
     let $projectFile := doc(edition:getPreferencesURI($edition))
     
     return
        if($projectFile != 'null' and $projectFile//entry[@key = $key]) then ($projectFile//entry[@key = $key]/string(@value))
        else ($file//entry[@key = $key]/string(@value))
};

(:~
: Return the application and content language
:
: @param $edition The edition's path
: @return The language key
:)
declare function eutil:getLanguage($edition as xs:string?) as xs:string {

    if (request:get-parameter("lang", "") != "")
    then request:get-parameter("lang", "")
    else if(request:get-cookie-names() = 'edirom-language')
    then request:get-cookie-value('edirom-language')
    else eutil:getPreference('application_language', edition:findEdition($edition))
};

(:~
 : Returns the application base URL as seen from the client
 :
 : NB, this is a relative path on the server, missing the scheme,
 : as well as the server address and port.
 : This function simply concats the current context path with the
 : eXist variables `$exist:prefix` and `$exist:controller`
 : (see https://exist-db.org/exist/apps/doc/urlrewrite)
 :
 : @return a relative path on the server
 :)
declare function eutil:get-app-base-url() as xs:string? {
    if(request:exists())
    then request:get-context-path() || request:get-attribute("exist:prefix") || request:get-attribute('exist:controller')
    else util:log-system-out('request object does not exist; failing to compute base url')
};

(:~
 : Sorts a sequence of numeric-alpha values or nodes (e.g. 1, 1a, 1b, 2) 
 : This is an adaption of functx:sort-as-numeric()
 :
 : @author  Dennis Ried
 : @see     http://www.xqueryfunctions.com/xq/functx_sort-as-numeric.html 
 : @param   $seq the sequence to sort 
 :)
declare function eutil:sort-as-numeric-alpha($seq as item()* )  as item()* {
   for $item in $seq
   let $itemPart1 := (functx:get-matches($item, '\d+'))[1]
   let $itemPart2 := substring-after($item, $itemPart1)
   order by number($itemPart1), $itemPart2
   return $item
    
} ;

(:~
 : Extracts an ISO 639 language code from a given ISO 3166-1 language code
 :
 : @author Benjamin W. Bohl
 : @param  $iso3166-1 xs:string the given ISO 3166-1 language code, e.g., en-US
 : @return xs:string ISO 639 language code, e.g., en
 :)
declare function eutil:iso3166-1-to-iso639($iso3166-1 as xs:string) as xs:string {
    tokenize($iso3166-1, "-")[1]
};

(:~
 : Returns the ISO 639 language code with the highest 'quality' (none cosidered as 1) from
 : the HTTP-request Accept-Language header
 :
 : @author Benjamin W. Bohl
 : @return xs:string ISO 639 language code
 :)
declare function eutil:request-lang-preferred-iso639() as xs:string {
let $request.accept-language := request:get-header("Accept-Language")
return
if($request.accept-language)
then 
    let $tokens := tokenize($request.accept-language, ";")
    let $tokens.qless.ordered := (
        for $token in $tokens
            let $q := substring-after(string-join((analyze-string($token, "(q=\d(\.\d)?)")//fn:match)[1], ""), "q=")
            let $q.decimal := if($q = "") then xs:decimal(1) else xs:decimal($q)
            let $token.qless := replace($token,",?q=\d(\.\d)?,?", "")
            order by $q.decimal descending
            return
                $token.qless
    )
    let $tokens.qmax := $tokens.qless.ordered[1]
    let $tokens.qmax.first := tokenize($tokens.qmax, ",")[1]
    return 
        eutil:iso3166-1-to-iso639($tokens.qmax.first)
    
else
    "en"
};
