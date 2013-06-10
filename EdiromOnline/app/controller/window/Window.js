/**
 *  Edirom Online
 *  Copyright (C) 2011 The Edirom Project
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
 *
 *  ID: $Id: Window.js 1459 2012-10-15 14:51:16Z niko $
 */
Ext.define('de.edirom.online.controller.window.Window', {

    extend: 'Ext.app.Controller',

    requires: [
        'de.edirom.online.view.window.HeaderView',
        'de.edirom.online.view.window.RenderingView',
        //TODO:'de.edirom.online.view.window.SearchView',
        'de.edirom.online.view.window.XmlView',
        'de.edirom.online.view.window.source.SourceView',
        'de.edirom.online.view.window.text.TextView'
    ],

    views: [
        'window.Window'
    ],

    init: function() {
        this.control({
            'ediromWindow': {
                show: this.onWindowRendered,
                single: true
            }
        });
    },

    onWindowRendered: function(win) {
        var me = this;

        if(win.initialized) return;
        win.initialized = true;

        window.doAJAXRequest('data/xql/getLinkTarget.xql',
            'POST', 
            {
                uri: win.uri
            },
            Ext.bind(function(response){
                var data = response.responseText;
                data = Ext.JSON.decode(data);
                this.onMetaDataLoaded(data, win);
            }, me)
        );
    },

    onMetaDataLoaded: function(config, win) {

        var me = this;
        var views = [];

        Ext.Array.each(config.views, function(view) {

            views.push(this.createView(view.type, {
                window:win,
                type:config.type,
                viewType: view.type,
                viewLabel: view.label,
                defaultView: view.defaultView,
                uri:view.uri
            }));

        }, me);

        config.views = views;
        win.setWindowConfig(config);
    },

    createView: function(type, config) {

        var me = this;

        var id = type;
        var label = (config.viewLabel && config.viewLabel != ''?config.viewLabel:me.getLabel(type));
        var viewClass = me.getViewClass(type);

        return {
            id: id,
            label: label,
            view: Ext.create(viewClass, config)
        };
    },

    getLabel: function(type) {
        switch(type) {
            case 'summaryView': return getLangString('controller.window.Window_summaryView');
            case 'xmlView': return getLangString('controller.window.Window_xmlView');
            case 'sourceView': return getLangString('controller.window.Window_sourceView');
            case 'headerView': return getLangString('controller.window.Window_headerView');
            case 'textView': return getLangString('controller.window.Window_textView');
            case 'annotationView': return getLangString('controller.window.Window_annotationView');
            case 'renderingView': return getLangString('controller.window.Window_renderingView');
            //TODO:case 'searchView': return 'Suche';
        }
    },

    getViewClass: function(type) {
        switch(type) {
            case 'summaryView': return 'de.edirom.online.view.window.SummaryView';
            case 'xmlView': return 'de.edirom.online.view.window.XmlView';
            case 'sourceView': return 'de.edirom.online.view.window.source.SourceView';
            case 'headerView': return 'de.edirom.online.view.window.HeaderView';
            case 'textView': return 'de.edirom.online.view.window.text.TextView';
            case 'annotationView': return 'de.edirom.online.view.window.AnnotationView';
            case 'renderingView': return 'de.edirom.online.view.window.RenderingView';
            //TODO:case 'searchView': return 'de.edirom.online.view.window.SearchView';
        }
    }
});
