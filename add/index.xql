xquery version "3.1";

import module namespace edition = "http://www.edirom.de/xquery/edition" at "data/xqm/edition.xqm";

declare variable $edition := request:get-parameter("edition", "");
declare variable $editionUri := edition:findEdition($edition);
declare variable $preferences := doc(edition:getPreferencesURI($editionUri));

declare option exist:serialize "method=html5 media-type=text/html omit-xml-declaration=yes indent=yes";

comment{"
 *  Edirom Online
 *  Copyright (C) 2014 The Edirom Project
 *  http://www.edirom.de
 *
 *  Edirom Online is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  Edirom Online is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with Edirom Online.  If not, see <http://www.gnu.org/licenses/>.
"
},
<html>
    <head>
        <meta charset="UTF-8"/>
        <title>{edition:getName($editionUri)} – EdiromOnline</title>
        <!-- **CSS** -->
        <link rel="stylesheet" type="text/css" href="resources/css/todo.css"/>
        
        <!-- **CSS** -->
        <link rel="stylesheet" href="resources/css/font-awesome.min.css"/>
        <link rel="stylesheet" type="text/css" href="resources/css/tipped/tipped.css"/>
        
        <!-- **Raphael JS** -->
        <script type="text/javascript" src="resources/js/raphael-min.js"/>
        
        <!-- **Leaflet** -->
        <link rel="stylesheet" href="resources/leaflet-0.7.3/leaflet.css"/>
        <link rel="stylesheet" href="resources/Leaflet.tooltip-master/dist/leaflet.tooltip.css"/>
        <script type="text/javascript" src="resources/leaflet-0.7.3/leaflet.js"/>
        <script type="text/javascript" src="resources/facsimileLayer/FacsimileLayer.js"/>
        <script src="resources/Leaflet.tooltip-master/dist/leaflet.tooltip.js"/>
        
        <!-- **Open Sea Dragon** -->
        <script type="text/javascript" src="resources/js/openseadragon.min.js"/>
        
        <!-- **JQUERY** -->
        <script type="text/javascript" src="resources/jquery/jquery-2.1.3.js" charset="utf-8"/>
        
        <!-- **ACE** -->
        <script src="resources/js/ace/ace.js" type="text/javascript" charset="utf-8"/>
        <script src="resources/js/ace/mode-xml.js" type="text/javascript" charset="utf-8"/>
        
        <link rel="stylesheet" href="resources/EdiromOnline-all.css"/>
        <!-- TODO if prefs css then include here -->
        {
            if ($preferences//entry[@key = "additional_css_path" and @value != ''])
            then
                <link rel="stylesheet" href="{string-join((request:get-context-path(), 'rest', substring-after($preferences//entry[@key = 'additional_css_path']/@value, 'xmldb:exist:///')), '/')}"/>
            else ()
        }
        <script type="text/javascript" src="app.js"/>
        
        <!-- **WHERE TO OPEN LINKS** -->
        <base target="_blank"/>
        
    </head>
    <body>
        <script type="text/javascript" src="resources/js/tipped/tipped.js"/>
    </body>
</html>
