xquery version "3.1";

module namespace measuretests = "http://www.edirom.de/xquery/xqsuite/measure-tests";

import module namespace measure = "http://www.edirom.de/xquery/measure" at "xmldb:exist:///db/apps/Edirom-Online/data/xqm/measure.xqm";

declare namespace mei="http://www.music-encoding.org/ns/mei";
declare namespace tei="http://www.tei-c.org/ns/1.0";
declare namespace test="http://exist-db.org/xquery/xqsuite";
declare namespace xhtml="http://www.w3.org/1999/xhtml";

declare 
    %test:args("<measure xmlns='http://www.music-encoding.org/ns/mei' 
        n='1'>some content</measure>")          %test:assertEquals("1")
    %test:args("<measure xmlns='http://www.music-encoding.org/ns/mei' 
        n='foo'>some content</measure>")        %test:assertEquals("foo")
    %test:args("<measure xmlns='http://www.music-encoding.org/ns/mei' 
        n='foo' label='bar'>some content</measure>")    %test:assertEquals("bar")
    %test:args("<measure xmlns='http://www.music-encoding.org/ns/mei' 
        label='bar'>some content</measure>")            %test:assertEquals("bar")
    function measuretests:getMeasureLabelAttr($node as element()) {
        measure:getMeasureLabelAttr($node)
};

(: The function `measure:resolveMultiMeasureRests#2` is currently commented out :)
(:
declare
    %test:args("4")         %test:assertEmpty
    %test:args("foo")       %test:assertEmpty
    %test:args("108")       %test:assertExists
    function measuretests:resolveMultiMeasureRests($measureN as xs:string) as node()* {
        doc("testdata/multiMeasureRests.xml")/mei:mdiv =>
        measure:resolveMultiMeasureRests($measureN)
};
:)

declare
    %test:args("xacea1fff-da53-42b4-bb5e-e814e1ca653a")       %test:assertXPath("/xhtml:span[parent::xhtml:span][.='107']")
    %test:args("x9cafb006-025b-4019-9430-936ab85a62db")       %test:assertXPath("/xhtml:span[parent::xhtml:span][.='108']")
    %test:args("xf48dfa96-2cf1-43e5-8fbf-ec8d1dca7501")       %test:assertXPath("/xhtml:span[parent::xhtml:span][.='110']")
    function measuretests:getMeasureLabel($measureID as xs:string) as element(xhtml:span) {
        doc("testdata/multiMeasureRests.xml")/id($measureID) =>
        measure:getMeasureLabel()
};

declare
    %test:args("xacea1fff-da53-42b4-bb5e-e814e1ca653a")       %test:assertEquals("107")
    %test:args("x9cafb006-025b-4019-9430-936ab85a62db")       %test:assertEquals("108","109")
    %test:args("xf48dfa96-2cf1-43e5-8fbf-ec8d1dca7501")       %test:assertEquals("110a")
    %test:args("x10f96702-291d-4d4e-962a-755a4eed2507")       %test:assertEquals("104","105","106","107")
    %test:args("foo")       %test:assertEmpty
    function measuretests:analyzeLabel($measureID as xs:string) as xs:string* {
        doc("testdata/multiMeasureRests.xml")/id($measureID) =>
        measure:analyzeLabel()
};
