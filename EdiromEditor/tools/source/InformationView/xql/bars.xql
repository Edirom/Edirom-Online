xquery version "1.0";
(: Provides functions and templates used in the bars content in the source module :)

declare option exist:serialize "method=xhtml media-type=text/html omit-xml-declaration=no indent=yes 
        doctype-public=-//W3C//DTD&#160;XHTML&#160;1.0&#160;Strict//EN
        doctype-system=http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd";

<div>
    <h2>
		Taktstruktur
	</h2>
	
	<div id="barsTables" class="informationViewScrollLayout">
	
	</div>

    <div id="movementHeading_template" class="heading" style="display: none;"></div>
    <table id="table_barsPerMov_template" class="classic" style="display: none;">
        <thead>
        	<tr>
        		<th>Optionen</th>
        		<th>Takt</th>
        		<th>Satz</th>
        		<th>Seite</th>
        		<th>Auftakt</th>
        		<th>Pausentakt</th>
        		<th>Anzahl Takte</th>
        	</tr>
    	</thead>
    	<tbody class="bars_listBody"/>	
    </table>
	
    <div style="clear: both;"></div>
    <table style="display:none;">
        <tr id="row_bars_template">
            <td class="buttons">
                <input class="selectBar" type="checkbox"/>
                <span class="openButton"></span>
                <span class="openXMLButton"></span>
                <span class="moveButton"></span>
                <span class="deleteButton" id="delete_template"></span>
            </td>
            <td>
                <input class="bars_name_input" style="width: 30px;" id="input_template" type="text" value="" />
            </td>
            <td class="movement"></td>
            <td class="page"></td>
            <td>
                <input class="upbeat" id="input_upbeat" disabled="disabled" type="checkbox" /> 
            </td>
            <td>
                <input class="pause" id="input_pause" disabled="disabled" type="checkbox" />
            </td>
            <td>
                <input class="measureCount" id="input_measureCount" disabled="disabled" type="text" value="" />
            </td>
            
        </tr>
    </table>
</div>
