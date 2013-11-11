xquery version "1.0";
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

declare namespace request="http://exist-db.org/xquery/request";
declare namespace edirom="http://www.edirom.de/ns/1.3";
declare namespace xlink="http://www.w3.org/1999/xlink";

declare namespace xmldb="http://exist-db.org/xquery/xmldb";

declare option exist:serialize "method=xhtml media-type=text/html omit-xml-declaration=yes indent=yes";

declare function local:getCategory($category) {


    <div class="navigatorCategory" id="{$category/@xml:id}">
        <div class="navigatorCategoryTitle">
            { $category/edirom:names/edirom:name[1]/text() }
        </div>
        {
            for $elem in $category/edirom:navigatorItem
            return
                local:getItem($elem)
        }
    </div>
};

declare function local:getItem($item) {

    let $target := $item/replace(@targets, '\[.*\]', '')
    let $cfg := concat('{', replace(substring-before($item/substring-after(@targets, '['), ']'), '=', ':'), '}')
    return

    <div class="navigatorItem" id="{$item/@xml:id}" onclick="loadLink('{$target}', {$cfg})">
        { $item//edirom:name[1]/text() }
    </div>
};

declare function local:getSeparator() {

    <div class="navigatorSeparator"></div>
};

declare function local:getDefinition($navConfig) {
    
    let $elems := $navConfig/*
    
    for $elem in $elems
    
    return
        
        if(local-name($elem) eq 'navigatorItem')
        then(
            local:getItem($elem)
        )
        else if(local-name($elem) eq 'navigatorSeparator')
        then(
            local:getSeparator()
        )
        else if(local-name($elem) eq 'navigatorCategory')
        then(
            local:getCategory($elem)
        )
        else()
};

let $editionId := request:get-parameter('editionId', '')
let $workId := request:get-parameter('workId', '')
let $edition := doc($editionId)/root()
let $work := $edition/id($workId)
let $navConfig := $work/edirom:navigatorDefinition

return
    local:getDefinition($navConfig)