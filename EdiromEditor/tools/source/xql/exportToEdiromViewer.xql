xquery version "1.0";
(: 
    @author Daniel R�wenstrunk
:)

declare namespace mei="http://www.edirom.de/ns/mei";
declare namespace tei="http://www.tei-c.org/ns/1.0";
declare namespace image="http://www.edirom.de/ns/image";
declare namespace xlink="http://www.w3.org/1999/xlink";

declare option exist:serialize "method=xml media-type=text/xml omit-xml-declaration=yes indent=yes";

declare function local:getImage($uri) {
    doc(replace($uri, 'xmldb:exist://', ''))/image:image
};

declare function local:getMEI($idsT) {
    for $id in $idsT
    return
        xcollection('/db/contents/sources')//mei:source/id($id)/root()
};

let $ids := request:get-parameter('sources', '')
let $idsT := tokenize($ids, '__xx__')
let $meiT := local:getMEI($idsT)
let $editionName := request:get-parameter('editionName', '')
let $publisher := request:get-parameter('publisherName', '')
let $editionId := request:get-parameter('editionId', '')
let $defaultLang := request:get-parameter('lang', 'de')

return
(

<?oxygen SCHSchema="edirom.sch"?>,

<edition xmlns="http://www.edirom.de/ns/1.1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:tei="http://www.tei-c.org/ns/1.0" xmlns:svg="http://www.w3.org/2000/svg"
    xsi:schemaLocation="http://www.edirom.de/ns/1.1 edirom_edition.xsd http://www.tei-c.org/ns/1.0 http://www.tei-c.org/release/xml/tei/custom/schema/xsd/teilite.xsd"
    id="{$editionId}">
    
    <!--
        
        generiert mit Stylesheet vom 22.04.2010 exportToEdiromViewer.xql
        
        parts werden aus der ersten Datei �bernommen alle weiteren parts werden implizit �ber die Reihenfolge gematcht
        voices werden in dieser Version nicht ber�cksichtigt, es wird angenommen, dass alle Takte �ber die gesamte Akkolade markiert wurden
    
    -->

    <editionName>{$editionName}</editionName>
    <editionSummary>
        <tei:p>An dieser Stelle bitte diesen Text durch eine Zusammenfassung ersetzen.</tei:p>
    </editionSummary>
    <languages>
        <language xml:lang="{$defaultLang}" complete="true"/>
    </languages>
    <publicationInfo>
        <publisher>{$publisher}</publisher>
        <publicationLink>http://www.edirom.de</publicationLink>
    </publicationInfo>

    <works>
        <work id="work-1" sortNo="1">
            <summary>
                <tei:TEI xml:lang="{$defaultLang}">
                    <tei:teiHeader>
                        <tei:fileDesc>
                            <tei:titleStmt>
                                <tei:title>{$editionName}</tei:title>
                            </tei:titleStmt>
                            <tei:publicationStmt>
                                <tei:p/>
                            </tei:publicationStmt>
                            <tei:sourceDesc>
                                <tei:p/>
                            </tei:sourceDesc>
                        </tei:fileDesc>
                    </tei:teiHeader>
                    <tei:text>
                        <tei:body>
                            <tei:div>
                                <tei:head>{$editionName}</tei:head>
                            </tei:div>
                        </tei:body>
                    </tei:text>
                </tei:TEI>                
            </summary>
        
            <names>
                <name xml:lang="{$defaultLang}">{$meiT[1]//mei:filedesc/mei:titlestmt/mei:title/text()}</name>
            </names>
            <composers>
                <composer>{$meiT[1]//mei:filedesc/mei:titlestmt/mei:respstmt/mei:name[@role = 'composer']/text()}</composer>
            </composers>
            <parts>
            { for $mdiv at $i in $meiT[1]//mei:body/mei:mdiv
                return
                <part id="part-{$i}" sortNo="{$i}">
                    <names>
                        <name xml:lang="{$defaultLang}">{$mdiv/data(@n)}</name>
                    </names>
                </part>
            }
            </parts>
            <voices>
                <!-- to be created -->
            </voices>
            <texts/>
            <sources>
 
{
(:folgendes in Schleife fassen f�r das Prozessieren mehrerer input files :)
for $mei at $n in $meiT
return
for $source at $i in $mei/mei:mei/mei:meihead/mei:filedesc/mei:sourcedesc/mei:source
 return
     <source id="{concat('source-', ($n * 10) + $i)}" type="print" sortNo="{($n * 10) + $i}" writer="">
        <names>
            <name xml:lang="{$defaultLang}">{$source/mei:titlestmt/mei:title/text()}</name>
        </names>
        <siglum>{$mei/mei:mei/mei:meihead/mei:filedesc/mei:pubstmt/mei:identifier[@type="signature"]/text()}</siglum>
        <description id="{concat('description-', ($n * 10) + $i)}" sortNo="1">
            <tei:TEI xml:lang="{$defaultLang}">
                <tei:teiHeader>
                    <tei:fileDesc>
                        <tei:titleStmt>
                            <tei:title>{$source/mei:titlestmt/mei:title/text()}</tei:title>
                        </tei:titleStmt>
                        <tei:publicationStmt>
                            <tei:p/>
                        </tei:publicationStmt>
                        <tei:sourceDesc>
                            <tei:p/>
                        </tei:sourceDesc>
                    </tei:fileDesc>
                </tei:teiHeader>
                <tei:text>
                    <tei:body>
                        <tei:p/>
                    </tei:body>
                </tei:text>
            </tei:TEI>
        </description>
        <facsimiles>
{
    for $surface at $x in $mei//mei:music/mei:facsimile[@source = $source/@xml:id]/mei:surface
    return
        let $image := local:getImage($surface/mei:graphic[@type='facsimile']/@xlink:href)
        return
            <facsimile id="facsimile-{((($n * 10) + $i) * 100) + $x}" path="{replace(replace($image/@fileOrig, '.jpg', '.edj'), '.JPG', '.edj')}" sortNo="{$x}" folio="recto" width="{$image/@width}" height="{$image/@height}">
                <name xml:lang="{$defaultLang}">{$surface/data(@n)}</name>
                <bars>
{
            for $zone in $surface/mei:zone[@type='measure']
            return
                let $measure := $mei//mei:measure[@facs=$zone/@xml:id]
                let $measurePos := count($measure/preceding::mei:measure) + 1
                return
                    if(exists($measure))
                    then(
                        if(exists($measure/mei:multirest))
                        then(
                            <barGroup id="barGroup-{((($n * 10) + $i) * 100) + $x}{$measurePos}" firstBar="{$measure/@n}" lastBar="{$measure/@n + $measure/mei:multirest/@dur -1}" sortNo="{$measurePos}" part="{concat('part-', count($measure/ancestor::mei:mdiv/preceding-sibling::mei:mdiv) + 1)}">
                                <coordinates x="{$zone/@ulx}" y="{$zone/@uly}" width="{number($zone/@lrx) - number($zone/@ulx)}" height="{number($zone/@lry) - number($zone/@uly)}"/>
                            </barGroup>
                        )
                        else(
                            <bar id="bar-{((($n * 10) + $i) * 100) + $x}{$measurePos}" name="{$measure/@n}" sortNo="{$measurePos}" part="{concat('part-', count($measure/ancestor::mei:mdiv/preceding-sibling::mei:mdiv) + 1)}">
                                <coordinates x="{$zone/@ulx}" y="{$zone/@uly}" width="{number($zone/@lrx) - number($zone/@ulx)}" height="{number($zone/@lry) - number($zone/@uly)}"/>
                            </bar>
                        )
                    )
                    else()
}
                </bars>
            </facsimile>
}            
        </facsimiles>
    </source>
(: Ende der Schleife:)
    }
        </sources>
        <annotations/>
        </work>
    </works>
</edition>
)