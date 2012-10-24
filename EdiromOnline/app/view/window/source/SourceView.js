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
 *  ID: $Id: SourceView.js 1455 2012-10-11 10:42:55Z daniel $
 */
Ext.define('de.edirom.online.view.window.source.SourceView', {
    extend: 'Ext.panel.Panel',

    mixins: {
        observable: 'Ext.util.Observable'
    },

    requires: [
        'de.edirom.online.view.window.image.ImageViewer',

        'Ext.draw.Component',
        'Ext.slider.Single',
        'Ext.form.ComboBox',
        'Ext.window.MessageBox'
    ],

    alias : 'widget.sourceView',

    layout: 'border',

    border: 0,

    imageSet: null,
    imageToShow: null,

    measuresVisible: false,
    annotationsVisible: false,

    initComponent: function () {

        this.addEvents('measureVisibilityChange',
            'annotationsVisibilityChange',
            'overlayVisiblityChange',
            'gotoMovement',
            'gotoMeasure',
            'gotoMeasureByName');

        this.imageViewer = Ext.create('de.edirom.online.view.window.image.ImageViewer');
        this.imageViewer.region = 'center';

        this.bottomBar = new de.edirom.online.view.window.BottomBar({owner:this, region:'south'});

        this.items = [
            this.imageViewer,
            this.bottomBar
        ];

        this.callParent();

        this.on('afterrender', this.createMenuEntries, this, {single: true});
        this.on('afterrender', this.createToolbarEntries, this, {single: true});
        this.imageViewer.on('zoomChanged', this.updateZoom, this);

        this.window.on('loadInternalLink', this.loadInternalId, this);
    },

    loadInternalId: function() {
        var me = this;

        if(me.window.internalIdType == 'measure') {
            me.window.requestForActiveView(me);
            me.gotoMeasure(me.window.internalId);
        }
    },

    //TODO: in mixin verpacken, wenn möglich
    setAnnotationFilter: function(priorities, categories) {
        var me = this;

        var prioritiesItems = [];
        priorities.each(function(priority) {
            prioritiesItems.push({
                text: priority.get('name'),
                priorityId: priority.get('id'),
                checked: true,
                handler: Ext.bind(me.annotationFilterChanged, me)
            });
        });

        me.annotPrioritiesMenu = Ext.create('Ext.menu.Menu', {
             items: prioritiesItems
        });

        me.annotMenu.menu.add({
            id: me.id + '_annotCategoryFilter',
            text: getLangString('view.window.source.SourceView_prioMenu'),
            menu: me.annotPrioritiesMenu
        });

        var categoriesItems = [];
        categories.each(function(category) {
            categoriesItems.push({
                text: category.get('name'),
                categoryId: category.get('id'),
                checked: true,
                handler: Ext.bind(me.annotationFilterChanged, me)
            });
        });

        me.annotCategoriesMenu = Ext.create('Ext.menu.Menu', {
             items: categoriesItems
        });

        me.annotMenu.menu.add({
            id: me.id + '_annotPriorityFilter',
            text: getLangString('view.window.source.SourceView_categoriesMenu'),
            menu: me.annotCategoriesMenu
        });
    },

    annotationFilterChanged: function(item, event) {
        var me = this;

        if(!me.annotationsVisible) return;

        var visiblePriorities = [];
        me.annotPrioritiesMenu.items.each(function(item) {
            if(item.checked)
                visiblePriorities.push(item.priorityId);
        });
        var visibleCategories = [];
        me.annotCategoriesMenu.items.each(function(item) {
            if(item.checked)
                visibleCategories.push(item.categoryId);
        });

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

    setMovements: function(movements) {
        var me = this;

        me.movements = movements;

        var movementItems = [];
        movements.each(function(movement) {
            movementItems.push({
                text: movement.get('name'),
                handler: Ext.bind(me.gotoMovement, me, movement.get('id'), true)
            });
        });

        me.gotoMenu.menu.add({
            id: me.id + '_gotoMovement',
            text: getLangString('view.window.source.SourceView_gotoMovement'),
            menu: {
                items: movementItems
            }
        });
    },

    gotoMovement: function(menuItem, event, movementId) {
        this.fireEvent('gotoMovement', this, movementId);
    },

    setOverlays: function(overlays) {
        var me = this;

        me.overlays = overlays;

        var overlayItems = [];
        overlays.each(function(overlay) {
            overlayItems.push({
                text: overlay.get('name'),
                overlayId: overlay.get('id'),
                checked: false,
                handler: Ext.bind(me.overlayVisibilityChanged, me)
            });
        });

        me.viewMenu.menu.add({
            id: me.id + '_showHideOverlays',
            text: getLangString('view.window.source.SourceView_layersMenu'),
            menu: {
                items: overlayItems
            }
        });
    },

    overlayVisibilityChanged: function(item, event) {
        var me = this;
        me.fireEvent('overlayVisiblityChange', me, item.overlayId, item.checked);
    },

    hideOverlay: function(overlayId) {
        var me = this;
        me.imageViewer.removeSVGOverlay(overlayId);
    },

    showOverlay: function(overlayId, overlay) {
        var me = this;
        me.imageViewer.addSVGOverlay(overlayId, overlay);
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


        if(me.measuresVisible)
            this.fireEvent('measureVisibilityChange', me, true);

        if(me.annotationsVisible)
            this.fireEvent('annotationsVisibilityChange', me, true);
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

    createMenuEntries: function() {

        var me = this;

        me.viewMenu =  Ext.create('Ext.button.Button', {
            text: getLangString('view.window.source.SourceView_viewMenu'),
            indent: false,
            cls: 'menuButton',
            menu : {
                items: [
                    {
                        id: me.id + '_showMeasures',
                        xtype: 'menucheckitem',
                        checked: me.measuresVisible,
                        text: getLangString('view.window.source.SourceView_showMeasures'),
                        checkHandler: Ext.bind(me.toggleMeasures, me, [], true)
                    },
                    {
                        id: me.id + '_fitFacsimile',
                        text: getLangString('view.window.source.SourceView_fitView'),
                        handler: Ext.bind(me.fitFacsimile, me, [], 0)
                    }
                ]
            }
        });
        me.window.getTopbar().addViewSpecificItem(me.viewMenu, me.id);

        me.annotMenu =  Ext.create('Ext.button.Button', {
            text: getLangString('view.window.source.SourceView_annotationsMenu'),
            indent: false,
            cls: 'menuButton',
            menu : {
                items: [
                    {
                        id: me.id + '_showAnnotations',
                        xtype: 'menucheckitem',
                        checked: me.annotationsVisible,
                        text: getLangString('view.window.source.SourceView_ShowAnnotations'),
                        checkHandler: Ext.bind(me.toggleAnnotations, me, [], true)
                    }
                ]
            }
        });
        me.window.getTopbar().addViewSpecificItem(me.annotMenu, me.id);

        me.gotoMenu =  Ext.create('Ext.button.Button', {
            text: getLangString('view.window.source.SourceView_gotoMenu'),
            indent: false,
            cls: 'menuButton',
            menu : {
                items: [
                    {
                        id: me.id + '_gotoMeasure',
                        text: getLangString('view.window.source.SourceView_gotoMeasure'),
                        handler: Ext.bind(me.gotoMeasureDialog, me)
                    }
                ]
            }
        });
        me.window.getTopbar().addViewSpecificItem(me.gotoMenu, me.id);
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
        me.bottomBar.add(me.zoomSlider);

        me.pageSpinner = Ext.create('de.edirom.online.view.window.source.PageSpinner', {
            width: 111,
            cls: 'pageSpinner',
            owner: me
        });
        me.bottomBar.add(me.pageSpinner);
    },

    fitFacsimile: function() {
        this.imageViewer.fitInImage();
    },

    toggleMeasures: function(item, state) {
        var me = this;
        me.measuresVisible = state;

        this.fireEvent('measureVisibilityChange', me, state);
    },

    showMeasures: function(measures) {
        var me = this;
        me.imageViewer.addMeasures(measures);
    },

    hideMeasures: function() {
        var me = this;
        me.imageViewer.removeShapes('measures');
    },

    gotoMeasureDialog: function() {
        var me = this;

        Ext.create('de.edirom.online.view.window.source.GotoMsg', {
            movements: me.movements,
            callback: Ext.bind(function(measure, movementId) {
                this.fireEvent('gotoMeasureByName', this, measure, movementId);
            }, me)
        }).show();
    },

    gotoMeasure: function(measureId) {
        this.fireEvent('gotoMeasure', this, measureId);
    },

    showMeasure: function(measure) {
        var me = this;
        var x = Number(measure.get('ulx'));
        var y = Number(measure.get('uly'));
        var width = measure.get('lrx') - measure.get('ulx');
        var height = measure.get('lry') - measure.get('uly');

        me.imageViewer.showRect(x, y, width, height, true);
    },

    toggleAnnotations: function(item, state) {
        var me = this;
        me.annotationsVisible = state;

        this.fireEvent('annotationsVisibilityChange', me, state);
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
    }
});

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
                listeners:{
                     scope: this,
                     click: this.prev
                }
            },
            this.combo,
            {
                xtype: 'button',
                cls : 'next toolButton',
                listeners:{
                     scope: this,
                     click: this.next
                }
            }
        ]);

        this.combo.on('select', this.owner.setPage, this.owner);
    }
});

Ext.define('de.edirom.online.view.window.source.GotoMsg', {

    extend: 'Ext.window.Window',

    requires: [
        'Ext.form.field.Text',
        'Ext.form.ComboBox'
    ],

	cls: 'gotoDialogue',
	bodyBorder: false,
	
    height: 140,
    width: 320,

    modal: true,
    resizable: false,

    layout: {
        type: 'vbox',
        align: 'stretch',
        padding: 5
    },

    padding: 0,

    initComponent: function() {
        var me = this;

        Ext.apply(me, me.config);

        me.title = getLangString('view.window.source.SourceView_GotoMsg_Title');

        me.combo = Ext.create('Ext.form.ComboBox', {
            fieldLabel: getLangString('view.window.source.SourceView_GotoMsg_MovmentNumber'),
            store: me.movements,
            queryMode: 'local',
            displayField: 'name',
            valueField: 'id'
        });

        me.field = Ext.create('Ext.form.field.Text', {
            name: 'measure',
            fieldLabel: getLangString('view.window.source.SourceView_GotoMsg_Measure'),
            allowBlank: false
        });

        me.items = [
            me.combo, me.field
        ];

        me.buttons = [
            {
                text: getLangString('global_cancel'),
                handler: me.close,
                scope: me
            },
            {
                text: getLangString('global_execute'),
                handler: me.gotoFn,
                scope: me
            }
        ];

        me.callParent();

        me.combo.setValue(me.movements.getAt(0).get('id'));
        me.on('afterrender', me.initKeys, me, {single: true});
    },

    initKeys: function() {
        var me = this;
        var map = me.getKeyMap();

        map.addBinding({
            key: Ext.EventObject.ENTER,
            fn: me.gotoFn,
            scope: me
        });

        map.addBinding({
            key: Ext.EventObject.ESC,
            fn: me.close,
            scope: me
        });

        map.enable();
    },

    gotoFn: function(button, event) {
        var me = this;

        //TODO: Validierung
        me.callback(Ext.String.trim(me.field.getValue()), me.combo.getValue());
        me.close();
    }
});

