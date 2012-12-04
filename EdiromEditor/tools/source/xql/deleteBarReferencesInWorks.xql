xquery version "1.0";
(:
    Johannes
    removes all references to a bar in all referring works.
:)

declare namespace mei="http://www.edirom.de/ns/mei";
declare namespace request="http://exist-db.org/xquery/request";
declare namespace util="http://exist-db.org/xquery/util";
declare namespace xlink="http://www.w3.org/1999/xlink";


let $sourceID := request:get-parameter('sourceID', '')
let $measureID := request:get-parameter('measureID', '')
let $worksColl := '/db/contents/works'
let $works := xcollection($worksColl)//mei:source/mei:extptr[@xlink:href eq concat('xmldb:exist:///db/contents/sources/', $sourceID , '.xml')]/root()

return (

    for $work in $works
    let $measureConc := $work//mei:annot[@type eq 'measureConcordance']
    let $measureConnection := $measureConc/mei:annot[./mei:extptr[@xlink:href eq concat('xmldb:exist:///db/contents/sources/', $sourceID , '.xml#', $measureID)]]
    
    let $commentary := $work//mei:annot[@type eq 'criticalCommentary']
    let $relevantAnnots := $commentary/mei:annot[@type eq 'editorialComment' and contains(@plist, $measureID)]
    
    return (# exist:batch-transaction #) {
            
            (:disconnect measure from connection / remove complete connection from measure-concordance:)
            if(count($measureConnection/mei:extptr) gt 2)
            then(
                update delete $measureConnection/mei:extptr[@xlink:href eq concat('xmldb:exist:///db/contents/sources/', $sourceID , '.xml#', $measureID)]
            )
            else(
                update delete $measureConnection
            ),
            
            (:remove all references to measures of that movement:)            
            for $annot in $relevantAnnots
            return 
                update value $annot/@plist with normalize-space(replace($annot/@plist, $measureID, ''))
          
    }
)