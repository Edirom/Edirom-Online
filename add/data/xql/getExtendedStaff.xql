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
let $newUri := concat('/exist/rest/', $docUri)

return
<html>	
    <head>   	
        <title></title>
    	<!-- **VEROVIO** -->
    	<script src="../../resources/verovio/verovio-toolkit-0.9.9.js" type="text/javascript" charset="utf-8"></script>
    	
    	<!-- **JQUERY** -->
    	<script type="text/javascript" src="../../resources/jquery/jquery-2.1.3.js"  charset="utf-8"></script> 
    </head>
	<body>
        <div id="output"/>		 
	</body>	
	<script type="text/javascript">
		vrvToolkit = new verovio.toolkit();
	 	var verovioData;
	 	
	 	var initHeight = $(document).height()* 100 / 33;
	 	var initWidth = $(document).width()* 100 / 33;
	 	
                $.ajax({{
                    url: '{$newUri}'
                    ,async: false
                    , dataType: "text"
                    , success: function(data) {{
                        verovioData = data; 
                		allPages();               		
                    }}
                }});
                
                function allPages(){{
                	var options = JSON.stringify({{
                			scale: 33,
							noLayout: 0,
							pageHeight: initHeight,
							pageWidth: initWidth,
							adjustPageHeight: 1
                		}});
                		vrvToolkit.setOptions( options );
                		vrvToolkit.loadData(verovioData);
                		numberPages = vrvToolkit.getPageCount();
                		var svg = vrvToolkit.renderPage(1, options);
						for (i = 2; i !== vrvToolkit.getPageCount()+1; i++) {{
							svg = svg + vrvToolkit.renderPage(i, options);
						}}
                		$("#output").html(svg);
                }}
            
	 	function loadPage(pageNr){{
	 		var options = JSON.stringify({{
                			scale: 33,
							noLayout: 0,
							pageHeight: initHeight,
							pageWidth: initWidth,
							adjustPageHeight: 1
                		}});
                		vrvToolkit.setOptions( options );
                		vrvToolkit.loadData(verovioData);
                		var svg = vrvToolkit.renderPage(pageNr, "");
                		$("#output").html(svg);
                		return numberPages;
	 	}}
	 	
	 	
	 	function loadContinuousHight(){{
	 		var pageHeight_1 = $(document).height();
						var pageWidth_1 = $(document).width();
						var options = JSON.stringify({{
							scale: 33,
							pageHeight: pageHeight_1,
							pageWidth: pageHeight_1
						}});
						vrvToolkit.setOptions(options);
						vrvToolkit.redoLayout();		
						var svg = vrvToolkit.renderPage(1, options);
						for (i = 2; i !== vrvToolkit.getPageCount()+1; i++) {{
							svg = svg + vrvToolkit.renderPage(i, options);
						}}
						$("#output").html(svg);
	 	}}
	 	
	 	function loadContinuousWidth(){{
	 		var options = JSON.stringify({{
							scale: 33,
							noLayout: 1
						}});
						vrvToolkit.setOptions(options);
						vrvToolkit.loadData(verovioData);
						var svg = vrvToolkit.renderPage(1, options);
						$("#output").html(svg);
			 
	 	}}
	  	
		</script>		
</html>