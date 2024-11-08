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
    let $languages :=
        $language-files/langFile/lang | (: language files in add/data/locale :)
        $language-files/language/@xml:lang (: language files in add/data/xslt/i18n :)
    return
    
        for $entry in $language-files//entry
        group by $key := $entry/data((@key,@xml:id))
        where count($entry) ne count($language-files)
        let $available :=
        (
            $entry/ancestor::langFile/lang ! string(.), (: language files in add/data/locale :)
            $entry/parent::language/@xml:lang ! string(.) (: language files in add/data/xslt/i18n :)
        )
        let $missing := $languages[not(. = $available)]
        let $duplicates :=
            for $i in $entry
            group by $langkey := ($i/ancestor::langFile/lang, $i/parent::language/@xml:lang)
            where count($i) gt 1
            return $langkey
        return
            if(count($duplicates) gt 0)
            (: duplicate keys :)
            then <key duplicates="{$duplicates => string-join(' ')}">{$key}</key>
            (: missing keys :)
            else <key missing="{$missing => string-join(' ')}" available="{$available => string-join(' ')}">{$key}</key>
};

<results>{
    edirom:print-missing-keys()
}</results>
