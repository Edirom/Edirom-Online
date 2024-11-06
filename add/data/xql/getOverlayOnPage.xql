xquery version "3.1";
(:
 : For LICENSE-Details please refer to the LICENSE file in the root directory of this repository.
 :)

(:~
    Returns an SVG element.

    @author <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
:)

(: NAMESPACE DECLARATIONS ================================================== :)

declare namespace mei = "http://www.music-encoding.org/ns/mei";
declare namespace output = "http://www.w3.org/2010/xslt-xquery-serialization";
declare namespace request = "http://exist-db.org/xquery/request";
declare namespace svg = "http://www.w3.org/2000/svg";

(: OPTION DECLARATIONS ===================================================== :)

declare option output:method "json";
declare option output:media-type "application/json";

(: QUERY BODY ============================================================== :)

let $uri := request:get-parameter('uri', '')
let $mei := doc($uri)
let $surfaceId := request:get-parameter('pageId', '')
let $overlayId := request:get-parameter('overlayId', '')

let $overlay := $mei/id($overlayId)

let $plist := tokenize(replace($overlay/@plist, '#', ''), '\s+')
let $surface := $mei/id($surfaceId)
let $svg := $surface/svg:svg[@id = $plist]

let $overlay :=
    map {
        'id': string($svg/@id),
        'svg': $svg
    }

return
    $overlay
