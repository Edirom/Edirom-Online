xquery version "1.0";

import module namespace eutil = "http://www.edirom.de/xquery/util" at "data/xqm/util.xqm";

declare variable $exist:path external;
declare variable $exist:resource external;
declare variable $exist:prefix external;
declare variable $exist:controller external;

declare option exist:serialize "method=xhtml media-type=application/xhtml+html";

let $langVal := eutil:getLanguage(request:get-parameter("edition", ""))

return
    if ($exist:path eq "") then
        (: forward missing / to / :)
        <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
            <redirect url="{request:get-uri()}/"/>
        </dispatch>
    else if ($exist:path eq "/") then
        (: redirect root path to index.html :)
        <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
            <redirect url="index.html?lang={$langVal}"/>
        </dispatch>
    else if ($exist:path eq "/index.html") then
        (: forward index.html to index.xql :)
        <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
            <forward url="index.xql">
                <add-parameter name="lang" value="{$langVal}"/>
            </forward>
        </dispatch>
    (:else if (starts-with($exist:path, "/data")) then
        <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
            <!--<redirect url="/exist/restxq{$exist:path}"/>-->
            <forward servlet="RestXqServlet"/>
        </dispatch>:)
    else
        (: everything else is passed through :)
        <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
            <set-attribute name="exist:path" value="{$exist:path}"/>
            <set-attribute name="exist:resource" value="{$exist:resource}"/>
            <set-attribute name="exist:controller" value="{$exist:controller}"/>
            <set-attribute name="exist:prefix" value="{$exist:prefix}"/>
            <cache-control cache="yes"/>
        </dispatch>
