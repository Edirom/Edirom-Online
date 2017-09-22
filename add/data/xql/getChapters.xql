xquery version "3.0";
(:
  Edirom Online
  Copyright (C) 2011 The Edirom Project
  http://www.edirom.de

  Edirom Online is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  Edirom Online is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with Edirom Online.  If not, see <http://www.gnu.org/licenses/>.

  ID: $Id: getChapters.xql 1460 2012-10-15 15:58:35Z niko $
:)

import module namespace eutil="http://www.edirom.de/xquery/util" at "../xqm/util.xqm";

declare namespace request="http://exist-db.org/xquery/request";
declare namespace tei="http://www.tei-c.org/ns/1.0";
declare namespace xlink="http://www.w3.org/1999/xlink";

declare namespace xmldb="http://exist-db.org/xquery/xmldb";

declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";

declare function local:changeFormat($n) as xs:string {
    if($n = '1')
    then('I')
    else if($n = '2')
    then('II')
    else if($n = '3')
    then('III')
    else if($n = '4')
    then('IV')
    else if($n = '5')
    then('V')
    else if($n = '6')
    then('VI')
    else if($n = '7')
    then('VII')
    else if($n = '8')
    then('VIII')
    else if($n = '9')
    then('IX')
    else ($n)
};

let $uri := request:get-parameter('uri', '')
let $mode := request:get-parameter('mode', '')
let $tei := eutil:getDoc($uri)/root()

let $ret := for $elem in $tei//tei:div[@type='chapter'] | $tei//tei:div1 | $tei//tei:milestone[@unit='number'] | $tei//tei:div[@type='act']
            let $pageId := if($mode = 'pageMode')then(substring-after($elem/preceding::tei:pb[1]/@facs, '#'))else('-1')
            return
                if(($elem/local-name() = 'div' and $elem[@type='chapter']) or $elem/local-name() = 'div1')
                then(
                    let $chapter := $elem
                    let $n := if($chapter/@n)then(concat($chapter/@n, ': '))else('')
                    let $label := if($chapter/tei:head)then($chapter/tei:head)else($chapter/text())
                    let $label := if(string-length($label) > 30)then(concat(substring($label, 1, 30), '…'))else($label)
                    return
                        concat('{',
                            'id: "', $chapter/string(@xml:id), '", ',
                            'name: "', concat($n, $label), '", ',
                            'pageId: "', $pageId, '"',
                        '}')
                )
                else if($elem/local-name() = 'milestone' and $elem[@unit='number'])
                then(
                    let $numbers := $elem
                    let $n := concat('No. ', $numbers/@n)
                    order by $numbers/number(replace(@n, '\D', '')), $numbers/@n
                    return
                        concat('{',
                            'id: "', $numbers/string(@xml:id), '", ',
                            'name: "', $n, '", ',
                            'pageId: "', $pageId, '"',
                        '}')
                )
                else if($elem/local-name() = 'div' and $elem[@type='act'])
                then(
                    let $act := $elem
                    let $label := local:changeFormat($act/@n)                                        
                    return
                        for $scene in $act//tei:div[@type='scene']
                        let $label := $label || ' - ' || string-join(for $t in $scene/tei:head//text()
                                                        return
                                                            if(matches($t, '\w'))then($t)else(), '')
                        let $label := if(string-length($label) > 40)then(concat(substring($label, 1, 40), '…'))else($label)
                        let $pageId := if($mode = 'pageMode')then(substring-after($scene/preceding::tei:pb[1]/@facs, '#'))else('-1')
                        return
                            concat('{',
                                '"id": "', $scene/string(@xml:id), '", ',
                                '"name": "', $label, '", ',
                                'pageId: "', $pageId, '"',
                            '}')
                )
                else()

return concat('[', string-join($ret, ','), ']')