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
 *
 */
Ext.define('EdiromOnline.controller.window.source.MeasureBasedView', {

    extend: 'Ext.app.Controller',

    views: [
        'window.source.MeasureBasedView'
    ],

    init: function() {
        this.control({
            'measureBasedView': {
                afterlayout: this.onMeasureBasedViewRendered,
                mdivSelected: this.onMdivSelected
            },
            
            'horizontalMeasureViewer': {
                showMeasure: this.onShowMeasure,
                measureVisibilityChange: this.onMeasureVisibilityChange,
                annotationsVisibilityChange: this.onAnnotationsVisibilityChange,
                overlayVisiblityChange: this.onOverlayVisiblityChange
            }
        });
    },

    onMeasureBasedViewRendered: function(view) {
        var me = this;

        if(view.initialized) return;
        view.initialized = true;

        window.doAJAXRequest('data/xql/getParts.xql',
            'GET', 
            {
                uri: view.owner.uri
            },
            Ext.bind(function(response){
                var data = response.responseText;

                var parts = Ext.create('Ext.data.Store', {
                    fields: ['id', 'label', 'selectedByDefault', 'selected'],
                    data: Ext.JSON.decode(data)
                });
				
                me.partsLoaded(parts, view);
            }, me)
        );
    },

    onMdivSelected: function(mdiv, view) {
        var me = this;

        Ext.Ajax.request({
            url: 'data/xql/getMeasures.xql',
            method: 'GET',
            params: {
                uri: view.owner.uri,
                mdiv: mdiv
            },
            success: function(response){
                var data = response.responseText;

                var measures = Ext.create('Ext.data.Store', {
                    fields: ['id', 'measures', 'name', 'mdivs'],
                    data: Ext.JSON.decode(data)
                });
                me.measuresLoaded(measures, view);
            }
        });        
    },

    measuresLoaded: function(measures, view) {
        view.setMeasures(measures);
    },
    
    partsLoaded: function(parts, view) {
        view.setParts(parts);
    },
    
    onShowMeasure: function(view, uri, measureId, count) {
        var me = this;

        Ext.Ajax.request({
            url: 'data/xql/getMeasurePage.xql',
            method: 'GET',
            params: {
                id: uri,
                measure: measureId,
                measureCount: count
            },
            success: Ext.bind(function(response){
                var data = response.responseText;
                this.showMeasure(view, uri, measureId, Ext.JSON.decode(data));
            }, me)
        });
    },
    
    showMeasure: function(view, uri, measureId, data) {
        view.showMeasure(data);
    },
    
    onMeasureVisibilityChange: function(viewer, visible, pageId, uri, args) {
        var me = this;
        
        if(visible) {
            me.fetchMeasures(uri, pageId, Ext.bind(me.measuresOnPageLoaded, me, [viewer, pageId], true));
        }else {
            viewer.removeShapes('measures');
        }
    },
    
    fetchMeasures: function(uri, pageId, fn) {
        Ext.Ajax.request({
            url: 'data/xql/getMeasuresOnPage.xql',
            method: 'GET',
            params: {
                uri: uri,
                pageId: pageId
            },
            success: function(response){
                var data = response.responseText;

                var measures = Ext.create('Ext.data.Store', {
                    fields: ['zoneId', 'ulx', 'uly', 'lrx', 'lry', 'id', 'name', 'type', 'rest'],
                    data: Ext.JSON.decode(data)
                });

                if(typeof fn == 'function')
                    fn(measures);
            }
        });
    },
    
    measuresOnPageLoaded: function(measures, viewer, pageId) {

        if(pageId != viewer.imgId) return;

        viewer.addMeasures(measures);
    },
    
    onAnnotationsVisibilityChange: function(viewer, visible, pageId, uri, sourceView, args) {
        var me = this;
        
        if(visible) {
            window.doAJAXRequest('data/xql/getAnnotationsOnPage.xql',
                'GET', 
                {
                    uri: uri,
                    pageId: pageId
                },
                Ext.bind(function(response){
                    var me = this;
                    var data = response.responseText;

                    var annotations = Ext.create('Ext.data.Store', {
                        fields: ['id', 'title', 'text', 'uri', 'plist', 'svgList', 'priority', 'categories', 'fn'],
                        data: Ext.JSON.decode(data)
                    });

                    me.annotationsLoaded(annotations, viewer, pageId, sourceView);
                }, this)
            );
        }else {
            viewer.removeShapes('annotations');
        }
    },
    
    annotationsLoaded: function(annotations, viewer, pageId, sourceView) {

        if(pageId != viewer.imgId) return;

        viewer.addAnnotations(annotations);
        sourceView.annotationFilterChanged();
    },
    
    onOverlayVisiblityChange: function(viewer, overlays, pageId, uri, sourceView, args) {
        var me = this;
        
        Ext.Array.each(Object.keys(overlays), function(overlayId) {
           
           if(overlays[overlayId]) {
               
 			Ext.Ajax.request({
 				url: 'data/xql/getOverlayOnPage.xql',
 				method: 'GET',
 				params: {
 					uri: uri,
 					pageId: pageId,
 					overlayId: overlayId
 				},
 				success: function (response) {
 					var data = response.responseText;
 					
 					if (data.trim() == '') return;
 					
 					var overlay = Ext.create('Ext.data.Store', {
                         fields: ['id', 'svg'],
                         data: Ext.JSON.decode(data)
                     });
 
 					
 					me.overlayLoaded(viewer, pageId, overlayId, overlay, sourceView);
 				}
 			});
           }else {
               viewer.removeSVGOverlay(overlayId);
           }
        });
    },
    
    overlayLoaded: function(viewer, pageId, overlayId, overlay, sourceView) {

        if(pageId != viewer.imgId) return;

        viewer.addSVGOverlay(overlayId, overlay);
    }
});
