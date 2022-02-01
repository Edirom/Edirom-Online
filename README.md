# Edirom Online

Edirom Online is a web application written in XQuery and Javascript, and designed for deployment in eXist-db[http://exist-db.org/exist/apps/homepage/index.html](http://exist-db.org/exist/apps/homepage/index.html). It is based on the work of the [_Edirom_-Project](https://edirom.de/edirom-projekt/) that originally was funded by the German Research Foundation (DFG). This software brings paperbased historio-critical editions of music texts to the web.

The software is still under high development and has to be seen as beta software.


Edirom Online depends heavily on the javascript framework ExtJS (<http://www.sencha.com/products/extjs/>) which is included in parts in our code base. We use ExtJS 4.2.1 in the GPL version. Edirom Online also includes the Raphaël javscript library (<http://raphaeljs.com>, MIT License) and the ACE editor (<http://ace.ajax.org>, BSD license).







## Other deployment methods

Please see our documentation in the wiki section: https://github.com/Edirom/Edirom-Online/wiki 

## License

Edirom Online is released to the public under the terms of the [GNU GPL v.3](<http://www.gnu.org/copyleft/gpl.html>) open source license.

<!--
# EdiromOnline/app

This folder contains the javascript files for the application.

# EdiromOnline/resources

This folder contains static resources (typically an `"images"` folder as well).

# EdiromOnline/overrides

This folder contains override classes. All overrides in this folder will be 
automatically included in application builds if the target class of the override
is loaded.

# EdiromOnline/sass/etc

This folder contains misc. support code for sass builds (global functions, 
mixins, etc.)

# EdiromOnline/sass/src

This folder contains sass files defining css rules corresponding to classes
included in the application's javascript code build.  By default, files in this 
folder are mapped to the application's root namespace, 'EdiromOnline'. The
namespace to which files in this directory are matched is controlled by the
app.sass.namespace property in EdiromOnline/.sencha/app/sencha.cfg. 

# EdiromOnline/sass/var

This folder contains sass files defining sass variables corresponding to classes
included in the application's javascript code build.  By default, files in this 
folder are mapped to the application's root namespace, 'EdiromOnline'. The
namespace to which files in this directory are matched is controlled by the
app.sass.namespace property in EdiromOnline/.sencha/app/sencha.cfg. 
-->