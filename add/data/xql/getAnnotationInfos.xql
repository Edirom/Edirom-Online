xquery version "3.1";
(:
For LICENSE-Details please refer to the LICENSE file in the root directory of this repository. 
:)

declare namespace mei = "http://www.music-encoding.org/ns/mei";
declare namespace output = "http://www.w3.org/2010/xslt-xquery-serialization";
declare namespace request = "http://exist-db.org/xquery/request";

import module namespace annotation = "http://www.edirom.de/xquery/annotation" at "../xqm/annotation.xqm";
import module namespace eutil = "http://www.edirom.de/xquery/util" at "../xqm/util.xqm";

declare option output:method "json";
declare option output:media-type "application/json";

declare variable $uri := request:get-parameter('uri', '');
declare variable $edition := request:get-parameter('edition', '');
declare variable $edition_path := eutil:getPreference('edition_path', $edition);

(:~
 : Returns distinct list of catagories
 :)
declare function local:getDistinctCategories($annots as element()*) as xs:string* {
    
    let $oldCats := distinct-values($annots/mei:ptr[@type = "categories"]/replace(@target, '#', ''))
    let $newCats := distinct-values(for $annot in $annots
    return
        tokenize(replace(normalize-space($annot/@class), '#', ''), ' '))[contains(., 'annotation.category')]
    
    return
        distinct-values(($oldCats, $newCats)[string-length() gt 0])
};

(:~
 : Returns distinct list of annotation priorities
 :)
declare function local:getDistinctPriorities($annots as element()*) as xs:string* {
    
    distinct-values(
    for $annot in $annots
    let $oldLink := $annot/mei:ptr[@type = "priority"]/replace(@target, '#', '')
    let $classes := tokenize(replace(normalize-space($annot/@class), '#', ''), ' ')
    let $newLink := $classes[starts-with(., 'ediromAnnotPrio')]
    return
        distinct-values(($oldLink, $newLink))[string-length(.) gt 0]
    )
};

let $mei := doc($uri)/root()
let $annots := collection($edition_path)//mei:annot[matches(@plist, $uri)] | $mei//mei:annot
let $categories :=
for $category in local:getDistinctCategories($annots)
let $categoryElement := (collection($edition_path)/id($category)[mei:label or mei:name])[1]
let $name := annotation:category_getName($categoryElement, eutil:getLanguage($edition))
    order by $name
return
    map {
        'id': $category,
        'name': $name
    }

let $prios :=
for $priority in local:getDistinctPriorities($annots)
let $name := annotation:getPriorityLabel((collection($edition_path)//id($priority)[mei:label or mei:name])[1])
    order by $name
return
    map {
        'id': $priority,
        'name': $name
    }

let $map :=
map {
    'categories': array {$categories},
    'priorities': array {$prios},
    'count': count($annots)
}

return
    $map
    
    (:

return concat('{categories: [',
        string-join(
            for $category in local:getDistinctCategories($annots)
            let $categoryElement := (collection($edition_path)/id($category))[1]
            let $name := annotation:category_getName($categoryElement, eutil:getLanguage($edition))
            order by $name
            return
                concat('{id:"', $category, '",name:"', $name,'"}')
        , ','),
        '], priorities: [',
        string-join(
            for $priority in local:getDistinctPriorities($annots)
            let $name := eutil:getLocalizedName((collection($edition_path)//id($priority))[1], $lang)
            order by $name
            return
                concat('{id:"', $priority, '",name:"', $name,'"}')
        , ','),
        ']}')
        
        :)