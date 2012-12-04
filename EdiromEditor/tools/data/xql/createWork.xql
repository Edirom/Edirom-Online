xquery version "1.0";
(: daniel: main html for workbench :)

declare namespace request="http://exist-db.org/xquery/request";
declare namespace xmldb="http://exist-db.org/xquery/xmldb";
declare namespace util="http://exist-db.org/xquery/util";
declare namespace xlink="http://www.w3.org/1999/xlink";
declare namespace mei="http://www.edirom.de/ns/mei";

declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";

declare function local:createNewWork($coll, $fields, $values) {
    let $id := concat("edirom_", "work_", util:uuid())
    
    let $fieldsT := tokenize($fields, '__%__')
	let $valuesT := tokenize($values, '__%__')
    
    let $title := local:getTitle($fieldsT, $valuesT)
    let $composer := local:getComposer($fieldsT, $valuesT)

    let $result := local:checkCollections($coll)
    
    let $mei := util:parse(concat('<meicorpus xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.edirom.de/ns/mei" xmlns:xlink="http://www.w3.org/1999/xlink" meiversion="2011-05" xml:id="', $id, '">',
                                        '<meihead type="corpus">',
                                            '<filedesc>',
                                                '<titlestmt>',
                                                    '<title>', $title, '</title>',
                                                    '<respstmt>',
                                                        '<persname role="composer">', $composer, '</persname>',
                                                    '</respstmt>',
                                                '</titlestmt>',
                                                '<pubstmt/>',
                                                '<notesstmt>',
                                                    '<annot type="movementConcordance"/>',
                                                    '<annot type="measureConcordance"/>',
                                                    '<annot type="criticalCommentary"/>',
                                                '</notesstmt>',
                                                '<sourcedesc/>',
                                           '</filedesc>',
                                           '<profiledesc>',
                                              '<classification>',
                                                 '<!-- Warning: Changing the contents of <classification/> may break the export to Edirom presentation tools -->',
                                                 '<classcode xml:id="ediromDefaultCategories_NS1.2"/>',
                                                 '<classcode xml:id="ediromDefaultPriorities_NS1.2"/>',
                                                 '<termlist>',
                                                    '<term classcode="ediromDefaultPriorities_NS1.2" xml:id="ediromAnnotPrio1"/>',
                                                    '<term classcode="ediromDefaultPriorities_NS1.2" xml:id="ediromAnnotPrio2"/>',
                                                    '<term classcode="ediromDefaultPriorities_NS1.2" xml:id="ediromAnnotPrio3"/>',
                                                    '<term classcode="ediromDefaultCategories_NS1.2" xml:id="ediromDefaultCategory_Bogensetzung"/>',
                                                    '<term classcode="ediromDefaultCategories_NS1.2" xml:id="ediromDefaultCategory_VerbalInstruction"/>',
                                                    '<term classcode="ediromDefaultCategories_NS1.2" xml:id="ediromDefaultCategory_Embellishment"/>',
                                                    '<term classcode="ediromDefaultCategories_NS1.2" xml:id="ediromDefaultCategory_Correction"/>',
                                                    '<term classcode="ediromDefaultCategories_NS1.2" xml:id="ediromDefaultCategory_DiastematicMark"/>',
                                                    '<term classcode="ediromDefaultCategories_NS1.2" xml:id="ediromDefaultCategory_Dynamics"/>',
                                                    '<term classcode="ediromDefaultCategories_NS1.2" xml:id="ediromDefaultCategory_Harmony"/>',
                                                    '<term classcode="ediromDefaultCategories_NS1.2" xml:id="ediromDefaultCategory_Rhythm"/>',
                                                    '<term classcode="ediromDefaultCategories_NS1.2" xml:id="ediromDefaultCategory_Articulation"/>',
                                                    '<term classcode="ediromDefaultCategories_NS1.2" xml:id="ediromDefaultCategory_EditorialIntervention"/>',
                                                    '<term classcode="ediromDefaultCategories_NS1.2" xml:id="ediromDefaultCategory_InclusionFromA"/>',
                                                    '<term classcode="ediromDefaultCategories_NS1.2" xml:id="ediromDefaultCategory_NotationalPeculiarity"/>',
                                                    '<term classcode="ediromDefaultCategories_NS1.2" xml:id="ediromDefaultCategory_NotationalVariant"/>',
                                                    '<term classcode="ediromDefaultCategories_NS1.2" xml:id="ediromDefaultCategory_NotationalImprecision"/>',
                                                    '<term classcode="ediromDefaultCategories_NS1.2" xml:id="ediromDefaultCategory_AlterationByAnalogy"/>',
                                                    '<term classcode="ediromDefaultCategories_NS1.2" xml:id="ediromDefaultCategory_StematicRelationship"/>',
                                                    '<term classcode="ediromDefaultCategories_NS1.2" xml:id="ediromDefaultCategory_SeparativeVariant"/>',
                                                    '<term classcode="ediromDefaultCategories_NS1.2" xml:id="ediromDefaultCategory_ConjunctiveError"/>',
                                                    '<term classcode="ediromDefaultCategories_NS1.2" xml:id="ediromDefaultCategory_Score"/>',
                                                    '<term classcode="ediromDefaultCategories_NS1.2" xml:id="ediromDefaultCategory_Lyrics"/>',
                                                    '<term classcode="ediromDefaultCategories_NS1.2" xml:id="ediromDefaultCategory_Direction"/>',
                                                    '<term classcode="ediromDefaultCategories_NS1.2" xml:id="ediromDefaultCategory_Text"/>',
                                                    '<term classcode="ediromDefaultCategories_NS1.2" xml:id="ediromDefaultCategory_Music"/>',
                                                    '<term classcode="ediromDefaultCategories_NS1.2" xml:id="ediromDefaultCategory_Stage"/>',
                                                    '<term classcode="ediromDefaultCategories_NS1.2" xml:id="ediromDefaultCategory_Scene"/>',
                                                 '</termlist>',
                                              '</classification>',
                                           '</profiledesc>',
                                       '</meihead>',
                                   '</meicorpus>'))
    
    let $result := xmldb:store($coll, concat($id, '.xml'), $mei) 
    
    return
        $id
};

declare function local:getTitle($fields, $values) {
    for $x in (1 to count($fields))
    return
        if($fields[$x] eq 'titleInput')
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

let $coll := '/db/contents/works'
let $fields := request:get-parameter('fields', '')
let $values := request:get-parameter('values', '')
let $id := local:createNewWork($coll, $fields, $values)
let $result := exists(xcollection($coll)//mei:meicorpus/id($id))

return
    if($result)
    then(
        string($id)
    )
    else(
        concat('ERROR:')
    )
