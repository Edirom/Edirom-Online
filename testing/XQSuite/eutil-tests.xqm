xquery version "3.1";

module namespace eut = "http://www.edirom.de/xquery/xqsuite/eutil-tests";

import module namespace eutil = "http://www.edirom.de/xquery/eutil" at "xmldb:exist:///db/apps/Edirom-Online/data/xqm/eutil.xqm";

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
        "de")       %test:assertEquals("P1-PA1 – Autographe Partitur")
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

declare
    %test:arg("uri")                %test:assertEmpty
    %test:arg("uri", "")            %test:assertEmpty
    %test:args("foo")               %test:assertEmpty
    %test:args("https://edirom.de") %test:assertXPath("/html")
    %test:args("xmldb:exist://db/apps/Edirom-Online/data/locale/edirom-lang-de.xml")    %test:assertXPath("/langFile")
    %test:args("/db/apps/Edirom-Online/data/locale/edirom-lang-de.xml")                 %test:assertXPath("/langFile")
    function eut:test-getDoc($uri as xs:string?) as document-node()? {
        eutil:getDoc($uri)
};

declare 
    (: Test empty replacements with non-existing key :)
    %test:arg("key", "foo1g4#")
    %test:arg("values") 
    %test:arg("lang", "de") %test:assertEmpty
    (: Test empty replacements with existing key :)
    %test:arg("key", "view.desktop.Desktop_Maximize")
    %test:arg("values") 
    %test:arg("lang", "de") %test:assertEquals("Maximieren")
    (: Test empty replacements with existing key in another language :)
    %test:arg("key", "view.desktop.Desktop_Maximize")
    %test:arg("values") 
    %test:arg("lang", "en") %test:assertEquals("Maximize")
    (: Test replacements with existing key :)
    %test:args("view.desktop.TaskBar_Desktop", "5", "de") %test:assertEquals("Desktop 5")
    (: Test replacements with existing key in another language :)
    %test:args("view.desktop.TaskBar_Desktop", "foo", "en") %test:assertEquals("Desktop foo")
    (: Test replacements with existing key without placeholders :)
    %test:args("view.desktop.Desktop_Maximize", "foo", "de") %test:assertEquals("Maximieren")
    (: Test replacements with existing key and non-existing language :)
    %test:args("view.desktop.Desktop_Maximize", "foo", "foo1g4#lang") %test:assertEmpty
    (: Test empty replacements with non-existing key and non-existing language :)
    %test:arg("key", "foo1g4#")
    %test:arg("values") 
    %test:arg("lang", "foo1g4#lang") %test:assertEmpty
    function eut:test-getLanguageString-3-arity($key as xs:string, $values as xs:string*, $lang as xs:string) as xs:string? {
        eutil:getLanguageString($key, $values, $lang)
};

declare 
    (: Test empty replacements with non-existing key :)
    %test:arg("edition", "edirom_edition_example")
    %test:arg("key", "foo1g4#")
    %test:arg("values") 
    %test:arg("lang", "de") %test:assertEmpty
    (: Test empty replacements with existing key :)
    %test:arg("edition", "edirom_edition_example")
    %test:arg("key", "global_cancel")
    %test:arg("values") 
    %test:arg("lang", "de") %test:assertEquals("Test-Abbrechen")
    (: Test empty replacements with existing key in another language :)
    %test:arg("edition", "edirom_edition_example")
    %test:arg("key", "global_cancel")
    %test:arg("values") 
    %test:arg("lang", "it") %test:assertEquals("Test-it-Abbrechen")
    (: Test replacements with existing key :)
    %test:args("edirom_edition_example", "view.desktop.TaskBar_Desktop", "5", "de") %test:assertEquals("Test-Desktop 5")
    (: Test replacements with existing key in another language :)
    %test:args("edirom_edition_example", "view.desktop.TaskBar_Desktop", "foo", "it") %test:assertEquals("Test-it-Desktop foo")
    (: Test replacements with existing key without placeholders :)
    %test:args("edirom_edition_example", "global_cancel", "foo", "de") %test:assertEquals("Test-Abbrechen")
    (: Test replacements with existing key and non-existing language :)
    %test:args("edirom_edition_example", "global_cancel", "foo", "foo1g4#lang") %test:assertEmpty
    (: Test empty replacements with non-existing key and non-existing language :)
    %test:arg("edition", "edirom_edition_example")
    %test:arg("key", "foo1g4#")
    %test:arg("values") 
    %test:arg("lang", "foo1g4#lang") %test:assertEmpty
    (: Test empty replacements with existing key from default language file :)
    %test:arg("edition", "edirom_edition_example")
    %test:arg("key", "view.desktop.Desktop_Maximize")
    %test:arg("values") 
    %test:arg("lang", "de") %test:assertEquals("Maximieren")
    (: Test empty replacements with non-existing editionID – with existing key from default language file :)
    %test:arg("edition", "foobar4#_edition")
    %test:arg("key", "view.desktop.Desktop_Maximize")
    %test:arg("values") 
    %test:arg("lang", "de") %test:assertEquals("Maximieren")
    function eut:test-getLanguageString-4-arity($edition as xs:string, $key as xs:string, $values as xs:string*, $lang as xs:string) as xs:string? {
        eutil:getLanguageString($edition, $key, $values, $lang)
};