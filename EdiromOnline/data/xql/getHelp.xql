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

  ID: $Id: getHelp.xql 1455 2012-10-11 10:42:55Z daniel $
:)

declare namespace request="http://exist-db.org/xquery/request";
declare namespace mei="http://www.music-encoding.org/ns/mei";
declare namespace tei="http://www.tei-c.org/ns/1.0";
declare namespace xmldb="http://exist-db.org/xquery/xmldb";
declare namespace system="http://exist-db.org/xquery/system";
declare namespace transform="http://exist-db.org/xquery/transform";

declare option exist:serialize "method=xhtml media-type=text/html omit-xml-declaration=yes indent=yes";

let $viewXtype := request:get-parameter('viewXtype', '')
let $base := concat('file:', system:get-module-load-path(), '/../xslt/')
let $base := concat(replace(system:get-module-load-path(), 'embedded-eXist-server', ''), '/../xslt/') (: TODO: Prüfen, wie wir an dem replace vorbei kommen:)
let $doc := doc(concat('file:', system:get-module-load-path(), '/../../resources/help/',$viewXtype, '.xml'))/root()
let $doc := doc(concat(replace(system:get-module-load-path(), 'embedded-eXist-server', ''), '/../../resources/help/',$viewXtype, '.xml'))/root() (: TODO: Prüfen, wie wir an dem replace vorbei kommen:)
return(
    transform:transform($doc, concat($base, 'teiBody2HTML.xsl'), <parameters><param name="base" value="{$base}"/></parameters>)
(:$base:)
)