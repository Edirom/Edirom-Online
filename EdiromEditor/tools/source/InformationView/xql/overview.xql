xquery version "1.0";
(: daniel: overview html for source :)

declare option exist:serialize "method=xhtml media-type=text/html omit-xml-declaration=no indent=yes 
        doctype-public=-//W3C//DTD&#160;XHTML&#160;1.0&#160;Strict//EN
        doctype-system=http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd";

<div>
   
	<h2>Allgemeine Angaben</h2>

    <div id="structure_container" class="informationViewScrollLayout">
    
    	<div class="dataBox">
        	<div class="label">Werk:</div>
            <input id="workInput" style="width: 400px;" type="text" value="" />
        </div>
        
        <div class="dataBox">
        	<div class="label">Komponist:</div>
            <input id="composerInput" style="width: 400px;" type="text" value="" />
        </div>
        
        <div class="dataBox">
        	<div class="label">Bezeichnung:</div>
            <input id="nameInput" style="width: 400px;" type="text" value="" />
        </div>
        
        <div class="dataBox">
        	<div class="label">Signatur der Quelle:</div>
            <input id="sourceSignatureInput" style="width: 400px;" type="text" value="" />
        </div>
        
        <div class="dataBox">
        	<div class="label">Datierung:</div>
            <input title="Jahr" id="sourceDatingInput" style="width: 400px;" type="text" value="" />
        </div>
        
        <div class="dataBox">
        	<div class="label">Typ:</div>
            <select id="sourceTypeInput">
						<option value="">bitte wählen</option>
						<option value="autograph">Autograph</option>
						<option value="copyistsCopy">Abschrift</option>
						<option value="edition">Edition</option>
						<option value="firstPrint">Originalausgabe</option>
						<option value="insignificant">insignifikant</option>
						<option value="print">Druck</option>
					</select>
        </div>
        
        <div class="saveBox" id="saveBox" style="display:none; float:none; width:560px; text-align:right; padding-bottom:15px">
            <span id="inputValidationFeedback" />
    	    <span class="saveBoxButton" id="cancelButton">Abbrechen</span>
    		<span class="saveBoxButton" id="saveButton">Anlegen</span>
        </div>
        
    </div>

    <div style="clear: both;"></div>
</div>
