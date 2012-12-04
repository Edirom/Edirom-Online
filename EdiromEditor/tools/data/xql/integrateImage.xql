xquery version "1.0";
(: daniel: main html for workbench :)

declare namespace request="http://exist-db.org/xquery/request";
declare namespace mei="http://www.edirom.de/ns/mei";

declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";
        
declare function local:integrateImage($id, $coll, $uri, $surfaceId) {
	let $mei := xcollection($coll)//mei:source/id($id)/root()
	let $result := local:checkFacsimileTag($mei, $id)
	let $graphicId := concat("edirom_", "graphic_", util:uuid())
	let $pageNo := local:getPageNo($mei)
	let $surface := <surface xmlns="http://www.edirom.de/ns/mei" xml:id="{$surfaceId}" n="{$pageNo}">
						    <graphic xmlns="http://www.edirom.de/ns/mei" xlink:href="{$uri}" xml:id="{$graphicId}" type="facsimile" />
					    </surface>
	let $result := update insert $surface into $mei//mei:facsimile
	return
		exists($mei//mei:graphic/id($graphicId))
};

declare function local:checkFacsimileTag($mei, $sourceId) {
	if(exists($mei//mei:facsimile))
	then()
	else(
		let $id := concat("edirom_", "facsimile_", util:uuid())
		let $facs := <facsimile xmlns="http://www.edirom.de/ns/mei" xml:id="{$id}" source="{$sourceId}" />
		return
			if(empty($mei//mei:music/child::*))
			then( update insert $facs into $mei//mei:music)
			else( update insert $facs preceding $mei//mei:music/child::*[1])
	)
};

declare function local:getPageNo($mei) {
    if(empty($mei//mei:surface))
    then(1)
    else(
        let $max := max($mei//mei:surface/@n)
        return
        if(contains($max, 'NaN'))
        then(
            if(contains($mei//mei:surface/last()/@n, 'NaN'))
            then(string(''))
            else(number($mei//mei:surface/last()/@n) + 1)
        )
        else(number($max) + 1)
    )
};

let $id := request:get-parameter('id', '')
let $uri := request:get-parameter('uri', '')
let $coll := '/db/contents/sources'
let $surfaceId := concat("edirom_", "surface_", util:uuid())
let $result := local:integrateImage($id, $coll, $uri, $surfaceId)

return
    if($result)
    then(
        $surfaceId
    )
    else(
        string('ERROR:')
    )
