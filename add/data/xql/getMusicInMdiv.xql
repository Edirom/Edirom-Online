xquery version "3.0";

declare namespace request="http://exist-db.org/xquery/request";
declare namespace mei="http://www.music-encoding.org/ns/mei";
declare namespace system="http://exist-db.org/xquery/system";
declare namespace transform="http://exist-db.org/xquery/transform";

let $uri := request:get-parameter('uri', '')
let $movementId := request:get-parameter('movementId', '')
let $mei := doc($uri)/root()
let $mdiv := if($movementId eq '')
             then($mei//mei:mdiv[1])
             else($mei/id($movementId))
             
let $base := concat(replace(system:get-module-load-path(), 'embedded-eXist-server', ''), '/../xslt/')
let $data := transform:transform($mdiv, concat($base, 'edirom_prepareAnnotsForRendering.xsl'), <parameters/>)


return
    <mei xmlns="http://www.music-encoding.org/ns/mei" xmlns:xlink="http://www.w3.org/1999/xlink" meiversion="4.0.0">
        {$mei//mei:meiHead}
        <music>
            <facsimile/>
            <body>
                {$data}
            </body>
        </music>
    </mei>