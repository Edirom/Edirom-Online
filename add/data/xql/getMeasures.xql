xquery version "3.1";
(:
 : For LICENSE-Details please refer to the LICENSE file in the root directory of this repository.
 :)

(: IMPORTS ================================================================= :)

import module namespace functx = "http://www.functx.com";

import module namespace eutil = "http://www.edirom.de/xquery/util" at "/db/apps/Edirom-Online/data/xqm/util.xqm";

import module namespace measure = "http://www.edirom.de/xquery/measure" at "/db/apps/Edirom-Online/data/xqm/measure.xqm";

(: NAMESPACE DECLARATIONS ================================================== :)

declare namespace mei = "http://www.music-encoding.org/ns/mei";
declare namespace output = "http://www.w3.org/2010/xslt-xquery-serialization";
declare namespace request = "http://exist-db.org/xquery/request";
declare namespace xlink = "http://www.w3.org/1999/xlink";
declare namespace xmldb = "http://exist-db.org/xquery/xmldb";

(: OPTION DECLARATIONS ===================================================== :)

declare option output:media-type "text/plain";
declare option output:method "text";

(: QUERY BODY ============================================================== :)

let $uri := request:get-parameter('uri', '')
let $mdivID := request:get-parameter('mdiv', '')
let $mei := doc($uri)/root()

let $ret := measure:getMeasures($mei, $mdivID)

return

    '[' || string-join($ret, ',') || ']'

