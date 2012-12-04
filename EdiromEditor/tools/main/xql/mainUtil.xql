xquery version "1.0";
(: 
    Provides functions used globally
    
    @author: Daniel Röwenstrunk
:)

module namespace main="http://www.edirom.de/EdiromEditor/mainUtil";

declare function main:getTemplate($title, $script) {
    <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="de" lang="de">
        <head>
	        <meta http-equiv="content-type" content="text/html; charset=utf-8" />
	
	        <title>{$title}</title>
	
	        <link rel="stylesheet" href="/main/css/main.css" media="all" charset="utf-8" />
	
           <script type="text/javascript" src="/main/js/main.js" />	
	        <script type="text/javascript" src="{$script}" />	
        </head>
        <body>
	        <div id="background">
            	<div id="ediromObject">
            	</div>
        	</div>
        	
        	<div id="logger"> </div>
        	
	    </body>
    </html>
};

declare function main:getHeaderTemplate($id, $title) {
    <div id="objectHeadFrame" xmlns="http://www.w3.org/1999/xhtml">
	    <div id="objectHeading">
	    	<div id="viewSwitch">
			</div>
		    <span id="objectID" title="Objekt-ID">{$id}</span>
			<span id="objectTitle">{$title}</span>			
		</div>
				
		<div id="objectToolbar">
		    
		</div>
				
		<div id="objectTabBox">
			<div id="tabBoxItems" class="items">
			</div>
		</div>
	</div>
};

declare function main:getNiceDate($date) {
    concat(year-from-dateTime($date), '-', 
            main:getTwoDigits(month-from-dateTime($date)), '-',
            main:getTwoDigits(day-from-dateTime($date)), ' ',
            main:getTwoDigits(hours-from-dateTime($date)), ':',
            main:getTwoDigits(minutes-from-dateTime($date)))
};

declare function main:getTwoDigits($number) {
    if(string-length(string($number)) = 1)
    then(concat('0', $number))
    else($number)
};