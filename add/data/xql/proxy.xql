xquery version "3.0";
(:
  Edirom Online
  Copyright (C) 2022 The Edirom Project
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
:)

declare namespace request="http://exist-db.org/xquery/request";
declare namespace response="http://exist-db.org/xquery/response";
declare namespace util="http://exist-db.org/xquery/util";

let $ressourcePath := request:get-parameter('ressourcePath', '')
let $contentType := request:get-parameter('contentType', 'text/plain; charset=UTF-8')

return
    if(util:is-binary-doc('xmldb:exist://' || $ressourcePath))
    then(
        if(matches($contentType, 'text'))
        then(
            response:set-header('Content-Type', $contentType),
            util:binary-to-string(util:binary-doc('xmldb:exist://' || $ressourcePath))
            )
        else(
            response:stream-binary(util:binary-doc('xmldb:exist://' || $ressourcePath), $contentType)
            )
    )
    else(
        response:set-header('Content-Type', $contentType),
        doc('xmldb:exist://' || $ressourcePath)
    )
