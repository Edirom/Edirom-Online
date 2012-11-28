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
:)


(:~
: This module provides library functions for Edirom Online Backend
:
: @author <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
:)
module namespace ee = "http://www.edirom.de/xquery/EdiromEditor";


import module namespace templates="http://exist-db.org/xquery/templates" at "templates.xql";

(:~
 : This function generates the sidenav
 :)
declare function ee:generateSidenav($node as node(), $params as element(parameters)?, $model as item()*) {
    
    let $activePage := request:get-attribute("$exist:resource")
    return
    templates:process(
        <div class="sidenav">
            <ul class="nav nav-pills nav-stacked level1">
                <li class="nav-header">Dashboard</li>
                {ee:generateSidenavItem('index.html', $activePage, 'Home')}
                
                <li class="nav-header">Objects</li>
                {ee:generateSidenavItem('manage-objects.html', $activePage, 'Manage Objects')}
                {ee:generateSidenavItem('xml-editor.html', $activePage, 'Edit Object (XML)')}

                <!--<li class="nav-header">Takte</li>
                {ee:generateSidenavItem('index.html', $activePage, 'Takte anlegen')}
                {ee:generateSidenavItem('index.html', $activePage, 'Taktpositionen markieren')}
                {ee:generateSidenavItem('index.html', $activePage, 'Musik und Faksimile mergen')}
                
                <li class="nav-header">Konkordanzen</li>
                {ee:generateSidenavItem('index.html', $activePage, 'Satzkonkordanzen anlegen')}
                {ee:generateSidenavItem('index.html', $activePage, 'Taktkonkordanzen anlegen')}
                
                <li class="nav-header">Importieren</li>
                {ee:generateSidenavItem('index.html', $activePage, 'Bilder importieren')}
                {ee:generateSidenavItem('index.html', $activePage, 'Texte importieren')}
                {ee:generateSidenavItem('index.html', $activePage, 'Musik importieren')}-->
                
                <li class="nav-header space-above">Administration</li>
                {ee:generateSidenavItem('settings.html', $activePage, 'Settings')}
                {ee:generateSidenavItem('manage-users.html', $activePage, 'Manage Users')}

            </ul>
        </div>,
        $model
  )
};

declare function ee:generateSidenavItem($page as xs:string, $activePage as xs:string, $label as xs:string) as node() {
    <li class="{if($page eq $activePage)then('active')else('')}">
        <a href="{$page}">{$label}</a>
    </li>
};

declare function ee:getXMLEditorTitle($node as node(), $params as element(parameters)?, $model as item()*) {
    let $uri := request:get-parameter('uri', '')
    return
        templates:process(
        
            <h3>XML Editor: {$uri}</h3>,
            $model
        )
};


declare function ee:getXMLEditorSource($node as node(), $params as element(parameters)?, $model as item()*) {
    <input type="hidden" id="editorSourceUri" value="{request:get-parameter('uri', '')}"/>
};