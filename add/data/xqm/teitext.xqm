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

  ID: $Id: teitext.xqm 1324 2012-05-15 13:59:35Z daniel $
:)


(:~
: This module provides library functions for Texts
:
: @author <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
:)
module namespace teitext="http://www.edirom.de/xquery/teitext";

declare namespace tei="http://www.tei-c.org/ns/1.0";

import module namespace eutil="http://www.edirom.de/xquery/util" at "../xqm/util.xqm";

(:~
: Returns whether a document is a work or not
:
: @param $uri The URI of the document
: @return Is work or not
:)
declare function teitext:isText($uri as xs:string) as xs:boolean {
    
    exists(doc($uri)/tei:TEI)
};

(:~
: Returns a text's label
:
: @param $source The URIs of the Text's document to process
: @return The label
:)
declare function teitext:getLabel($uri as xs:string, $edition as xs:string) as xs:string {
    let $language := eutil:getLanguage($edition)
    return doc($uri)//tei:titleStmt/data(tei:title[not(@xml:lang) or @xml:lang = $language])
};