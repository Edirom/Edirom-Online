xquery version "3.1";
(:
 : For LICENSE-Details please refer to the LICENSE file in the root directory of this repository.
 :)

(: IMPORTS ================================================================= :)

import module namespace eutil = "http://www.edirom.de/xquery/util" at "../xqm/util.xqm";

(: NAMESPACE DECLARATIONS ================================================== :)

declare namespace edirom = "http://www.edirom.de/ns/1.3";
declare namespace mei = "http://www.music-encoding.org/ns/mei";
declare namespace output = "http://www.w3.org/2010/xslt-xquery-serialization";
declare namespace request = "http://exist-db.org/xquery/request";
declare namespace xlink = "http://www.w3.org/1999/xlink";
declare namespace xmldb = "http://exist-db.org/xquery/xmldb";

(: OPTION DECLARATIONS ===================================================== :)

declare option output:method "json";
declare option output:media-type "application/json";

(: VARIABLE DECLARATIONS =================================================== :)

declare variable $lang := request:get-parameter('lang', '');

(: FUNCTION DECLARATIONS =================================================== :)

declare function local:getGroups($parent) as map(*)? {
    if ($parent/edirom:groups) then (
        map {
            "label": eutil:getLocalizedName($parent/edirom:groups, $lang),
            "groups": local:getSingleGroups($parent/edirom:groups)
        }
    ) else
        ()
};

declare function local:getSingleGroups($parent) as array(*)* {
    array {
        for $group in $parent/edirom:group
        return
            map {
                "name": eutil:getLocalizedName($group, $lang),
                "connections": local:getConnections($group)
            }
    }
};

declare function local:getConnections($parent) as map(*)? {
    if ($parent/edirom:connections) then (
        map {
            "label": eutil:getLocalizedName($parent/edirom:connections, $lang),
            "connections": local:getSingleConnections($parent/edirom:connections)
        }
    ) else
        ()
};

declare function local:getSingleConnections($parent) as array(*)* {
    array {
        for $connection in $parent/edirom:connection
        return
            map {
                "name": $connection/string(@name),
                "plist": $connection/string(@plist)
            }
    }
};

(: QUERY BODY ============================================================== :)

let $id := request:get-parameter('id', '')
let $mei := doc($id)/root()
let $workId := request:get-parameter('workId', '')
let $work := $mei/id($workId)
let $concordances := $work//edirom:concordance

return (
    array {
        for $concordance in $concordances
        return
            map {
                "name": eutil:getLocalizedName($concordance, $lang),
                "groups": local:getGroups($concordance),
                "connections": local:getConnections($concordance)
            }
    }
)
