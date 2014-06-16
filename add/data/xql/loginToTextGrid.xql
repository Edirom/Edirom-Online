xquery version "3.0";

declare namespace html="http://www.w3.org/1999/xhtml";

let $loginname := request:get-parameter('loginname', '')
let $password := request:get-parameter('password', '')
let $authZinstance := request:get-parameter('authZinstance', 'textgrid-ws3.sub.uni-goettingen.de')

let $login := httpclient:get(xs:anyURI('https://textgridlab.org/1.0/WebAuthN/TextGrid-WebAuth.php?authZinstance=' || $authZinstance || '&amp;loginname=' || $loginname || '&amp;password=' || $password),
                    false(), ())

return
    if($login//html:meta[@name='remote_principal'])
    then(
        let $userName := $login//html:meta[@name='remote_principal']/string(@content)
        let $sessionId := $login//html:meta[@name='rbac_sessionid']/string(@content)
        let $cookie := response:set-cookie('edirom_online_textgrid_username', $userName, (), false(), '.freischuetz-digital.de', '/')
        let $cookie := response:set-cookie('edirom_online_textgrid_sessionId', $sessionId, (), false(), '.freischuetz-digital.de', '/')
        return
            '{success: true, msg: "Login successful", user: "' || $userName || '"}'
    )
    else(
        '{success: false, msg: "Login failed"}'
    )