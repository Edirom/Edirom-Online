# Setup Edirom-Online

**!!! PLEASE NOTE: The following instructions are taken from the wiki, where in former times of Edirom-Online the technical documentation was living. 
This is changing during the v1.0.0 release. The content of the technical documentation is moving to edirom-online/docs and updated and enhanced. This current file is existing only temporarily at this place and will be removed in future releases.
But it is kept for now in concerns of older releases and to have it captured in the commit-history. Thanks to its commit history this file can be consulted anytime while using the v1.0.0 release package.
Just for information: Content below every first level topic was its own wiki-page. The latest updates to the technical documentation in the wiki were made in 2017, detailed dates below every first level topic.!!!**

- [Getting Edirom-Online](#getting-edirom-online)
  * [Edirom-Online as a service](#edirom-online-as-a-service)
    + [Installing components](#installing-components)
    + [Installing Edirom-Online](#installing-edirom-online)
      - [Prerequisites](#prerequisites)
      - [Download, configure, build and install Edirom-Online](#download--configure--build-and-install-edirom-online)
        * [Configure](#configure)
        * [Build](#build)
        * [Install](#install)
- [Build Process](#build-process)
- [Problems with the Edirom Online Wrapper](#problems-with-the-edirom-online-wrapper)
- [Installing components on OS X](#installing-components-on-os-x)
  * [Preparing your system](#preparing-your-system)
  * [Install and configure eXist-db](#install-and-configure-exist-db)
  * [Install and configure the Jetty Application Server](#install-and-configure-the-jetty-application-server)
  * [Install and configure Digilib](#install-and-configure-digilib)
- [Preparing your content for Edirom Online](#preparing-your-content-for-edirom-online)
  * [Overview](#overview)
  * [Exporting your edition's data](#exporting-your-edition-s-data)
- [Getting your content into Edirom Online](#getting-your-content-into-edirom-online)
  * [Prerequisites](#prerequisites-1)
  * [Importing your edition's data to eXist-db](#importing-your-edition-s-data-to-exist-db)
  * [Importing your edition's image files to Digilib](#importing-your-edition-s-image-files-to-digilib)
    + [Optional: Advanced image handling](#optional--advanced-image-handling)

# Getting Edirom-Online
*(last modification of this section in the wiki 17.1.2017)*

You have two different options. Installing Edirom-Online as a web service on your server/computer or using it as desktop application which will be provided for download in the future.

## Edirom-Online as a service

To run Edirom-Online as a service you have to install the following components: 

* Jetty Application Server (<http://www.eclipse.org/jetty/>), in the newest version (tested with version 9.2.3)
* eXist-db (<http://www.exist-db.org>), in the newest version (tested with version 2.2)
* Digilib (<http://digilib.sourceforge.net/>), in the newest version (tested with version 2.2)
* Apache with mod_proxy (<http://httpd.apache.org/docs/current/mod/mod_proxy.html>)

Install eXist-db and Digilib on different ports. We use Jetty as application server for Digilib, others should work, too. You will find step-by-step guides for different platforms in the following sections.

### Installing components

* Linux
* [Mac OS X](Installing-components-on-OS-X)
* Windows

### Installing Edirom-Online

#### Prerequisites

Edirom Online depends heavily on the javascript framework [ExtJS](http://www.sencha.com/products/extjs/) by Sencha which is included in parts in our code base. We use ExtJS 4.2.1 in the GPL version. To configure and customize Edirom-Online you will need [Sencha Cmd](http://www.sencha.com/products/sencha-cmd/). Please download and install Version 4.0.4.84 from [this site](http://www.sencha.com/products/sencha-cmd/download/) at "Related Links". For further information see [Sencha Cmd documentation](http://docs.sencha.com/cmd/5.x/intro_to_cmd.html).

We assume, that you have Secha Cmd installed in your home directory at ~/bin and that you have edited your PATH environmental variable as follows:

* Edit or create _.profile_: `nano ~/.profile` on macOS Sierra `nano ~/.bash_profile` respectively

* Insert the line: `export PATH=~/[YourUser]/bin/Sencha/Cmd/4.0.4.84:$PATH`

#### Download, configure, build and install Edirom-Online

* Optional: Fork Edirom-Online for your project and download or check out the code from there (see next step).

* Download or check out [Edirom-Online](https://github.com/Edirom/Edirom-Online.git) to a local directory of your choice.

* [Prepare your edition content for Edirom-Online using Edirom-Editor](Preparing-your-content-for-Edirom-Online).

* [Copy your edition content (MEI, TEI and image files)](Getting-your-content-into-Edirom-Online) to the appropriate locations.

##### Configure

* Go to `[PathToYourEdirom-OnlineDirectory]/app/Application.js` and edit l. 61 and 62 to point to your edition's content in eXist-db:

```XML
activeEdition: 'xmldb:exist:///db/contents/[PathToYourEdition.xml]',
activeWork: 'edirom_work_[WorkID]',
```
___

Following our [instructions](Getting-your-content-into-Edirom-Online) this should be equal to:

```XML
activeEdition: 'xmldb:exist:///db/contents/edition-MyEdition.xml',
activeWork: 'edirom_work_[WorkID]',
```
___

* Go to `[PathToYourEdirom-OnlineDirectory]/app/view/window/image/ImageViewer.js` and change l. 45 to:

```JavaScript
imgPrefix: 'http://[IP_or_DomainOfJettyDigilib]:[Port]/digilib/Scaler/'
```

* Go to `[PathToYourEdirom-OnlineDirectory]/add/data/prefs/edirom-prefs.xml` and change l. 28 to:
        
```XML
<entry key="image_prefix" value="http://[IP_or_DomainOfJettyDigilib]:[Port]/digilib/Scaler/"/>
```


##### Build
		
* Go to `[PathToYourEdirom-OnlineDirectory]/` and build Edirom-Online by typing: `./build.sh`

* After building you will find your Edirom-Online application package in `[PathToYourEdirom-OnlineDirectory]/build-xar/Edirom-Online-0.1-[DateAndTimeOfBuild].xar`

##### Install

* Open your eXist-db dashboard at _http://[IP_or_DomainOfeXist-db]:8080_, authenticate as admin and open the _Package Manager_.

* Install your Edirom-Online by clicking on the blue "+"-button in the upper left corner of _Package Manager_ and upload your Edirom-Online xar file.

* When the upload has finished close _Package Manager_. You will find a new application icon _"Edirom Online"_ in your eXist-db dashboard. By clicking on it your Edirom-Online should start in a new browser window or tab.

# Build Process
*(last modification of this section in the wiki 31.6.2016)*
* **How can I debug Edirom Online?** Prior to building the app go to `[PathToYourEdirom-OnlineSourceDirectory]/index.html` and change l. 38 to `<script src="ext/ext-debug.js"></script>`. Then build and upload the app and use Firefox/Firebug to debug your code.

# Problems with the Edirom Online Wrapper
*(last modification of this section in the wiki 19.2.2015)*
_Problem_: **On a Windows computer the Edirom Online starts, but the edition is not shown**

_Description_: On Windows machines sometimes the default program for Javascript files is changed. Javascript is used to start the internal server. In most cases, when this error occures, the file `startServer.js` is opened in a text editor or another program. In this case the internal server for Edirom Online is not started correctly.

_Solution_: The default program for Javascript files has to be reset in the registry. 1. Type `regedit` in the command prompt to access the registry. 2. Change the default value of the key `HKEY_CLASSES_ROOT\.js` to the string `JSFile`

# Installing components on OS X
*(last modification of this section in the wiki 17.1.2017)*

This step-by-step guide reflects the installation of the needed components on a Mac running **OS X 10.9.5** Mavericks.

## Preparing your system

Perform all needed system updates and install Java. Until OS X 10.9 Apple provided its own Java (1.6) implementation as an optional installation aside the newer Java releases by Oracle (1.7/1.8). From OS X 10.10 onwards you are guided to the Oracle Java download pages (https://www.java.com/de/download/). Nevertheless which version of OS X you are using, please make sure to have the most current release of Java installed.

## Install and configure eXist-db

Download the installer. To install eXist-db respectively Edirom-Online on a (probably "headless") Server we take the JAR-file of the current stable release of eXist-db: http://sourceforge.net/projects/exist/files/Stable/.

Create the directory `/Library/eXist` and install eXist-db into it by following the instructions for headless installation in the eXist-db [Documentation](http://exist-db.org/exist/apps/doc/documentation.xml) section [Advanced Installation Methods](http://exist-db.org/exist/apps/doc/advanced-installation.xml#headless). To automatically start eXist-db at system startup it is important to run the command
`sudo /Library/eXist/tools/wrapper/bin/exist.sh install` after installation. This will create and load a LaunchDaemon named `org.eXist-db.wrapper.eXist-db.plist` in `/Library/LaunchDaemons`.

Create a daemon user _eXist_ which will be responsible for running eXist-db. You can do this manually in the _User_ section of _System Preferences_. A more convenient possibility is to use a script provided [here](http://serverfault.com/a/532860) (see instructions there). This will create an appropriate OS X daemon user which won't appear in the list of users shown in the GUI.

You can now tell your system to execute eXist-db as user _eXist_:

* Unload the LaunchDaemon: `sudo launchctl unload -w /Library/LaunchDaemons/org.eXist-db.wrapper.eXist-db.plist`

* Change permissions on /Library/eXist: `sudo chown -R _exist:_exist /Library/eXist`

* Edit the LaunchDaemon (`sudo nano /Library/LaunchDaemons/org.eXist-db.wrapper.eXist-db.plist`) and insert the key _UserName_ and the string "_exist". The complete plist file is shown here:

		<?xml version="1.0" encoding="UTF-8"?>
		<!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
		<plist version="1.0">
			<dict>
				<key>Label</key>
				<string>org.eXist-db.wrapper.eXist-db</string>
				<key>ProgramArguments</key>
				<array>
					<string>/Library/eXist/tools/wrapper/bin/./exist.sh</string>
					<string>launchdinternal</string>
				</array>
				<key>UserName</key>
				<string>_exist</string>
				<key>OnDemand</key>
				<true/>
				<key>RunAtLoad</key>
				<true/>
			</dict>
		</plist>

* Make sure that _root_ is still the owner of the plist file: `sudo chown root:wheel /Library/LaunchDaemons/org.eXist-db.wrapper.eXist-db.plist`. Otherwise the LaunchDaemon won't load on system boot.

* Load the LaunchDaemon: `sudo launchctl load -w /Library/LaunchDaemons/org.eXist-db.wrapper.eXist-db.plist`.

You can test your configuration by opening _http://[IP_or_DomainOfeXist-db]:8080_ in your browser. You should now see the eXist-db dashboard.

Optional: You can change the port on which eXist-db respectively the underlying Jetty Application Server ist listening. Open `/Library/eXist/tools/jetty/etc/jetty.xml` and change the value of _jetty.port_ to the desired value in line 38:
		
		<Set name="port"><SystemProperty name="jetty.port" default="8080"/></Set>

See also the section [Troubleshooting – Port Conflicts](http://exist-db.org/exist/apps/doc/troubleshooting.xml#port-conflicts) in the eXist-db Documentation.

After changing the port stop and restart eXist-db by unloading and loading the LaunchDaemon.


## Install and configure the Jetty Application Server

Download your prefered package for the latest stable release from: http://download.eclipse.org/jetty/.

Create the directory `/Library/Jetty` and copy the extracted content of the downloaded package to this directory.

Create the user _jetty_ to run this Jetty instance the same way as in the eXist-db section above.

Change ownership of the directory `/Library/Jetty` to this new user: `sudo chown -R _jetty:_jetty /Library/Jetty`.

To be able to start the Jetty server on system boot, create a new LaunchDaemon plist file: `sudo nano /Library/LaunchDaemons/org.eclipse.jetty.plist`. See the complete plist file here.

		<?xml version="1.0" encoding="UTF-8"?>
		<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
		<plist version="1.0">
			<dict>
        		<key>Label</key>
        		<string>org.eclipse.jetty</string>
        		<key>WorkingDirectory</key>
        		<string>/Library/jetty</string>
        		<key>ProgramArguments</key>
        			<array>
                		<string>/user/bin/java</string>
                		<string>-jar</string>
                		<string>start.jar</string>
        			</array>
        		<key>UserName</key>
        		<string>_jetty</string>
        		<key>RunAtLoad</key>
        		<true/>
        		<key>KeepAlive</key>
        		<false/>
			</dict>
		</plist>

Save the plist file and verify that it is owned by _root_: `sudo chown root:wheel /Library/LaunchDaemons/org.eclipse.jetty.plist`

Because this Jetty server instance will listen to the same port as eXist's build in Jetty Server, we have to change the port here: `sudo nano /Library/jetty/start.d/http.ini`and change the value of _jetty.port_ to _8081_. For more information on this please see [Changing the Jetty Port](http://www.eclipse.org/jetty/documentation/current/quickstart-running-jetty.html#quickstart-changing-jetty-port) in the [Jetty Documentation](http://www.eclipse.org/jetty/documentation/current/).

Now you can load the LauchDaemon to start this Jetty instance: `sudo launchctl load -w /Library/LaunchDaemons/org.eclipse.jetty.plist`. You shold now be able to access the server in your browser on the adress: _http://[localhost_or_IP]:8081_.

## Install and configure Digilib 

Download the latest stable release from: http://sourceforge.net/projects/digilib/files/.

We will install Digilib as a web application provided by the previously installed Jetty Application Server. For further information on installing and configuring Digilib please see the [Digilib Documentation](http://digilib.sourceforge.net/index.html) pages. 

* Stop Jetty: `sudo launchctl unload -w /Library/LaunchDaemons/org.eclipse.jetty.plist`

* Create a directory for the Digilib web application: `sudo mkdir /Library/Jetty/webapps/digilib`

* Copy the downloaded Digilib war file to this directory and extract it: `jar -xf digilib-webapp-2.2.2-srv2.war`

* Delete the war file: `sudo rm /Library/Jetty/webapps/digilib/digilib-webapp-2.2.2-srv2.war`

* Create a directory _contents_ with three subdirectories named _images-100_, _images-50_, _images-25_:

	* `sudo mkdir /Library/Jetty/webapps/digilib/contents`

	* `sudo mkdir /Library/Jetty/webapps/digilib/contents/images-100`

	* `sudo mkdir /Library/Jetty/webapps/digilib/contents/images-50`

	* `sudo mkdir /Library/Jetty/webapps/digilib/contents/images-25`

* Duplicate the configuration file _digilib-config.xml.template_ to _digilib-config.xml_: `sudo cp /Library/Jetty/webapps/digilib/WEB-INF/digilib-config.xml.template /Library/Jetty/webapps/digilib/WEB-INF/digilib-config.xml`

* Edit _digilib-config.xml_ and define the parameter _basedir-list_:
	* `sudo nano /Library/Jetty/webapps/digilib/WEB-INF/digilib-config.xml`
	
	* change the paramaeter `basedir-list` (line 18) to:
		
			<parameter name="basedir-list" value="/Library/Jetty/webapps/digilib/contents/images-100:/Library/Jetty/webapps/digilib/contents/images-50:/Library/Jetty/webapps/digilib/contents/images-25" />

* Copy an example image file to the directory _images-100_.

* Start Jetty: `sudo launchctl load -w /Library/LaunchDaemons/org.eclipse.jetty.plist`

You can now check your Digilib installation by opening _http://[IP_or_DomainOfJettyDigilib]:8081/digilib/_. You should see a list with files and direcories. You should also be able to open _http://[IP_or_DomainOfJettyDigilib]:8081/digilib/digilib.html_, where you will see Digilib's image viewer interface and your example image file. As a third test it should be possible to directly access your image file in the browser at _http://[IP_or_DomainOfJettyDigilib]:8081/digilib/Scaler/[your_image_file]?mo=file_.

You are now ready to install Edirom-Online proceeding the instructions at [Installing Edirom-Online](Getting-Edirom-Online#installing-edirom-online).

# Preparing your content for Edirom Online
*(last modification of this section in the wiki 18.7.2017)*

## Overview
You can prepare content for _Edirom Online_ using the _Edirom Editor_. The released versions of _Edirom Editor_ can be tretrieved from https://github.com/Edirom/Edirom-Editor/releases, please also see https://github.com/Edirom/Edirom-Editor/ for system requirements. Its online help can be found at http://www.edirom.de/EdiromEditor/help/.

Alternatively you can start out from https://github.com/Edirom/EditionExample (currently under development) to give you a first insight into the data model and contents of Edirom Online.

## Exporting your edition's data

Having prepared your content in Edirom-Editor, you have to export your data following these steps:
* Mark one or more works you want to export for Edirom-Online in the library view (main window) and click on the export button in the lower left section (button with the export arrow).
* In the export dialogue choose _Edirom Online_ as the target application, fill in the (optional) requested information and click _Export_. You will then be asked to specify a location on your computer where Edirom-Editor will save the exported data.

To be able to proceed with ["Getting your content into Edirom-Online"](Getting-your-content-into-Edirom-Online) please name the edition _MyEdition_, set the publisher to _Editor_ and choose the image files to be exported, too. After export you should get the following example directory structure:

* contents
 * edition-MyEdition.xml
 * sources
   * edirom_source_[SourceID].xml
   * …
 * works
   * edirom_work_[WorkID].xml
   * …
* images
 * edition-MyEdition
   * edirom_source_[SourceID]
     * [NameOfSourcePicture].jpg
      * …

Depending on the amount of data (structure and images), the export process could last for a while. Export is finished when you are see the library view of Edirom-Editor again.

# Getting your content into Edirom Online
*(last modification of this section in the wiki 17.12.2015)*

## Prerequisites

This guide assumes that you have installed ["Edirom-Online as a service"](Getting-Edirom-Online) and prepared your content following the steps to get the example export data structure in ["Preparing your content for Edirom-Online"](Preparing-your-content-for-Edirom-Online).

## Importing your edition's data to eXist-db

* Open eXist-db's dashboard in your browser and authenticate as admin: _http://[localhost_or_IP]:8080_
* Open _Collections_ to get access to the database contents.
* You should see three directories: _apps_, _contents_ and _system_. If there is no _contents_ directory, create it (third button in the toolbar).
* Go to _contents_ by double-clicking on it.
* Click on _Upload resources_ (last button in the toolbar) and then on _Upload_. Find your exported edition data and go to the there contained _contents_ directory. Choose your _edition-MyEdition.xml_ to be uploaded and do this again for the _sources_ and _works_ directories.

## Importing your edition's image files to Digilib

Copy the exported image files to Digilib: `sudo cp -R [PathToYourExportedData]/images/edition-MyEdition [PathToYourDigilib]/webapps/contents/images-100/`.

You are now prepared to see your edition in Edirom-Online following [these steps](Getting-Edirom-Online#download-build-and-install-edirom-online).

### Optional: Advanced image handling

If you have followed the instructions for ["Edirom-Online as a service"](Getting-Edirom-Online#edirom-online-as-a-service), you will also have directories named _images-50_ and _images-25_ in your Digilib's _contents_ directory. Here you can store resized versions (50% and 25%) of your source images, which then will be selected by Digilib for loading when zoom levels are changed (e.g. in the source view of Edirom-Online). This function mainly accelerates image loading processes.

If you want to use this function, resize the exported images with your preferred image processing application, preserving (!) the directory structure and file names. Copy these two new image sets to _images-50_ and _images-25_ the same way as described above. Edirom-Online will then be able to find the resized images on its own. If you want further information on this, please see Digilib's documentation on ["Directory layout for images"](http://digilib.sourceforge.net/image-directories.html).

