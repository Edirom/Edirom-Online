xquery version "3.1";
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
 
:)


(:~
: This module provides library functions for MEI
:
: @author Dennis Ried
:)
module namespace meiutil= "http://www.edirom.de/xquery/mei";

import module namespace eutil="http://www.edirom.de/xquery/util" at "../xqm/util.xqm";

declare namespace edirom="http://www.edirom.de/ns/1.3";
declare namespace mei="http://www.music-encoding.org/ns/mei";

(:~
: Returns the mei version number as a string if exists
:
: @param $node A node that should be checked
: @return The mei version from the root element if exists
:)
declare function meiutil:getMeiVersion($node as node()) as xs:string? {
    
    let $mei := $node/root()/mei:mei
    let $lang := request:get-parameter('lang', '')
    return
        concat('
            {',
                'id: "', $work/string(@xml:id), '", ',
                'doc: "', $uri, '", ',
                'title: "', replace(eutil:getLocalizedTitle($work//mei:work, $lang), '"', '\\"'), '"',
            '}')
};
