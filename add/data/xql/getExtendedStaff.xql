xquery version "3.0";

declare namespace request="http://exist-db.org/xquery/request";
declare namespace mei="http://www.music-encoding.org/ns/mei";

declare namespace tei="http://www.tei-c.org/ns/1.0";
declare namespace xmldb="http://exist-db.org/xquery/xmldb";
declare namespace system="http://exist-db.org/xquery/system";
declare namespace transform="http://exist-db.org/xquery/transform";

declare option exist:serialize "method=xhtml media-type=text/html omit-xml-declaration=yes indent=yes";

let $uri := request:get-parameter('uri', '')
let $edition := request:get-parameter('edition', '')
let $file2render := concat(substring-before(request:get-url(), 'EdiromOnline'), substring-after($uri,'xmldb:exist:///db/apps/'))
let $resourceVerovio := concat(substring-before(request:get-url(), 'Edirom-Online'),'Edirom-Online/resources/verovio/verovio-app.js')
let $appName := substring-before(substring-after(request:get-url(), 'apps/'), '/')
return
<html>
    <head>
        <title>Verovio</title>
        <style>
            html, body {{
                width: 100%;
                height: 100%;
                margin: 0;
            }}
            #appVerovio {{
                height: 100%;
                width: 100%;
                position: absolute;
                top: 80px;
                bottom: 0;
            }}
    </style>
    </head>
	<body>
        <div class="panel-body">
            <div id="app" class="panel" style="border: 1px solid lightgray;"></div>
        </div>
        <script type="module">
            import '{$resourceVerovio}';
        
            // Create the app - here with an empty option object
            const app = new Verovio.App(document.getElementById("app"), {{}});
        
            // Load a file (MEI or MusicXML)
            fetch("{$file2render}")
                .then(function(response) {{
                    return response.text();
                }})
                .then(function(text) {{
                    app.loadData(text);
                }});
        </script> 
    </body>
</html>
