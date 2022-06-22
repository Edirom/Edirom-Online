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
        'CookieController',
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
        'window.iFrameView',
        'window.WindowController',
        'window.XmlView',
        'window.concordanceNavigator.ConcordanceNavigator',
        'window.audio.AudioView',
        'window.search.SearchWindow',
        'window.source.SourceView',
        'window.source.PageBasedView',
        'window.source.MeasureBasedView',
        'window.source.VerovioView',
        'window.text.FacsimileView',
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
    
    activeEdition: '',
    activeWork: '', 

    launch: function() {
        var me = this;
        
        window.getActiveEdition = Ext.bind(this.getActiveEdition, this);

        me.addEvents('workSelected');
        
        var editionParam = me.getURLParameter('edition');
        if(editionParam !== null)
            me.activeEdition = editionParam;
        
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
        
        var workParam = me.getURLParameter('work');
        if(workParam !== null)
            me.activeWork = workParam;
        
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
        me.getController('LanguageController').initLangFile(me.activeEdition, 'de');
        me.getController('LanguageController').initLangFile(me.activeEdition, 'en');
        me.initDataStores();

        var app = Ext.create('EdiromOnline.view.desktop.App', {app: this});

        var match,
            pl     = /\+/g,  // Regex for replacing addition symbol with a space
            search = /([^&=]+)=?([^&]*)/g,
            decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
            query  = window.location.search.substring(1);

        urlParams = {};
        while (match = search.exec(query))
            urlParams[decode(match[1])] = decode(match[2]);
            
        if(typeof urlParams.uri != 'undefined') {
            if(window.location.hash != '')
                urlParams.uri = urlParams.uri + window.location.hash; 
        
            app.on('ready', Ext.bind(window.loadLink, me, [urlParams.uri, {sort:'sortGrid'}], false), me, {single: true});
        }else {
            app.on('ready', Ext.bind(me.openStartDocuments, me), me, {single: true});
        }
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

        works.getProxy().extraParams = {editionId: this.activeEdition, lang: getPreference('application_language')};
        works.load();
    },
    
    getActiveEdition: function() {
        return this.activeEdition;
    },
    
    selectEdition: function(editionId) {
        this.activeEdition = editionId;
        this.fireEvent('editionSelected', editionId);
        window.open(window.location.pathname + '?edition=' + editionId, "_self");
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
	},
	
	getURLParameter: function(parameter) {
        return decodeURIComponent((new RegExp('[?|&]' + parameter + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
    },
    
    openStartDocuments: function() {
        var me = this;
        var uris = me.getController('PreferenceController').getPreference('start_documents_uri');
        window.loadLink(uris);
    }
});
