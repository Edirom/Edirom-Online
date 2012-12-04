xquery version "1.0";
(: Provides functions and templates used in the description content in the source module :)

declare option exist:serialize "method=xhtml media-type=text/html omit-xml-declaration=no indent=yes 
        doctype-public=-//W3C//DTD&#160;XHTML&#160;1.0&#160;Strict//EN
        doctype-system=http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd";
        
<div>
	<p>
		Hier können Sie die dem Notentext eine TEI-Datei als Beschreibung hinzufügen.
	</p>
	<table class="classic">
	    <thead>
		<tr>
			<th>Optionen</th>
			<th>Name</th>
			<th>ID</th>
		</tr>
		</thead>
		<tbody id="texts_listBody"/>
		<tr>
			<td colspan="3">
                <!-- TODO: Weiche einbauen: diese Lösung funktioniert nur in eclipse -->
                <!-- TODO: Über ein Servlet realisieren, dann lässt sich der Fortschritt besser beschreiben -->
				<span class="addItemButton" id="import_description">⇒ Beschreibung hinzufügen</span>
			</td>			
		</tr>			
	</table>
<!--    <iframe width="100%" src=""/>-->
    <div style="clear: both;"></div>
    <table style="display:none;">
        <tr id="row_text_template">
            <td class="buttons">
                <span class="openButton"></span>
                <span class="openXMLButton"></span>
                <span class="deleteButton" id="delete_text_template"></span>
            </td>
            <td>
                <input class="texts_name_input" style="width: 100px;" disabled="disabled" id="input_text_template" type="text" value="" />
            </td>
            <td>
                <input class="texts_id_input" style="width: 400px;" disabled="disabled" id="input_text_template2" type="text" value="" />
            </td>
        </tr>
    </table>
</div>