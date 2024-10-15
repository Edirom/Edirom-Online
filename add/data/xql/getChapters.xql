xquery version "3.1";
(:
 : For LICENSE-Details please refer to the LICENSE file in the root directory of this repository.
 :)

(: IMPORTS ================================================================= :)

import module namespace eutil = "http://www.edirom.de/xquery/util" at "../xqm/util.xqm";

(: NAMESPACE DECLARATIONS ================================================== :)

declare namespace output = "http://www.w3.org/2010/xslt-xquery-serialization";
declare namespace request = "http://exist-db.org/xquery/request";
declare namespace tei = "http://www.tei-c.org/ns/1.0";
declare namespace xlink = "http://www.w3.org/1999/xlink";
declare namespace xmldb = "http://exist-db.org/xquery/xmldb";

(: OPTION DECLARATIONS ===================================================== :)

declare option output:method "json";
declare option output:media-type "application/json";

(: FUNCTION DECLARATIONS =================================================== :)

declare function local:changeFormat($n) as xs:string {
(:TODO replace with fn:format-integer:)
    if ($n = '1') then
        ('I')
    else if ($n = '2') then
        ('II')
    else if ($n = '3') then
        ('III')
    else if ($n = '4') then
        ('IV')
    else if ($n = '5') then
        ('V')
    else if ($n = '6') then
        ('VI')
    else if ($n = '7') then
        ('VII')
    else if ($n = '8') then
        ('VIII')
    else if ($n = '9') then
        ('IX')
    else
        ($n)
};

let $uri := request:get-parameter('uri', '')
let $mode := request:get-parameter('mode', '')
let $tei := eutil:getDoc($uri)

let $ret as array(*)* :=
    array {
        for $elem in $tei//tei:div[@type = 'chapter'] |
            $tei//tei:div1 | $tei//tei:milestone[@unit = 'number'] |
            $tei//tei:div[@type = 'act']
        let $pageId :=
            if ($mode = 'pageMode') then
                (substring-after($elem/preceding::tei:pb[1]/@facs, '#'))
            else
                ('-1')
        return
            if (($elem/local-name() = 'div' and $elem[@type = 'chapter']) or $elem/local-name() = 'div1') then (
                let $chapter := $elem
                let $n :=
                    if ($chapter/@n) then
                        (concat($chapter/@n, ': '))
                    else
                        ('')
                    let $label := if ($chapter/tei:head) then
                        ($chapter/tei:head)
                    else
                        ($chapter/text())
                let $label :=
                    if (string-length($label) > 30) then
                        (concat(substring($label, 1, 30), '…'))
                    else
                        ($label)
                return
                    map {
                        "id": $chapter/string(@xml:id),
                        "name": concat($n, $label),
                        "pageId": $pageId
                    }
            ) else if ($elem/local-name() = 'milestone' and $elem[@unit = 'number']) then (
                let $numbers := $elem
                let $n := concat('No. ', $numbers/@n)
                order by $numbers/number(replace(@n, '\D', '')), $numbers/@n
                return
                    map {
                        "id": $numbers/string(@xml:id),
                        "name": $n,
                        "pageId": $pageId
                    }
            ) else if ($elem/local-name() = 'div' and $elem[@type = 'act']) then (
                let $act := $elem
                let $label := local:changeFormat($act/@n)
                return
                    for $scene in $act//tei:div[@type = 'scene']
                    let $label := $label || ' - ' || string-join(
                        for $t in $scene/tei:head//text()
                        return
                            if (matches($t, '\w')) then
                                ($t)
                            else
                                (), '')
                    let $label :=
                        if (string-length($label) > 40) then
                            (concat(substring($label, 1, 40), '…'))
                        else
                            ($label)
                    let $pageId :=
                        if ($mode = 'pageMode') then
                            (substring-after($scene/preceding::tei:pb[1]/@facs, '#'))
                        else
                            ('-1')
                    return
                        map {
                            "id": $scene/string(@xml:id),
                            "name": $label,
                            "pageId": $pageId
                        }
            ) else
                ()
    }
return
    $ret
