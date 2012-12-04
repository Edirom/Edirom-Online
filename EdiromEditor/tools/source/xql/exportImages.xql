xquery version "1.0";
(: 
    @author Daniel R�wenstrunk
:)

declare namespace mei="http://www.edirom.de/ns/mei";
declare namespace tei="http://www.tei-c.org/ns/1.0";
declare namespace image="http://www.edirom.de/ns/image";
declare namespace xlink="http://www.w3.org/1999/xlink";
declare namespace functx = "http://www.functx.com";

declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";

declare function local:getImage($uri) {
    doc(replace($uri, 'xmldb:exist://', ''))/image:image
};

declare function local:getMEI($idsT) {
    for $id in $idsT
    return
        xcollection('/db/contents/sources')//mei:source/id($id)/root()
};

declare function functx:repeat-string($stringToRepeat as xs:string?, $count as xs:integer) as xs:string{

    string-join((for $i in 1 to $count return $stringToRepeat), '')
};

declare function functx:pad-integer-to-length($integerToPad as xs:anyAtomicType?, $length as xs:integer) as xs:string{
       
   if ($length < string-length(string($integerToPad)))
   then error(xs:QName('functx:Integer_Longer_Than_Length'))
   else concat(functx:repeat-string('0', $length - string-length(string($integerToPad))), string($integerToPad))
};
 
let $ids := request:get-parameter('sources', '')
let $workIndex := request:get-parameter('workIndex', '')
let $idsT := tokenize($ids, '__xx__')
let $meiT := local:getMEI($idsT)

return

for $mei at $n in $meiT
return
for $source at $i in $mei/mei:mei/mei:meihead/mei:filedesc/mei:sourcedesc/mei:source
 return
    for $surface at $x in $mei//mei:music/mei:facsimile[@source = $source/@xml:id]/mei:surface
    return
        let $image := local:getImage($surface/mei:graphic[@type='facsimile']/@xlink:href)
        return
            concat(replace(replace(replace($image/@fileOrig, '.jpg', '.edj'), '.JPG', '.edj'), '.jpeg', '.edj'), '__xx__', $image/@file, '__xx__', 'source-', $workIndex, functx:pad-integer-to-length($n, 2))
