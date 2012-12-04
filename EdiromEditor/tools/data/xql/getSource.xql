xquery version "1.0";
(: johannes: returns a complete source object :)

(:TODO wieder einbauen: import module namespace main="http://www.edirom.de/EdiromEditor/mainUtil" at "../../de.edirom.server/webapp/xql/mainUtil.xql";:)

declare namespace request="http://exist-db.org/xquery/request";
declare namespace mei="http://www.edirom.de/ns/mei";
declare namespace image="http://www.edirom.de/ns/image";
declare namespace xlink="http://www.w3.org/1999/xlink";
declare namespace tei="http://www.tei-c.org/ns/1.0";

declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";

declare function local:getRest($measure) {
    if(exists($measure/mei:mrest))
    then (
        1
    )
    else if(exists($measure/mei:multirest))
    then(
        $measure/mei:multirest/data(@num)
    )
    else(
        0
    )
};

declare function local:getUpbeat($measure) {
    if(exists($measure/@type) and $measure/@type eq 'upbeat')
    then (
        true()
    )
    else(
        false()
    )
};

declare function local:getNiceDate($date) {
    concat(year-from-dateTime($date), '-', 
            local:getTwoDigits(month-from-dateTime($date)), '-',
            local:getTwoDigits(day-from-dateTime($date)), ' ',
            local:getTwoDigits(hours-from-dateTime($date)), ':',
            local:getTwoDigits(minutes-from-dateTime($date)))
};

declare function local:getTwoDigits($number) {
    if(string-length(string($number)) = 1)
    then(concat('0', $number))
    else($number)
};

let $id := request:get-parameter('id', '')
let $coll := '/db/contents/sources'
let $mei := xcollection($coll)/id($id)/root()
let $source := $mei/id($id)
 
return (
    concat('this.setName("', replace($source/mei:titlestmt/data(mei:title), '"', '\\"'), '");'),
    concat('this.setSignature("', replace($mei//mei:pubstmt/data(mei:identifier[@type eq 'signature']), '"', '\\"'), '");'),
    concat('this.setComposer("', replace($mei//mei:filedesc/mei:titlestmt/mei:respstmt/data(mei:persname[@role eq 'composer']), '"', '\\"'), '");'),
    concat('this.setWorkName("', replace($mei//mei:filedesc/mei:titlestmt/data(mei:title), '"', '\\"'), '");'),
    concat('this.setDating("', replace($source/mei:pubstmt/data(mei:date), '"', '\\"'), '");'),
    concat('this.setType("', replace($source//mei:classification/mei:termlist/data(mei:term[@classcode eq 'ediromSourceTypes']), '"', '\\"'), '");'),
    (
        for $surface in $mei//mei:surface
        let $graphic := $surface/mei:graphic[@type eq 'facsimile']
        let $image := doc($graphic/@xlink:href)/image:image
        let $surfaceIdUnderscore := replace($surface/@xml:id, '-', '_')
        return 
            concat('var page_', $surfaceIdUnderscore, ' = new de.edirom.server.data.Page("', 
                $surface/@xml:id, '","', 
                replace($surface/@n, '"', '\\"'), '",',
                $image/data(@width), ',', 
                $image/data(@height), ',"',
                $image/data(@fileOrig), '","',
                local:getNiceDate(xmldb:created('/db/contents/images', util:document-name($image))), '","',
                $image/data(@file),'", "',
                $graphic/data(@xlink:href), '");',
                
                'this.addPage(page_', $surfaceIdUnderscore, ');')
    ),
    (
        for $movement in $mei//mei:mdiv
        let $movementId := $movement/string(@xml:id)
        
        return (
            concat('this.addMovement(new de.edirom.server.data.Movement("', $movementId, '","', replace($movement/@n, '"', '\\"'), '", this));'),
            concat('var movement=this.getMovement("', $movement/@xml:id , '");'),
            
            for $measure in $movement//mei:measure
            return
            (
                let $zoneId := $measure/string(@facs)
                let $zone := $mei/id($zoneId)
                let $pagID := $zone/parent::mei:surface/@xml:id
                let $pagIdUnderscore := replace($pagID, '-', '_')
                return
                (
                    concat('movement.addBar(new de.edirom.server.data.Bar("',
                    $measure/@xml:id, '", "',
                    replace($measure/@n, '"', '\\"'), '", ',
           	 	     $zone/@uly, ', ',
           	 	     $zone/@ulx, ', ',
           		     $zone/number(@lrx) - $zone/number(@ulx), ', ',
           		     $zone/number(@lry) - $zone/number(@uly), ', "',
           		     $movement/@xml:id, '", ',
           		     local:getRest($measure), ', ',
           		     local:getUpbeat($measure), ', "',
           		     $pagID, '", "',
           		     $zone/@xml:id, '"));',
           		     
                    'page_', $pagIdUnderscore, '.addBar("' , $measure/@xml:id , '");')
                )
            )
        )
    ),
    
    (   for $textPointer at $i in $mei//mei:notesstmt/mei:annot[@type='ediromSourceDesc']
        let $textRef := $textPointer/string(@xlink:href)
        let $textDoc := doc($textRef)
        let $textID := $textDoc//tei:TEI/string(@xml:id)
        return ( 
            concat('var func = function() { this.registerTexts("', $textID, '"); }.bind(this);',
            'var newText', $i, ' = new de.edirom.server.data.Text("', $textID, '",func);'),
            concat('this.addText(newText', $i,');')
        )
    )
    
)
    