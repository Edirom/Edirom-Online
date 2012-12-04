xquery version "1.0";
(:
    Johannes
    removes all references to a source's page in all referring works. This includes removing all bars from that page. 
    Actually, currently nothing else besides the bars is referred. 
:)

declare namespace mei="http://www.edirom.de/ns/mei";
declare namespace request="http://exist-db.org/xquery/request";
declare namespace util="http://exist-db.org/xquery/util";
declare namespace xlink="http://www.w3.org/1999/xlink";


let $sourceID := request:get-parameter('sourceID', '')
let $pageID := request:get-parameter('pageID', '')
let $sourceColl := '/db/contents/sources'
let $worksColl := '/db/contents/works'
let $zones := xcollection($sourceColl)//mei:surface/id($pageID)//mei:zone
let $works := xcollection($worksColl)//mei:source/mei:extptr[@xlink:href eq concat('xmldb:exist:///db/contents/sources/', $sourceID , '.xml')]/root()

return (

    for $work in $works
    let $measureConc := $work//mei:annot[@type eq 'measureConcordance']
    let $commentary := $work//mei:annot[@type eq 'criticalCommentary']
    
    return (# exist:batch-transaction #) {
        
        for $zone in $zones
        
        let $measure := $zone/root()//mei:measure[@facs eq $zone/@xml:id]
        let $measureConnection := $measureConc/mei:annot[./mei:extptr[@xlink:href eq concat('xmldb:exist:///db/contents/sources/', $sourceID , '.xml#', $measure/@xml:id)]]
        let $relevantAnnots := $commentary/mei:annot[@type eq 'editorialComment' and contains(@plist, $measure/@xml:id)]
        
        return (
            
            (:disconnect measure from connection / remove complete connection from measure-concordance:)
            if(count($measureConnection/mei:extptr) gt 2)
            then(
                update delete $measureConnection/mei:extptr[@xlink:href eq concat('xmldb:exist:///db/contents/sources/', $sourceID , '.xml#', $measure/@xml:id)]
            )
            else(
                update delete $measureConnection
            ),
            
            (:remove all references to measures of that movement:)            
            for $annot in $relevantAnnots
            return 
                update value $annot/@plist with normalize-space(replace($annot/@plist, $measure/@xml:id, ''))
            
        )
    }
)