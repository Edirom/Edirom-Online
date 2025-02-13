xquery version "3.1";

module namespace edt = "http://www.edirom.de/xquery/xqsuite/edition-tests";

import module namespace edition = "http://www.edirom.de/xquery/edition" at "xmldb:exist:///db/apps/Edirom-Online/data/xqm/edition.xqm";

declare namespace test="http://exist-db.org/xquery/xqsuite";


declare
    (: check xml:id :)
    %test:args("edirom_edition_example")
    %test:assertEquals("xmldb:exist:///db/apps/Edirom-Online/testing/XQSuite/data/edition.xml")
    (: check database path :)
    %test:args("/db/apps/Edirom-Online/testing/XQSuite/data/edition.xml")
    %test:assertEquals("xmldb:exist:///db/apps/Edirom-Online/testing/XQSuite/data/edition.xml")
    (: check empty sequence :)
    %test:arg("editionIDorPath")       %test:assertEmpty
    function edt:test-getEditionURI($editionIDorPath as xs:string?) as xs:string?  {
        edition:getEditionURI($editionIDorPath)
};
