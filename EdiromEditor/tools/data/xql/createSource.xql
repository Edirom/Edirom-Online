xquery version "1.0";
(: daniel: main html for workbench :)

declare namespace request="http://exist-db.org/xquery/request";
declare namespace xmldb="http://exist-db.org/xquery/xmldb";
declare namespace mei="http://www.edirom.de/ns/mei";

declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";

declare function local:createNewSource($coll, $fields, $values) {
    let $id := concat("edirom_", "source_", util:uuid())
    let $facsId := concat("edirom_", "facsimile_", util:uuid())
    let $mdivId := concat("edirom_", "mdiv_", util:uuid())
    
    let $fieldsT := tokenize($fields, '__%__')
	let $valuesT := tokenize($values, '__%__')
    
    let $work := local:getWork($fieldsT, $valuesT)
    let $composer := local:getComposer($fieldsT, $valuesT)
    let $title := local:getTitle($fieldsT, $valuesT)
    let $signature := local:getSignature($fieldsT, $valuesT)
    let $dating := local:getDating($fieldsT, $valuesT)
    let $type := local:getType($fieldsT, $valuesT)
    
    let $mei := <mei xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.edirom.de/ns/mei" xmlns:xlink="http://www.w3.org/1999/xlink" meiversion="2011-05">
        <meihead>
            <filedesc>
                <titlestmt>
                    <title>{$work}</title>
                    <respstmt>
                        <persname role="composer">{$composer}</persname>
                    </respstmt>
                </titlestmt>
                <pubstmt/>
                <sourcedesc>
                    <source xml:id="{$id}">
                        <titlestmt>
                            <title>{$title}</title>
                        </titlestmt>
                        <pubstmt>
                            <date>{$dating}</date>
                            <identifier type="signature">{$signature}</identifier>
                        </pubstmt>
                        <classification>
                           <classcode xml:id="ediromSourceTypes"/>
                           <termlist>
                              <term classcode="ediromSourceTypes">{$type}</term>
                           </termlist>
                        </classification>
                    </source>
                </sourcedesc>
            </filedesc>
        </meihead>
        <music>
            <facsimile xml:id="{$facsId}" source="{$id}" />
            <body>
                <mdiv xml:id="{$mdivId}" n="Satz 1" />
            </body>
        </music>
    </mei>
    
    let $result := local:checkCollections($coll)
    let $result := xmldb:store($coll, concat($id, '.xml'), $mei) 
    
    return
        $id
};

declare function local:getWork($fields, $values) {
    for $x in (1 to count($fields))
    return
        if($fields[$x] eq 'workInput')
        then($values[$x])
        else()
};

declare function local:getComposer($fields, $values) {
    for $x in (1 to count($fields))
    return
        if($fields[$x] eq 'composerInput')
        then($values[$x])
        else()
};

declare function local:getTitle($fields, $values) {
    for $x in (1 to count($fields))
    return
        if($fields[$x] eq 'nameInput')
        then($values[$x])
        else()
};

declare function local:getSignature($fields, $values) {
    for $x in (1 to count($fields))
    return
        if($fields[$x] eq 'sourceSignatureInput')
        then($values[$x])
        else()
};

declare function local:getDating($fields, $values) {
    for $x in (1 to count($fields))
    return
        if($fields[$x] eq 'sourceDatingInput')
        then($values[$x])
        else()
};

declare function local:getType($fields, $values) {
    for $x in (1 to count($fields))
    return
        if($fields[$x] eq 'sourceTypeInput')
        then($values[$x])
        else()
};

declare function local:checkCollections($coll) {
    let $num := count(tokenize($coll, '/'))
    for $x in (0 to $num - 2)
    order by $x descending
    return
	    local:createCollection(replace($coll, concat(local:getPattern($x), '$'), ''))
};

declare function local:getPattern($num) {
	string-join(
		for $x in (1 to $num)
		return
			string('/[a-z]*')
	, '')
};

declare function local:createCollection($path) {
    if(xmldb:collection-exists($path))
    then()
    else(
        let $coll := substring-after($path, '/')
        let $parents := substring($path, 1, string-length($path) - string-length($coll))
        return
            xmldb:create-collection($parents, $coll)
    )
};

let $coll := '/db/contents/sources'
let $fields := request:get-parameter('fields', '')
let $values := request:get-parameter('values', '')
let $id := local:createNewSource($coll, $fields, $values)
let $result := exists(xcollection($coll)//mei:source/id($id))

return
    if($result)
    then(
        string($id)
    )
    else(
        concat('ERROR:')
    )
