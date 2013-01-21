Edirom Online
=============

Table of contents

<ul>
	<li style="margin-top:0;margin-bottom:0;"><a href="#dependencies">Dependencies</a></li>
	<li style="margin-top:0;margin-bottom:0;"><a href="#projectlayout">Project layout</a></li>
	<li style="margin-top:0;margin-bottom:0;"><a href="#setup">Setup</a></li>
	<li style="margin-top:0;margin-bottom:0;"><a href="#setupcontent">Setup Content</a></li>
	<li style="margin-top:0;margin-bottom:0;"><a href="#development">Development</a></li>
	<li style="margin-top:0;margin-bottom:0;"><a href="#license">License</a></li>
</ul>

Edirom Online is a web application written in XQuery and Javascript, based on the work of the _Edirom_-Project (<http://www.edirom.de>) funded by the German Research Foundation (DFG). This software brings paperbased historio-critical editions of musicians handwritings to the pc.

Edirom Online depends heavily on the javascript framework ExtJS (<http://www.sencha.com/products/extjs/>) which is included in parts in our code base. We use ExtJS 4.0.7 in the GPL version. Edirom Online also includes the Raphaël javscript library (<http://raphaeljs.com>, MIT License) and the ACE editor (<http://ace.ajax.org>, BSD license).

The software is still under high development and has to be seen as beta software.


Dependencies
------------

* Jetty Application Server (<http://www.eclipse.org/jetty/>), in Version 7.3.x, newer versions have caused some problems
* eXist-db (<http://www.exist-db.org>), right now we are using trunk because of some features like RestXQ
* Digilib (<http://digilib.berlios.de/>), in Version 1.8.3

Deploy eXist ([eXist deployment documentation](http://www.exist-db.org/exist/deployment.xml#d895e414)) and Digilib as webapps in Jetty. We normally unpack `.war` archives to have better access to the configuration files, Jetty usually unpacks archives anyway.

Start jetty with `java -jar -Xmx1024m start.jar` (adjust the memory settings as needed) and try <http://localhost:8080> and see if Jetty is available (if you changed the port, don't forget to adjust the URL). We assume that you can access eXist from <http://localhost:8080/exist> and Digilib from <http://localhost:8080/digilib>.

### Set up eXist

The web application uses the _FunctX_ library, so make sure to install the corresponding package in your database (see <http://www.exist-db.org/exist/repo/repo.xml#d30107e361> for a description). 

Don't forget to change the admin's password as described here: <http://www.exist-db.org/exist/security.xml#d30081e624>.

### Set up Digilib

The Digilib archive does not contain the Apache Log4J library, you have to put one in `digilib/WEB-INF/lib` manually (you may use the one shipped with eXist `exist/WEB-INF/lib/log4j-1.2.16.jar`).

At the moment the web application assumes that Digilib's Scaler servlet is accessible from <http://localhost:8080/digilib/Scaler> but Digilib's configuration file `digilib/WEB-INF/web.xml` starts the servlet with following URL <http://localhost:8080/digilib/servlet/Scaler>. You may either change Diglib's configuration file from

    <servlet-mapping>
      <servlet-name>
        Scaler
      </servlet-name>
      <url-pattern>
        /scaler/Scaler/*
      </url-pattern>
    </servlet-mapping>

to 

    <servlet-mapping>
      <servlet-name>
        Scaler
      </servlet-name>
      <url-pattern>
        /Scaler/*
      </url-pattern>
    </servlet-mapping>
    
or change all the variables describing the path to the scaler servlet in all XQueries and XSLTs. These variables will soon be unified in one variable that will be accessible through the future backend.

### Other application servers

In general it should be possible to set up a server environment with Apache Tomcat, too. We never testet it, so we can't say anything about it.


Project layout
--------------

* `docs` additional documentation
* `EdiromEditor` contains the code of the web application's backend (very first draft, don't use it)
* `EdiromOnline` contains the code of the web application's frontend
* `EdiromEditor` contains the code of the web application's backend

Setup
-----

Either use pre packaged versions of the web applications listed under _Downloads_, check out the source with `git://github.com/Edirom/Edirom-Online.git Edirom-Online` or download an archived version.

### Packaged web applications

Coming soon.

### Source code

Use one of the possibilities to access the eXist database (WebDAV, Java Admin Client, oXygen, etc.) and upload the directory `EdiromOnline` to the root of the database.

Create a collection `/db/contents`. This is where all the content files are going to be stored.

Copy the file `collections.xconf` to `/db/system/config/db/contents/collections.xconf` and reindex the collection `/db/contents` (reindexing is only necessary if you already have content in this collection) as described here: <http://www.exist-db.org/exist/indexing.xml#d30093e904>.

All XQueries (`*.xql`) and XQuery Modules (`*.xqm`) have to be executable for everyone, so make sure to set the correct permissions (e.g. `rwxr-xr-x`, see <http://www.exist-db.org/exist/security.xml#permissions>). Expect a script for doing this task to be in place soon.


Setup Content
-------------

The easiest solution is to use our tool _Edirom Editor_ (download at <http://www.edirom.de/software>) and export contents for _Edirom Online_. You will get an output containing the MEI files (in `contents`) and the referenced images (in `images`).

The content of `contents` should go into the collection `/db/contents` in the eXist database. For a more detailed description of the MEI and Edirom structures read [here](<https://github.com/Edirom/Edirom-Online/blob/master/docs/Content.md>).

Put the content of `images` in the folder you specified in Digilib's configuration file `digilib/WEB-INF/digilib-config.xml` for parameter `basedir-list` (e.g. `webapps/digilib/images`). You may want to add reduced versions of the images here, too. You probably have to restart Jetty to make these images available in Digilib.

Point your browser at <http://localhost:8080/exist/apps/EdiromOnline/> and you should see your content inside the Edirom Online web application.


Development
-----------

For instructions how to contribute and how to set up a development environment for Edirom Online extensions and modifications read [here](<https://github.com/Edirom/Edirom-Online/blob/master/docs/Development.md>)


License
-------

Edirom Online is released to the public under the terms of the [GNU GPL v.3](<http://www.gnu.org/copyleft/gpl.html>) open source license.