xquery version "3.1";
(:
 : For LICENSE-Details please refer to the LICENSE file in the root directory of this repository.
 :)

(: IMPORTS ================================================================= :)

import module namespace eutil = "http://www.edirom.de/xquery/eutil" at "../xqm/eutil.xqm";

(: NAMESPACE DECLARATIONS ================================================== :)

declare namespace mei = "http://www.music-encoding.org/ns/mei";
declare namespace output = "http://www.w3.org/2010/xslt-xquery-serialization";
declare namespace request = "http://exist-db.org/xquery/request";

(: OPTION DECLARATIONS ===================================================== :)

declare option output:media-type "text/html";
declare option output:method "xhtml";
declare option output:indent "yes";
declare option output:omit-xml-declaration "yes";

(: QUERY BODY ============================================================== :)

let $uri := request:get-parameter('uri', '')
let $docUri :=
    if (contains($uri, '#')) then
        (substring-before($uri, '#'))
    else
        ($uri)
let $doc := eutil:getDoc($docUri)
let $artist := $doc//mei:titleStmt/mei:respStmt/mei:persName[@role = 'artist']
let $album := $doc//mei:meiHead/mei:fileDesc/mei:sourceDesc/mei:source[1]/mei:titleStmt/mei:title[1]/text()
let $albumCover := $doc//mei:graphic[@type = 'cover']/string(@target)
let $records :=
    for $rec in $doc//mei:recording
    let $recSource := $doc//mei:source[@xml:id = substring-after($rec/@decls, '#')]
    let $recTitle := $recSource/mei:titleStmt/mei:title
    let $avFile := $rec/mei:avFile[1]/string(@target)
    return
    (:TODO map instead of concatenation :)

    '{
        "title": "' || replace($recTitle, '"', '\\"') || '",
        "composer": "' || replace($artist, '"', '\\"') || '",
        "work": "' || replace($album, '"', '\\"') || '",
        "src": "' || $avFile || '",
        "cover_art_url": "' || $albumCover || '"' || '
    }'

let $audioConfig := '[' ||
        replace(string-join($records, ', '), '\n', '')
    || ']'

return
    $audioConfig
