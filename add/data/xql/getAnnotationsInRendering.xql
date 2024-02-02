xquery version "3.1";
(:
For LICENSE-Details please refer to the LICENSE file in the root directory of this repository.
:)

(:~
    Returns a JSON sequence with all anotations on a specific page.

    @author <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
:)

(: IMPORTS ========================================================= :)

import module namespace functx = "http://www.functx.com";
import module namespace eutil = "http://www.edirom.de/xquery/util" at "../xqm/util.xqm";

(: NAMESPACE DECLARATIONS ========================================== :)

declare namespace mei = "http://www.music-encoding.org/ns/mei";
declare namespace xlink = "http://www.w3.org/1999/xlink";
declare namespace request = "http://exist-db.org/xquery/request";

(: OPTION DECLARATIONS ============================================= :)

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
        
        return (:TODO map instead of concat :)
            concat('
                {',
                '"id": "', $id, '", ',
                '"measureId": "', $measureId, '", ',
                '"fn": "loadLink(\"', $uri, '\")", ',
                '"uri": "', $uri, '", ',
                '"priority": "', $prio, '", ',
                '"categories": "', $cat, '"',
                '}'
            )
};


let $edition := request:get-parameter('edition', '')
let $uri := request:get-parameter('uri', '')
let $measureIds := request:get-parameter('measureIds', '')
let $edition_path := eutil:getPreference('edition_path', $edition)
let $annots := local:getAnnotations($edition, $edition_path, $uri, tokenize($measureIds, ','))

return
    concat(
        '[',
        string-join($annots, ','),
        ']'
    )
