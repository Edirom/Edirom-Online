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
Ext.define('EdiromOnline.view.window.source.SourceView', {
    extend: 'EdiromOnline.view.window.View',

    requires: [
        'EdiromOnline.view.window.source.PageBasedView',
        'EdiromOnline.view.window.source.MeasureBasedView',

        'Ext.draw.Component',
        'Ext.slider.Single',
        'Ext.form.ComboBox',
        'Ext.window.MessageBox'
    ],

    alias : 'widget.sourceView',

    layout: 'border',

    border: 0,

    activeView: 'pageBasedView',

    measuresVisible: false,
    measuresVisibilitySetLocaly: false,
    annotationsVisible: false,
    annotationsVisibilitySetLocaly: false,
    overlaysVisible: {},
    
    cls: 'sourceView',
    
    initComponent: function () {

        var me = this;

        me.addEvents('measureVisibilityChange',
            'annotationsVisibilityChange',
            'overlayVisiblityChange',
            'gotoMovement',
            'gotoMeasure',
            'gotoMeasureByName',
            'gotoZone',
            'afterImagesLoaded');

        me.pageBasedView = Ext.create('EdiromOnline.view.window.source.PageBasedView', {
            owner: me
        });

        me.measureBasedView = Ext.create('EdiromOnline.view.window.source.MeasureBasedView', {
            owner: me
        });

        me.viewerContainer = Ext.create('Ext.panel.Panel', {
            region: 'center',
            border: 0,
            layout: 'card',
            items: [
                me.pageBasedView,
                me.measureBasedView
            ]
        });

        me.bottomBar = new EdiromOnline.view.window.BottomBar({owner:me, region:'south', enableOverflow: false});

        me.items = [
            me.viewerContainer,
            me.bottomBar
        ];

        me.callParent();

        me.on('afterrender', me.createMenuEntries, me, {single: true});
        me.on('afterrender', me.createToolbarEntries, me, {single: true});

        me.window.on('loadInternalLink', me.loadInternalId, me);
    },

    getWeightForInternalLink: function(uri, type, id) {
        var me = this;
        
        if(me.uri != uri)
            return 0;
            
        if(type == 'measure' || type == 'zone' || type == 'surface' || type == 'graphic')
            return 70;
        
        return 0;
    },
        
    loadInternalId: function(id, type) {
        var me = this;

        if(type == 'measure') {
            me.window.requestForActiveView(me);
            me.gotoMeasure(id);
        
        }else if(type == 'zone') {
            me.window.requestForActiveView(me);
            me.gotoZone(id);
        
        }else if(type == 'surface' || type == 'graphic' ) {
            me.window.requestForActiveView(me);
            me.showPage(id);
        }
    },

    checkGlobalMeasureVisibility: function(visible) {
        
        var me = this;
        
        if(me.measuresVisibilitySetLocaly) return;
        
        me.measuresVisible = visible;
        me.toggleMeasureVisibility.setChecked(visible, true);
        me.fireEvent('measureVisibilityChange', me, visible);
    },
    
    checkGlobalAnnotationVisibility: function(visible) {
        
        var me = this;
        
        if(me.annotationsVisibilitySetLocaly) return;
        
        me.annotationsVisible = visible;
        me.toggleAnnotationVisibility.setChecked(visible, true);
        me.fireEvent('annotationsVisibilityChange', me, visible);
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

        me.pageBasedView.annotationFilterChanged(visibleCategories, visiblePriorities);
        me.measureBasedView.annotationFilterChanged(visibleCategories, visiblePriorities);
    },

    setMovements: function(movements) {
        var me = this;

        me.movements = movements;
        me.measureBasedView.setMovements(movements);

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

        if(overlays.count() == 0) return;

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
        
        me.overlaysVisible[item.overlayId] = item.checked;        
        me.fireEvent('overlayVisiblityChange', me, item.overlayId, item.checked);
    },

    getImageSet: function() {
        var me = this;
        return me.pageBasedView.imageSet;
    },

    /* TODO: check if this function is still in use */
    setPage: function(combo, store) {

        var me = this;

        me.pageBasedView.setPage(combo, store);
        
        if(me.measuresVisible)
            this.fireEvent('measureVisibilityChange', me, true);

        if(me.annotationsVisible)
            this.fireEvent('annotationsVisibilityChange', me, true);
    },

    showPage: function(pageId) {
        var me = this;
        me.pageBasedView.showPage(pageId);
    },

    getActivePage: function() {
        return this.pageBasedView.getActivePage();
    },

    createMenuEntries: function() {

        var me = this;

        me.toggleMeasureVisibility = Ext.create('Ext.menu.CheckItem', {
            id: me.id + '_showMeasures',
            checked: me.measuresVisible,
            text: getLangString('view.window.source.SourceView_showMeasures'),
            checkHandler: Ext.bind(me.toggleMeasures, me, [], true)
        });

        me.viewMenu =  Ext.create('Ext.button.Button', {
            text: getLangString('view.window.source.SourceView_viewMenu'),
            indent: false,
            cls: 'menuButton',
            menu : {
                items: [
                    me.toggleMeasureVisibility,
                    {
                        id: me.id + '_fitFacsimile',
                        text: getLangString('view.window.source.SourceView_fitView'),
                        handler: Ext.bind(me.fitFacsimile, me, [], 0)
                    }
                ]
            }
        });
        me.window.getTopbar().addViewSpecificItem(me.viewMenu, me.id);

        me.toggleAnnotationVisibility = Ext.create('Ext.menu.CheckItem', {
            id: me.id + '_showAnnotations',
            checked: me.annotationsVisible,
            text: getLangString('view.window.source.SourceView_ShowAnnotations'),
            checkHandler: Ext.bind(me.toggleAnnotations, me, [], true)
        });

        me.annotMenu =  Ext.create('Ext.button.Button', {
            text: getLangString('view.window.source.SourceView_annotationsMenu'),
            indent: false,
            cls: 'menuButton',
            menu : {
                items: [
                    me.toggleAnnotationVisibility
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

        me.pageBasedViewButton = Ext.create('Ext.button.Button', {
            handler: Ext.bind(me.switchInternalView, me, ['pageBasedView'], false),
            tooltip: { text: getLangString('view.window.source.SourceView_PageBasedView'), align: 'bl-tl' },
            enableToggle: true,
            pressed: true,
            cls : 'pageBasedView toolButton'
        });

        me.measureBasedViewButton = Ext.create('Ext.button.Button', {
            handler: Ext.bind(me.switchInternalView, me, ['measureBasedView'], false),
            tooltip: { text: getLangString('view.window.source.SourceView_MeasureBasedView'), align: 'bl-tl' },
            enableToggle: true,
            cls : 'measureBasedView toolButton'
        });
        
        me.bottomBar.add(me.pageBasedViewButton);
        me.bottomBar.add(me.measureBasedViewButton);
        me.bottomBar.add({xtype:'tbseparator'});

        var entries = me.pageBasedView.createToolbarEntries();

		var image_server = getPreference('image_server');

        Ext.Array.each(entries, function(entry) {
			if(image_server === 'digilib' || image_server === 'openseadragon'){
				me.bottomBar.add(entry);    
			}
			else if(entry.initialCls !== 'zoomSlider' && entry.xtype !== 'tbseparator'){
				me.bottomBar.add(entry);  
			}      
        });
        
        entries = me.measureBasedView.createToolbarEntries();
        Ext.Array.each(entries, function(entry) {			
				me.bottomBar.add(entry);     
        });
    },

    switchInternalView: function(viewId) {
        var me = this;
        
        if(viewId == 'pageBasedView') {
            me.measureBasedViewButton.toggle(false, true);
            me.pageBasedViewButton.toggle(true, true);
            me.measureBasedView.hideToolbarEntries();
            me.pageBasedView.showToolbarEntries();
            me.viewerContainer.getLayout().setActiveItem(me.pageBasedView);
            //me.gotoMenu.menu.child('#' + me.id + '_gotoMovement').show();
            me.gotoMenu.show();

        }else if(viewId == 'measureBasedView') {
            me.pageBasedViewButton.toggle(false, true);
            me.measureBasedViewButton.toggle(true, true);
            me.pageBasedView.hideToolbarEntries();
            me.measureBasedView.showToolbarEntries();
            me.viewerContainer.getLayout().setActiveItem(me.measureBasedView);
            //me.gotoMenu.menu.child('#' + me.id + '_gotoMovement').hide();
            me.gotoMenu.hide();
        }
        
        me.activeView = viewId;
    },

    fitFacsimile: function() {
        
        var me = this;
        
        if(me.activeView == 'pageBasedView')
            me.pageBasedView.fitFacsimile();
        else if(me.activeView == 'measureBasedView')
            me.measureBasedView.fitFacsimile();
    },

    toggleMeasures: function(item, state) {
        var me = this;
        me.measuresVisible = state;
        me.measuresVisibilitySetLocaly = true;
        
        this.fireEvent('measureVisibilityChange', me, state);
    },

    showMeasures: function(measures) {
        var me = this;
        me.pageBasedView.showMeasures(measures);
    },

    hideMeasures: function() {
        var me = this;
        me.pageBasedView.hideMeasures();
    },

    gotoMeasureDialog: function() {
        var me = this;

        Ext.create('EdiromOnline.view.window.source.GotoMsg', {
            movements: me.movements,
            callback: Ext.bind(function(measure, movementId) {
                this.fireEvent('gotoMeasureByName', this, measure, movementId);
            }, 
            me)
        }).show();
    },

    gotoMeasure: function(measureId) {
        this.fireEvent('gotoMeasure', this, measureId);
    },

    showMeasure: function(movementId, measureId, measureCount) {
        var me = this;
       
        if(me.activeView !== 'measureBasedView')
        	me.switchInternalView('measureBasedView');
       
        me.measureBasedView.showMeasure(movementId, measureId, measureCount);
   
    },
    
    gotoZone: function(zoneId) {
        this.fireEvent('gotoZone', this, zoneId);
    },

    showZone: function(zone) {
        var me = this;
        me.pageBasedView.showZone(zone);
    },
    
    toggleAnnotations: function(item, state) {
        var me = this;
        me.annotationsVisible = state;
        me.annotationsVisibilitySetLocaly = true;

        this.fireEvent('annotationsVisibilityChange', me, state);
    },

    showAnnotations: function(annotations) {
        var me = this;
        me.pageBasedView.showAnnotations(annotations);
        me.annotationFilterChanged();
    },

    hideAnnotations: function() {
        var me = this;
        me.pageBasedView.hideAnnotations();
    },
    
    getContentConfig: function() {
        var me = this;
        return {
            id: this.id,
            pageBasedView: me.pageBasedView.getContentConfig(),
            measureBasedView: me.measureBasedView.getContentConfig()
        };
    },
    
    setContentConfig: function(config) {
        var me = this;
        me.pageBasedView.setContentConfig(config.pageBasedView);
        me.measureBasedView.setContentConfig(config.measureBasedView);
    }
});

Ext.define('EdiromOnline.view.window.source.GotoMsg', {

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
            me.combo, me.field,
            {
                xtype: 'panel',
                layout: 'hbox',
                items: [
                    { xtype: 'component', flex: 1 },
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
                ]
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

