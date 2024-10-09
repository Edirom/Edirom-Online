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

        window.doAJAXRequest('data/xql/getMeasures.xql',
            'GET', 
            {
                uri: view.owner.uri,
                mdiv: mdiv
            },
            Ext.bind(function(response){
                var data = response.responseText;

                var measures = Ext.create('Ext.data.Store', {
                    fields: ['id', 'measures', 'name', 'mdivs'],
                    data: Ext.JSON.decode(data)
                });
                me.measuresLoaded(measures, view);
            }, this)
        );
    },

    measuresLoaded: function(measures, view) {
        view.setMeasures(measures);
    },
    
    partsLoaded: function(parts, view) {
        view.setParts(parts);
    },
    
    onShowMeasure: function(view, uri, measureId, count) {
        var me = this;

        window.doAJAXRequest('data/xql/getMeasurePage.xql',
            'GET', 
            {
                id: uri,
                measure: measureId,
                measureCount: count
            },
            Ext.bind(function(response){
                var data = response.responseText;
                this.showMeasure(view, uri, measureId, Ext.JSON.decode(data));
            }, me)
        );
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
        window.doAJAXRequest('data/xql/getMeasuresOnPage.xql',
            'GET', 
            {
                uri: uri,
                pageId: pageId
            },
            Ext.bind(function(response){
                var data = response.responseText;

                var measures = Ext.create('Ext.data.Store', {
                    fields: ['zoneId', 'ulx', 'uly', 'lrx', 'lry', 'id', 'name', 'type', 'rest'],
                    data: Ext.JSON.decode(data)
                });

                if(typeof fn == 'function')
                    fn(measures);
            }, this)
        );
    },
    
    measuresOnPageLoaded: function(measures, viewer, pageId) {

        if(pageId != viewer.imgId) return;

        viewer.addMeasures(measures);
    },
    
    onAnnotationsVisibilityChange: function(viewer, visible, pageId, uri, sourceView, args) {
        var me = this;
        

        if(debug !== null && debug) {
            console.log('controller: MeasureBasedView: onAnnotationsVisibilityChange');
        }

        if(visible) {

            if(debug !== null && debug) {
                console.log('visible: ' + visible);
            }

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

            if(debug !== null && debug) {
                console.log('visible: ' + visible);
            }

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
               
               window.doAJAXRequest('data/xql/getOverlayOnPage.xql',
                   'GET', 
                   {
                       uri: uri,
 					  pageId: pageId,
 					  overlayId: overlayId
                   },
                   Ext.bind(function(response){
                     var data = response.responseText;
 					
 					if (data.trim() == '') return;
 					
 					var overlay = Ext.create('Ext.data.Store', {
                         fields: ['id', 'svg'],
                         data: Ext.JSON.decode(data)
                     });
 
 					
 					me.overlayLoaded(viewer, pageId, overlayId, overlay, sourceView);
                   }, this)
               );
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
