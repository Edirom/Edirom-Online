declare namespace system="http://exist-db.org/xquery/system";

let $params :=
 <parameters>
   <param name="output" value="/var/tmp"/>
    <param name="backup" value="yes"/>
    <param name="incremental" value="no"/>
 </parameters>
 return
    system:trigger-system-task("org.exist.storage.ConsistencyCheckTask", $params)
