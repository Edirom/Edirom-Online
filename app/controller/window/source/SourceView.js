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
Ext.define('EdiromOnline.controller.window.source.SourceView', {

    extend: 'Ext.app.Controller',

    views: [
        'window.source.SourceView'
    ],

    init: function() {
        this.control({
            'sourceView': {
                afterlayout: this.onSourceViewRendered,
                beforedestroy: this.onSourceViewDestroyed,
                single: true
            }
        });
    },

    onSourceViewRendered: function(view) {
        var me = this;

        if(view.initialized) return;
        view.initialized = true;

        view.on('measureVisibilityChange', me.onMeasureVisibilityChange, me);
        view.on('annotationsVisibilityChange', me.onAnnotationsVisibilityChange, me);
        view.on('gotoMovement', me.onGotoMovement, me);
        view.on('gotoMeasureByName', me.onGotoMeasureByName, me);
        view.on('gotoMeasure', me.onGotoMeasure, me);
        view.on('gotoZone', me.onGotoZone, me);

        ToolsController.addMeasureVisibilityListener(view.id, Ext.bind(view.checkGlobalMeasureVisibility, view));
        view.checkGlobalMeasureVisibility(ToolsController.areMeasuresVisible());

        ToolsController.addAnnotationVisibilityListener(view.id, Ext.bind(view.checkGlobalAnnotationVisibility, view));
        view.checkGlobalAnnotationVisibility(ToolsController.areAnnotationsVisible());


        Ext.Ajax.request({
            url: 'data/xql/getMovements.xql',
            method: 'GET',
            params: {
                uri: view.uri
            },
            success: function(response){
                var data = response.responseText;

                var movements = Ext.create('Ext.data.Store', {
                    fields: ['id', 'name'],
                    data: Ext.JSON.decode(data)
                });

                me.movementsLoaded(movements, view);
            }
        });
        
        window.doAJAXRequest('data/xql/getAnnotationInfos.xql',
            'GET',
            {
                uri: view.uri,
                lang: getPreference('application_language')
            },
            Ext.bind(function(response){
                var me = this;
                var data = response.responseText;

                data = Ext.JSON.decode(data);

                var priorities = Ext.create('Ext.data.Store', {
                    fields: ['id', 'name'],
                    data: data['priorities']
                });
                var categories = Ext.create('Ext.data.Store', {
                    fields: ['id', 'name'],
                    data: data['categories']
                });

                me.annotInfosLoaded(priorities, categories, view);
            }, this)
        );
        
        Ext.Ajax.request({
            url: 'data/xql/getOverlays.xql',
            method: 'GET',
            params: {
                uri: view.uri
            },
            success: function(response){
                var data = response.responseText;

                var overlays = Ext.create('Ext.data.Store', {
                    fields: ['id', 'name'],
                    data: Ext.JSON.decode(data)
                });

                me.overlaysLoaded(overlays, view);
            }
        });
    },

    movementsLoaded: function(movements, view) {
        view.setMovements(movements);
    },

    annotInfosLoaded: function(priorities, categories, view) {
        view.setAnnotationFilter(priorities, categories);
    },

    overlaysLoaded: function(overlays, view) {
        view.setOverlays(overlays);
    },

    onGotoMovement: function(view, movementId) {
        var me = this;

        Ext.Ajax.request({
            url: 'data/xql/getMovementsFirstPage.xql',
            method: 'GET',
            params: {
                uri: view.uri,
                movementId: movementId
            },
            success: function(response){
                var data = response.responseText;
                me.gotoMovement(Ext.String.trim(data), view);
            }
        });
    },

    gotoMovement: function(pageId, view) {
        if(pageId != '')
            view.showPage(pageId);
    },

    onMeasureVisibilityChange: function(view, visible) {
        var me = this;

        if(visible) {

            // If there is now active page, we don't need to load measures
            if(typeof view.getActivePage() == 'undefined') return;
            
            var pageId = view.getActivePage().get('id');
            me.fetchMeasures(view.uri, pageId, Ext.bind(me.measuresOnPageLoaded, me, [view, pageId], true));

        }else {
            view.hideMeasures();
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

    measuresOnPageLoaded: function(measures, view, pageId) {

        if(pageId != view.getActivePage().get('id')) return;

        view.showMeasures(measures);
    },

    onAnnotationsVisibilityChange: function(view, visible) {
        var me = this;

        if(visible) {
            
            // If there is now active page, we don't need to load annotations
            if(typeof view.getActivePage() == 'undefined') return;
            
            var pageId = view.getActivePage().get('id');
            var lang = getPreference('application_language');

            window.doAJAXRequest('data/xql/getAnnotationsOnPage.xql',

                'GET',
                {
                    uri: view.uri,
                    pageId: pageId,
                    lang: lang
                },
                Ext.bind(function(response){
                    var me = this;
                    var data = response.responseText;

                    var annotations = Ext.create('Ext.data.Store', {
                        fields: ['id', 'title', 'text', 'uri', 'plist', 'svgList', 'priority', 'categories', 'fn'],
                        data: Ext.JSON.decode(data)
                    });

                    me.annotationsLoaded(annotations, view, pageId);
                }, this)
            );
			
		} else {
			view.hideAnnotations();
		}
	},
	
	annotationsLoaded: function (annotations, view, pageId) {
		
		if (pageId != view.getActivePage().get('id')) return;
		
		view.showAnnotations(annotations);
	},
	
	onGotoMeasureByName: function (view, measure, movementId) {
		var me = this;
		
		Ext.Ajax.request({
			url: 'data/xql/getMeasurePage.xql',
			method: 'GET',
			params: {
				id: view.uri,
				measure: measure,
				movementId: movementId
			},
			success: Ext.bind(function (response) {
				var data = response.responseText;
				this.gotoMeasure(Ext.JSON.decode(data)[0], view);
			},
			me)
		});
	},
	
	onGotoMeasure: function (view, measureId) {
		
		var me = this;
		
		Ext.Ajax.request({
			url: 'data/xql/getMeasure.xql',
			method: 'GET',
			params: {
				id: view.uri,
				measureId: measureId
			},
			success: Ext.bind(function (response) {
				var data = response.responseText;
				this.gotoMeasure(Ext.JSON.decode(data), view);
			},
			me)
		});
	},
	
	gotoMeasure: function (result, view) {
		var me = this;
		
		var measureId = result.measureId;
		var movementId = result.movementId;
		var measureCount = result.measureCount;
		
		if (measureId != '' && movementId != '') {
			view.showMeasure(movementId, measureId, measureCount);
		}
	},
	
	onGotoZone: function (view, zoneId) {
		
		var me = this;
		
		Ext.Ajax.request({
			url: 'data/xql/getZone.xql',
			method: 'GET',
			params: {
				uri: view.uri,
				zoneId: zoneId
			},
			success: Ext.bind(function (response) {
				var data = response.responseText;
				this.gotoZone(Ext.JSON.decode(data), view);
			},
			me)
		});
	},
	
	gotoZone: function (result, view) {
		var me = this;
		
		var zoneId = result.zoneId;
		var pageId = result.pageId;
		
		if (zoneId != '' && pageId != '') {
			
			if (view.imageSet == null) {
				view.on('afterImagesLoaded', Ext.bind(view.showZone, view,[result], false), view,[ {
					single: true
				}]);
				view.showPage(pageId);
			} else if (typeof view.getActivePage() == 'undefined' || view.getActivePage().get('id') != pageId) {
				view.showPage(pageId);
				view.showZone(result);
			} else {
				view.showZone(result);
			}
		}
	},
	
	onSourceViewDestroyed: function (view) {
		var me = this;
		
		ToolsController.removeMeasureVisibilityListener(view.id);
		ToolsController.removeAnnotationVisibilityListener(view.id);
	}
});
