/**
 *  Edirom Online
 *  Copyright (C) 2014 The Edirom Project
 *  http://www.edirom.de
 *
 *  Edirom Online is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  Edirom Online is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with Edirom Online.  If not, see <http://www.gnu.org/licenses/>.
 */
Ext.define('EdiromOnline.Application', {
    name: 'EdiromOnline',

    extend: 'Ext.app.Application',

    controllers: [
        'AJAXController',
        'LanguageController',
        'PreferenceController',
        'ToolsController',
        'LinkController',
        'desktop.Desktop',
        'desktop.TaskBar',
        'desktop.TopBar',
        'navigator.Navigator',
        'window.AnnotationView',
        'window.HeaderView',
        'window.HelpWindow',
        'window.SingleWindowController',
        'window.SummaryView',
        'window.WindowController',
        'window.XmlView',
        'window.concordanceNavigator.ConcordanceNavigator',
        'window.search.SearchWindow',
        'window.source.SourceView',
        'window.source.PageBasedView',
        'window.source.MeasureBasedView',
        'window.source.VerovioView',
        'window.text.TextFacsimileSplitView',
        'window.text.TextView'
    ],
    
    models: [
        'EdiromOnline.model.Edition',
        'EdiromOnline.model.Work'
    ],
    
    requires: [
        'EdiromOnline.view.desktop.App'
    ],
    
    //TODO:
    activeEdition: 'xmldb:exist:///db/contents/edition-RWA/edition-RWA.xml',
    activeWork: 'edirom_work_e6de17cf-febd-4fc7-8ead-d3016e97ea55', 

    launch: function() {
        var me = this;
       
        me.addEvents('workSelected');
        
        Ext.Ajax.request({
            url: 'data/xql/getEditionURI.xql',
            async: false,
            method: 'GET',
            params: {
                uri: me.activeEdition
            },success: function(response){
                this.activeEdition = response.responseText;
            },
            scope: this
        });
        
        Ext.Ajax.request({
            url: 'data/xql/getWorkID.xql',
            async: false,
            method: 'GET',
            params: {
                uri: me.activeEdition,
                workId: me.activeWork
            },success: function(response){
                this.activeWork = response.responseText;
            },
            scope: this
        });
        
        me.getController('PreferenceController').initPreferences(me.activeEdition);
        me.getController('LanguageController').initLangFile(me.activeEdition);
        me.initDataStores();

        Ext.create('EdiromOnline.view.desktop.App', {app: this});
    },
    
    initDataStores: function() {

        var edition = Ext.create('Ext.data.Store', {
            model: 'EdiromOnline.model.Edition',
            storeId: 'Editions'
        });

        edition.getProxy().extraParams = {id: this.activeEdition};
        edition.load();

        var works = Ext.create('Ext.data.Store', {
            model: 'EdiromOnline.model.Work',
            storeId: 'Works'
        });

        works.getProxy().extraParams = {editionId: this.activeEdition};
        works.load();
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
});
