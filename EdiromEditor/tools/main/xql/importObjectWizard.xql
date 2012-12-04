xquery version "1.0";
(: daniel: import wizard :)

declare namespace exist="http://exist.sourceforge.net/NS/exist";

declare option exist:serialize "method=xhtml media-type=text/html omit-xml-declaration=no indent=yes 
        doctype-public=-//W3C//DTD&#160;XHTML&#160;1.0&#160;Strict//EN
        doctype-system=http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd";


let $id := request:get-parameter('id', '')
let $appVersion := request:get-parameter('appVersion', '')

return

<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="de" lang="de">
<head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />
	<title>Edirom Editor - Neues Objekt importieren</title>
	
	<script src="../js/scriptaculous/prototype.js?{$appVersion}" type="text/javascript" charset="utf-8" />
	
	<link rel="stylesheet" href="../css/main.css?{$appVersion}" media="all" charset="utf-8" />
	<link rel="stylesheet" href="../css/createObjectWizard.css?{$appVersion}" media="all" charset="utf-8" />
</head>
<body>
	<div id="background">
		<div id="ediromHeader">
		</div>
		
		<div id="ediromDetail">
			<div class="ediromDetailContent" style="top:0px">
				<h1>Neuen Text importieren</h1>
					<p>
						Wählen Sie hier die XML-Datei aus, die Sie imporieren möchten. Über die Schaltfläche "Importieren" legen Sie dann ein neues Text-Objekt in der Edirom an. 
					</p>
				
				<form enctype="multipart/form-data" action="/text/importObject.xql" name="importForm" method="POST">	
					
                    <div class="dataBox">
    					<div class="label">Zu importierende Datei:</div>
    					<input id="importfile" name="importfile" type="file" />
    				</div>				
    				
    				<input type="hidden" id="id" name="id" value="{if($id = '') then() else($id)}" />
    				
    				<div class="saveBox">
    					<input class="saveBoxButton" type="button" value="Abbrechen" onclick="window.status = 'edirom:de.edirom.server:closeWindow';" />
    					<input class="saveBoxButton" name="submit" onclick="if($('importfile').value == '') return false;" type="submit" value="Importieren" />
    				</div>
				</form>
				<div style="clear: both;"></div>
			</div>
		</div>
	</div>
</body>
</html>