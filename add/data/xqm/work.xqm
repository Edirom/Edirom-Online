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

  ID: $Id: work.xqm 1324 2012-05-15 13:59:35Z daniel $
:)


(:~
: This module provides library functions for Works
:
: @author <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
:)
module namespace work = "http://www.edirom.de/xquery/work";

declare namespace mei="http://www.music-encoding.org/ns/mei";
declare namespace edirom="http://www.edirom.de/ns/1.3";


(:~
: Returns a JSON representation of a Work
:
: @param $uri The URI of the Work's document to process
: @return The JSON representation
:)
declare function work:toJSON($uri as xs:string) as xs:string {
    
    let $work := doc($uri)/mei:mei
    return
        concat('
            {',
                'id: "', $work/string(@xml:id), '", ',
                'doc: "', $uri, '", ',
                'title: "', $work//mei:workDesc/mei:work/mei:titleStmt/replace(mei:title[1], '"', '\\"'), '"',
            '}')
};

(:~
: Returns whether a document is a work or not
:
: @param $uri The URI of the document
: @return Is work or not
:)
declare function work:isWork($uri as xs:string) as xs:boolean {
    
    exists(doc($uri)//mei:mei) and exists(doc($uri)//mei:work) and not(doc($uri)//mei:source)
};

(:~
: Returns a works's label
:
: @param $source The URIs of the Work's document to process
: @return The label
:)
declare function work:getLabel($work as xs:string) as xs:string {
     
    doc($work)//mei:work/mei:titleStmt/data(mei:title[1])
};

(:~
: Returns the forst works id
:
: @param $uri The URIs of the Edition
: @return The id
:)
declare function work:findWorkID($uri as xs:string) as xs:string {
     
    doc($uri)//edirom:work[1]/data(@xml:id)
};