xquery version "1.0";
(:
    daniel
    ui: index site for a source item 
:)

declare namespace mei="http://www.edirom.de/ns/mei";
declare namespace xhtml="http://www.w3.org/1999/xhtml";

(:TODO einbauen import module namespace main="http://www.edirom.de/EdiromEditor/mainUtil" at "../../de.edirom.server/webapp/xql/mainUtil.xql";:)

declare option exist:serialize "method=xhtml media-type=text/html omit-xml-declaration=no indent=yes 
        doctype-public=-//W3C//DTD&#160;XHTML&#160;1.0&#160;Strict//EN
        doctype-system=http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd";


declare function local:buildPage($uri, $title, $appVersion) {
    let $template := <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="de" lang="de">
        <head>
	        <meta http-equiv="content-type" content="text/html; charset=utf-8" />
	
	        <title>{$title}</title>
	
            <script type="text/javascript" src="../main/index.js?appVersion={$appVersion}" />
            <script type="text/javascript" src="../data/index.js?appVersion={$appVersion}" />	
                        
	        <script type="text/javascript" src="index.js?appVersion={$appVersion}" />	
        </head>
        <body>
            <div id="loading"><span>Notentext wird geladen</span></div>
	        <div id="background">
            	<div id="ediromObject">
            	    <div id="objectHeadFrame" xmlns="http://www.w3.org/1999/xhtml">
                	    <div id="objectHeading">
                	    	<div id="viewSwitch">
                			</div>
                		    <span id="objectID" title="Objekt-ID">{$uri}</span>
                			<span id="objectTitle">{$title}</span>			
                		</div>
                				
                		<div id="objectToolbar">
                		    
                		</div>
                				
                		<div id="objectTabBox">
                			<div id="tabBoxItems" class="items">
                			</div>
                		</div>
                	</div>
            	</div>
        	</div>
        	
        	<div id="logger"> </div>
        	
        	<input type="hidden" id="sourceId" value="{$uri}" />
	    </body>
    </html>

    return
        $template
};

declare function local:current-time() {
    let $daysTillMonth := (0,31,59,90,120,151,181,212,243,273,304,334)
    
    let $time := current-dateTime()
    let $utc := adjust-dateTime-to-timezone($time, xs:dayTimeDuration('PT0H'))
    let $year := year-from-dateTime($utc)
    let $years := $year - 1970
    let $leapYear := floor((($year - 1) - 1968) div 4) - floor((($year - 1) - 1900) div 100) + floor((($year - 1) - 1600) div 400)
    let $month := month-from-dateTime($utc)
    let $leapYearDiff := if(($month > 2) and ($year mod 4 = 0 and ($year mod 100 != 0 or $year mod 400 = 0))) then(60 * 60 * 24) else(0)
    let $day := day-from-dateTime($utc)
    let $hours := hours-from-dateTime($utc)
    let $minutes := minutes-from-dateTime($utc)
    let $seconds := xs:decimal(replace(seconds-from-dateTime($utc), '\..*', ''))
    return $seconds + ($minutes * 60) + ($hours * 60 * 60) + (($daysTillMonth[$month] + $day - 1) * 60 * 60 * 24) + ((($years * 365) + $leapYear) * 60 * 60 * 24) + $leapYearDiff
};

let $uri := request:get-parameter('uri', '')
let $appVersion := request:get-parameter('appVersion', local:current-time())

return
    let $mei := doc($uri)/root()
    let $title := $mei//mei:source[1]//mei:title[1]//text()
    let $title := if(string-length($title) = 0) then(string('Notentext')) else($title)
    
    return
    
        local:buildPage($uri, $title, $appVersion)
