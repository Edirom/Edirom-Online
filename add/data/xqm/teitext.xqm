xquery version "3.1";
(:
 : For LICENSE-Details please refer to the LICENSE file in the root directory of this repository.
 :)

(:~
 : This module provides library functions for Texts
 :
 : @author <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
 :)
module namespace teitext="http://www.edirom.de/xquery/teitext";

(: IMPORTS ================================================================= :)

import module namespace eutil="http://www.edirom.de/xquery/util" at "util.xqm";

(: NAMESPACE DECLARATIONS ================================================== :)

declare namespace tei="http://www.tei-c.org/ns/1.0";

(: FUNCTION DECLARATIONS =================================================== :)

(:~
 : Returns whether a document is a work or not
 :
 : @param $uri The URI of the document
 : @return Is work or not
 :)
declare function teitext:isText($uri as xs:string) as xs:boolean {

    exists(doc($uri)/tei:TEI)

};

(:~
 : Returns a text's label
 :
 : @param $source The URIs of the Text's document to process
 : @return The label
 :)
declare function teitext:getLabel($uri as xs:string, $edition as xs:string) as xs:string {

    let $language := eutil:getLanguage($edition)

    return doc($uri)//tei:titleStmt/data(tei:title[not(@xml:lang) or @xml:lang = $language])

};
