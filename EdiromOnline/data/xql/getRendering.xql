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

  ID: $Id: getRendering.xql 1334 2012-06-14 12:40:33Z daniel $
:)

declare namespace request="http://exist-db.org/xquery/request";
declare namespace mei="http://www.music-encoding.org/ns/mei";

declare namespace xmldb="http://exist-db.org/xquery/xmldb";
declare namespace system="http://exist-db.org/xquery/system";
declare namespace transform="http://exist-db.org/xquery/transform";

declare option exist:serialize "method=xhtml media-type=text/html omit-xml-declaration=yes indent=yes";



let $uri := request:get-parameter('uri', '')
let $movementId := request:get-parameter('movementId', '')
let $stripStaves := request:get-parameter('stripStaves', '')
let $showStaff := request:get-parameter('showStaff', '')
let $firstMeasure := request:get-parameter('firstMeasure', '')
let $lastMeasure := request:get-parameter('lastMeasure', '')


let $docUri := if(contains($uri, '#')) then(substring-before($uri, '#')) else($uri)
let $doc := doc($docUri)

return
    
    let $base := concat('file:', system:get-module-load-path(), '/../xslt/svgRend3/')
    (:let $base := concat('xmldb:exist:///','db/functions/svgRend/'):)
    
    let $mdiv2show := $movementId
    let $outputStep := 'svg'
    
   
    
    let $svg := transform:transform($doc, concat($base, 'mei2svg.xsl'), <parameters>
            <param name="outputStep" value="{$outputStep}"/>
            <param name="basePath" value="{$base}"/>
            <param name="mdiv2show" value="{$mdiv2show}"/>
            <param name="stripStaves" value="{$stripStaves}"/>
            <param name="showStaff" value="{$showStaff}"/>
            <param name="firstMeasure" value="{$firstMeasure}"/>
            <param name="lastMeasure" value="{$lastMeasure}"/>
        </parameters>)
    (:let $svg := transform:transform($svg, concat($base, 'svgCleaner.xsl'),<parameters/>):)
    
    (:let $mdiv := transform:transform($doc, concat($base, 'reduceToMdiv.xsl'), <parameters><param name="mdiv2show" value="{$mdiv2show}"/></parameters>)
    
    let $addedIDs := transform:transform($mdiv, concat($base, 'preprocessor/add-ids.xsl'), <parameters/>)
    let $canonicalized := transform:transform($addedIDs, concat($base, 'preprocessor/canonicalize.xsl'), <parameters/>)
    let $addedDurs := transform:transform($canonicalized, concat($base, 'preprocessor/addDurations.xsl'), <parameters/>)
    let $synced := transform:transform($addedDurs, concat($base, 'preprocessor/addSynchronicity.xsl'), <parameters/>)
    let $musx := transform:transform($synced, concat($base, 'mei2musx/mei2musx.xsl'), <parameters/>)
    let $svg := transform:transform($musx, concat($base, 'musx2svg/musx2svg.xsl'), <parameters/>):)
    
    
    return
            
        $svg            
       