xquery version "3.1";

(:~
 : XQuery for checking that contents of language files are aligned
 :)


(: NAMESPACE DECLARATIONS ================================================== :)

declare namespace edirom="http://www.edirom.de/ns/1.3";
declare namespace output = "http://www.w3.org/2010/xslt-xquery-serialization";

(: OPTION DECLARATIONS ===================================================== :)

declare option output:media-type "application/xml";
declare option output:method "xml";
declare option output:indent "yes";
declare option output:omit-xml-declaration "yes";

(: VARIABLE DECLARATIONS =================================================== :)

declare variable $edirom:language-files-path as xs:string external;


declare function edirom:print-missing-keys() as element()* {
    let $language-files := collection($edirom:language-files-path)
    let $languages := $language-files/langFile/lang 
    return
    
        for $entry in $language-files//entry
        group by $key := $entry/data(@key)
        where count($entry) ne count($language-files)
        let $available := $entry/ancestor::langFile/lang ! string(.)
        let $missing := $languages[not(. = $available)]
        return
            <key missing="{$missing => string-join(' ')}" available="{$available => string-join(' ')}">{$key}</key>
};

<results>{
    edirom:print-missing-keys()
}</results>
