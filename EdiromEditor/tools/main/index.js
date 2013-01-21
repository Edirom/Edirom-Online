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
if ( typeof de.edirom.server.main == 'undefined' ) de.edirom.server.main = {};

de.edirom.server.main.debug = true;

de.edirom.server.appVersion = 'appVersion=' + (new Date()).getTime();
if(window.location.search.match(/appVersion=[^&]+/))
    de.edirom.server.appVersion = window.location.search.match(/appVersion=[^&]+/)[0];



document.write('<script src="../main/js/scriptaculous/prototype.js?' + de.edirom.server.appVersion + '" type="text/javascript" charset="utf-8"></script>');
document.write('<script src="../main/js/scriptaculous/scriptaculous.js?' + de.edirom.server.appVersion + '&load=effects,dragdrop,slider" type="text/javascript"></script>');
document.write('<script src="../main/js/marqueetool/rectmarquee.js?' + de.edirom.server.appVersion + '" type="text/javascript"></script>');
document.write('<script src="../main/js/raphael/raphael-min.js?' + de.edirom.server.appVersion + '" type="text/javascript"></script>');
document.write('<link rel="stylesheet" href="../main/js/marqueetool/marker.css?' + de.edirom.server.appVersion + '" media="all" charset="utf-8" />');



if(de.edirom.server.main.debug) {

    document.write('<link rel="stylesheet" href="../main/css/main.css?' + de.edirom.server.appVersion + '" media="all" charset="utf-8" />');
    document.write('<link rel="stylesheet" href="../main/css/objectHeadframe.css?' + de.edirom.server.appVersion + '" media="all" charset="utf-8" />');
    document.write('<link rel="stylesheet" href="../main/css/objectHeading.css?' + de.edirom.server.appVersion + '" media="all" charset="utf-8" />');
    document.write('<link rel="stylesheet" href="../main/css/objectToolbar.css?' + de.edirom.server.appVersion + '" media="all" charset="utf-8" />');
    document.write('<link rel="stylesheet" href="../main/css/objectTabBox.css?' + de.edirom.server.appVersion + '" media="all" charset="utf-8" />');
    document.write('<link rel="stylesheet" href="../main/css/objectViewSwitch.css?' + de.edirom.server.appVersion + '" media="all" charset="utf-8" />');
    document.write('<link rel="stylesheet" href="../main/css/createObjectWizard.css?' + de.edirom.server.appVersion + '" media="all" charset="utf-8" />');
    document.write('<link rel="stylesheet" href="../main/css/objectPicker.css?' + de.edirom.server.appVersion + '" media="all" charset="utf-8" />');
    document.write('<link rel="stylesheet" href="../main/css/popup.css?' + de.edirom.server.appVersion + '" media="all" charset="utf-8" />');
    document.write('<link rel="stylesheet" href="../main/css/ediromDetailContent.css?' + de.edirom.server.appVersion + '" media="all" charset="utf-8" />');
    document.write('<link rel="stylesheet" href="../main/css/scrolling.css?' + de.edirom.server.appVersion + '" media="all" charset="utf-8" />');
    document.write('<link rel="stylesheet" href="../main/css/tabs.css?' + de.edirom.server.appVersion + '" media="all" charset="utf-8" />');
    document.write('<link rel="stylesheet" href="../main/css/proto.menu.css?' + de.edirom.server.appVersion + '" media="all" charset="utf-8" />');
    document.write('<link rel="stylesheet" href="../main/css/dropdown.css?' + de.edirom.server.appVersion + '" media="all" charset="utf-8" />');
    document.write('<link rel="stylesheet" href="../main/css/indicator.css?' + de.edirom.server.appVersion + '" media="all" charset="utf-8" />');



    document.write('<script type="text/javascript" src="../main/js/main.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="../main/js/Action.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="../main/js/AddObjectCommand.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="../main/js/ChangeFieldCommand.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="../main/js/CommandController.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="../main/js/Content.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="../main/js/createObjectWizard.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="../main/js/DigilibViewer.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="../main/js/DropDown.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="../main/js/FacsimileViewer.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="../main/js/GroupCommand.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="../main/js/Indicator.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="../main/js/LinkedHashMap.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="../main/js/Math.uuid.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="../main/js/Module.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="../main/js/MoveObjectCommand.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="../main/js/ObjectPicker.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="../main/js/proto.menu.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="../main/js/RemoveObjectCommand.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="../main/js/Scrolling.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="../main/js/ShortcutController.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="../main/js/Sidebar.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="../main/js/SidebarContent.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="../main/js/TabBar.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="../main/js/Tabs.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="../main/js/Toolbar.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="../main/js/UndoCommand.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="../main/js/Util.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="../main/js/Util2.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="../main/js/View.js?' + de.edirom.server.appVersion + '"></script>');
    document.write('<script type="text/javascript" src="../main/js/VisibilityListener.js?' + de.edirom.server.appVersion + '"></script>');
    
}else {

    document.write('<link rel="stylesheet" href="../main/main-min.css?' + de.edirom.server.appVersion + '" media="all" charset="utf-8" />');

    document.write('<script src="../main/main-min.js?' + de.edirom.server.appVersion + '" type="text/javascript" charset="utf-8"></script>');

}