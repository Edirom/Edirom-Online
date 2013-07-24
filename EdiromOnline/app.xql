xquery version "1.0";

(:
 :  Edirom Online
 :  Copyright (C) 2011 The Edirom Project
 :  http://www.edirom.de
 :
 :  Edirom Online is free software: you can redistribute it and/or modify
 :  it under the terms of the GNU General Public License as published by
 :  the Free Software Foundation, either version 3 of the License, or
 :  (at your option) any later version.
 :
 :  Edirom Online is distributed in the hope that it will be useful,
 :  but WITHOUT ANY WARRANTY; without even the implied warranty of
 :  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 :  GNU General Public License for more details.
 :
 :  You should have received a copy of the GNU General Public License
 :  along with Edirom Online.  If not, see <http://www.gnu.org/licenses/>.
 :
 :  ID: $Id: app.js 1396 2012-08-22 12:07:19Z daniel $
 :)
 
declare namespace edirom="http://www.edirom.de/ns/1.3";
 
declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";
 
let $edition := (collection('/db/contents')//edirom:edition)[1]
return
concat("
Ext.application({

    name: 'de.edirom.online',
    appFolder: 'app',

    mixins: {
        observable: 'Ext.util.Observable'
    },

    controllers: [
        'AJAXController',
        'LanguageController',
        'LinkController',
        'PreferenceController',
        'ToolsController',
        'desktop.Desktop',
        'desktop.TaskBar',
        'desktop.TopBar',
        'navigator.Navigator',
        'window.WindowController',
        'window.AnnotationView',
        'window.HeaderView',
        'window.HelpWindow',
        'window.RenderingView',
        'window.SummaryView',
        'window.Window',
        'window.XmlView',
        'window.concordanceNavigator.ConcordanceNavigator',
        'window.search.SearchWindow',
        'window.source.SourceView',
        'window.source.PageBasedView',
        'window.source.MeasureBasedView',
        'window.text.TextView'
    ],

    requires: [
        'Ext.container.Viewport',

        'de.edirom.online.model.Edition',
        'de.edirom.online.model.Work',

        'de.edirom.online.view.desktop.Desktop'
    ],

    events: {},
    listeners: {},

    activeEdition: 'xmldb:exist://", document-uri($edition/root()), "',
    activeWork: '", $edition//edirom:work[1]/@xml:id, "',

    launch: function() {
        var me = this;

        me.addEvents('workSelected');

        this.getController('PreferenceController').initPreferences(me.activeEdition);
        this.getController('LanguageController').initLangFile(me.activeEdition);
        this.initDataStores();

        me.viewport = new Ext.container.Viewport({
            layout: 'fit',
            items: [
                new de.edirom.online.view.desktop.Desktop(this.getDesktopConfig())
            ]
        });
    },

    initDataStores: function() {

        var edition = Ext.create('Ext.data.Store', {
            model: 'de.edirom.online.model.Edition',
            storeId: 'Editions'
        });

        edition.getProxy().extraParams = {id: this.activeEdition};
        edition.load();

        var works = Ext.create('Ext.data.Store', {
            model: 'de.edirom.online.model.Work',
            storeId: 'Works'
        });

        works.getProxy().extraParams = {editionId: this.activeEdition};
        works.load();
    },

    getDesktopConfig: function (num) {
        return {
            app: this
        };
    },

    selectWork: function(workId) {
        this.activeWork = workId;
        this.fireEvent('workSelected', workId);
    },

    callFunctionOfEdition: function(win, fnName, callback, args) {
        var me = this;

        var arguments = Ext.apply({workId: me.activeWork}, args);
        var editions = Ext.getStore('Editions');
        var editionIndex = editions.find('doc', me.activeEdition);
        var edition = editions.getAt(editionIndex);

        edition[fnName](callback, arguments);
    }
});")