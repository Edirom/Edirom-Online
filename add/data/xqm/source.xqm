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

  ID: $Id: source.xqm 1324 2012-05-15 13:59:35Z daniel $
:)


(:~
: This module provides library functions for Sources
:
: @author <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
: @author <a href="mailto:bohl@edirom.de">Benjamin W. Bohl</a>
:)
module namespace source = "http://www.edirom.de/xquery/source";

declare namespace mei="http://www.music-encoding.org/ns/mei";

import module namespace eutil="http://www.edirom.de/xquery/util" at "../xqm/util.xqm";

(:~
: Returns whether a document is a source or not. Generally this should work for MEI versions
: 2011-05 through 5.0
:
: @param $uri The URI of the document
:
: @return xs:boolean indicating whether the document referenced by @param $uri
: is considered a music source or not.
:)
declare function source:isSource($uri as xs:string) as xs:boolean {
    let $doc := eutil:getDoc($uri)
    let $meiVersion4To5Regex := '^[4-5](\.\d){1,2}(-dev)?(\+(anyStart|basic|CMN|Mensural|Neumes))?$'
    (: 2010-05 pre camelCase :)
    (: 2011-05 2012 :)
    (: 2013 +meiversion.num 2.1.1:)
    (: 3.0.0 :)
    (:mei2 and ?3 :)
    return
        (exists($doc//mei:mei) and exists($doc//mei:source)) (:mei2 and ?3 :)
        or
        (: MEI 4.0.1 and 5.0 with all dev and cutomization variants :)
        (matches($doc//mei:mei/@meiversion, $meiVersion4To5Regex) and exists($doc//mei:manifestation[@singleton='true'])) (:mei4+ for manuscripts:)
        or
        (matches($doc//mei:mei/@meiversion, $meiVersion4ToRegex) and exists($doc//mei:manifestation//mei:item)) (: mei4+ for prints :)
};

(:~
: Returns a comma separated list of source labels
:
: @param $sources The URIs of the Sources' documents to process
: @return The labels
:)
declare function source:getLabels($sources as xs:string*, $edition as xs:string) as xs:string {
    string-join(
        for $source in $sources return source:getLabel($source, $edition)
    , ', ')
};

(:~
: Returns a source's label
:
: @param $source The URIs of the Source's document to process
: @return The label
:)
declare function source:getLabel($source as xs:string, $edition as xs:string) as xs:string {
    let $sourceDoc := doc($source)
    let $language := eutil:getLanguage($edition)
    let $label := if($sourceDoc/mei:mei/@meiversion = ("4.0.0", "4.0.1"))(:TODO encoding of source labels may heavily differ in certain encoding contexts, thus introduction of class="http://www.edirom.de/edirom-online/source/label":)
                    then $sourceDoc//mei:manifestation[@singleton='true']/mei:titleStmt/mei:title[@class = "http://www.edirom.de/edirom-online/source/label"][not(@xml:lang) or @xml:lang = $language]
                    else $sourceDoc//mei:source/mei:titleStmt/mei:title[not(@xml:lang) or @xml:lang = $language]
    let $label := if($label)
                    then($label)
                    else(doc($source)//mei:meiHead/mei:fileDesc/mei:titleStmt/mei:title[not(@xml:lang) or @xml:lang = $language])
    let $label := if($label)
                    then($label)
                    else('unknown title')
    return
        string($label)

};

(:~
: Returns a comma separated list of source sigla
:
: @param $sources The URIs of the Sources' documents to process
: @return The sigla
:)
declare function source:getSigla($sources as xs:string*) as xs:string {
    string-join(
        source:getSiglaAsArray($sources)
    , ', ')
};

(:~
: Returns an array of source sigla
:
: @param $sources The URIs of the Sources' documents to process
: @return The sigla
:)
declare function source:getSiglaAsArray($sources as xs:string*) as xs:string* {
    for $source in $sources return source:getSiglum($source)
};

(:~
: Returns a source's siglum
:
: @param $source The URIs of the Source's document to process
: @return The siglum
:)
declare function source:getSiglum($source as xs:string) as xs:string? {
    let $doc := doc($source)
    let $elems := $doc//mei:*[@type eq 'siglum']
    let $siglum := if(exists($elems)) then($elems[1]//text()) else()
    return $siglum
};
