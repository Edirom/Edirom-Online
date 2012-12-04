xquery version "1.0";
(: Provides functions and templates used in the pages content in the source module :)

declare option exist:serialize "method=xhtml media-type=text/html omit-xml-declaration=no indent=yes 
        doctype-public=-//W3C//DTD&#160;XHTML&#160;1.0&#160;Strict//EN
        doctype-system=http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd";

<div>
    <h2>
		Seiten
	</h2>
	<div id="pages_list_container" class="informationViewScrollLayout">
    	<table class="classic" id="pages_list">
    	    <thead>
    		<tr>
    			<th>Optionen</th>
    			<th>Seite</th>
    			<th>Lage</th>
    			<th>Maße (px)</th>
    			<th>Dateiname</th>
    			<th>hinzugefügt am</th>
    			<th>Kommentar</th>
    		</tr>
    		</thead>
    		<tbody id="pages_listBody"/>
    		<tfoot>
                <tr>
                    <td colspan="7">
                        <!-- TODO: Weiche einbauen: diese Lösung funktioniert nur in eclipse -->
                        <!-- TODO: Über ein Servlet realisieren, dann lässt sich der Fortschritt besser beschreiben -->
                        <span class="addItemButton" id="import_pages">⇒ Seite hinzufügen</span>
                    </td>
                </tr>
            </tfoot>
    	</table>
	</div>
    				
    <div style="clear: both;"></div>
    <table style="display:none;">
        <tr id="row_page_template">
            <td class="buttons">
                <!--<input type="checkbox"/>-->
                <span class="openButton"></span>
                <span class="openXMLButton"></span>
                <span class="moveButton"></span>
                <span class="deleteButton" id="delete_template"></span>
            </td>
            <td>
                <input class="pages_name_input" style="width: 30px;" id="input_template" type="text" value="" />
            </td>
            <!--<td class="nonSelectableContent"></td>-->
            <td class="nonSelectableContent imageScale"></td>
            <td class="nonSelectableContent imageFileName"></td>
            <td class="nonSelectableContent imageDate"></td>
            <!--<td class="nonSelectableContent"></td>-->
            <input type="hidden" id="imageUri_template" class="imageUri" value="" />
        </tr>
    </table>
</div>
