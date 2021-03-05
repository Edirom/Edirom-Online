xquery version "1.0";

import module namespace eutil="http://www.edirom.de/xquery/util" at "../xqm/util.xqm";
import module namespace edition="http://www.edirom.de/xquery/edition" at "../xqm/edition.xqm";

declare namespace request="http://exist-db.org/xquery/request";
declare namespace xslfo="http://exist-db.org/xquery/xslfo";

declare namespace fo="http://www.w3.org/1999/XSL/Format";
declare namespace mei="http://www.music-encoding.org/ns/mei";
declare namespace tei="http://www.tei-c.org/ns/1.0";
declare namespace eof = "http://www.edirom.de/xquery/ediromOnlineFunctions";
declare namespace xhtml = "http://www.w3.org/1999/xhtml";

declare option exist:serialize "method=html media-type=text/html omit-xml-declaration=yes indent=yes";

(: VARIABLES ========================================================= :)

declare variable $lang := 'en';
declare variable $base := concat('file:', replace(system:get-module-load-path(),'\\','/'), '/../xslt/');

declare variable $edition := request:get-parameter('edition', '');
declare variable $imageserver :=  eutil:getPreference('image_server', $edition);
declare variable $facsBasePath := if($imageserver = 'leaflet')
	then(eutil:getPreference('leaflet_prefix', $edition))
	else(eutil:getPreference('image_prefix', $edition));

(:declare variable $facsBasePath := eutil:getPreference('image_prefix', request:get-parameter('edition', ''));:)
declare variable $printResolution := 150;
declare variable $facsAreaWidth := 6.5;(: in inch :)
declare variable $facsMetaHeight := 30;

declare variable $uri := request:get-parameter('uri','');
declare variable $type := request:get-parameter('type','');
declare variable $doc := doc($uri)/root();
declare variable $langFile := if(doc-available(concat($base, '../xslt/i18n/', $lang, '.xml')))
                              then(doc(concat($base, '../xslt/i18n/', $lang, '.xml')))
                              else(concat($base, '../xslt/i18n/', $lang, '.xml'));

declare variable $facsItems := $doc//mei:surface/mei:graphic[@type='facsimile'];
declare variable $pageFormat := if($doc//mei:facsimile or $doc//tei:facsimile)
                                then if((sum(for $h in $facsItems/@height return $h) div count($facsItems)) gt (sum(for $h in $facsItems/@width return $h) div count($facsItems)))
                                     then 'A4'
                                     else 'A4ls'
                                else();

declare variable $pageMaster := doc(concat($base,'edirom_fo_layoutMasterSet.xml'))//fo:*[@master-name = $pageFormat];
declare variable $ediromOnlineRoot := request:get-context-path();

(: FUNCTIONS ========================================================= :)

declare function eof:getLabel($key as xs:string){
    if($langFile/id($key) and not($langFile/id($key)/text() eq ''))
    then($langFile/id($key)/text())
    else($key)
};

declare function eof:getFacsImgParas($areaWidth){
    concat('&amp;dw=',floor($printResolution*$areaWidth), '&amp;mo=scale')
};

declare function eof:getPageRegionBodyWidth(){
    if($pageMaster/fo:region-body/@margin)
    then(concat(number(substring-before($pageMaster/@page-width, 'mm'))
               -number(substring-before($pageMaster/fo:region-body/@margin, 'mm'))*2, 'mm'))
    else(concat(number(substring-before($pageMaster/@page-width, 'mm'))
               -sum(for $a in $pageMaster/fo:region-body/@margin-left | $pageMaster/fo:region-body/@margin-right
                    return number(substring-before($a, 'mm'))),'mm'))
};

declare function eof:getPageRegionBodyHeight(){
    if($pageMaster/fo:region-body/@margin)
    then(concat(number(substring-before($pageMaster/@page-height, 'mm'))
               -number(substring-before($pageMaster/fo:region-body/@margin, 'mm'))*2, 'mm'))
    else(concat(number(substring-before($pageMaster/@page-height, 'mm'))
               -sum(for $a in $pageMaster/fo:region-body/@margin-top | $pageMaster/fo:region-body/@margin-bottom
                    return number(substring-before($a, 'mm')))
               -$facsMetaHeight,'mm'))
};

declare function eof:insertAttributeSet_h1(){
    attribute font-weight {'bold'}
};

(: OUTPUT ========================================================= :)

let $xsl_source := concat($base,'edirom_source2Print.xsl')
let $xsl_text := concat($base,'edirom_text2Print.xsl')
let $paras  := <parameters>
                 <param name="base" value="{$base}"/>
                 <param name="uri" value="{$uri}"/>
                 <param name="ediromOnlineRoot" value="{$ediromOnlineRoot}"/>
                 <param name="pageFormat" value="{$pageFormat}"/>
                 <param name="facsAreaWidth" value="{$facsAreaWidth}"/>
                 <param name="printResolution" value="{$printResolution}"/>
                 <param name="facsImgParas" value="{eof:getFacsImgParas($facsAreaWidth)}"/>
                 <param name="facsBasePath" value="{$facsBasePath}"/>
               </parameters>

let $width := eof:getPageRegionBodyWidth()
let $height := eof:getPageRegionBodyHeight()

let $type := request:get-parameter('type', '')
let $docUri := if(contains($uri, '#')) then(substring-before($uri, '#')) else($uri)
let $doc := doc($docUri)

return
    if($type = 'work')
    then('work')
    else if($type = 'source')
    then transform:transform($doc, $xsl_source, $paras)
    else if($type = 'text')
    then transform:transform($doc, $xsl_text, $paras)
    else('last else')
