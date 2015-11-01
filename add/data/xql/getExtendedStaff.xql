xquery version "3.0";

declare namespace request="http://exist-db.org/xquery/request";
declare namespace mei="http://www.music-encoding.org/ns/mei";

declare namespace tei="http://www.tei-c.org/ns/1.0";
declare namespace xmldb="http://exist-db.org/xquery/xmldb";
declare namespace system="http://exist-db.org/xquery/system";
declare namespace transform="http://exist-db.org/xquery/transform";

declare option exist:serialize "method=xhtml media-type=text/html omit-xml-declaration=yes indent=yes";

let $uri := request:get-parameter('uri', '')
let $docUri := if(contains($uri, '///')) then(substring-after($uri, '///')) else($uri)
(:let $action := if(contains($docUri, '?')) then(substring-after($docUri, '?')) else($docUri)
let $temp := if(contains($docUri, '?')) then(substring-before($docUri, '?')) else($docUri)
let $newUri := concat('http://localhost:8080/exist/rest/', $temp):)
let $newUri := concat('http://localhost:8080/exist/rest/', $docUri)

return
<html xmlns="http://www.w3.org/1999/xhtml">	
    <head>   	
        <title></title>
    	<!-- **VEROVIO** -->
    	<script src="../../resources/verovio/verovio-toolkit-0.9.9.js" type="text/javascript" charset="utf-8"></script>
    	
    	<!-- **JQUERY** -->
    	<script type="text/javascript" src="../../resources/jquery/jquery-2.1.3.js"  charset="utf-8"></script> 
    	<link rel="stylesheet" href="../../resources/css/rendering_view.css"/>
    </head>
	<body>
	
	<div id="toolbar">
  
        <label for="rendering_view">Rendering View : </label>
        <select id="select" name="select" onclick="enableRectangle1()">
  			<option value="pagebased" selected="selected">Pagebased</option> 
  			<option value="continuous_hight">Continuous Hight</option>
  			<option value="continuous_width">Continuous Width</option>
		</select>
        
        <label id="pageNumber" for="page_number">Page</label>
        <input id="pageSelection" type="number" min="1" value ="1" onclick="enableRectangle1()"/>
        <label id="pageNumberNach" for="page_number_nach">of</label>
        <input type="text" id="anzahl" disabled="true" style="border:none; background-color:#E8E8E8;"/>
      </div>
        <div id="output"/>
		 
	</body>	
	<script type="text/javascript">
	 	var vrvToolkit;
	 	var verovioData;
	 	var numberPages;
	   if(typeof vrvToolkit === 'undefined'){{
	    	vrvToolkit = new verovio.toolkit();
            		$.ajax({{
                		url: '{$newUri}', 
                		dataType: "text", 
                		success: function(data) {{  
                		verovioData = data; 
                		enableRectangle1();
               		}}
               		}});
	   }}
	  
	
			function enableRectangle1(){{
				if(select.value === 'pagebased'){{
					var pageHeight = $(document).height()* 100 / 33;
						var pageWidth = $(document).width()* 100 / 33;
                		var options = JSON.stringify({{
                			scale: 33,
							noLayout: 0,
							pageHeight: pageHeight,
							pageWidth: pageWidth,
							adjustPageHeight: 1
                		}});
                		vrvToolkit.setOptions( options );
                		vrvToolkit.loadData(verovioData);
                		numberPages = vrvToolkit.getPageCount();
                		pageSelection.disabled=false;
						pageNumber.disabled=false;
						anzahl.value=numberPages;
                		pageSelection.max = numberPages;
                		var selectedNumber = pageSelection.valueAsNumber;
                		var svg = vrvToolkit.renderPage(selectedNumber, "");
                		$("#output").html(svg); 
				}}
				if(select.value === 'continuous_hight'){{
					var pageHeight_1 = $(document).height();
						var pageWidth_1 = $(document).width();
						var options = JSON.stringify({{
							scale: 33,
							pageHeight: pageHeight_1,
							pageWidth: pageWidth_1,
							noLayout: 0
						}});
						vrvToolkit.setOptions(options);
						vrvToolkit.redoLayout();		
						var svg = vrvToolkit.renderPage(1, options);
						pageSelection.disabled=true;
						pageNumber.disabled=true;
						$("#output").html(svg);
				}}	 
				if(select.value === 'continuous_width'){{
					var options = JSON.stringify({{
							scale: 33,
							noLayout: 1
						}});
						vrvToolkit.setOptions(options);
						vrvToolkit.loadData(verovioData);
						var svg = vrvToolkit.renderPage(1, options);
						pageSelection.disabled=true;
						pageNumber.disabled=true;
						$("#output").html(svg);
				}}	 
			}}
				
		</script>		
</html>