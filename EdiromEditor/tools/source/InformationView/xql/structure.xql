xquery version "1.0";
(:
    Provides functions and templates used in the structure content in the source module
:)

declare namespace request="http://exist-db.org/xquery/request";
declare namespace mei="http://www.edirom.de/ns/mei";

declare option exist:serialize "method=xhtml media-type=text/html omit-xml-declaration=no indent=yes 
        doctype-public=-//W3C//DTD&#160;XHTML&#160;1.0&#160;Strict//EN
        doctype-system=http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd";


<div>
	
	<h2>Musikalische Struktur</h2>
	
    <div id="structure_list_container" class="informationViewScrollLayout" style="bottom:58px">
        <div>
            <div style="display:inline-block">
        	
        	<div id="sourceStructure">
        	
        	</div>
        	
    	    </div>
	    </div>
	</div>
	
	<div style="position:absolute;bottom:44px">
	    <span class="addItemButton" id="addMovement">⇒ Satz hinzufügen</span>
	</div>
	
	<div style="clear: both"></div>
	
    <div style="display: none;">
        <div id="sourceStructureTemplate" class="sourceStructure_mdiv">
            <div class="label deleteButton" style="display: none;">X</div>
            <div class="mdivBox">
                <input type="text" value="" class="mdivName"/>
                <span class="label mdivBars"/>
            </div>        
        </div>
    </div>
</div>
