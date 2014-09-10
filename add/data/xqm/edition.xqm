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

  ID: $Id: edition.xqm 1334 2012-06-14 12:40:33Z daniel $
:)


(:~
: This module provides library functions for Editions
:
: @author <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
:)
module namespace edition = "http://www.edirom.de/xquery/edition";

declare namespace edirom="http://www.edirom.de/ns/1.3";
declare namespace xlink="http://www.w3.org/1999/xlink";

(:~
: Returns a JSON representation of an Edition
:
: @param $uri The URI of the Edition's document to process
: @return The JSON representation
:)
declare function edition:toJSON($uri as xs:string) as xs:string {
    
    let $edition := doc($uri)/edirom:edition
    return
        concat('
            {',
                'id: "', $edition/string(@xml:id), '", ',
                'doc: "', $uri, '", ',
                'name: "', $edition/edirom:editionName, '"',
            '}')
};

(:~
: Returns a list of URIs pointing to referenced Works
:
: @param $uri The URI of the Edition's document to process
: @return The list of URIs
:)
declare function edition:getWorkUris($uri as xs:string) as xs:string* {
    
    doc($uri)//edirom:work/string(@xlink:href)
};

(:~
: Returns the URI for a specific language file
:
: @param $uri The URI of the Edition's document to process
: @param $lang The language
: @return The URI
:)
declare function edition:getLanguageFileURI($uri as xs:string, $lang as xs:string) as xs:string {
    
    doc($uri)//edirom:language[@xml:lang eq $lang]/string(@xlink:href)
};

(:~
: Returns the URI for the preferences file
:
: @param $uri The URI of the Edition's document to process
: @return The URI
:)
declare function edition:getPreferencesURI($uri as xs:string) as xs:string {
    
    doc($uri)//edirom:preferences/string(@xlink:href)
};

(:~
: Returns the URI of the first found Edition
:
: @param $uri The URI of the Edition's document to process
: @return The URI
:)
declare function edition:findEdition() as xs:string {
    let $edition := (collection('/db')//edirom:edition)[1]
    return 'xmldb:exist://' || document-uri($edition/root())
};
