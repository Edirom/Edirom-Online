collections.xconf and reindex
Rechte an den Dateien (besonders XQueries)
FunctX-Dependency
/Scaler/* vs. /servlet/Scaler/*



Edirom Online
=============

Table of contents

<ul>
	<li style="margin-top:0;margin-bottom:0;"><a href="#dependencies">Dependencies</a></li>
	<li style="margin-top:0;margin-bottom:0;"><a href="#projectlayout">Project layout</a></li>
	<li style="margin-top:0;margin-bottom:0;"><a href="#setup">Setup</a></li>
	<li style="margin-top:0;margin-bottom:0;"><a href="#license">License</a></li>
</ul>

Edirom Online is a web application written in XQuery and Javascript, based on the work of the _Edirom_-Project (<http://www.edirom.de>) funded by the German Research Foundation (DFG). This software brings paperbased historio-critical editions of musicians handwritings to the pc.

Dependencies
------------

* Jetty Application Server (<http://www.eclipse.org/jetty/>), in Version 7
* eXist-db (<http://www.exist-db.org>), right now we are using trunk because of some features like RestXQ
* Digilib (<http://digilib.berlios.de/>), in Version 1.8.3

Deploy eXist ([eXist deployment documentation](http://www.exist-db.org/exist/deployment.xml#d895e414)) and Digilib as webapps in Jetty.

Start jetty and try <http://localhost:8080> and see if Jetty is available (if you changed the port, don't forget to adjust the URL). We assume that you can access eXist from <http://localhost:8080/exist> and Digilib from <http://localhost:8080/digilib>.

Don't forget to change the admin's password as described here: <http://www.exist-db.org/exist/security.xml#d30081e624>.

In general it should be possible to set up a server environment with Apache Tomcat, too. We never testet it, so we can't say anything about it.

Project layout
--------------

* `EdiromOnline` contains the code of the web application's frontend
* `EdiromEditor` contains the code of the web application's backend
* `EdiromShared` contains resources and scripts used by both web applications

Setup
-----

Either use pre packaged versions of the web applications listed under _Downloads_, check out the source with `git://github.com/Edirom/Edirom-Online.git Edirom-Online` or download an archived version.

###Packaged web applications

###Source code

Use one of the possibilities to access the eXist database (WebDAV, Java Admin Client, etc.) and upload the three directories to the root of the database.

License
-------