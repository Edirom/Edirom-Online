xquery version "3.1";
(:
 : For LICENSE-Details please refer to the LICENSE file in the root directory of this repository.
 :)

(: IMPORTS ================================================================= :)

import module namespace eutil = "http://www.edirom.de/xquery/util" at "../xqm/util.xqm";

(: NAMESPACE DECLARATIONS ================================================== :)

declare namespace edirom = "http://www.edirom.de/ns/1.3";
declare namespace output = "http://www.w3.org/2010/xslt-xquery-serialization";
declare namespace request = "http://exist-db.org/xquery/request";
declare namespace xlink = "http://www.w3.org/1999/xlink";
declare namespace xmldb = "http://exist-db.org/xquery/xmldb";

(: OPTION DECLARATIONS ===================================================== :)

declare option output:media-type "text/html";
declare option output:method "xhtml";
declare option output:indent "yes";
declare option output:omit-xml-declaration "yes";

(: VARIABLE DECLARATIONS =================================================== :)

declare variable $lang := request:get-parameter('lang', '');

(: FUNCTION DECLARATIONS =================================================== :)

declare function local:getCategory($category, $depth) {
    
    <div
        class="navigatorCategory{
                if ($depth = 1) then
                    ()
                else
                    ($depth)
            }"
        id="{$category/@xml:id}">
        <div
            class="navigatorCategoryTitle{
                    if ($depth = 1) then
                        ()
                    else
                        ($depth)
                }">
            {
                if ($depth = 1) then
                    (eutil:getLocalizedName($category, $lang))
                else
                    (
                    <span
                        id="{$category/@xml:id}-title"
                        onclick="if(Ext.get('{$category/@xml:id}-title').hasCls('folded')) {{Ext.get('{$category/@xml:id}-title').removeCls('folded');Ext.get(Ext.get('{$category/@xml:id}-title').query('.fa')[0]).removeCls('fa-caret-right').addCls('fa-caret-down');Ext.get('{$category/@xml:id}-items').removeCls('hidden');}}else{{Ext.get('{$category/@xml:id}-title').addCls('folded');Ext.get(Ext.get('{$category/@xml:id}-title').query('.fa')[0]).removeCls('fa-caret-down').addCls('fa-caret-right');Ext.get('{$category/@xml:id}-items').addCls('hidden');}}"
                        class="folded">{eutil:getLocalizedName($category, $lang)}<i
                            class="fa fa-caret-right fa-fw"></i></span>
                    )
            }
        </div>
        <div
            id="{$category/@xml:id}-items"
            class="{
                    if ($depth = 1) then
                        ()
                    else
                        ('hidden')
                }">
            {
                for $elem in $category/edirom:navigatorItem | $category/edirom:navigatorCategory
                return
                    if (local-name($elem) eq 'navigatorItem') then (
                        local:getItem($elem, $depth)
                    ) else if (local-name($elem) eq 'navigatorSeparator') then (
                        local:getSeparator()
                    ) else if (local-name($elem) eq 'navigatorCategory') then (
                        local:getCategory($elem, $depth + 1)
                    ) else
                        ()
            }
        </div>
    </div>
};

declare function local:getItem($item, $depth) {
    
    let $target := $item/replace(@targets, '\[.*\]', '')
    let $cfg := concat('{', replace(substring-before($item/substring-after(@targets, '['), ']'), '=', ':'), '}')
    let $target :=
        if (starts-with($target, 'javascript:')) then
            (replace($target, 'javascript:', ''))
        else
            (concat("loadLink('", $target, "', ", $cfg, ")"))
        return
        
        <div class="navigatorItem{
                    if ($depth lt 2) then
                        ()
                    else
                        ($depth)
                }"
            id="{$item/@xml:id}"
            onclick="{$target}">
            {eutil:getLocalizedName($item, $lang)}
        </div>
};

declare function local:getSeparator() {
    
    <div class="navigatorSeparator"></div>
};

declare function local:getDefinition($navConfig) {
    let $elems := $navConfig/*
    
    for $elem in $elems
    
    return
        
        if (local-name($elem) eq 'navigatorItem') then (
            local:getItem($elem, 1)
        ) else if (local-name($elem) eq 'navigatorSeparator') then (
            local:getSeparator()
        ) else if (local-name($elem) eq 'navigatorCategory') then (
            local:getCategory($elem, 1)
        ) else
            ()
};

(: QUERY BODY ============================================================== :)

let $editionId := request:get-parameter('editionId', '')
let $workId := request:get-parameter('workId', '')
let $edition := doc($editionId)/root()
let $work := $edition/id($workId)
let $navConfig := $work/edirom:navigatorDefinition

return
    local:getDefinition($navConfig)
