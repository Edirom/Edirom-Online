xquery version "1.0";
(: daniel: main html for workbench :)

declare namespace exist="http://exist.sourceforge.net/NS/exist";

declare option exist:serialize "method=xhtml media-type=text/html omit-xml-declaration=no indent=yes 
        doctype-public=-//W3C//DTD&#160;XHTML&#160;1.0&#160;Strict//EN
        doctype-system=http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd";

let $appVersion := request:get-parameter('appVersion', '')
return

<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="de" lang="de">
<head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />
	<title>Edirom Editor - Neues Objekt anlegen</title>
	
	<script type="text/javascript" charset="utf-8">
	    <!--
	    var buttonsEnabled = true;

        function createNewObject(uri) {
	        buttonsEnabled = false;

        	window.location.href = uri;
        }

        function getSelectedOption() {
	        return document.getElementById('objectTypes').value;
        }
	    -->
	</script>
	
	<link rel="stylesheet" href="../css/main.css?{$appVersion}" media="all" charset="utf-8" />
	<link rel="stylesheet" href="../css/createObjectWizard.css?{$appVersion}" media="all" charset="utf-8" />
</head>
<body>
	<div id="background">
		<div id="ediromHeader">
		</div>
		
		<div id="ediromDetail">
			
			<div class="ediromDetailContent" style="top:0px">
				<h1>Objekt anlegen</h1>
					<p class="descriptionText">
						Wählen Sie hier aus, welche Art von Objekt Sie anlegen möchten. Auf der nächsten Seite (Schaltfläche "Weiter") müssen Sie dann einige grundlegende Informationen zu Ihrem Objekt eingeben, um es anlegen zu können. 
					</p>
				
				<div class="dataBox">
					<div class="label">Objekttyp:</div>
					<select id="objectTypes">
						<option value="/source/index.xql">Notentext</option>
						<option value="/text/index.xql">Text</option>
						
						<option value="/work/index.xql">Werk</option>
					</select>
				</div>				
				
				<div class="saveBox">
					<span class="saveBoxButton" onclick="if(buttonsEnabled) window.status = 'edirom:de.edirom.server:closeWindow';">Abbrechen</span>
					<span class="saveBoxButton" onclick="if(buttonsEnabled) createNewObject(getSelectedOption());">Weiter</span>
				</div>		
				<div style="clear: both;"></div>
			</div>
			
		</div>
	</div>
	
		
	<script type="text/javascript">
	<!--
	    window.status = 'edirom:de.edirom.server:getCreateObjectTypes?id=objectTypes';
	-->
	</script>
</body>
</html>