xquery version "3.1";
(:
 : For LICENSE-Details please refer to the LICENSE file in the root directory of this repository.
 :)

(: NAMESPACE DECLARATIONS ================================================== :)

declare namespace mei = "http://www.music-encoding.org/ns/mei";
declare namespace output = "http://www.w3.org/2010/xslt-xquery-serialization";
declare namespace request = "http://exist-db.org/xquery/request";
declare namespace system = "http://exist-db.org/xquery/system";
declare namespace transform = "http://exist-db.org/xquery/transform";
declare namespace xmldb = "http://exist-db.org/xquery/xmldb";

(: OPTION DECLARATIONS ===================================================== :)

declare option output:media-type "text/html";
declare option output:method "xhtml";
declare option output:indent "yes";
declare option output:omit-xml-declaration "yes";

(: QUERY BODY ============================================================== :)

let $uri := request:get-parameter('uri', '')
let $movementId := request:get-parameter('movementId', '')
let $stripStaves := request:get-parameter('stripStaves', '')
let $showStaff := request:get-parameter('showStaff', '')
let $firstMeasure := request:get-parameter('firstMeasure', '')
let $lastMeasure := request:get-parameter('lastMeasure', '')


let $docUri :=
    if (contains($uri, '#')) then
        (substring-before($uri, '#'))
    else
        ($uri)

let $doc := doc($docUri)

return
    
    let $base := concat('file:', system:get-module-load-path(), '/../xslt/svgRend3/')
    (:let $base := concat('xmldb:exist:///','db/functions/svgRend/'):)
    
    let $mdiv2show := $movementId
    let $outputStep := 'svg'
    
    let $svg := transform:transform($doc, concat($base, 'mei2svg.xsl'),
        <parameters>
            <param name="outputStep" value="{$outputStep}"/>
            <param name="basePath" value="{$base}"/>
            <param name="mdiv2show" value="{$mdiv2show}"/>
            <param name="stripStaves" value="{$stripStaves}"/>
            <param name="showStaff" value="{$showStaff}"/>
            <param name="firstMeasure" value="{$firstMeasure}"/>
            <param name="lastMeasure" value="{$lastMeasure}"/>
        </parameters>
    )

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
