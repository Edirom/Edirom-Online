xquery version "1.0";
(: daniel: main html for workbench :)

declare namespace request="http://exist-db.org/xquery/request";
declare namespace xmldb="http://exist-db.org/xquery/xmldb";
declare namespace tei="http://www.tei-c.org/ns/1.0";

declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";

declare function local:createNewSource($coll, $fields, $values) {
    let $id := concat("edirom_", "text_", util:uuid())
    
    let $fieldsT := tokenize($fields, '__%__')
	let $valuesT := tokenize($values, '__%__')
    
    let $inputfile := local:getInputFile($fieldsT, $valuesT)
    let $title := local:getTitle($fieldsT, $valuesT)
    
    let $tei := <TEI xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.tei-c.org/ns/1.0" xmlns:xlink="http://www.w3.org/1999/xlink" xml:id='{$id}'>
        <teiHeader>
		<fileDesc>
			<titleStmt>
				<title>{$title}</title>
			</titleStmt>
			<publicationStmt>
				<date>{fn:current-date()}</date>
			</publicationStmt>
			<sourceDesc>
				<p>Created with Edirom Editor.</p>
			</sourceDesc>
		</fileDesc>
	</teiHeader>
	<text>
		<body>
			<p>Neuer Text.</p>
		</body>
	</text>
    </TEI>
    
    let $result := local:checkCollections($coll)
    let $result := xmldb:store($coll, concat($id, '.xml'), $tei) 
    
    return
        $id
};

declare function local:getInputFile($fields, $values) {
    for $x in (1 to count($fields))
    return
        if($fields[$x] eq 'inputfile')
        then($values[$x])
        else()
};

declare function local:getTitle($fields, $values) {
    for $x in (1 to count($fields))
    return
        if($fields[$x] eq 'titleInput')
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

let $coll := '/db/contents/texts'
let $fields := request:get-parameter('fields', '')
let $values := request:get-parameter('values', '')
let $id := local:createNewSource($coll, $fields, $values)
let $result := exists(xcollection($coll)//tei:TEI/id($id))

return
    if($result)
    then(
        string($id)
    )
    else(
        concat('ERROR:')
    )
