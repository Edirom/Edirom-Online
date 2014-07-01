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
let $tei := eutil:getDoc($uri)/root()

let $ret := for $chapter in $tei//tei:div[@type='chapter'] | $tei//tei:div1
            let $n := if($chapter/@n)then(concat($chapter/@n, ': '))else('')
            let $label := if($chapter/tei:head)then($chapter/tei:head)else($chapter/text())
            let $label := if(string-length($label) > 30)then(concat(substring($label, 1, 30), '…'))else($label)
            return
                concat('{',
                    'id: "', $chapter/string(@xml:id), '", ',
                    'name: "', concat($n, $label), '"',
                '}')

let $ret2 := for $numbers in $tei//tei:milestone[@unit='number']
            let $n := concat('No. ', $numbers/@n)
            order by $numbers/number(replace(@n, '\D', '')), $numbers/@n
            return
                concat('{',
                    'id: "', $numbers/string(@xml:id), '", ',
                    'name: "', $n, '"',
                '}')

let $ret3 := for $act in $tei//tei:div[@type='act']
            let $label := local:changeFormat($act/@n)                                        
            return
                for $scene in $act//tei:div[@type='scene']
                let $label := $label || ' - ' || string-join(for $t in $scene/tei:head//text()
                                                return
                                                    if(matches($t, '\w'))then($t)else(), '')
                let $label := if(string-length($label) > 40)then(concat(substring($label, 1, 40), '…'))else($label)
                return
                    concat('{',
                        '"id": "', $scene/string(@xml:id), '", ',
                        '"name": "', $label, '"',
                    '}')


return concat('[', string-join($ret, ','), string-join($ret2, ','), string-join($ret3, ','), ']')