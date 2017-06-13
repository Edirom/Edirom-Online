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

declare option exist:serialize "method=xhtml media-type=text/html omit-xml-declaration=yes indent=yes";

let $lang := request:get-parameter('lang', '')
let $idPrefix := request:get-parameter('idPrefix', '')

let $base := replace(system:get-module-load-path(), 'embedded-eXist-server', '') (:TODO:)

let $doc := doc(concat('../../help/help_', $lang, '.xml'))

let $xsl := doc('../xslt/edirom_langReplacement.xsl')
let $doc := transform:transform($doc, $xsl, <parameters><param name="base" value="{concat($base, '/../xslt/')}"/><param name="lang" value="{$lang}"/></parameters>)

let $xsl := doc('../xslt/teiBody2HTML.xsl')
let $doc := transform:transform($doc, $xsl, <parameters><param name="base" value="{concat($base, '/../xslt/')}"/><param name="lang" value="{$lang}"/><param name="tocDepth" value="1"/><param name="graphicsPrefix" value="help/"/></parameters>)

return
    transform:transform($doc, doc('../xslt/edirom_idPrefix.xsl'), <parameters><param name="idPrefix" value="{$idPrefix}"/></parameters>)