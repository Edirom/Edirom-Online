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
 */
Ext.define('de.edirom.online.controller.ToolsController', {

    extend: 'Ext.app.Controller',

    requires: [
        'Ext.Error'
    ],
    
    measureVisibilityListeners: {},
    annotationVisibilityListeners: {},
    
    globalMeasureVisibility: false,
    globalAnnotationVisibility: false,

    init: function() {
        window.ToolsController = this;
    },
    
    addMeasureVisibilityListener: function(id, listener) {
        var me = this;
        me.measureVisibilityListeners[id] = listener;
    },
    
    addAnnotationVisibilityListener: function(id, listener) {
        var me = this;
        me.annotationVisibilityListeners[id] = listener;
    },
    
    removeMeasureVisibilityListener: function(id) {
        var me = this;
        delete me.measureVisibilityListeners[id];
    },
    
    removeAnnotationVisibilityListener: function(id) {
        var me = this;
        delete me.annotationVisibilityListeners[id];
    },
    
    areMeasuresVisible: function() {
        return this.globalMeasureVisibility;
    },
    
    areAnnotationsVisible: function() {
        return this.globalAnnotationVisibility;
    },

    setGlobalMeasureVisibility: function(state) {
        var me = this;
        me.globalMeasureVisibility = state;
        
        Ext.Object.each(me.measureVisibilityListeners, function(id, listener, obj) {
            listener(state);
        });
    },
    
    setGlobalAnnotationVisibility: function(state) {
        var me = this;
        me.globalAnnotationVisibility = state;
        Ext.Object.each(me.annotationVisibilityListeners, function(id, listener, obj) {
            listener(state);
        });
    }
});