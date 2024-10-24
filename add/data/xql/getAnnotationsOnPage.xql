xquery version "3.1";
(:
 : For LICENSE-Details please refer to the LICENSE file in the root directory of this repository.
 :)

(:~
 :  Returns a JSON sequence with all anotations on a specific page.
 :
 :  @author <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
 :  @author <a href="mailto:bohl@edirom.de">Benjamin W. Bohl</a>
 :)


(: IMPORTS ================================================================= :)

import module namespace functx = "http://www.functx.com";

import module namespace eutil = "http://www.edirom.de/xquery/util" at "../xqm/util.xqm";


(: NAMESPACE DECLARATIONS ================================================== :)

declare namespace ft = "http://exist-db.org/xquery/lucene";

declare namespace mei = "http://www.music-encoding.org/ns/mei";

declare namespace output = "http://www.w3.org/2010/xslt-xquery-serialization";

declare namespace request = "http://exist-db.org/xquery/request";

declare namespace svg = "http://www.w3.org/2000/svg";

declare namespace xlink = "http://www.w3.org/1999/xlink";

declare namespace xmldb = "http://exist-db.org/xquery/xmldb";


(: OPTION DECLARATIONS ===================================================== :)

declare option output:method "json";

declare option output:media-type "application/json";


(: FUNCTION DECLARATIONS =================================================== :)

(:~
 : Returns a JSON array of annotations
 :
 : @param $sourceUriSharp the xmldb-uri of a mei-source with a trailing #
 : @param $surfaceId the xml:id of a mei:surface element
 : @param $annotations the mei:annotation elements to consider
 :
 : @returns a JSON array of annotations
 :)
declare function local:getAnnotations($sourceUriSharp as xs:string, $surfaceId as xs:string, $annotations as element()*, $elems as element()*) as array(*)* {
    array {
        for $annotation in $annotations
        
        let $id := $annotation/string(@xml:id)
        
        let $uri := concat('xmldb:exist://', document-uri($annotation/root()), '#', $id)
        
        let $classes := tokenize(replace(normalize-space($annotation/@class), '#', ''), ' ')
        
        let $prio := $annotation/mei:ptr[@type = "priority"]/replace(@target, '#', '') || $classes[starts-with(., 'ediromAnnotPrio')]
        
        let $cat := $annotation/mei:ptr[@type = "categories"]/replace(@target, '#', '') || string-join($classes[contains(., 'annotation.category.')], ' ')
        
        let $plist.raw :=
            for $p in tokenize(normalize-space($annotation/@plist), ' ')
            let $p.noSharp := replace($p, '#', '')
            return
                if (starts-with($p, $sourceUriSharp)) then
                    (substring-after($p, $sourceUriSharp))
                else if ($elems/@xml:id[. = $p.noSharp] or $elems/@id[. = $p.noSharp]) then
                    ($p.noSharp)
                else
                    ()
        
        let $svgList as array(*)* := local:getAnnotSVGs($id, $plist.raw, $elems)
        
        let $plist as array(*)* := local:getParticipants($id, $plist.raw, $elems)
        
        return
            map {
                'id': $id,
                'plist': $plist,
                'svgList': $svgList,
                'fn': 'loadLink("' || $uri || '")',
                'uri': $uri,
                'priority': $prio,
                'categories': $cat
            }
    }
};

(:~
 : Returns all annotations in all works of an edirom-edition containing references to a list of IDs from one source
 :
 : @param $edition The xmldb-uri to the edirom-edition file
 : @param $uri The xmldb-uri to the source-file
 : @param $elemIds The element-IDs to check (most likely measures and zones)
 :
 : @returns A sequence of mei:annot elements
 :)
declare function local:findAnnotations($edition as xs:string, $uri as xs:string, $elemIds as xs:string*) as element()* {
    
    (: TODO: search in other documents and in other collections :)
    (: TODO: check if annotations hold URIs or IDRefs :)
    let $annots := collection(eutil:getPreference('edition_path', $edition))//mei:annot
    let $ret :=
        for $id in $elemIds
        
        let $uriPlusId := concat($uri, '#', $id)
        
        let $hashId := '#' || $id
        
        (: all mei:annot elements in the editions 'edition_path' collection :)
        
        return
            (:
             : The first predicate with `contains` is just a rough estimate to narrow down the result set.
             : It uses the index and is fast while the second (exact) predicate is generally too slow
             :)
            $annots[contains(@plist, $uriPlusId)][$uriPlusId = tokenize(@plist, '\s')] |
            $annots[contains(@plist, $hashId)][$hashId = tokenize(@plist, '\s')]
    return functx:distinct-deep($ret)
};

(:~
 : Returns an array of JSON representations of all participants of an annotation
 :
 : @param $annotId The id of the annotation to process
 : @param $plist The list of participants referenced by the annotation
 : @param $elem A sequence of elements which could be relevant
 :
 : @returns an array of map objects with the keys "id", "type", "ulx", "uly", "lrx", and "lry" 
 :)
declare function local:getParticipants($annoId as xs:string, $plist as xs:string*, $elems as element()*) as array(*)* {
    
    let $participants := $elems[@xml:id = $plist]
    
    return
        array {
            for $p in $participants
            
            let $coord := local:getCoordinates($p)
            
            return
                map {
                    'id': 'annotation__' || string($p/@xml:id),
                    'type': if($p/@type != '') then string($p/@type) else local-name($p),
                    'ulx': $coord[1],
                    'uly': $coord[2],
                    'lrx': $coord[3],
                    'lry': $coord[4]
                }
        }
};

(:~
 : Returns an array of JSON representations of all SVGs of an annotation
 :
 : @param $annotId The id of the annotation to process
 : @param $plist The list of participants referenced by the annotation
 : @param $elem A sequence of elements which could be relevant
 :
 : @returns an array of map objects with the keys "id" and "svg"
 :)
declare function local:getAnnotSVGs($annoId as xs:string, $plist as xs:string*, $elems as element()*) as array(*)* {
    
    let $participants := $elems[@id = $plist]
    
    return
        array {
            for $svg in $participants
            
            let $id := $svg/@id
            
            return
                map {
                    'id': $annoId || '__' || $id,
                    'svg': $svg
                }
        }
};

(:~
 : Reads the coordinates of an element referenced from an mei:annot/@plist
 : If the element name is 'measure' or 'staff' theses will be fetched from
 : a zone referenced with the @facs attribute
 : If the zone does not have an @ulx attribute or if there is no zone being referenced
 : the function will return -1 as avalue for all coordinates
 :
 : @param $participant The element to process
 :
 : @returns A sequence with coordinates (ulx, uly, lrx, lry)
 : @error A fallback sequence wit -1 as all values: (-1, -1, -1, -1)
:)
declare function local:getCoordinates($participant as element()) as xs:integer+ {

    let $zone :=
        if (name($participant) = 'measure' or name($participant) = 'staff') then
            ($participant/root()/id(substring($participant/@facs, 2)))
        else
            ($participant)
    
    return
        if ($zone/@ulx) then
            (number($zone/@ulx), number($zone/@uly), number($zone/@lrx), number($zone/@lry))
        else
            (-1, -1, -1, -1)
};


(: QUERY BODY ============================================================== :)

let $edition := request:get-parameter('edition', '')

let $sourceUri := request:get-parameter('uri', '')

let $sourceUriSharp := concat($sourceUri, '#')

let $mei := doc($sourceUri)/root()

let $surfaceId := request:get-parameter('pageId', '')

let $surface := $mei/id($surfaceId)

let $zones := $surface//mei:zone

(: all children of the source’s MEI file that in their @facs contain a token matching any xml:id of $zones,
   e.g., mei:measure elements pointing to an mei:zone that is a child of $surface
:)
let $measureLike :=
    for $id in $zones[@type = 'measure' or @type = 'staff']/string(@xml:id)
    let $ref := concat('#', $id)
    return
        (:
         : The first predicate with `contains` is just a rough estimate to narrow down the result set.
         : It uses the index and is fast while the second (exact) predicate is generally too slow
         :)
        $mei//*[contains(@facs, $ref)][$ref = tokenize(@facs, '\s+')]

let $svgLike := $surface//svg:svg

let $targetLike := $zones | $measureLike | $svgLike

let $targetLikeIds := $zones/@xml:id | $measureLike/@xml:id | $svgLike/@id

let $annotations := local:findAnnotations($edition, $sourceUri, $targetLikeIds)

let $annots := local:getAnnotations($sourceUriSharp, $surfaceId, $annotations, $targetLike)

return
    $annots
