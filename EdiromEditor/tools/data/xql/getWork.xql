xquery version "1.0";
(: johannes: returns a complete work object :)

declare namespace request="http://exist-db.org/xquery/request";
declare namespace mei="http://www.edirom.de/ns/mei";
declare namespace image="http://www.edirom.de/ns/image";
declare namespace xlink="http://www.w3.org/1999/xlink";

declare option exist:serialize "method=xhtml media-type=text/html omit-xml-declaration=no indent=yes 
        doctype-public=-//W3C//DTD&#160;XHTML&#160;1.0&#160;Strict//EN
        doctype-system=http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd";

declare function local:generateSourceRequests($sources) {
    for $sourcePointer at $i in $sources
    let $sourceRef := $sourcePointer/string(@xlink:href)
    let $sourceDoc := doc($sourceRef)/root()
    let $sourceID := $sourceDoc//mei:source/@xml:id
    return (
        concat('var func = function() { this.registerParticipants("', $sourceID, '"); this.reduceSourcesToLoad(); }.bind(this);',
        'var newSource', $i, ' = new de.edirom.server.data.Source("', $sourceID, '",func);'),
        concat('this.addSource(newSource', $i,');'),
        string('this.sourcesToLoad++;')
    )        
};

declare function local:generateMdivConc($mdivConc) {
    
    let $connections := $mdivConc/mei:annot[@type eq 'connection']  
    return (
        
        string('this.movementConcordance = new de.edirom.server.data.Concordance(this, "mdiv");'),
        (
            for $connection in $connections
            let $connectionID := $connection/string(@xml:id)
            let $pointers := $connection/mei:extptr/replace(replace(@xlink:href, 'xmldb:exist:///db/contents/sources/', ''), '.xml', '')
            return (
                concat('this.movementConcordance.addConnection(new de.edirom.server.data.Connection("',$connectionID,'",["', string-join($pointers, '","') ,'"]));')
            )
        )
    )
};

declare function local:generateMeasureConc($measureConc) {
    
    let $connections := $measureConc/mei:annot[@type eq 'connection']
    
    return (
        
        string('this.measureConcordance = new de.edirom.server.data.Concordance(this, "measure");'),
        (
            for $connection in $connections
            let $connectionID := $connection/string(@xml:id)
            let $pointers := $connection/mei:extptr/replace(replace(@xlink:href, 'xmldb:exist:///db/contents/sources/', ''), '.xml', '')
            
            return (
                concat('this.measureConcordance.addConnection(new de.edirom.server.data.Connection("',$connectionID,'",["', string-join($pointers, '","') ,'"]));')
            )
            
        )
    )
};

declare function local:getParticipants($plist) {
      
   let $coll := '/db/contents/sources'
   let $participants := tokenize($plist,' ')
   for $participantID in $participants
   return 
       
       if(exists($participantID))
       then(
           (: TODO: Unterscheidung zwischen Takten und Stimmen!!! :)
           let $element := xcollection($coll)/id($participantID)
           let $sourceID := $element/root()//mei:source/@xml:id
           let $type := name($element)
		   let $participantPageID := if($type = 'measure')
										then($element/root()/id($element/@facs))
										else()
		   let $participantPageID := $participantPageID/../@xml:id
		   
           return
				concat('new de.edirom.server.data.AnnotParticipant("',$participantID,'","',$type,'","', $participantPageID ,'","', $sourceID ,'")')		
       )
       else(           
       )
       
       (: sonst an Satz oder sogar Quelle hängen :)
};

declare function local:getAnnotations($commentary) {
    let $annots := $commentary/mei:annot
   
    return (
       
        for $annotation in $annots
        return (
            let $participantArray := local:getParticipants($annotation/string(@plist))
            let $categoriesArray := string-join(tokenize($annotation/mei:ptr[@type eq 'categories']/string(@plist),' '), '","')
            let $categoriesArray := if(string-length($categoriesArray) gt 0)
                                    then(concat('"', $categoriesArray, '"'))
                                    else()
            return
                concat('this.addAnnotation(new de.edirom.server.data.Annotation("',
                $annotation/@xml:id, '", "',
                replace($annotation/mei:title/text(), '"', '\\"'), '", [',
                string-join($participantArray, ','), '], "',
                $annotation/@resp, '", [',
                $categoriesArray, '], "',
                $annotation/mei:ptr[@type eq 'priority']/@plist, '", "',
                replace(replace($annotation/mei:p/text(), '"', '\\"'), '\n', '\\n'),'"));')
        )
                
    )
};

declare function local:getAnnotationCategories($categories) {
   for $term in $categories
   return (
      let $id := $term/string(@xml:id)
      let $name := $term/text()
      return
         concat('this.annotationCategories.set("', $id, '", "', replace($name, '"', '\\"'), '")')
   )
};

declare function local:getAnnotationPriorities($priorities) {
   for $term in $priorities
   return (
      let $id := $term/string(@xml:id)
      let $name := $term/text()
      return
         concat('this.annotationPriorities.set("', $id, '", "', replace($name, '"', '\\"'), '")')
   )
};

let $id := request:get-parameter('id', '')
let $coll := '/db/contents/works'
let $mei := xcollection($coll)//mei:meicorpus/id($id)/root()

let $title := $mei//mei:meihead[@type eq 'corpus']/mei:filedesc/mei:titlestmt/mei:title/text()
let $composer := $mei//mei:meihead[@type eq 'corpus']/mei:filedesc/mei:titlestmt/mei:respstmt/mei:persname[@role eq 'composer']/text()
let $sources := $mei//mei:meihead[@type eq 'corpus']//mei:source/mei:extptr
let $mdivConc := $mei//mei:annot[@type eq 'movementConcordance']
let $measureConc := $mei//mei:annot[@type eq 'measureConcordance']
let $commentary := $mei//mei:annot[@type eq 'criticalCommentary']
let $categories := $mei//mei:term[@classcode eq 'ediromDefaultCategories_NS1.2']
let $priorities := $mei//mei:term[@classcode eq 'ediromDefaultPriorities_NS1.2']

return (
    
    concat('this.setTitle("', replace($title, '"', '\\"'), '");'),    
    concat('this.setComposer("', replace($composer, '"', '\\"'), '");'),
    local:generateSourceRequests($sources),
    local:generateMdivConc($mdivConc), 
    local:generateMeasureConc($measureConc),
    local:getAnnotations($commentary), 
    local:getAnnotationCategories($categories),
    local:getAnnotationPriorities($priorities)
    
)
