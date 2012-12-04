    xquery version "1.0";
(: daniel: overview html for source :)

declare option exist:serialize "method=xhtml media-type=text/html omit-xml-declaration=no indent=yes 
        doctype-public=-//W3C//DTD&#160;XHTML&#160;1.0&#160;Strict//EN
        doctype-system=http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd";


<div>
    <div id="facsimile">
        <div id="measures"/>
        <div id="imageContainer"></div>
    </div>
    
    <div id="digilibImage">
    </div>
    
    
    <div class="sidebar" id="_sidebar">
    
        <!-- The content of the former "facsimileMark.xql": -->
        <div id="facsimileMarkSidebarContent" class="sidebarContent">
        	<div class="sideBarModule noTabs" id="zoneList">
        		<h2 class="sidebarH">Übersicht: Takte auf Seite <span id="currentPage"></span></h2>
        		
                <div id="barZones_container" style="height:150px">
                    <table id="barZones" class="sidebarTable">
                        <thead>
                        	<tr>
                        		<th>Nummer</th>
                        		<th>Offset (top/left)</th>
                        		<th>Breite</th>
                        		<th>Höhe</th>
                        	</tr>
                    	</thead>
                    	<tbody id="barZones_tbody">
                    	</tbody>
                    </table>
                </div>
                <div id="tool_createBar" class="smallButton">Anlegen</div>
        	</div>
        	
        	<div class="sideBarModule noTabs" id="sidebarZones">
        		<!--später als Tabs, um dann außer Takten auch anderes zu markieren? 
        			Hier zunächst ausschließlich Takte…-->
        		<h2 class="sidebarH">Takt</h2>
        		
        		<div class="label">Satz:</div>
        		<select id="movementSelection">
        		</select>
        
        		<div class="label">Nummer:</div>
        		<input class="sidebarInput" id="barNumber" />
        		
        		<div class="label">Optionen:</div>
        		<div class="checkBoxOption"><input type="checkbox" id="barUpbeat" /><span class="label">Auftakt</span></div>
        
        		<div class="checkBoxOption">
        			<input id="barRestNumber" class="sidebarInputSmall" value="" />
        			<input type="checkbox" id="barRest" /><span class="label">Pausentakt</span>
        		</div>					
        		
        		<div class="sidebarTools">
            		<div id="tool_deleteBar" class="toolButton">Takt löschen</div>
        		    <div id="tool_editBar" class="toolButton">Markierung bearbeiten</div>
        		</div>
        	</div>
        </div>
    
    
        <!-- The content of the former "annotations.xql": -->
        <div id="annotationSidebarContent" class="sidebarContent" style="display: none;">
        	<div class="sideBarModule noTabs" id="sidebarAnnotationList">
        		<h2 class="sidebarH">Übersicht</h2>
        		
        		<div id="annotationList_container" style="max-height:150px">
            		<table id="annotationList" class="sidebarTable">
            		    <thead>
                			<tr>
                				<th>Seite</th>
                				<th>Takt</th>
                				<th>Kategorie</th>
                				<th>Titel</th>
                				<th>Priorität</th>
                			</tr>
            			</thead>
            			<tbody id="annotationList_tbody">
            			</tbody>
            		</table>
        		</div>
        		<div id="tool_createAnnotation" class="smallButton">Anlegen</div>
        	</div>
        	
        	<div class="sideBarModule noTabs" id="sidebarAnnotation">
        		<div id="priority">
        			<div class="priorityStep" id="prio1"></div>
        			<div class="priorityStep" id="prio2"></div>
        			<div class="priorityStep" id="prio3"></div>
        			<div class="priorityStep" id="prio4"></div>
        			<div class="priorityStep" id="prio5"></div>
        		</div>
        		<h2 class="sidebarH">Anmerkung (Takt)</h2>
        		
        		<div class="label">Titel:</div>
        		<input class="sidebarInput" id="annotationTitle" value="" />
        							
        		<div class="label">Quellen:</div>
        		<div id="attachedSources_container" style="max-height:86px">
            		<table id="attachedSources" class="sidebarTable">
            		    <thead>
                			<tr>
                				<th>Signatur</th>
                				<th>Seite</th>
                				<th>Satz</th>
                				<th>Takt</th>
                				<th>Stimme</th>
                			</tr>
            			</thead>
            			<tbody id="attachedSources_tbody">
            			</tbody>
            		</table>
        		</div>
        		<div id="tool_addParticipant" class="smallButton">+ Takt hinzufügen</div>
        		<div id="tool_removeParticipant" class="smallButton">- Takt entfernen</div>
        		
        		<div class="label">Kategorie:</div>
        		<textarea class="sidebarTextArea" id="annotationCategories" cols="30" rows="1"></textarea>
        		
        		<div class="label">Anmerkungstext:</div>
        		<textarea class="sidebarTextArea" id="annotationText" cols="30" rows="5"></textarea>
        		
        		<div class="sidebarTools">
            		<div id="tool_deleteAnnotation" class="toolButton">Anmerkung löschen</div>
        		</div>
        	</div>
        </div>
    
    </div>

</div>
