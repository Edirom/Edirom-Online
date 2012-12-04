xquery version "1.0";
(: daniel: main html for workbench :)

declare namespace request="http://exist-db.org/xquery/request";
declare namespace xmldb="http://exist-db.org/xquery/xmldb";
declare namespace image="http://www.edirom.de/ns/image";

declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";
        
declare function local:createNewImage($coll, $id, $path, $pathOrig, $width, $height) {
    let $image := <image xmlns="http://www.edirom.de/ns/image"
                        file="{$path}"
                        fileOrig="{$pathOrig}"
                        width="{$width}"
                        height="{$height}"
                        xml:id="{$id}" />
    
    let $result := xmldb:store($coll, concat($id, '.xml'), $image) 
    
    return
        $id
};

let $id := request:get-parameter('id', '')
let $path := request:get-parameter('path', '')
let $pathOrig := request:get-parameter('pathOrig', '')
let $width := request:get-parameter('width', '')
let $height := request:get-parameter('height', '')
let $coll := '/db/contents/images'
let $result := local:createNewImage($coll, $id, $path, $pathOrig, $width, $height)
let $result := exists(xcollection($coll)//image:image/id($id))

return
    if($result)
    then(
        concat('xmldb:exist://', $coll, '/', $id, '.xml')
    )
    else(
        concat('ERROR:', $pathOrig)
    )
