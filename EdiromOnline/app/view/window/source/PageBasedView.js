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
Ext.define('de.edirom.online.view.window.source.PageBasedView', {
    extend: 'Ext.panel.Panel',

    mixins: {
        observable: 'Ext.util.Observable'
    },

    requires: [
        'de.edirom.online.view.window.image.ImageViewer'
    ],

    alias : 'widget.pageBasedView',

    layout: 'fit',

    border: 0,

    imageSet: null,
    imageToShow: null,

    initComponent: function () {

        this.imageViewer = Ext.create('de.edirom.online.view.window.image.ImageViewer');

        this.items = [
            this.imageViewer
        ];

        this.callParent();

        this.imageViewer.on('zoomChanged', this.updateZoom, this);
    },

    annotationFilterChanged: function(visibleCategories, visiblePriorities) {
        var me = this;

        var annotations = me.imageViewer.getShapes('annotations');
        var fn = Ext.bind(function(annotation) {
            var annotDiv = this.imageViewer.getShapeElem(annotation.id);
            var className = annotDiv.dom.className.replace('annotation', '').trim();
            var classes = className.split(' ');

            var hasCategory = false;
            var hasPriority = false;

            for(var i = 0; i < classes.length; i++) {
                hasCategory |= Ext.Array.contains(visibleCategories, classes[i]);
                hasPriority |= Ext.Array.contains(visiblePriorities, classes[i]);
            }

            annotDiv.setVisible(hasCategory & hasPriority);
        }, me);

        if(annotations.each)
            annotations.each(fn);
        else
            Ext.Array.each(annotations, fn);
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

        me.pageSpinner = Ext.create('de.edirom.online.view.window.source.PageSpinner', {
            width: 111,
            cls: 'pageSpinner',
            owner: me
        });
        
        me.separator = Ext.create('Ext.toolbar.Separator');
        
        return [me.zoomSlider, me.separator, me.pageSpinner];
    },
    
    hideToolbarEntries: function() {
        var me = this;
        me.zoomSlider.hide();
        me.pageSpinner.hide();
        me.separator.hide();
    },
    
    showToolbarEntries: function() {
        var me = this;
        me.zoomSlider.show();
        me.pageSpinner.show();
        me.separator.show();
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

    hideAnnotations: function() {
        var me = this;
        me.imageViewer.removeShapes('annotations');
    },

    updateZoom: function(zoom) {
        this.zoomSlider.suspendEvents();
        this.zoomSlider.setValue(Math.round(zoom * 100));
        this.zoomSlider.resumeEvents();
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

//TODO: mit de.edirom.online.view.window.source.MeasureSpinner zusammen legen
Ext.define('de.edirom.online.view.window.source.PageSpinner', {
    extend: 'Ext.container.Container',

    alias : 'widget.pageSpinner',

    layout: 'hbox',

    initComponent: function () {

        this.items = [
        ];
        this.callParent();
    },

    next: function() {

        this.store.clearFilter(false);

        var oldIndex = this.store.findExact('id', this.combo.getValue());
        if(oldIndex + 1 < this.store.getCount())
            this.setPage(this.store.getAt(oldIndex + 1).get('id'));
    },

    prev: function() {

        this.store.clearFilter(false);

        var oldIndex = this.store.findExact('id', this.combo.getValue());
        if(oldIndex > 0)
            this.setPage(this.store.getAt(oldIndex - 1).get('id'));
    },

    setPage: function(id) {
        this.combo.setValue(id);
        this.owner.setPage(this.combo, this.combo.store);
    },

    setStore: function(store) {

        this.removeAll();

        this.store = store;

        this.combo = Ext.create('Ext.form.ComboBox', {
            width: 35,
            hideTrigger: true,
            queryMode: 'local',
            store: store,
            displayField: 'name',
            valueField: 'id',
            cls: 'pageInputBox',
            autoSelect: true
        });

        this.add([
            {
                xtype: 'button',
                cls : 'prev toolButton',
                tooltip: { text: getLangString('view.window.source.SourceView_PageBasedView_previousPage'), align: 'bl-tl' },
                listeners:{
                     scope: this,
                     click: this.prev
                }
            },
            this.combo,
            {
                xtype: 'button',
                cls : 'next toolButton',
                tooltip: { text: getLangString('view.window.source.SourceView_PageBasedView_nextPage'), align: 'bl-tl' },
                listeners:{
                     scope: this,
                     click: this.next
                }
            }
        ]);

        this.combo.on('select', this.owner.setPage, this.owner);
    }
});

