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

  ID: $Id: getAnnotationInfos.xql 1261 2012-02-28 15:50:45Z daniel $
:)

declare namespace request="http://exist-db.org/xquery/request";
declare namespace mei="http://www.music-encoding.org/ns/mei";
declare namespace xlink="http://www.w3.org/1999/xlink";

declare namespace xmldb="http://exist-db.org/xquery/xmldb";

declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";


declare function local:getDistinctCategories($annots as element()*) as xs:string* {
    distinct-values(
        for $category in $annots/mei:ptr[@type="categories"]/replace(@target, '#', '')
        return
            tokenize($category, ' ')
    )
};

declare function local:getDistinctPriorities($annots as element()*) as xs:string* {
    distinct-values(
        for $priority in $annots/mei:ptr[@type="priority"]/replace(@target, '#', '')
        return
            tokenize($priority, ' ')
    )
};

let $uri := request:get-parameter('uri', '')
let $mei := doc($uri)/root()
let $annots := collection('/db/contents')//mei:annot[matches(@plist, $uri)] | $mei//mei:annot

return concat('{categories: [',
        string-join(
            for $category in local:getDistinctCategories($annots)
            return
                concat('{id:"', $category, '",name:"', (collection('/db/contents')//id($category))[1]/mei:name/text(),'"}')
        , ','),
        '], priorities: [',
        string-join(
            for $priority in local:getDistinctPriorities($annots)
            return
                concat('{id:"', $priority, '",name:"', (collection('/db/contents')//id($priority))[1]/mei:name/text(),'"}')
        , ','),
        ']}')