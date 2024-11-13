xquery version "3.1";
(:
 : For LICENSE-Details please refer to the LICENSE file in the root directory of this repository.
 :)

(:~
 : This module provides library functions for Works
 :
 : @author <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
 :)
module namespace work = "http://www.edirom.de/xquery/work";

(: IMPORTS ================================================================= :)

import module namespace eutil="http://www.edirom.de/xquery/util" at "util.xqm";

(: NAMESPACE DECLARATIONS ================================================== :)

declare namespace edirom="http://www.edirom.de/ns/1.3";
declare namespace mei="http://www.music-encoding.org/ns/mei";
declare namespace request = "http://exist-db.org/xquery/request";

(: FUNCTION DECLARATIONS =================================================== :)

(:~
 : Returns  a map object with details about a Work
 :
 : @param $uri The URI of the Work's document to process
 : @return a map object with the keys "id", "doc", and "title" 
 :)
declare function work:details($uri as xs:string, $edition as xs:string) as map(*) {
    
    let $work := doc($uri)/mei:mei | doc($uri)/mei:work
    let $lang := request:get-parameter('lang', '')
    
    return
        map {
            "id": $work/string(@xml:id),
            "doc": $uri,
            "title": replace(eutil:getLocalizedTitle((($work/descendant-or-self::mei:work)[1]), $lang), '"', '\\"')
        }
};

(:~
 : Returns whether a document is a work or not
 :
 : @param $uri The URI of the document
 : @return Is work or not
 :)
declare function work:isWork($uri as xs:string) as xs:boolean {
    
    (exists(doc($uri)//mei:mei) and exists(doc($uri)//mei:work) and not(doc($uri)//mei:source)) or exists(doc($uri)/mei:work)

};

(:~
 : Returns a works's label
 :
 : @param $work The URIs of the Work's document to process
 : @param $edition The ID of the Edition the Work is part of
 : @return The label
 :)
declare function work:getLabel($work as xs:string, $edition as xs:string) as xs:string {
 
    eutil:getLocalizedTitle(doc($work)/root()//mei:work, request:get-parameter('lang', ''))

};

(:~
 : Returns the forst works id
 :
 : @param $uri The URIs of the Edition
 : @return The id
 :)
declare function work:findWorkID($uri as xs:string) as xs:string {
 
    doc($uri)//edirom:work[1]/data(@xml:id)

};
