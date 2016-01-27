Ext.define('EdiromOnline.view.window.text.FacsimileView', {
    extend: 'EdiromOnline.view.window.View',

    requires: [
        'EdiromOnline.view.window.image.ImageViewer'
    ],

    alias : 'widget.facsimileView',

    layout: 'border',

    border: 0,

    imageSet: null,
    imageToShow: null,

    measuresVisible: false,
    annotationsVisible: false,

    initComponent: function () {

        this.addEvents();

        this.imageViewer = Ext.create('EdiromOnline.view.window.image.ImageViewer');
        this.imageViewer.region = 'center';

        this.bottomBar = new EdiromOnline.view.window.BottomBar({owner:this, region:'south'});

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

    getWeightForInternalLink: function(uri, type, id) {
        var me = this;
        
        if(me.uri != uri)
            return 0;
        
        if(type == 'graphic' || type == 'surface' || type == 'zone')
            return 70;
            
        return 0;
    },

    loadInternalId: function() {
        var me = this;

        if(me.window.internalIdType == 'surface' || me.window.internalIdType == 'graphic' ) {
            me.window.requestForActiveView(me);
            me.showPage(me.window.internalId);
        }
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
            
        me.fireEvent('afterImagesLoaded', me, imageSet);
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
                        id: me.id + '_fitFacsimile',
                        text: getLangString('view.window.source.SourceView_fitView'),
                        handler: Ext.bind(me.fitFacsimile, me, [], 0)
                    }
                ]
            }
        });
        me.window.getTopbar().addViewSpecificItem(me.viewMenu, me.id);
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

        me.pageSpinner = Ext.create('EdiromOnline.view.window.source.PageSpinner', {
            width: 121,
            cls: 'pageSpinner',
            owner: me
        });
        me.bottomBar.add(me.pageSpinner);
    },

    fitFacsimile: function() {
        this.imageViewer.fitInImage();
    },

    updateZoom: function(zoom) {
        this.zoomSlider.suspendEvents();
        this.zoomSlider.setValue(Math.round(zoom * 100));
        this.zoomSlider.resumeEvents();
    },

    zoomChanged: function(slider) {
        this.imageViewer.setZoomAndCenter(slider.getValue() / 100);
    },
    
    setChapters: function(chapters) {
        var me = this;

        if(chapters.getTotalCount() == 0) return;

        me.gotoMenu =  Ext.create('Ext.button.Button', {
            text: getLangString('view.window.text.TextView_gotoMenu'),
            indent: false,
            cls: 'menuButton',
            menu : {
                items: [
                ]
            }
        });
        me.window.getTopbar().addViewSpecificItem(me.gotoMenu, me.id);

        me.chapters = chapters;

        var chapterItems = [];
        chapters.each(function(chapter) {
            chapterItems.push({
                text: chapter.get('name'),
                handler: Ext.bind(me.gotoChapter, me, chapter.get('pageId'), true)
            });
        });

        me.gotoMenu.menu.add(chapterItems);
        me.gotoMenu.show();
    },
	
	gotoChapter: function (menuItem, event, pageId) {
		this.fireEvent('gotoChapter', this, pageId);
	},
    
    gotoPage: function (pageId) {
		var me = this;
		me.pageSpinner.setPage(me.imageSet.getById(pageId));
	}
});

Ext.define('EdiromOnline.view.window.source.PageSpinner', {
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