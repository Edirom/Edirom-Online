xquery version "3.1";
(:
 : For LICENSE-Details please refer to the LICENSE file in the root directory of this repository.
 :)

(:~
    Returns a JSON representation of a zone.

    @author <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
:)

(: NAMESPACE DECLARATIONS ================================================== :)

declare namespace mei = "http://www.music-encoding.org/ns/mei";
declare namespace output = "http://www.w3.org/2010/xslt-xquery-serialization"; 
declare namespace request = "http://exist-db.org/xquery/request";
declare namespace xlink = "http://www.w3.org/1999/xlink";
declare namespace xmldb = "http://exist-db.org/xquery/xmldb";

(: OPTION DECLARATIONS ===================================================== :)

declare option output:method "json";
declare option output:media-type "application/json";

(: QUERY BODY ============================================================== :)

let $uri := request:get-parameter('uri', '')
let $zoneId := request:get-parameter('zoneId', '')

let $mei := doc($uri)/root()
let $zone := $mei/id($zoneId)

return (
    map {
        'zoneId': $zone/string(@xml:id),
        'pageId': $zone/../string(@xml:id),
        'ulx': $zone/string(@ulx),
        'uly': $zone/string(@uly),
        'lrx': $zone/string(@lrx),
        'lry': $zone/string(@lry)
        }
)
