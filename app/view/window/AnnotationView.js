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
Ext.define('EdiromOnline.view.window.AnnotationView', {
    extend: 'EdiromOnline.view.window.View',
    
    cls: 'annotView',
    
    requires: [
        'Ext.grid.Panel',
        /*'Ext.grid.PagingScroller',*/
        'Ext.ux.grid.FiltersFeature',
        'EdiromOnline.model.Annotation',
        'EdiromOnline.model.AnnotationParticipant',
        'EdiromOnline.view.utils.Lightbox',
        'EdiromOnline.view.window.annotationLayouts.AnnotationLayout1',
        'EdiromOnline.view.window.annotationLayouts.AnnotationLayout2',
        'EdiromOnline.view.window.annotationLayouts.AnnotationLayout3'
    ],

    alias : 'widget.annotationView',

    layout: 'card',
    
    cls: 'annotationView',

    initComponent: function () {

        var me = this;

        me.addEvents('showAnnotation');

        me.activeSingleAnnotation = "";

        me.list = Ext.create('Ext.grid.Panel', {
            store: me.createStore(),
            title: getLangString('view.window.AnnotationView_Title'),
            bodyBorder: false,
            border: '0 0 0 0',
            cls: 'annotationList',
            features: [{
                ftype: 'filters',
                encode: false,
                local: true,
                filters: []
            }],
            columns: [
// 	            Not needed for RWA
/*
            	{
                    header: getLangString('view.window.AnnotationView_No'),
                    dataIndex: 'pos',
                    width: 35
                },
*/
                {
                    header: getLangString('view.window.AnnotationView_TitleLabel'),
                    dataIndex: 'title',
                    flex: 4,
                    filter: true
                },
                {
                    header: getLangString('view.window.AnnotationView_Categories'),
                    dataIndex: 'categories',
                    flex: 2,
                    filter: true
                },
                {
                    header: getLangString('view.window.AnnotationView_Priority'),
                    dataIndex: 'priority',
                    flex: 1,
                    filter: true
                },
                {
                    header: getLangString('view.window.AnnotationView_Sigla'),
                    dataIndex: 'sigla',
                    flex: 2,
                    filter: true
                }
            ]
        });

        me.participantsList = Ext.create('Ext.grid.Panel', {
            store: Ext.create('Ext.data.Store', {
                model: 'EdiromOnline.model.AnnotationParticipant'
            }),
            title: getLangString('view.window.AnnotationView_Participants'),
            bodyBorder: false,
            border: '0 0 0 0',
            cls: 'annotationList',
            features: [{
                ftype: 'filters',
                encode: false,
                local: true,
                filters: []
            }],
            columns: [
                {
                    header: getLangString('view.window.AnnotationView_Source'),
                    dataIndex: 'source',
                    flex: 1,
                    filter: true
                },
                {
                    header: getLangString('view.window.AnnotationView_TitleLabel'),
                    dataIndex: 'label',
                    flex: 2,
                    filter: true
                }
            ]
        });
        me.participantsList.on('itemdblclick', me.participantClickedList, me);

        me.contentPanel = Ext.create('Ext.panel.Panel', {
            html: '<div id="' + me.id + '_annotationCont" class="annotationViewContent">Content</div>',
            border: 0,
            flex: 2
        });
        me.metaPanel = Ext.create('Ext.panel.Panel', {
            html: '<div id="' + me.id + '_annotationMeta" class="annotationViewContent">Meta</div>',
            border: 0,
            flex: 1
        });

        me.participantsPanelGrid = Ext.create('Ext.panel.Panel', {
            html: '<div id="' + me.id + '_annotationParticipants" class="annotationViewContent"></div>',
            border: 0
        });
        me.participantsPanelSingle = Ext.create('Ext.panel.Panel', {
            html: '<div id="' + me.id + '_annotationParticipantsSingle" class="annotationViewContent"></div>',
            border: 0
        });
        me.participantsPanelList = Ext.create('Ext.panel.Panel', {
            items: [
                me.participantsList
            ],
            border: 0
        });
        me.participantsPanel = Ext.create('Ext.panel.Panel', {
            layout: 'card',
            border: 0,
            items: [
                me.participantsPanelGrid,
                me.participantsPanelSingle,
                me.participantsPanelList
            ]
        });

        var annotLayoutClass = getPreference('annotation_layout');

        me.singleView = Ext.create(annotLayoutClass);
        me.singleView.region = 'center';
        me.singleView.border = 0;
        me.singleView.setPanels(me.contentPanel, me.metaPanel, me.participantsPanel);

        me.bottomBar = new EdiromOnline.view.window.BottomBar({owner:me, region:'south'});

        me.singlePlusToolbar = Ext.create('Ext.panel.Panel', {
            layout: 'border',
            border: 0,
            items: [
                me.singleView,
                me.bottomBar
            ]
        });

        me.items = [
            me.list,
            me.singlePlusToolbar
        ];

        me.callParent();

        me.on('afterrender', me.createToolbarEntries, me, {single: true});
        me.on('afterrender', me.createMenuEntries, me, {single: true});
        me.on('show', me.loadStore, me, {single: true});

        me.window.on('loadInternalLink', me.loadInternalId, me);

        me.on('resize', me.calculateLimitingImageFactor, me, {buffer: 100});
        me.on('resize', me.resizePanels, me, {buffer: 100});

        me.list.on('itemdblclick', me.onItemDblClicked, me);
    },

    resizePanels: function() {
        var me = this;

        if(me.singleView && me.singleView.onResizeHandler) me.singleView.onResizeHandler(me);
    },
	
	createMenuEntries: function() {
		var me = this;
		
		me.switchLayout =  Ext.create('Ext.button.Button', {
        	cls: 'menuButton',
            text: getLangString('view.window.AnnotationView_Display'),
            menu: Ext.create('Ext.menu.Menu', {
                items: [
                    {
                        text: getLangString('view.window.AnnotationView_Grid'),
                        group: me.id + '_layout',
                        checked: true,
                        layoutName: 'grid',
                        handler: Ext.bind(me.switchActiveLayout, me)
                    },
                    {
                        text: getLangString('view.window.AnnotationView_Single'),
                        group: me.id + '_layout',
                        checked: false,
                        layoutName: 'single',
                        handler: Ext.bind(me.switchActiveLayout, me)
                    },
                    {
                        text: getLangString('view.window.AnnotationView_ListView'),
                        group: me.id + '_layout',
                        checked: false,
                        layoutName: 'list',
                        handler: Ext.bind(me.switchActiveLayout, me)
                    }
                ]
            })
        });
        me.window.getTopbar().addViewSpecificItem(me.switchLayout, me.id);
	},
	
    createToolbarEntries: function() {

        var me = this;

		me.listButton =  Ext.create('Ext.button.Button', {
        	cls: 'list toolButton',
        	tooltip: { text: getLangString('view.window.AnnotationView_ListView'), align: 'bl-tl' },
            handler: Ext.bind(me.showList, me)
        });
        me.bottomBar.add(me.listButton);


        me.prevItemButton =  Ext.create('Ext.button.Button', {
            cls: 'prev toolButton',
            tooltip: { text: getLangString('view.window.AnnotationView_PreviousAnnotation'), align: 'bl-tl' },
            handler: Ext.bind(me.showPrevItem, me)
        });
        me.bottomBar.add(me.prevItemButton);

        me.nextItemButton =  Ext.create('Ext.button.Button', {
            cls: 'next toolButton',
            tooltip: { text: getLangString('view.window.AnnotationView_NextAnnotation'), align: 'bl-tl' },
            handler: Ext.bind(me.showNextItem, me)
        });
        me.bottomBar.add(me.nextItemButton);
        
        me.openAllButton =  Ext.create('Ext.button.Button', {
            cls: 'openAll toolButton',
            tooltip: { text: getLangString('view.window.AnnotationView_OpenAll'), align: 'bl-tl' },
            view: me,
            action: 'openAll'
        });
        me.bottomBar.add(me.openAllButton);
        
        me.closeAllButton =  Ext.create('Ext.button.Button', {
            cls: 'closeAll toolButton',
            tooltip: { text: getLangString('view.window.AnnotationView_CloseAll'), align: 'bl-tl' },
            disabled: true,
            action: 'closeAll'
        });
        me.bottomBar.add(me.closeAllButton);

        

    },

    createStore: function() {
        var me = this;

        me.listStore = Ext.create('Ext.data.Store', {
            model: 'EdiromOnline.model.Annotation',
            autoLoad: false
        });
        me.listStore.getProxy().extraParams = {uri: me.uri, lang: getPreference('application_language')};

        return me.listStore;
    },

    loadStore: function() {
        var me = this;
        me.listStore.load();
    },

    getWeightForInternalLink: function(uri, type, id) {
        var me = this;
        
        if(me.uri != uri)
            return 0;
        
        if(type == 'annot') {
            return 70;
        }
        
        return 0;
    },
    
    loadInternalId: function(id, type) {
        var me = this;

        if(type == 'annot') {
            me.window.requestForActiveView(me);
            me.showSingleAnnotation(id);
        }
    },

    onItemDblClicked: function(list, record, item, index, e, eOpts) {
        var me = this;
        me.showSingleAnnotation(record.get('id'));
    },

    showList: function() {
        var me = this;

        if(me.getLayout().getActiveItem() != me.list)
            me.getLayout().setActiveItem(me.list);

        var selection = me.list.getSelectionModel().getSelection();

        if(selection.length == 0) {
            if(me.activeSingleAnnotation != "") {
                var activeIndex = me.listStore.indexOfId(me.activeSingleAnnotation);
                me.list.getSelectionModel().select(activeIndex);
            }else
                me.list.getSelectionModel().select(0);
        }
    },

    showPrevItem: function() {
        var me = this;
        var newItem = me.getItemByIndexDiff(-1);

        if(typeof newItem == 'undefined') return;

        me.list.getSelectionModel().select(newItem);

        if(me.getLayout().getActiveItem() == me.singlePlusToolbar)
            me.showSingleAnnotation(newItem.get('id'));
    },

    showNextItem: function() {
        var me = this;
        var newItem = me.getItemByIndexDiff(1);

        if(typeof newItem == 'undefined') return;

        me.list.getSelectionModel().select(newItem);

        if(me.getLayout().getActiveItem() == me.singlePlusToolbar)
            me.showSingleAnnotation(newItem.get('id'));
    },

    getItemByIndexDiff: function(diff) {
        var me = this;
        var selection = me.list.getSelectionModel().getSelection();

        if(selection.length == 0) {
            if(me.activeSingleAnnotation != "") {
                var activeIndex = me.listStore.indexOfId(me.activeSingleAnnotation);
                me.list.getSelectionModel().select(activeIndex);
            }else
                me.list.getSelectionModel().select(0);

            selection = me.list.getSelectionModel().getSelection();
        }

        if(selection.length == 0) return;

        var item = selection[0];
        var index = me.listStore.indexOfId(item.get('id'));
        var newItem = me.listStore.getAt(index + diff);

        return newItem;
    },

    showSingleAnnotation: function(id) {
        var me = this;

        // clear single view
        me.el.getById(me.id + '_annotationCont').update('');
        me.el.getById(me.id + '_annotationMeta').update('');
        me.el.getById(me.id + '_annotationParticipants').update('');

        me.activeSingleAnnotation = id;

        me.getLayout().setActiveItem(me.singlePlusToolbar);
        me.fireEvent('showAnnotation', me, me.uri + '#' + id);
    },

    setContent: function(data) {
        var me = this;
        var cont = me.el.getById(me.id + '_annotationCont');
        cont.update(data);

        var imgs = cont.query('img');
        Ext.Array.each(imgs, function(img) {
            var elem = new Ext.Element(img);
            elem.on('click', me.imgClicked, me, {image: elem});
        }, me);

    },

    imgClicked: function(e, elem, obj) {

        var me = this;
        var lightbox = new EdiromOnline.view.utils.Lightbox();
        lightbox.init(elem);
    },

    setMeta: function(data) {
        var me = this;
        me.el.getById(me.id + '_annotationMeta').update(data);
    },

    setPreview: function(participants) {
        var me = this;

        me.activeParticipants = participants;

        Ext.Array.each(participants, function(participant) {
            participant.id = Ext.id();
        });

        me.setPreviewGrid(participants);
/*        me.setPreviewSingle(participants);*/
/*        me.setPreviewList(participants);*/
    },

    setPreviewGrid: function(participants) {
        var me = this;

        var el = me.el.getById(me.id + '_annotationParticipants');
        el.update('<div class="annotView"><div class="previewArea"></div></div>');
        var div = el.query('div.previewArea');
        if(div.length && div.length > 0) div = div[0];

        var dh = Ext.DomHelper;
        var tplImg = dh.createTemplate({tag:'div', cls: 'previewItem',
            html:'<div id="{0}" class="imgBox"><img src="{1}" class="previewImg" /><input type="hidden" class="previewImgData" value="{2}"/></div><div class="label">{3}</div>'});
        tplImg.compile();

        var tplText = dh.createTemplate({tag:'div', cls: 'previewItem',
            html:'<div id="{0}" class="txtBox">{1}</div><div class="label">{2}</div>'});
        tplText.compile();

        var elems = new Array();

        var tall = false;
        var wide = false;
        var square = false;


        Ext.Array.each(participants, function(participant) {

            var id = participant['id'];
            var type = participant['type'];
            var label = participant['label'];
            var mdiv = participant['mdiv'];
            var page = participant['page'];
            var source = participant['source'];
            var siglum = participant['siglum'];
            var part = participant['part'];
            // var digilibBaseParams = participant['digilibBaseParams'];
            // var digilibSizeParams = participant['digilibSizeParams'];
            var digilibURL = participant['digilibURL'];
            var hiddenData = participant['hiddenData'];
            var content = participant['content'];

            label = (siglum == ''?source:siglum) + (part == ''?'':', '+part);//  + ": " + label;

            if(type == 'text') {

                var shape = tplText.append(div, [id, content, label], true);
                // shape.on('dblclick', me.participantClickedGrid, me, {participant: id});
                shape.on('dblclick', function() {
                   loadLink(participant.linkUri, {});
                });
                
                elems.push(shape);

                square |= true;

            }else {
                var shape = tplImg.append(div, [id, /* digilibBaseParams + "dw=600&amp;amp;dh=600" + digilibSizeParams*/ digilibURL, hiddenData, label], true);
                shape.on('dblclick', me.participantClickedGrid, me, {participant: id});

                elems.push(shape);

                var imgData = Ext.JSON.decode(hiddenData);

                if(imgData.height / imgData.width > 2.0)
                    tall |= true;
                else if(imgData.width / imgData.height > 2.0)
                    wide |= true;
                else
                    square |= true;
            }
        });

        var h = 100.00;
        var w = 100.00;

        if(tall && !wide && !square)
            w = Math.round(10000 / elems.length) / 100;

        else if(!tall && wide && !square)
            h = Math.round(10000 / elems.length) / 100;

        else {
            w = Math.ceil(Math.sqrt(elems.length));
            h = Math.ceil(elems.length / w);

            w = Math.round(10000 / w) / 100;
            h = Math.round(10000 / h) / 100;
        }

        Ext.Array.each(elems, function(item) {
            var elem = new Ext.Element(item);
            elem.setWidth(w + '%');
            elem.setHeight(h + '%');
        });

        me.calculateLimitingImageFactor();
    },

    setPreviewSingle: function(participants) {
        var me = this;

        if(participants.length > 0) {
            var participant = participants[0];
            me.setPreviewSingleById(participant['id']);
        }
    },

    setPreviewSingleById: function(id, prevView) {
        var me = this;

        var el = me.el.getById(me.id + '_annotationParticipantsSingle');
        el.update('<div class="annotView"><div class="previewArea"></div></div>');
        var div = el.query('div.previewArea');
        if(div.length && div.length > 0) div = div[0];

        var dh = Ext.DomHelper;
        var tplImg = dh.createTemplate({tag:'div', cls: 'previewItem',
            html:'<div class="stepLeft"></div><div class="stepRight"></div><div class="imgBox"><img src="{0}" class="previewImg" /><input type="hidden" class="previewImgData" value="{1}"/></div><div class="label">{2}</div>'});
        tplImg.compile();

        var tplText = dh.createTemplate({tag:'div', cls: 'previewItem',
            html:'<div class="stepLeft"></div><div class="stepRight"></div><div class="txtBox">{0}</div><input type="hidden" class="previewTxtData" value="{1}"/><div class="label">{2}</div>'});
        tplText.compile();

        var participants = Ext.Array.filter(me.activeParticipants, function(part) { return part['id'] == id });

        if(participants.length > 0) {

            var participant = participants[0];

            var type = participant['type'];
            var label = participant['label'];
            var mdiv = participant['mdiv'];
            var page = participant['page'];
            var source = participant['source'];
            var siglum = participant['siglum'];
            // var digilibBaseParams = participant['digilibBaseParams'];
            // var digilibSizeParams = participant['digilibSizeParams'];
            var digilibURL = participant['digilibURL'];
            var hiddenData = participant['hiddenData'];
            var content = participant['content'];

            label = (siglum == ''?source:siglum);//  + ": " + label;

            var shape = null;

            if(type == 'text') {
                shape = tplText.append(div, [content, hiddenData, label], true);

            } else {
                shape = tplImg.append(div, [/* digilibBaseParams + "dw=600&amp;amp;dh=600" + digilibSizeParams*/ digilibURL, hiddenData, label], true);
            }
            
            shape.setWidth('100%');
            shape.setHeight('100%');

            shape.on('dblclick', me.participantClickedSingle, me, {prevView: prevView});
            
            // does not seem to be implemented yet
            /* 
            var stepLeft = shape.query('div.stepLeft')[0];
            stepLeft.on('click', me.previousParticipantSingle, me);

            var stepRight = shape.query('div.stepRight')[0];
            stepRight.on('click', me.nextParticipantSingle, me);
            */
            
        }

        me.calculateLimitingImageFactor();
    },

    loadParticipantSingleContent: function() {
        var me = this;

        var contEl = me.el.getById(me.id + '_annotationParticipantsSingle');
        var previewTxtData = contEl.query('input.previewTxtData');

        if (previewTxtData.length == 0) return;

        var txtData = previewTxtData[0].value;
        var uri = txtData.match(/uri:(.*)__\$\$__/)[1];
        var id = txtData.match(/__\$\$__participantId:(.*)/)[1];

        Ext.Ajax.request({
            url: 'data/xql/getReducedDocument.xql?uri=' + uri + '&selectionId=' + id + '&subtreeRoot=div&idPrefix=' + me.id + '_',
            success: function(response){
                var contEl = this.el.getById(me.id + '_annotationParticipantsSingle');
                var txtBox = new Ext.Element(contEl.query('div.txtBox')[0]);
                txtBox.update(response.responseText);

                contEl.query('#' + this.id + '_' + id)[0].scrollIntoView(txtBox);
            },
            scope: me
        });
    },

    previousParticipantSingle: function() {
        //TODO: console.log(arguments);
    },

    nextParticipantSingle: function() {
        //TODO: console.log(arguments);
    },

    setPreviewList: function(participants) {
        var me = this;

        me.participantsList.getStore().loadData(participants, false);
    },

    switchActiveLayout: function(layoutName) {
        var me = this;

        if(typeof layoutName !== 'string') layoutName = layoutName.layoutName;

        me.switchLayout.menu.items.each(function(entry) {
            if(entry['layoutName'] == layoutName && !entry.checked)
                entry.setChecked(true);
        });

        switch(layoutName) {
            case 'grid': {
                me.participantsPanel.getLayout().setActiveItem(me.participantsPanelGrid);

            } break;
            case 'single': {
                me.participantsPanel.getLayout().setActiveItem(me.participantsPanelSingle);
                me.loadParticipantSingleContent();

            } break;
            case 'list': {
                me.participantsPanel.getLayout().setActiveItem(me.participantsPanelList);

            } break;
            default: break;
        }

        me.calculateLimitingImageFactor();
    },

    participantClickedGrid: function(e, item, args) {
        var me = this;

        me.setPreviewSingleById(args['participant'], 'grid');
        me.switchActiveLayout('single');
    },

    participantClickedList: function(grid, record, item, index, e, args) {
        var me = this;

        me.setPreviewSingleById(record.getId(), 'list');
        me.switchActiveLayout('single');
    },

    participantClickedSingle: function(e, item, args) {
        var me = this;

        me.switchActiveLayout(args.prevView);
    },

    calculateLimitingImageFactor: function() {
        var me = this;

        // GridView
        var contEl = me.el.getById(me.id + '_annotationParticipants');
        var items = contEl.query('.previewItem');

        Ext.Array.each(items, me.calculateLimitingImageFactorSingle);


        // SingleView
        contEl = me.el.getById(me.id + '_annotationParticipantsSingle');
        items = contEl.query('.previewItem');

        Ext.Array.each(items, me.calculateLimitingImageFactorSingle);

    },

    calculateLimitingImageFactorSingle: function(item) {

        //TODO: Texte rausfiltern

        var elem = new Ext.Element(item);

        var imgBoxes = elem.query('.imgBox');

        if(imgBoxes.length == 0) {

            elem.addCls('widthLimited');

        }else {
            var imgBox = new Ext.Element(imgBoxes[0]);
            var imgData = Ext.JSON.decode(new Ext.Element(elem.query('.previewImgData')[0]).getValue());

            var heightQuotient = imgBox.getHeight() / imgData.height;
            var widthQuotient = imgBox.getWidth() / imgData.width;

            if(heightQuotient < widthQuotient) {
                elem.removeCls('widthLimited');
                elem.addCls('heightLimited');
            }else {
                elem.removeCls('heightLimited');
                elem.addCls('widthLimited');
            }
        }
    },
    
    getContentConfig: function() {
        var me = this;
        return {
            id: this.id
        };
    }
});
