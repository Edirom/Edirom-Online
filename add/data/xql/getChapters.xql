xquery version "1.0";
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

declare namespace request="http://exist-db.org/xquery/request";
declare namespace tei="http://www.tei-c.org/ns/1.0";
declare namespace xlink="http://www.w3.org/1999/xlink";

declare namespace xmldb="http://exist-db.org/xquery/xmldb";

declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";

let $uri := request:get-parameter('uri', '')
let $tei := doc($uri)/root()

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


return concat('[', string-join($ret, ','), string-join($ret2, ','), ']')