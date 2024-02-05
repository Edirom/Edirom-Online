xquery version "3.1";
(:
For LICENSE-Details please refer to the LICENSE file in the root directory of this repository.
:)

(:~
 : This module provides library functions for Sources
 :
 : @author <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
 : @author <a href="mailto:bohl@edirom.de">Benjamin W. Bohl</a>
 :)
module namespace source = "http://www.edirom.de/xquery/source";

(: IMPORTS ========================================================= :)

import module namespace eutil="http://www.edirom.de/xquery/util" at "../xqm/util.xqm";

(: NAMESPACE DECLARATIONS ========================================== :)

declare namespace mei="http://www.music-encoding.org/ns/mei";

(: FUNCTION DECLARATIONS =========================================== :)

(:~
 : Returns whether a document is a source or not
 :
 : @param $uri The URI of the document
 : @return Is work or not
 :)
declare function source:isSource($uri as xs:string) as xs:boolean {
    
    let $doc := eutil:getDoc($uri)
    let $meiVersionRegex := '(([4-9])|(\d+[0-9]))\.\d+\.\d+(-dev)?'
    return
        (:mei2 and ?3 :)
        (exists($doc//mei:mei) and exists($doc//mei:source))
        or
        (:mei4+ for manuscripts:)
        (matches($doc//mei:mei/@meiversion, $meiVersionRegex) and exists($doc//mei:manifestation[@singleton='true']))
        or
        (: mei4+ for prints :)
        (matches($doc//mei:mei/@meiversion, $meiVersionRegex) and exists($doc//mei:manifestation//mei:item)) 
};

(:~
 : Returns a comma separated list of source labels
 :
 : @param $sources The URIs of the Sources' documents to process
 : @return The labels
 :)
declare function source:getLabels($sources as xs:string*, $edition as xs:string) as xs:string {
    
    string-join(
        for $source in $sources return source:getLabel($source, $edition)
    , ', ')
    
};

(:~
 : Returns a source's label
 :
 : @param $source The URIs of the Source's document to process
 : @return The label
 :)
declare function source:getLabel($source as xs:string, $edition as xs:string) as xs:string {
    
    let $sourceDoc := doc($source)
    let $language := eutil:getLanguage($edition)
    
    let $label :=
        (:TODO encoding of source labels may heavily differ in certain encoding contexts, thus introduction of class="http://www.edirom.de/edirom-online/source/label" OR some configuration method, e.g., a user definable function :)
        if($sourceDoc/mei:mei/@meiversion = ("4.0.0", "4.0.1")) then
            $sourceDoc//mei:manifestation[@singleton='true']/mei:titleStmt/mei:title[@class = "http://www.edirom.de/edirom-online/source/label"][not(@xml:lang) or @xml:lang = $language]
        
        else
            $sourceDoc//mei:source/mei:titleStmt/mei:title[not(@xml:lang) or @xml:lang = $language]
    
    let $label :=
        if($label) then
            ($label)
        else
            (doc($source)//mei:meiHead/mei:fileDesc/mei:titleStmt/mei:title[not(@xml:lang) or @xml:lang = $language])
    
    let $label :=
        if($label) then
            ($label)
        else
            ('unknown title')
    return
        string($label)

};

(:~
 : Returns a comma separated list of source sigla
 :
 : @param $sources The URIs of the Sources' documents to process
 : @return The sigla
 :)
declare function source:getSigla($sources as xs:string*) as xs:string {
    
    string-join(
        source:getSiglaAsArray($sources)
    , ', ')
    
};

(:~
 : Returns an array of source sigla
 :
 : @param $sources The URIs of the Sources' documents to process
 : @return The sigla
 :)
declare function source:getSiglaAsArray($sources as xs:string*) as xs:string* {

    for $source in $sources
    return
        source:getSiglum($source)

};

(:~
 : Returns a source's siglum
 :
 : @param $source The URIs of the Source's document to process
 : @return The siglum
 :)
declare function source:getSiglum($source as xs:string) as xs:string? {

    let $doc := doc($source)
    let $elems := $doc//mei:*[@type eq 'siglum']
    let $siglum :=
        if(exists($elems)) then
            ($elems[1]//text())
        else
            ()
    
    return $siglum
};
