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

  ID: $Id: getAnnotationsInText.xql 1279 2012-03-19 13:16:43Z daniel $
:)

(:~
    Returns a JSON sequence with all anotations in a specific text.
    
    @author <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
:)

declare namespace mei="http://www.music-encoding.org/ns/mei";
declare namespace xlink="http://www.w3.org/1999/xlink";

declare namespace request="http://exist-db.org/xquery/request";
declare namespace ft="http://exist-db.org/xquery/lucene";
declare namespace xmldb="http://exist-db.org/xquery/xmldb";

declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";

(:~
    Finds all annotations in all works.
    
    @param $elems The elements to check (most likely measures and zones)
    @returns A sequence of annotation elements
:)
declare function local:findAnnotations($uri as xs:string) as element()* {

    (: TODO: check if annotations hold URIs or IDRefs :)
	collection('/db/contents')//mei:annot[matches(@plist, $uri)]
};


declare function local:getAnnotations($uriSharp as xs:string, $annotations as element()*) as xs:string* {
    for $annotation in $annotations
	let $id := $annotation/string(@xml:id)
	let $uri := concat('xmldb:exist://', document-uri($annotation/root()), '#', $id)
	let $prio := $annotation/mei:ptr[@type="priority"]/replace(@target, '#', '')
	let $cat := $annotation/mei:ptr[@type="categories"]/replace(@target, '#', '')
	let $plist := for $p in tokenize($annotation/@plist, '\s+')
					return 
					   if(starts-with($p, $uriSharp))
					   then(concat('{id:"', $id, '__', substring-after($p, $uriSharp),'"}'))
					   else()
	let $plist := string-join($plist, ',')				   
	return
		concat('
       	{',
           	'id: "', $id, '", ',
           	'plist: [', $plist, '], ',
           	'svgList: [], ',
           	'fn: "loadLink(\"', $uri, '\")", ',
           	'uri: "', $uri, '", ',
           	'priority: "', $prio, '", ',
           	'categories: "', $cat, '"',
       	'}')
};

let $uri := request:get-parameter('uri', '')
let $uriSharp := concat($uri, '#')
let $annotations := local:findAnnotations($uri)

return
    concat('[',
	    string-join(local:getAnnotations($uriSharp, $annotations), ','),
    ']')
