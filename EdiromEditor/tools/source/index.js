/**
 * @fileOverview This file provides common functionality used in source windows
 *
 * @author: <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
 * @version 1.0
 */

if(de.edirom.server.main.debug) {

    document.write('<link rel="stylesheet" href="css/sidebar.css?' + de.edirom.server.appVersion + '" media="all" charset="utf-8"></link>');
    document.write('<link rel="stylesheet" href="css/source.css?' + de.edirom.server.appVersion + '" media="all" charset="utf-8"></link>');
    document.write('<link rel="stylesheet" href="FacsimileView/css/facsimileToolbar.css?' + de.edirom.server.appVersion + '" media="all" charset="utf-8"></link>');
    document.write('<link rel="stylesheet" href="FacsimileView/css/facsimileView.css?' + de.edirom.server.appVersion + '" media="all" charset="utf-8"></link>');
    document.write('<link rel="stylesheet" href="FacsimileView/css/measures.css?' + de.edirom.server.appVersion + '" media="all" charset="utf-8"></link>');
    document.write('<link rel="stylesheet" href="FacsimileView/css/selectarea.css?' + de.edirom.server.appVersion + '" media="all" charset="utf-8"></link>');
    document.write('<link rel="stylesheet" href="InformationView/css/informationView.css?' + de.edirom.server.appVersion + '" media="all" charset="utf-8"></link>');
    

    document.write('<script type="text/javascript" src="js/source.js?' + de.edirom.server.appVersion + '"></script>');

    document.write('<script type="text/javascript" src="InformationView/js/Bars.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="InformationView/js/BarsAction.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="InformationView/js/Description.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="InformationView/js/InformationView.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="InformationView/js/Overview.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="InformationView/js/Pages.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="InformationView/js/RenamePagesAction.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="InformationView/js/Structure.js?' + de.edirom.server.appVersion + '"></script>');
    
    document.write('<script type="text/javascript" src="FacsimileView/js/Facsimile.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="FacsimileView/js/FacsimileMarkAction.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="FacsimileView/js/FacsimileMarkSidebarContent.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="FacsimileView/js/FacsimileView.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="FacsimileView/js/Marquee.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="FacsimileView/js/PageAction.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="FacsimileView/js/ResetFacsimileViewAction.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="FacsimileView/js/ShowBarsAction.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="FacsimileView/js/ZoomAction.js?' + de.edirom.server.appVersion + '"></script>');
    
    document.write('<script type="text/javascript" src="XMLView/js/XMLView.js?' + de.edirom.server.appVersion + '"></script>');

}else {
    
    document.write('<link rel="stylesheet" href="source-min.css?' + de.edirom.server.appVersion + '" media="all" charset="utf-8" />');

    document.write('<script src="source-min.js?' + de.edirom.server.appVersion + '" type="text/javascript" charset="utf-8"></script>');
    //document.write('<script src="source.js" type="text/javascript" charset="utf-8"></script>');
}
