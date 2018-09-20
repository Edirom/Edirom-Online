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

declare namespace request="http://exist-db.org/xquery/request";
declare namespace edirom="http://www.edirom.de/ns/1.3";
declare namespace xlink="http://www.w3.org/1999/xlink";

declare namespace xmldb="http://exist-db.org/xquery/xmldb";

declare option exist:serialize "method=xhtml media-type=text/html omit-xml-declaration=yes indent=yes";

declare function local:getScores($work) {
    array:for-each(map:get($work, 'sources'), function($source) {
        <div class="navigatorItem" onclick="loadLink('asp-backend://sheet/{ map:get($source, 'id') }', {{}})">{ map:get($source, 'name') }</div>
    })
};

declare variable $lang := request:get-parameter('lang', '');

let $editionId := request:get-parameter('editionId', '')
let $workId := request:get-parameter('workId', '')
let $lang := request:get-parameter('lang', 'de')

let $api := 'http://nashira.upb.de:5001/work/' || $workId
let $work := json-doc($api)

return
    <div>

<div class="navigatorCategory" id="navCategory-10101">
    <div class="navigatorCategoryTitle">Edition ZenMEM Backend</div>
    <div id="navCategory-10101-items" class="">
        <div class="navigatorItem" id="navItem-10101" onclick="loadLink('asp-backend://work/{ $workId }', {{}})">{ map:get($work, 'title') }</div>
    </div>
</div>
<div class="navigatorSeparator"></div>
<div class="navigatorCategory" id="navCategory-0101">
    <div class="navigatorCategoryTitle">{ if($lang = 'de') then 'Notentexte' else 'Scores' }</div>
    <div id="navCategory-0101-items" class="">
    {
        local:getScores($work)
    }
    </div>
</div>
<div class="navigatorCategory" id="navCategory-21">
    <div class="navigatorCategoryTitle">{ if($lang = 'de') then 'Kritischer Bericht' else 'Critical Report' }</div>
    <div id="navCategory-21-items" class="">
        <div class="navigatorItem" id="navItem-22" onclick="loadLink('xmldb:exist:///db/apps/zenmem-backend/annotations.xml', {{}})">{ if($lang = 'de') then 'Anmerkungen' else 'Annotations' }</div>
    </div>
</div>
<div class="navigatorSeparator"></div>
<div class="navigatorCategory" id="navCategory-932">
    <div class="navigatorCategoryTitle">{ if($lang = 'de') then 'Einstellungen und Hilfe' else 'Settings and Help' }</div>
    <div id="navCategory-932-items" class="">
        <div class="navigatorItem" id="navItem-934" onclick="EdiromOnline.getApplication().getController('desktop.TaskBar').onSwitchLanguage()">
            <i xmlns="http://www.edirom.de/ns/1.3" class="fa fa-flag" style="margin-right: 7px;" aria-hidden="true"></i>{ if($lang = 'de') then 'Sprache auf Englisch umschalten' else 'Switch language to German' }</div>
        <div class="navigatorItem" id="navItem-935" onclick="loadLink('xmldb:exist:///db/apps/zenmem-backend/first-steps.xml', {{}})">{ if($lang = 'de') then 'Kurzanleitung' else 'Short help' }</div>
    </div>
</div>
<div class="navigatorSeparator"></div>
<div class="navigatorItem" id="" onclick="loadLink('xmldb:exist:///db/apps/zenmem-backend/imprint.xml', {{}})">{ if($lang = 'de') then 'Impressum' else 'Imprint' }</div>
</div>