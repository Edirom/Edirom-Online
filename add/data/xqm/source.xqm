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
:)

module namespace source = "http://www.edirom.de/xquery/source";

import module namespace console="http://exist-db.org/xquery/console";

declare namespace mei="http://www.music-encoding.org/ns/mei";

declare namespace conf="https://www.maxreger.info/conf";

import module namespace mrpShared="https://www.maxreger.info/mrpShared" at "../../../mrpApp/modules/mrpShared.xqm";

(:~
: Returns whether a document is a work or not
:
: @param $uri The URI of the document
: @return Is work or not
:)
declare function source:isSource($uri as xs:string) as xs:boolean {
    
    exists(doc($uri)//mei:mei) and (exists(doc($uri)//mei:source) or exists(doc($uri)//mei:manifestation//mei:relation[@rel = 'isEmbodimentOf']))
};

(:~
: Returns a comma separated list of source labels
:
: @param $sources The URIs of the Sources' documents to process
: @return The labels
:)
declare function source:getLabels($sources as xs:string*) as xs:string {
    string-join(
        for $source in $sources return source:getLabel($source)
    , ', ')
};

(:~
: Returns a source's label
:
: @param $source The URIs of the Source's document to process
: @return The label
:)
declare function source:getLabel($source as xs:string) as xs:string {
     
    let $sourceDoc := doc($source)
    return if ($sourceDoc//mei:source/mei:titleStmt/mei:title)
        then $sourceDoc//mei:source/mei:titleStmt/data(mei:title[1])
        else if ($sourceDoc//mei:manifestation//mei:title//mei:titlePart[@type = 'main'])
        then data($sourceDoc//mei:manifestation//mei:title//mei:titlePart[@type = 'main'])
        else ('ERROR')
};

(:~
: Returns a comma separated list of source sigla
:
: @param $sources The URIs of the Sources' documents to process
: @return The sigla
:)
declare function source:getSigla($sources as xs:string*, $workID as xs:string) as xs:string {
    string-join(
        source:getSiglaAsArray($sources, $workID)
    , ', ')
};

(:~
: Returns an array of source sigla
:
: @param $sources The URIs of the Sources' documents to process
: @return The sigla
:)
declare function source:getSiglaAsArray($sources as xs:string*, $workID as xs:string) as xs:string* {
    let $configResource := doc('xmldb:exist:///db/apps/mriExistDBconf/config.xml')
    let $mrpUrl := $configResource//conf:mrpURL
    let $lang := mrpShared:get-lang()
    
    let $sourceIDs := 
        for $source in $sources
        where not(doc($source)//mei:availability[@type = 'rwaOnline'] = 'hidden')
        return doc($source)//@xml:id[1]/string()
    
    let $getAnnotationSiglaAsArrayUrl := concat($mrpUrl, '/cat/rest/getAnnotationSiglaAsArray.xql?workID=', $workID, '&amp;sourceIDs[]=', string-join($sourceIDs, '&amp;sourceIDs[]='), '&amp;lang=', $lang)
    let $queryResult := hc:send-request(<hc:request href="{$getAnnotationSiglaAsArrayUrl}" method="get"/>)[2]
    return
        $queryResult
};