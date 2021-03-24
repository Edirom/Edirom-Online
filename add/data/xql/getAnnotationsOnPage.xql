xquery version "3.0";
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

  ID: $Id: getAnnotationsOnPage.xql 1457 2012-10-12 08:05:03Z daniel $
:)

(:~
    Returns a JSON sequence with all anotations on a specific page.
    
    @author <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
:)

import module namespace functx = "http://www.functx.com" at "../xqm/functx-1.0-nodoc-2007-01.xq";

import module namespace eutil="http://www.edirom.de/xquery/util" at "../xqm/util.xqm";

declare namespace mei="http://www.music-encoding.org/ns/mei";
declare namespace xlink="http://www.w3.org/1999/xlink";
declare namespace svg="http://www.w3.org/2000/svg";

declare namespace request="http://exist-db.org/xquery/request";
declare namespace ft="http://exist-db.org/xquery/lucene";
declare namespace xmldb="http://exist-db.org/xquery/xmldb";

declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";

declare function local:getAnnotations($uriSharp as xs:string, $surfaceId as xs:string, $annotations as element()*, $elems as element()*) as xs:string* {
    for $annotation in $annotations
	let $id := $annotation/string(@xml:id)
	let $uri := concat('xmldb:exist://', document-uri($annotation/root()), '#', $id)
	let $prio := $annotation/mei:ptr[@type="priority"]/replace(@target, '#', '')
	let $cat := $annotation/mei:ptr[@type="categories"]/replace(@target, '#', '')
	let $plist := for $p in tokenize($annotation/@plist, '\s+')
					return if(starts-with($p, $uriSharp))then(substring-after($p, $uriSharp))else()
    let $svgList := local:getAnnotSVGs($id, $plist, $elems)
    let $plist := local:getParticipants($id, $plist, $elems)
	return
		concat('
       	{',
           	'id: "', $id, '", ',
           	'plist: [', $plist, '], ',
           	'svgList: [', $svgList, '], ',
           	'fn: "loadLink(\"', $uri, '\")", ',
           	'uri: "', $uri, '", ',
           	'priority: "', $prio, '", ',
           	'categories: "', $cat, '"',
       	'}')
};

(:~
    Finds all annotations in all works.
    
    @param $elems The elements to check (most likely measures and zones)
    @returns A sequence of annotation elements
:)
declare function local:findAnnotations($edition as xs:string, $uri as xs:string, $elemIds as xs:string*) as element()* {

    (: TODO: search in other documents and in other collections :)
    (: TODO: check if annotations hold URIs or IDRefs :)
	functx:distinct-deep(
		for $id in $elemIds
		let $uriPlusId := concat($uri, '#', $id)
		return collection(eutil:getPreference('edition_path', $edition))//mei:annot/@plist[tokenize(string(.), '\s+') = $uriPlusId]/..
	)
};

(:~
    Returns a JSON representation of all participants of an annotation
    
    @param $annotId The id of the annotation to process
    @param $plist The list of participants referenced by the annotation
    @param $elem A sequence of elements which could be relevant
    @returns A JSON representation of the perticipants
:)
declare function local:getParticipants($annoId as xs:string, $plist as xs:string*, $elems as element()*) as xs:string {

    let $participants := $elems[@xml:id = $plist]
    return
        string-join(
            for $p in $participants
            let $coord := local:getCoordinates($p)
			return 
		        concat('{id:"', $annoId, '__', string($p/@xml:id), '",ulx:', $coord[1], ',uly:', $coord[2], ',lrx:', $coord[3], ',lry:', $coord[4],'}')
        , ",")
};

(:~
    Returns a JSON representation of all participants of an annotation
    
    @param $annotId The id of the annotation to process
    @param $plist The list of participants referenced by the annotation
    @param $elem A sequence of elements which could be relevant
    @returns A JSON representation of the perticipants
:)
declare function local:getAnnotSVGs($annoId as xs:string, $plist as xs:string*, $elems as element()*) as xs:string {

    let $participants := $elems[@id = $plist]
    return
        
    string-join(
    
        for $svg in $participants
        let $id := $svg/@id
        let $ser := util:serialize($svg, ())
        let $repl := replace(replace($ser, '"', '\\"'), '\n', '')
        return concat('{id:"', $annoId, '__', $id, '",svg:"', $repl,'"}')
    
    , ', ')
};

(:~
    Reads the coordinates of an element
    
    @param $participant The element to process
    @returns A sequence with coordiantes (ulx, uly, lrx, lry)
:)
declare function local:getCoordinates($participant as element()) as xs:integer+ {
    let $zone := if(name($participant) = 'measure' or name($participant) = 'staff') then($participant/root()/id(substring($participant/@facs, 2))) else($participant)
    return if($zone/@ulx) then(
        (number($zone/@ulx), number($zone/@uly), number($zone/@lrx), number($zone/@lry))
    )else ((-1, -1, -1, -1))
};

let $edition := request:get-parameter('edition', '')
let $uri := request:get-parameter('uri', '')
let $uriSharp := concat($uri, '#')
let $mei := doc($uri)/root()
let $surfaceId := request:get-parameter('pageId', '')

let $surface := $mei/id($surfaceId)
let $zones := $surface//mei:zone

let $measureLike := 
    for $id in $zones[@type = 'measure' or @type = 'staff']/string(@xml:id)
	let $ref := concat('#', $id)
	return $mei//*[@facs = $ref]
	
let $svgLike := $surface//svg:svg

let $targetLike := $zones | $measureLike | $svgLike
let $targetLikeIds := $zones/@xml:id | $measureLike/@xml:id | $svgLike/@id

let $annotations := local:findAnnotations($edition, $uri, $targetLikeIds)
let $annots := local:getAnnotations($uriSharp, $surfaceId, $annotations, $targetLike)

return (
    concat('[',
	    string-join($annots, ','),
    ']')
)
