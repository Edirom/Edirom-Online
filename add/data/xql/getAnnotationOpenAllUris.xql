xquery version "3.1";

(:
 : Copyright: For LICENSE-Details please refer to the LICENSE file in the root directory of this repository.
 :)

(: IMPORTS ================================================================= :)

import module namespace source = "http://www.edirom.de/xquery/source" at "../xqm/source.xqm";
import module namespace teitext = "http://www.edirom.de/xquery/teitext" at "../xqm/teitext.xqm";

(: NAMESPACE DECLARATIONS ================================================== :)

declare namespace mei = "http://www.music-encoding.org/ns/mei";
declare namespace output = "http://www.w3.org/2010/xslt-xquery-serialization";

(: OPTION DECLARATIONS ===================================================== :)

declare option output:method "text";
declare option output:media-type "text/plain";

declare function local:getParticipants($annot as element()) as xs:string* {
    
    let $participants := tokenize($annot/string(@plist), ' ')
    let $docs := distinct-values(for $p in $participants
    return
        substring-before($p, '#'))
    return
        for $doc in $docs
        return
            
            if (source:isSource($doc))
            then
                (local:getSourceParticipants($participants[starts-with(., $doc)], $doc))
            
            else
                if (teitext:isText($doc))
                then
                    (string-join($participants[starts-with(., $doc)], $doc), ' ')
                
                else
                    ()
};

declare function local:getSourceParticipants($participants as xs:string*, $doc as xs:string) as xs:string* {
    let $elems := for $p in $participants
    let $id := substring-after($p, '#')
    let $elem := doc($doc)/id($id)
        order by count($elem/preceding::*)
    return
        $elem
    
    return
        string-join(
        (for $elem in $elems[local-name() != 'measure']
        return
            concat($doc, '#', $elem/@xml:id)
        ,
        if (count($elems[local-name() = 'measure']) gt 0) then
            (local:groupSourceParticipants($elems[local-name() = 'measure'], $doc))
        else
            ()
        )
        , ' ')
};

declare function local:groupSourceParticipants($elems as node()*, $doc as xs:string) as xs:string* {
    let $startIds := ($elems[1]/string(@xml:id), local:getStartIdsOfRange($elems, 2, $elems[1]/string(@xml:id)))
    return
        for $startId in distinct-values($startIds)
        let $elem := $elems/id($startId)
        let $measureCount := count(index-of($startIds, $startId)) - 1
        let $tstamp2 := if ($measureCount gt 0)
        then
            (concat('?tstamp2=', $measureCount, 'm+0'))
        else
            ('')
        let $isInPart := exists(doc($doc)/id($startId)/ancestor::mei:part)
        return
            if ($isInPart)
            then
                concat($doc, '#measure_', $elem/ancestor::mei:mdiv/@xml:id, '_', $elem/@n, $tstamp2)
            else
                concat($doc, '#', $startId, $tstamp2)
};

declare function local:getStartIdsOfRange($elems as node()*, $pos as xs:integer, $id as xs:string) as xs:string* {
    if ($elems[$pos])
    then
        (
        if (count($elems[$pos - 1]/preceding::mei:measure) = count($elems[$pos]/preceding::mei:measure) - 1)
        then
            (($id, local:getStartIdsOfRange($elems, $pos + 1, $id)))
        else
            (($elems[$pos]/string(@xml:id), local:getStartIdsOfRange($elems, $pos + 1, $elems[$pos]/string(@xml:id))))
        )
    else
        ()
};

let $uri := request:get-parameter('uri', '')
let $annotId := request:get-parameter('annotId', '')
let $doc := doc($uri)
let $annot := $doc/id($annotId)

return
    string-join(local:getParticipants($annot), '
    ')
