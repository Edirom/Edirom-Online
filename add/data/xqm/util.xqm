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

  ID: $Id: util.xqm 1334 2012-06-14 12:40:33Z daniel $
:)

(:~
: This module provides library utility functions
:
: @author <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
:)
module namespace eutil = "http://www.edirom.de/xquery/util";

import module namespace work="http://www.edirom.de/xquery/work" at "work.xqm";
import module namespace source="http://www.edirom.de/xquery/source" at "source.xqm";
import module namespace teitext="http://www.edirom.de/xquery/teitext" at "teitext.xqm";


declare namespace mei="http://www.music-encoding.org/ns/mei";
import module namespace functx = "http://www.functx.com" at "../xqm/functx-1.0-nodoc-2007-01.xq";


(:~
: Returns a comma separated list of document labels
:
: @param $docs The URIs of the documents to process
: @return The labels
:)
declare function eutil:getDocumentsLabels($docs as xs:string*) as xs:string {
    string-join(
        eutil:getDocumentsLabelsAsArray($docs)
    , ', ')
};

(:~
: Returns an array of document labels
:
: @param $docs The URIs of the documents to process
: @return The labels
:)
declare function eutil:getDocumentsLabelsAsArray($docs as xs:string*) as xs:string* {
    for $doc in $docs return eutil:getDocumentLabel($doc)
};

(:~
: Returns a document's label
:
: @param $doc The URIs of the document to process
: @return The label
:)
declare function eutil:getDocumentLabel($doc as xs:string) as xs:string {
    
    if(work:isWork($doc))
    then(work:getLabel($doc))
    
    else if(source:isSource($doc))
    then(source:getLabel($doc))
    
    else if(teitext:isText($doc))
    then(teitext:getLabel($doc))

    else('')
};

(:~
: Returns a language specific string
:
: @param $key The key to search for
: @param $values The values to include into the string
: @return The string
:)
declare function eutil:getLanguageString($key as xs:string, $values as xs:string*) as xs:string {

    eutil:getLanguageString($key, $values, 'en')
};

(:~
: Returns a language specific string
:
: @param $key The key to search for
: @param $values The values to include into the string
: @param $lang The language 
: @return The string
:)
declare function eutil:getLanguageString($key as xs:string, $values as xs:string*, $lang as xs:string) as xs:string {

    let $base := concat('file:', system:get-module-load-path())
    let $file := doc(concat($base, '/../locale/edirom-lang-', $lang, '.xml'))
    
    let $string := $file//entry[@key = $key]/string(@value)
    let $string := functx:replace-multi($string, for $i in (0 to (count($values) - 1)) return concat('\{',$i,'\}'), $values)
                        
    return
        $string
        
};
