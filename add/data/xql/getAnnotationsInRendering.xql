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

import module namespace functx = "http://www.functx.com";

import module namespace eutil = "http://www.edirom.de/xquery/util" at "../xqm/util.xqm";

declare namespace mei = "http://www.music-encoding.org/ns/mei";
declare namespace xlink = "http://www.w3.org/1999/xlink";

declare namespace request = "http://exist-db.org/xquery/request";

declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";

declare function local:getAnnotations($edition as xs:string, $edition_path as xs:string, $uri as xs:string, $elemIds as xs:string*) as xs:string* {
    
    for $measureId in $elemIds
    let $uriPlusId := concat($uri, '#', $measureId)
    let $annots := collection($edition_path)//mei:annot/@plist[tokenize(string(.), '\s+') = $uriPlusId]/..
    return
        for $annotation in $annots
        let $id := $annotation/string(@xml:id)
        let $uri := concat('xmldb:exist://', document-uri($annotation/root()), '#', $id)
        let $prio := $annotation/mei:ptr[@type = "priority"]/replace(@target, '#', '')
        let $cat := $annotation/mei:ptr[@type = "categories"]/replace(@target, '#', '')
        return
            concat('
           	{',
            '"id": "', $id, '", ',
            '"measureId": "', $measureId, '", ',
            '"fn": "loadLink(\"', $uri, '\")", ',
            '"uri": "', $uri, '", ',
            '"priority": "', $prio, '", ',
            '"categories": "', $cat, '"',
            '}')
};


let $edition := request:get-parameter('edition', '')
let $uri := request:get-parameter('uri', '')
let $measureIds := request:get-parameter('measureIds', '')

let $edition_path := eutil:getPreference('edition_path', $edition)
let $annots := local:getAnnotations($edition, $edition_path, $uri, tokenize($measureIds, ','))

return
    (
    concat('[',
    string-join($annots, ','),
    ']')
    )
