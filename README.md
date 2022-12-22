# Edirom Online

Edirom Online is a web application written in XQuery and JavaScript, and designed for deployment in [eXist-db](https://exist-db.org/). It is based on the work of the [_Edirom_-Project](https://edirom.de/edirom-projekt/) that originally was funded by the German Research Foundation (DFG). This software brings paperbased historio-critical editions of music texts to the web.

The software is still under high development and has to be seen as beta software.

## Cloning this repository

Since this repository uses submodules for e.g. fonts, it is necessary to clone the repository with the recursive addition.

```bash
git clone --recursive <project url>
```

If the submodules are not yet present after cloning, you can update them with:

```bash
git submodule update --init --recursive
```

## Dependencies

Edirom Online depends heavily on the JavaScript framework [Ext JS](https://www.sencha.com/products/extjs) which is included in parts in our code base. We use Ext JS 4.2.1 in the GPL version. Edirom Online also includes the Raphaël javscript library (<http://raphaeljs.com>, MIT License) and the ACE editor (<http://ace.ajax.org>, BSD license).

## Contributing

### Building locally

For building Edirom Online you need *Sencha Cmd* installed on your system. You might want to refer to the [Sencha Cmd System Setup](https://docs.sencha.com/cmd/7.5.0/guides/intro_to_cmd.html#intro_to_cmd_-_system_setup) section for more details.

Alternatively we recommend to use a container image for building, e.g. [bwbohl/sencha-cmd](https://github.com/bwbohl/sencha-cmd/pkgs/container/sencha-cmd)

```bash
docker run --rm -it -v /ABSOLUTE/PATH/TO/YOUR/LOCAL/EDIROM-ONLINE/CLONE:/app --name ediBuild ghcr.io/bwbohl/sencha-cmd:latest
```

When you have your system preapared with all Sencha Cmd prerequisites or you have your docker container running you have to execute a sencha build command through calling the build script included in this repository with one of the sencha build-type options (please refer to [sencha app build reference](https://docs.sencha.com/cmd/guides/advanced_cmd/cmd_reference.html#advanced_cmd-_-cmd_reference_-_sencha_app_build) for details), either in your native shell or in the container shell, e.g.:

```bash
./build.sh testing
```

### Testing locally

It is essential to Test your modifications before committing or issuing a pull request. A recommended way is running a local eXist-db v5.3 container and deploying your local build of Edirom Online together with some test-data, e.g. the [Edirom Edition Example](https://github.com/Edirom/EditionExample).

## Other deployment methods

Please see our documentation in the [wiki](https://github.com/Edirom/Edirom-Online/wiki). 

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
