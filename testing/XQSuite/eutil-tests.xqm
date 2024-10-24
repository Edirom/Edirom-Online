xquery version "3.1";

module namespace eut = "http://www.edirom.de/xquery/xqsuite/eutil-tests";

import module namespace eutil = "http://www.edirom.de/xquery/util" at "xmldb:exist:///db/apps/Edirom-Online/data/xqm/util.xqm";

declare namespace mei="http://www.music-encoding.org/ns/mei";
declare namespace tei="http://www.tei-c.org/ns/1.0";
declare namespace test="http://exist-db.org/xquery/xqsuite";
declare namespace xhtml="http://www.w3.org/1999/xhtml";


declare 
    %test:args("<title xmlns='http://www.tei-c.org/ns/1.0' 
        type='main'>Some Title</title>")            %test:assertEquals("tei")
    %test:args("<render xmlns='http://www.music-encoding.org/ns/mei' 
        xmlns:mei='http://www.music-encoding.org/ns/mei'><mei:render>
        nested</mei:render> render</render>")       %test:assertEquals("mei")
    %test:args("<xhtml:span xmlns:xhtml='http://www.w3.org/1999/xhtml' 
        class='author'>Johann Evangelist Engl</xhtml:span>")     %test:assertEquals("unknown")
    function eut:test-getNamespace($node as element()) as xs:string {
        eutil:getNamespace($node)
};

declare 
    %test:args("<titleStmt xmlns='http://www.tei-c.org/ns/1.0'><?prüfen?><title type='abbreviated'>
        <identifier>P1-PA<rend rend='sup'>1</rend></identifier> – Autographe Partitur</title>
        <title type='main'>Autographe Partitur</title>
        <title type='sub'>Manifestation</title></titleStmt>", 
        "de")       %test:assertEquals("unknown") %test:pending("Ticket https://github.com/Edirom/Edirom-Online/issues/103")
    %test:args("<titleStmt xmlns='http://www.tei-c.org/ns/1.0'>
        <title type='main'>Autographe Partitur</title>
        <title type='sub'>Manifestation</title></titleStmt>", 
        "de")       %test:assertEquals("Autographe Partitur")
    %test:args("<titleStmt xmlns='http://www.tei-c.org/ns/1.0'>
        <title type='main'>Autographe Partitur</title></titleStmt>", 
        "de")       %test:assertEquals("Autographe Partitur")
    function eut:test-getLocalizedTitle($node as element(), $lang as xs:string?) as xs:string {
        eutil:getLocalizedTitle($node, $lang)
};
