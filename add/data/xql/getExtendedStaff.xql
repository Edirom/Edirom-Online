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
let $newUri := concat('http://localhost:8080/exist/rest/', $docUri)

return
<html xmlns="http://www.w3.org/1999/xhtml">	
    <head>   	
        <title></title>
    	<!-- **VEROVIO** -->
    	<script src="../../resources/verovio/verovio-toolkit-0.9.9.js" type="text/javascript" charset="utf-8"></script>
    	
    	<!-- **JQUERY** -->
    	<script type="text/javascript" src="../../resources/jquery/jquery-2.1.3.js"  charset="utf-8"></script>   	
    </head>
	<body>
		<div id="output"/>	
		<script type="text/javascript">
        	var vrvToolkit = new verovio.toolkit(); 
            $.ajax({{
                url: '{$newUri}', 
                dataType: "text", 
                success: function(data) {{
                	pageHeight = $(document).height()* 100 / 33;
					pageWidth = $(document).width()* 100 / 33;
                	options = JSON.stringify({{
                		scale: 33,
						noLayout: 0,
						pageHeight: pageHeight,
						pageWidth: pageWidth,
						adjustPageHeight: 1
                	}});
                	vrvToolkit.setOptions( options );
                	vrvToolkit.loadData(data);
                	svg = vrvToolkit.renderPage(1, "");
                	$("#output").html(svg);                  
               }}
            }});           
		</script>		
	</body>	
</html>