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
Ext.define('EdiromOnline.view.window.source.PageBasedView', {
    extend: 'EdiromOnline.view.window.View',

    requires: [
        'EdiromOnline.view.window.image.ImageViewer',
        'EdiromOnline.view.window.image.OpenSeaDragonViewer',
        'EdiromOnline.view.window.image.LeafletFacsimile'
    ],

    alias : 'widget.pageBasedView',

    layout: 'fit',

    border: 0,

    imageSet: null,
    imageToShow: null,

    cls: 'pageBasedView',

    initComponent: function () {

        var me = this;

        me.addEvents('overlayVisibilityChange');
        me.owner.on('overlayVisiblityChange', me.onOverlayVisibilityChange, me);

    	var image_server = getPreference('image_server');

        //TODO leaflet deprecation
    	if(image_server === 'leaflet'){
    		me.imageViewer = Ext.create('EdiromOnline.view.window.image.LeafletFacsimile', {flex: 1, width: '100%'});
    		//Ext.create('EdiromOnline.view.window.image.LeafletFacsimile');
    	}else if(image_server === 'openseadragon') {
    	    me.imageViewer = Ext.create('EdiromOnline.view.window.image.OpenSeaDragonViewer');
    	}else{
    		me.imageViewer = Ext.create('EdiromOnline.view.window.image.ImageViewer');
    	}

        this.items = [
            me.imageViewer
        ];

        me.callParent();

 	   me.imageViewer.on('zoomChanged', me.updateZoom, me);
    },

    annotationFilterChanged: function(visibleCategories, visiblePriorities) {

        var me = this;

        if(typeof(debug) !== 'undefined' && debug !== null && debug) {
            console.log('View: PageBasedView: annotationFilterChanged');
            console.log('visibleCategories');
            console.log(visibleCategories);
            console.log('visiblePriorities');
            console.log(visiblePriorities);
        }

        //TODO leaflet deprecation
     	var image_server = getPreference('image_server');

        var annotations = me.imageViewer.getShapes('annotations');

        if(typeof(debug) !== 'undefined' && debug !== null && debug) {
            console.log('View: PageBasedView: annotationFilterChanged: annotations');
            console.log(annotations);
            console.log(me.imageViewer.shapes.get('annotations'));
        }

        //TODO leaflet deprecation
        if(image_server === 'leaflet'){
            me.imageViewer.removeShapes('annotations');
            me.imageViewer.addAnnotations(annotations);
            me.imageViewer.removeDeselectedAnnotations(visibleCategories, visiblePriorities);
            return;
        }

        // define function to apply to relevant element IDs
        var fn = Ext.bind(function(annotationId) {

            var annotDiv = Ext.get(annotationId);
            var classList = annotDiv.dom.classList;
            var prioritiesCategories = Ext.Array.toArray(classList);
            Ext.Array.remove(prioritiesCategories, 'measure');
            Ext.Array.remove(prioritiesCategories, 'annoIcon');

            if(typeof(debug) !== 'undefined' && debug !== null && debug) {
                console.log('View: PageBasedView: annotationFilterChanged: annotations fn');
                console.log(annotationId);
                console.log(annotDiv);
                console.log(classList);
                console.log(prioritiesCategories);
            }

            // create category and priority match variables
            var matchesCategoryFilter = false;
            var matchesPriorityFilter = false;

            // iterate over annotation class attribute values to see if they match visibleCategories or visiblePriorities
            for(var i = 0; i < prioritiesCategories.length; i++) {
                matchesCategoryFilter |= Ext.Array.contains(visibleCategories, prioritiesCategories[i]);

                matchesPriorityFilter |= Ext.Array.contains(visiblePriorities, prioritiesCategories[i]);
            }

            if(typeof(debug) !== 'undefined' && debug !== null && debug) {
                console.log(matchesCategoryFilter);
                console.log(matchesPriorityFilter);
            }

            // if filter results are false check if visibleCategories are undefined and if so assign true
            if( matchesCategoryFilter == false && visibleCategories == 'undefined') {
                matchesCategoryFilter = true;
            }

            // if filter results are falsey check if visibleCategories are undefined and if so assign true
            if( matchesPriorityFilter == false && visiblePriorities == 'undefined') {
                matchesPriorityFilter = true;
            }

            // depending on match results assign or remove class 'hidden'
            if(matchesCategoryFilter & matchesPriorityFilter)
                annotDiv.removeCls('hidden');
            else
                annotDiv.addCls('hidden');
        }, me);


        var annotationDivIds = [];

        Ext.Array.each(annotations, function(annotation) {

            if(typeof(debug) !== 'undefined' && debug !== null && debug) {
                console.log('annotation');
                console.log(annotation);
                console.log('me');
                console.log(me);
                console.log('me.owner.owner');
                console.log(me.owner.owner);
            }

            var annotDiv = me.imageViewer.getShapeElem(annotation.id);
            var children = Ext.Array.toArray(annotDiv.dom.childNodes);

            // Ext.Array.push(annotationDivIds, annotation.id);
            Ext.Array.push(annotationDivIds, Ext.Array.pluck(children, 'id'));
        });

        if(typeof(debug) !== 'undefined' && debug !== null && debug) {
            console.log(annotationDivIds);
        }

        Ext.Array.each(annotationDivIds, fn);
    },


    setImageSet: function(imageSet) {

        var me = this;
        me.imageSet = imageSet;

        me.pageSpinner.setStore(me.imageSet);

        if(me.imageToShow != null) {
            me.pageSpinner.setPage(me.imageSet.getById(me.imageToShow));
            me.imageToShow = null;

        }else if(me.imageSet.getCount() > 0)
            me.pageSpinner.setPage(me.imageSet.getAt(0));

        me.owner.fireEvent('afterImagesLoaded', me.owner, imageSet);
    },

    setPage: function(combo, store) {

        var me = this;

        // Remove old stuff
        me.imageViewer.clear();

        var id = combo.getValue();
        var imgIndex = me.imageSet.findExact('id', id);
        me.activePage = me.imageSet.getAt(imgIndex);

        me.imageViewer.showImage(me.activePage.get('path'),
            me.activePage.get('width'), me.activePage.get('height'));

        if(me.owner.measuresVisible)
            me.owner.fireEvent('measureVisibilityChange', me.owner, true);

        if(me.owner.annotationsVisible)
            me.owner.fireEvent('annotationsVisibilityChange', me.owner, true);

        var layers = Object.keys(me.owner.overlaysVisible);
        Ext.Array.each(layers, function(layer) {
			me.owner.fireEvent('overlayVisiblityChange', me.owner, layer, me.owner.overlaysVisible[layer]);
        });

    },

    showPage: function(pageId) {
        var me = this;

        if(me.imageSet == null) {
            me.imageToShow = pageId;
            return;
        }

        me.pageSpinner.setPage(me.imageSet.getById(pageId));
    },

    getActivePage: function() {
        return this.activePage;
    },

    createToolbarEntries: function() {

        var me = this;

       var image_server = getPreference('image_server');

    	if(image_server === 'digilib'){
    		me.zoomSlider = Ext.create('Ext.slider.Single', {
            width: 140,
            value: 100,
            increment: 5,
            minValue: 10,
            maxValue: 400,
            checkChangeBuffer: 100,
            useTips: true,
            cls: 'zoomSlider',
            tipText: function(thumb){
                return Ext.String.format('{0}%', thumb.value);
            },
            listeners: {
                change: Ext.bind(me.zoomChanged, me, [], 0)
            }
        });
    	}
    	if (image_server === 'openseadragon') {
            me.zoomSlider = Ext.create('Ext.slider.Single', {
                width: 140,
                value: 100,
                increment: 5,
                minValue: 90,
                maxValue: 700,
                checkChangeBuffer: 100,
                useTips: true,
                cls: 'zoomSlider',
                tipText: function(thumb) {
                    return Ext.String.format('{0}%', thumb.value);
                },
                listeners: {
                    change: Ext.bind(me.zoomChanged, me, [], 0)
                }
            });
        }

        me.pageSpinner = Ext.create('EdiromOnline.view.window.util.PageSpinner', {
            width: 121,
            cls: 'pageSpinner',
            owner: me
        });

        me.separator = Ext.create('Ext.toolbar.Separator');

        if(image_server === 'digilib' || image_server === 'openseadragon'){
        return [me.zoomSlider, me.separator, me.pageSpinner];
        }
        else{
        	 return [me.pageSpinner];
        }
    },

    hideToolbarEntries: function() {
        var me = this;
        if(typeof me.zoomSlider !== 'undefined'){
        	me.zoomSlider.hide();
        }
        me.pageSpinner.hide();
        if(typeof me.separator !== 'undefined'){
        	me.separator.hide();
        }
    },

    showToolbarEntries: function() {
        var me = this;
        if(typeof me.zoomSlider !== 'undefined'){
        	me.zoomSlider.show();
        }
        me.pageSpinner.show();
        if(typeof me.separator !== 'undefined'){
        	 me.separator.show();
        }

    },

    fitFacsimile: function() {
        this.imageViewer.fitInImage();
    },

    showMeasures: function(measures) {
        var me = this;
        me.imageViewer.addMeasures(measures);
    },

    hideMeasures: function() {
        var me = this;
        me.imageViewer.removeShapes('measures');
    },

    showZone: function(zone) {
        var me = this;
        var x = Number(zone['ulx']);
        var y = Number(zone['uly']);
        var width = zone['lrx'] - zone['ulx'];
        var height = zone['lry'] - zone['uly'];

        me.imageViewer.showRect(x, y, width, height, true);
    },

    showAnnotations: function(annotations) {
        var me = this;
        me.imageViewer.addAnnotations(annotations);
    },

    onOverlayVisibilityChange: function(view, state) {
        var me = this;
        me.fireEvent('overlayVisiblityChange', me, me.owner.overlaysVisible, me.getActivePage().get('id'), me.owner.uri, me.owner);
    },

    hideAnnotations: function() {
        var me = this;
        me.imageViewer.removeShapes('annotations');
    },

    updateZoom: function(zoom) {
    	if(typeof this.zoomSlider !== 'undefined'){
        	this.zoomSlider.suspendEvents();
        	this.zoomSlider.setValue(Math.round(zoom * 100));
        	this.zoomSlider.resumeEvents();
        }
    },

    zoomChanged: function(slider) {
        this.imageViewer.setZoomAndCenter(slider.getValue() / 100);
    },

    getContentConfig: function() {
        var me = this;
        return {
            id: this.id,
            rect: me.imageViewer.getActualRect()
        };
    },

    setContentConfig: function(config) {
        var me = this;
        me.imageViewer.showRect(config.rect.x, config.rect.y, config.rect.width, config.rect.height, false);
    }
});
