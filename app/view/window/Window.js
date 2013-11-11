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
 *  ID: $Id: Window.js 1405 2012-08-24 12:52:56Z daniel $
 */
Ext.define('de.edirom.online.view.window.Window', {

    mixins: {
        observable: 'Ext.util.Observable'
    },

    alias: 'widget.ediromWindow',

    extend: 'Ext.window.Window',

    requires: [
        'Ext.layout.container.Card',
        'de.edirom.online.view.window.TopBar',
        'de.edirom.online.view.window.BottomBar'
    ],

    stateful: false,
    isWindow: true,
    constrainHeader: true,
    minimizable: true,
    maximizable: true,
    layout: 'card',
    activeItem: 0,
    cls: 'ediromWindow',

    border: 0,
    bodyBorder: false,

    padding: 0,
    bodyPadding: 0,

    initComponent: function() {

        this.addEvents('viewSwitched', 'loadInternalLink');

        this.tbar = this.topbar = new de.edirom.online.view.window.TopBar(this.getTopbarConfig());

        /* {id: id, label: label, view: view} */
        this.views = new Array();
        this.items = [
            Ext.create('Ext.panel.Panel', {
                html: '<div class="loader_view">' + getLangString('global_loading') + '</div>'
            })
        ];

        this.callParent();
    },

    setWindowConfig: function(config) {
        var me = this;

        me.setTitle(config['title'] || getLangString('global_unknown'));
        Ext.apply(me, config);

        me.viewRenderCount = me.views.length;

        for(var i = 0; i < me.views.length; i++) {
            var view = me.views[i];
            view.view.on('afterrender', me.onViewRendered, me);
            
            me.topbar.addView(view);
            me.add(view.view);
        }
    },

    onViewRendered: function(view, args) {
        var me = this;
        me.viewRenderCount--;

        if(me.viewRenderCount == 0)
            me.onWindowFinishedRendering();
    },

    onWindowFinishedRendering: function() {
        var me = this;

        var viewToShow = me.views[0].view;
        
        //console.log(me.doc + " " + me.internalIdType + " " + me.internalId);

        for(var i = 0; i < me.views.length; i++) {
            var view = me.views[i].view;
            
            //console.log(view.viewType + " " + view.uri);

            /*if(view.viewType == 'textView' && view.uri.match(/#.+$/))
                view.on('show', Ext.bind(view.scrollToId, view, [view.uri], false), view);*/

            if(me.internalIdType == 'unknown' && view.defaultView)
                viewToShow = view;

            else if(me.internalIdType == 'note' && view.viewType == 'textView' && view.uri == me.doc) {
                view.on('documentLoaded', Ext.bind(view.scrollToId, view, [me.internalId], false), view);
                viewToShow = view;

            }else if(me.internalIdType == 'annot' && view.viewType == 'annotationView') {
                view.on('show', Ext.bind(view.showSingleAnnotation, view, [me.internalId], false), view);
                viewToShow = view;

            }else if(me.internalIdType == 'zone' && view.viewType == 'sourceView') {
                view.on('show', Ext.bind(view.gotoZone, view, [me.internalId], false), view);
                viewToShow = view;

            }else if(me.internalIdType == 'measure' && view.viewType == 'sourceView') {
                view.on('show', Ext.bind(view.gotoMeasure, view, [me.internalId], false), view);
                viewToShow = view;

            }else if((me.internalIdType == 'surface' || me.internalIdType == 'graphic') && view.viewType == 'sourceView') {
                view.on('show', Ext.bind(view.showPage, view, [me.internalId], false), view);
                viewToShow = view;
            
            }else if(view.defaultView) {
                viewToShow = view;
            }
        }
        
        me.requestForActiveView(viewToShow);
    },

    getTopbarConfig: function () {
        var me = this, ret = {
            window: me
        };

        return ret;
    },

    getTopbar: function() {
        return this.topbar;
    },
    
    showView: function(viewType) {

        var me = this;

        for(var i = 0; i < me.views.length; i++) {
            var view = me.views[i].view;

            if(view.viewType == viewType)
                return me.requestForActiveView(view);
        }
    },

    switchView: function(view) {
        var oldView = this.getActiveView();
        
        this.getLayout().setActiveItem(view);
        this.fireEvent('viewSwitched', view, oldView);
    },

    requestForActiveView: function(view) {
        var me = this;

        if(me.getActiveView() != view)
            me.topbar.setActiveView(view);
    },

    getActiveView: function() {
        return this.getLayout().getActiveItem();
    },

    loadInternalId: function(internalId, internalIdType) {

        var me = this;
        me.internalId = internalId;
        me.internalIdType = internalIdType;

        me.fireEvent('loadInternalLink');
    },
    
    getContentConfig: function() {
        var me = this;
        var viewContentConfigs = {};
        
        Ext.Array.each(me.views, function(view) {
            if(typeof view.view.getContentConfig != 'undefined')
                viewContentConfigs[view.view.id] = view.view.getContentConfig();
        });
        
        return {
            id: this.id,
            views: viewContentConfigs
        };
    },
    
    setContentConfig: function(config) {
        var me = this;
        var viewConfigs = config.views;
    
        Ext.Array.each(me.views, function(view) {
            if(typeof view.view.setContentConfig != 'undefined')
                view.view.setContentConfig(viewConfigs[view.view.id]);
        });
    }
});