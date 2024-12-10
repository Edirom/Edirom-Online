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

declare
    %test:args("4")         %test:assertEmpty
    %test:args("foo")       %test:assertEmpty
    %test:args("108")       %test:assertExists
    function measuretests:resolveMultiMeasureRests($measureN as xs:string) as node()* {
        doc("testdata/multiMeasureRests.xml")/mei:mdiv =>
        measure:resolveMultiMeasureRests($measureN)
};
