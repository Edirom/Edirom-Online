xquery version "3.0";

(: Script based on http://atomic.exist-db.org/blogs/eXist/HoF :)

(:~ 
 : Scan a collection tree recursively starting at $root. Call 
 : the supplied function once for each resource encountered.
 : The first parameter to $func is the collection URI, the 
 : second the resource path (including the collection part).
 :)
declare function local:scan($root as xs:anyURI, $func as 
function(xs:anyURI, xs:anyURI?) as item()*) {
    local:scan-collections($root, function($collection as xs:anyURI) {
        $func($collection, ()),
        (:  scan-resources expects a function with one parameter, so we use a 
partial application
            to fill in the collection parameter :)
        local:scan-resources($collection, $func($collection, ?))
    })
};

(:~
 : List all resources contained in a collection and call the 
 : supplied function once for each resource with the complete
 : path to the resource as parameter.
 :)
declare function local:scan-resources($collection as xs:anyURI, $func as 
function(xs:anyURI) as item()*) {
    for $child in xmldb:get-child-resources($collection)
    return
        $func(xs:anyURI($collection || "/" || $child))
};

(:~
 : Scan a collection tree recursively starting at $root. Call 
 : $func once for each collection found 
 :)
declare function local:scan-collections($root as xs:anyURI, $func as function
(xs:anyURI) as item()*) {
    $func($root),
    for $child in xmldb:get-child-collections($root)
    return
        local:scan-collections(xs:anyURI($root || "/" || $child), $func)
};

let $perms := "g+x,u+x,o+x"

let $ediromOnline := local:scan(xs:anyURI("/db/EdiromOnline"), function($collection, $resource) {
                        if ($resource and 
                            xmldb:get-mime-type($resource) = "application/xquery") then
                            sm:chmod($resource, $perms)
                        else
                            sm:chmod($collection, $perms)
                    })
 
let $ediromEditor := local:scan(xs:anyURI("/db/EdiromEditor"), function($collection, $resource) {
                        if ($resource and 
                            xmldb:get-mime-type($resource) = "application/xquery") then
                            sm:chmod($resource, $perms)
                        else
                            sm:chmod($collection, $perms)
                    })
 
let $content := local:scan(xs:anyURI("/db/contents"), function($collection, $resource) {
                        if ($resource and 
                            xmldb:get-mime-type($resource) = "application/xquery") then
                            sm:chmod($resource, $perms)
                        else
                            sm:chmod($collection, $perms)
                    })

return
    ($ediromOnline, $ediromEditor, $content)