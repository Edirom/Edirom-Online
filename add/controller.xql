xquery version "1.0";

declare variable $exist:path external;
declare variable $exist:resource external;

declare option exist:serialize "method=xhtml media-type=application/xhtml+html";

if ($exist:path eq "") then
    (: forward missing / to / :)
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <redirect url="{request:get-uri()}/"/>
    </dispatch>
else if ($exist:path eq "/") then
    (: redirect root path to index.html :)
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <redirect url="index.html"/>
    </dispatch>
else if ($exist:path eq "/index.html") then
    (: forward index.html to index.xql :)
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <forward url="index.xql"/>
    </dispatch>
(:else if (starts-with($exist:path, "/data")) then
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <!--<redirect url="/exist/restxq{$exist:path}"/>-->
        <forward servlet="RestXqServlet"/>
    </dispatch>:)
else
    (: everything else is passed through :)
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <cache-control cache="yes"/>
    </dispatch>