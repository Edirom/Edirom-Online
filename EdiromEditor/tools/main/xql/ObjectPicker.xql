xquery version "1.0";
(: 
    author: Johannes Kepper
:)

declare namespace request="http://exist-db.org/xquery/request";
declare namespace exist="http://exist.sourceforge.net/NS/exist";
declare namespace mei="http://www.edirom.de/ns/mei";
declare namespace tei="http://www.tei-c.org/ns/1.0";


declare option exist:serialize "method=xhtml media-type=text/html omit-xml-declaration=no indent=yes 
        doctype-public=-//W3C//DTD&#160;XHTML&#160;1.0&#160;Strict//EN
        doctype-system=http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd";

declare function local:getSources($inputType) {
    
    for $source in xcollection('/db/contents/sources')/mei:mei
    return (
        <tr>
            <td class="objectPicker_itemChecker">
                <input type="{$inputType}" name="selectSource" id="select_{$source//mei:source/string(@xml:id)}"/>
            </td>
            <td>{$source//mei:filedesc/mei:titlestmt/mei:respstmt/data(mei:persname[@role eq 'composer'])}</td>
            <td>{$source//mei:filedesc/mei:titlestmt/data(mei:title)}</td>        							
            <td>{$source//mei:source/mei:titlestmt/mei:title/text()}</td>
            <td>{$source//mei:pubstmt/data(mei:identifier[@type eq 'signature'])}</td>
        </tr>
    
    )
        
};

declare function local:getTexts($mode) {
    
    for $text in xcollection('/db/contents/texts')/tei:TEI
    return (
        <tr>
            <td class="objectPicker_itemChecker">
                <input type="{$mode}" name="selectText" id="select_{$text/string(@xml:id)}"/>
            </td>
            <td>{$text//tei:titleStmt/data(tei:title)}</td>
            <td>{$text/data(@xml:id)}</td>        							
        </tr>
    
    )
        
};
(:
declare function local:getWorks() {
    let $worksColl := xcollection('/db/contents/works')
};
:)

let $sources := request:get-parameter('sources', '')
let $works := request:get-parameter('works', '')
let $texts := request:get-parameter('texts', '')
let $inputType := request:get-parameter('inputType', '')

return (
<div id="objectPickerBox">
    <div id="objectPicker_background"></div>
    <div id="objectPicker">
        <div id="objectPickerHeading">ObjectPicker</div>
        <div id="objectPickerContent">            
        {
            if($sources eq 'true')
            then(
                <table class="objectPickerTable">
                    <thead>
                        <th></th>
                        <th>Komponist</th>
                        <th>Werk</th>
                        <th>Bezeichnung</th>                        
                        <th>Signatur</th>                    
                    </thead>
                    <tbody>
                        {
                            local:getSources($inputType)
                        }
                    </tbody>
                </table>
            )
            else()
        }
        {
            if($works eq 'true')
            then()
            else()
        }
        {
            if($texts eq 'true')
            then(
                <table class="objectPickerTable">
                    <thead>
                        <th></th>
                        <th>Titel</th>
                        <th>ID</th>
                    </thead>
                    <tbody>
                        {
                            local:getTexts($inputType)
                        }
                    </tbody>
                </table>
            )
            else()
        }
        </div>
        <div class="saveBox objectPickerSaveBox">
            <span id="objectPicker_cancelButton" class="saveBoxButton">Abbrechen</span>
            <span id="objectPicker_okButton" class="saveBoxButton">Auswahl bestätigen</span>
        </div>
    </div>
</div>
)