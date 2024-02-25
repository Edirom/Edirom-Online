xquery version "3.1";
(:
 : For LICENSE-Details please refer to the LICENSE file in the root directory of this repository.
 :)

(:~
    Returns a JSON sequence with all measures on a specific page.

    @author <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
:)

(: IMPORTS ================================================================= :)

import module namespace eutil="http://www.edirom.de/xquery/util" at "/db/apps/Edirom-Online/data/xqm/util.xqm";

import module namespace measure = "http://www.edirom.de/xquery/measure" at "/db/apps/Edirom-Online/data/xqm/measure.xqm";

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
let $surfaceId := request:get-parameter('pageId', '')

let $mei := doc($uri)/root()
let $surface := $mei/id($surfaceId)

return (
    array {
        (: TODO: überlegen, wie die Staff-spezifischen Ausschnitte angezeigt werden sollen :)
        measure:getMeasuresOnPage($mei, $surface)
    }
)
