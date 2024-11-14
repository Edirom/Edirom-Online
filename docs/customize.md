# Customize Edirom Online

## Annotations
change the **layout** for annotations (3 are predefined), using predefined preferences
* `<entry key="annotation_layout" value="EdiromOnline.view.window.annotationLayouts.AnnotationLayout1"/>`

## CSS
Add a **custom CSS file**, using predefined preferences
* `<entry key="additional_css_path" value="xmldb:exist:///db/apps/baudiData/editions/baudi-14-2b84beeb/edirom/css/style.css"/>`

## Image server ###
**switch the image server** from digilib to openseadragon (IIIF), using predefined preferences
* `<entry key="image_server" value="openseadragon"/>`

## Topbar
change the **logo** of the edition
* edit [`app/view/desktop/TopBar.js`](https://github.com/Edirom/Edirom-Online/blob/f8abab67bd86cb055859be8fdb9965602477e854/app/view/desktop/TopBar.js#L72)
* then edit [`Edirom-Online/packages/eoTheme/sass/var/button/Button.scss`](https://github.com/Edirom/Edirom-Online/blob/f8abab67bd86cb055859be8fdb9965602477e854/packages/eoTheme/sass/var/button/Button.scss#L215)

de/activate **search**
* un/comment [`Edirom-Online/app/view/desktop/TopBar.js`](https://github.com/Edirom/Edirom-Online/blob/f8abab67bd86cb055859be8fdb9965602477e854/app/view/desktop/TopBar.js#L84)

de/activate **work switch**
* un/comment [`Edirom-Online/app/view/desktop/TopBar.js`](https://github.com/Edirom/Edirom-Online/blob/f8abab67bd86cb055859be8fdb9965602477e854/app/view/desktop/TopBar.js#L82)

## Welcome window
**define** a welcome window
* `<entry key="start_documents_uri" value="xmldb:exist:///db/apps/baudiData/editions/baudi-14-2b84beeb/edirom/introduction.xml"/>`

# Customize content

## SVG overlays
Edirom Online offers the possibility to add SVG overlays to source images that can be switched on and off dynamically. Defining such an overlay requires two steps.

**Add SVGs to facsimile**

You have to add the SVG to be displayed as overlay of a page to the respective mei:surface in the mei:facsimile tree, e.g.:

```
<music>
    <facsimile>
        <surface xml:id="edirom_surface_2fcc4e06-393d-4444-91e7-642b910773cd" n="1">
            <svg xmlns="http://www.w3.org/2000/svg" xml:id="overlay1_1" version="1.1" width="4911" height="1716" viewBox="0 0 4911 1716">
                <defs id="defs2989"/>
                <rect x="1057" y="40" width="100" height="100" rx="1093" ry="90" id="rect2995" style="opacity:0.3;fill:#ffe680" onclick="loadLink('xmldb:exist://db/contents/edition-74338556/texts/comment_sinfonia.xml',{})"/>
            </svg>
            ...
        </surface>
    </facsimile>
</music>
```

Please be aware, that Edirom does not provide a tool for generating theses SVGs, you have to use any appropriate image editing software, simple SVGs can easily be created in the XML directly, though. There are several issues that You should take care when creating the SVG.

1. The SVG element has to have an @xml:id in order to associate it with the layer definition. Otherwise it will not be displayed when the layer is being switched on in the Source-View.
2. The SVG should have the exact same proportions as the image file of the page on which it is to be displayed. The easiest way is to give it the exact same pixel dimensions, both in the @widht and @height attributes, and in the @viewbox attribute.
A feature currently under development is adding interactivity to SVG shapes. When ready this will allow to add the @onclick attribute to a shape that could trigger, e.g. loading some Ediron Online content in a new window (see above example).

**Define overlay**

In order to have the overlay displayed as option in a sources's View-Menu resp. Layers-Menu a mei:annot has to be defined in the mei:notesStmt, e.g.

```
<notesStmt>
    <annot type="overlay" xml:id="overlay1" plist="#overlay1_1 #overlay1_68">
        <title>Title to be shown in Menu</title>
    </annot>
</notesStmt>
```

The mei:annot has to be conform to the following issues:
1. @type="overlay"
2. @xml:id has to be present
3. @plist has to contain IDREFs to all SVG elements in the source that shall be associated with the corresponding entry in the View-Menu, i.e. the SVG elements of all facsimile surfaces that shall be displayed when the layer is set visible. Of course the overlay will only display the SVG associated with the source-page currently displayed.

## Windows

**dimensions of content windows**: when opened e.g. from the Navigator, window height is set to the max. desktop height, width is set to x% of the desktop's width. You can set the initial width of every content window by propagating it together with the calling link in the navigator in [edition].xml:
* `<navigatorItem xml:id="navItem-1" sortNo="1  targets="xmldb:exist:///db/contents/PathToYourSourcesFolder/source.xml[width:500]">
    <names>
        <name>Score</name>
    </names>
</navigatorItem>`


# Links

## Links to XML in the eXist-database

These xmldb-uris are generally used by Edirom Online to open contents.

**Link to source**
* opening default view: `xmldb:exist:///ABSOLUTE-PATH-TO-RESOURCE`, e.g. `xmldb:exist:///db/contents/edition-12345678/sources/source1.xml`

**Open a specified location in the source**
* `xmldb:exist:///ABSOLUTE-PATH-TO-RESOURCE#XML-ID`
  * e.g., a page `xmldb:exist:///db/contents/edition-12345678/sources/source1.xml#edirom_surface_87c87e5d-37bc-463d-9f13-6d2940472db2`
  * e.g., a measure `xmldb:exist:///db/apps/contents/musicSources/freidi-musicSource_A.xml#A_mov0_measure11`
  * to specify multiple resources, concatenate their xmldb URIs with `;`: `[xmldb-URI];[xmldb-URI]`

## Links from outside Edirom Online

**Link to Edirom Online**
* Depending on the domain of your deployment, the server setup etc. in a standard local server environment this might be: `http://localhost:8080/exist/apps/EdiromOnline/`
* Link to Edirom Online setting the active edition `http://localhost:8080/exist/apps/EdiromOnline?edition=[EDITION-ID]`
* Link to Edirom Online setting the active work `http://localhost:8080/exist/apps/EdiromOnline?work=[WORK-ID]` This will automatically also set the `activeEdition`.

**Link to Edirom Online opening a specified window/object**
* In addition to the above 'link to Edirom Online' use the `uri` parameter to supply a xmldb-uri ([see above](#Links-to-xml-in-the-exist-database)) to the database content that should be opened in Edirom Online, e.g.: `http://localhost:8080/exist/apps/EdiromOnline/?uri=xmldb:exist:///db/apps/contents/audioSources/freidi-recording_Janowski1994.xml`
* Edirom Online will open the objects in their respective default view and window size.

**Link to Edirom Online opening multiple specified windows/objects**
* As the above plus append additional resource-links separated by `;`, e.g.: `http://localhost:8080/exist/apps/EdiromOnline/?uri=xmldb:exist:///db/apps/contents/audioSources/freidi-recording_Janowski1994.xml;xmldb:exist:///db/apps/contents/librettoSources/freidi-librettoSource_KA-tx4.xml`

## JS

The function-handling links in Edirom Online are defined by the [app/controller/LinkController.js](https://github.com/Edirom/Edirom-Online/blob/develop/app/controller/LinkController.js) as follows:
```js
loadLink: function(uri, cfg){ ... }
```

The two parameters given are:
* **uri** any uri may be entered; nevertheless there are mechanisms for relative or absolute links and some special cases for certain 'protocols' such as 'edirom:' or 'xmldb:exist' 
* **cfg** is an JS object containing various options for defining things such as opening a link in a new Edirom Online window or defining width of the openend window.

***Examples***

* open **object window** in default view with default parameters
```js
loadLink('xmldb:exist:///db/apps/contents/audioSources/freidi-recording_Janowski1994.xml',{});
```
* open **target element** in its default view (e.g. open a specific measure of a music source in measureBasedView)
```js
loadLink('xmldb:exist:///db/apps/contents/musicSources/freidi-musicSource_A.xml#A_mov0_measure11',{});
```
* open object window in default view with **defined window width**
```js
loadLink('xmldb:exist:///db/apps/contents/audioSources/freidi-recording_Janowski1994.xml',{width:'600px'});
```
* **Update a window** that’s already displaying a resource
  * If the resource is not open in any window a new window will be opened
  ```js
  window.parent.loadLink('xmldb:exist:///db/apps/contents/musicSources/freidi-musicSource_A.xml#A_mov0_measure11', {useExisting:true});
  ```
  * If the resource is not open in any window, ignore the link
  ```js
  window.parent.loadLink('xmldb:exist:///db/apps/contents/musicSources/freidi-musicSource_A.xml#A_mov0_measure11', {onlyExisting:true});
  ```
* Open **multiple resources**
```js
window.parent.loadLink('xmldb:exist:///db/apps/contents/audioSources/freidi-recording_Janowski1994.xml;xmldb:exist:///db/apps/contents/musicSources/freidi-musicSource_A.xml#A_mov0_measure11');
```
  * Additionally sort the resources after they have been opened (at the moment this option only supports the `sortGrid` option)
  ```js
  window.parent.loadLink('xmldb:exist:///db/apps/contents/audioSources/freidi-recording_Janowski1994.xml', {sort:’sortGrid'});
  ```
  * If at the same instance windows that are already opened (array of window-objects) should be included in the sort. This is  used with the "open all" Button in annotation windows to include the annotation window in the sort
  ```js
  window.parent.loadLink('xmldb:exist:///db/apps/contents/audioSources/freidi-recording_Janowski1994.xml', {sort:’sortGrid’,sortIncludes:[win1,win2]});
  ```
