xquery version "3.1";
(:
  Edirom Online
  Copyright (C) 2011 The Edirom Project
  http://www.edirom.de

  Edirom Online is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  Edirom Online is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with Edirom Online.  If not, see <http://www.gnu.org/licenses/>.

  ID: $Id: getNavigatorConfig.xql 1279 2012-03-19 13:16:43Z daniel $
:)

import module namespace eutil="http://www.edirom.de/xquery/util" at "../xqm/util.xqm";
import module namespace console="http://exist-db.org/xquery/console";

declare namespace request="http://exist-db.org/xquery/request";
declare namespace edirom="http://www.edirom.de/ns/1.3";
declare namespace xlink="http://www.w3.org/1999/xlink";

declare namespace conf="https://www.maxreger.info/conf";

declare namespace xmldb="http://exist-db.org/xquery/xmldb";

declare option exist:serialize "method=xhtml media-type=text/html omit-xml-declaration=yes indent=yes";

declare variable $lang := request:get-parameter('lang', '');

declare variable $configResource := doc('xmldb:exist:///db/apps/mriExistDBconf/config.xml');
declare variable $env := $configResource//conf:env/text();

declare function local:getCategory($category, $depth) {


    <div class="navigatorCategory{if($depth = 1)then()else($depth)}" id="{$category/@xml:id}">
        <div class="navigatorCategoryTitle{if($depth = 1)then()else($depth)}">
            {
                if($depth = 1)
                then(eutil:getLocalizedName($category, $lang))
                else(
                    <span id="{$category/@xml:id}-title" onclick="if(Ext.get('{$category/@xml:id}-title').hasCls('folded')) {{Ext.get('{$category/@xml:id}-title').removeCls('folded');Ext.get(Ext.get('{$category/@xml:id}-title').query('.fa')[0]).removeCls('fa-caret-right').addCls('fa-caret-down');Ext.get('{$category/@xml:id}-items').removeCls('hidden');}}else{{Ext.get('{$category/@xml:id}-title').addCls('folded');Ext.get(Ext.get('{$category/@xml:id}-title').query('.fa')[0]).removeCls('fa-caret-down').addCls('fa-caret-right');Ext.get('{$category/@xml:id}-items').addCls('hidden');}}" class="folded">{eutil:getLocalizedName($category, $lang)}<i class="fa fa-caret-right fa-fw"></i></span>
                )
            }            
        </div>
        <div id="{$category/@xml:id}-items" class="{if($depth = 1)then()else('hidden')}">
        {
            for $elem in $category/edirom:navigatorItem | $category/edirom:navigatorCategory
            return
                (: RWA-specific: do not show (source) entries/@type = "private" or "editions" when on public server :)
                if(local-name($elem) eq 'navigatorItem')
                then(
                    if ($env = ('beta', 'public') and ($elem/@type = 'private' or matches($elem/@targets/string(), '(/music/editions/|/music/mused/)')))
                    then ()
                    else (local:getItem($elem, $depth))
                )
                else if(local-name($elem) eq 'navigatorSeparator')
                then(
                    local:getSeparator()
                )
                else if(local-name($elem) eq 'navigatorCategory')
                then(
                    local:getCategory($elem, $depth + 1)
                )
                else()
        }
        </div>
    </div>
};

declare function local:getItem($item, $depth) {

    let $target := $item/replace(@targets, '\[.*\]', '')
    
    (: RWA specific implementation, starts here: :)
    (: forward any target to "mri_…" to RWA Online :)
    (: We want to use our own object view for work descriptions :)
    let $RWAconfigDoc := doc('xmldb:exist:///db/apps/mriExistDBconf/config.xml')
    let $RWAOnlineURL := $RWAconfigDoc//conf:rwaOnlineURL
    let $target := for $t in tokenize($target, ' ')
                    return
                    if (starts-with($t, 'mri_'))
                    then (concat($RWAOnlineURL, $t, '.html'))
                    else ($t)
    let $target := string-join($target, ' ')
    (: RWA specific implementation, ends here. :)
    
    let $cfg := concat('{', replace(substring-before($item/substring-after(@targets, '['), ']'), '=', ':'), '}')
    return

    <div class="navigatorItem{if($depth lt 2)then()else($depth)}" id="{$item/@xml:id}" onclick="loadLink('{$target}', {$cfg})">
        {eutil:getLocalizedName($item, $lang) }
    </div>
};

declare function local:getSeparator() {

    <div class="navigatorSeparator"></div>
};

declare function local:getDefinition($navConfig, $edition) {
    let $elems := $navConfig/*
    let $identModule := $edition//edirom:identifier[@type = 'module']
    let $moduleName := 
        switch ($identModule)
        case '01' return 'I'
        case '02' return 'II'
        case '03' return 'III'
        default return ''
    let $identVolume := $edition//edirom:identifier[@type = 'volume']
    let $volName := $edition/edirom:editionName/edirom:name[@xml:lang = $lang]
    let $rwaEditionVolIdentString := concat('RWA&#160;', $moduleName, '/', number($identVolume))
    return
        (
            <div class="rwaNavigatorVolIdent">{$rwaEditionVolIdentString}</div>,
            for $elem in $elems
            return
                if(local-name($elem) eq 'navigatorItem')
                then(
                    local:getItem($elem, 1)
                )
                else if(local-name($elem) eq 'navigatorSeparator')
                then(
                    local:getSeparator()
                )
                else if(local-name($elem) eq 'navigatorCategory')
                then(
                    (: check if there are any items in category to show, dependig on (RWA) rules defined in local:getDefinition :)
                    let $category := local:getCategory($elem, 1)
                    return
                        if ($category//div[starts-with(./@class, 'navigatorItem')])
                        then ($category)
                        else ()
                )
                else()
        )
};

let $editionId := request:get-parameter('editionId', '')
let $workId := request:get-parameter('workId', '')
let $edition := doc($editionId)/root()
let $work := $edition/id($workId)
let $navConfig := $work/edirom:navigatorDefinition

return
    local:getDefinition($navConfig, $edition)