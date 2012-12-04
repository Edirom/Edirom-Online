/**
 * @fileOverview This file provides common functionality like dialogs and functions for changing tabs
 *
 * @author: <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
 * @version 1.0
 */

/** @namespace The namespace for global objects and functions */

if ( typeof de == 'undefined' ) de = {};
if ( typeof de.edirom == 'undefined' ) de.edirom = {};
if ( typeof de.edirom.server == 'undefined' ) de.edirom.server = {};
if ( typeof de.edirom.server.data == 'undefined' ) de.edirom.server.data = {};

if(de.edirom.server.main.debug) {

    document.write('<script type="text/javascript" src="../data/js/Annotation.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="../data/js/Bar.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="../data/js/Concordance.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="../data/js/Connection.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="../data/js/DataEvent.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="../data/js/DataListener.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="../data/js/Movement.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="../data/js/Page.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="../data/js/Source.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="../data/js/Text.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="../data/js/Work.js?' + de.edirom.server.appVersion + '"></script>');
    
}else {

    document.write('<script src="../data/data-min.js?' + de.edirom.server.appVersion + '" type="text/javascript" charset="utf-8"></script>');

}