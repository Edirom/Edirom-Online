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
Ext.define('EdiromOnline.view.window.text.TextFacsimileSplitView', {
    extend: 'EdiromOnline.view.window.View',

    requires: [
    ],

    alias : 'widget.textFacsimileSplitView',

    layout: 'border',
    
    cls: 'textFacsimileSplitView',

    annotationsVisible: false,
    annotationsLoaded: false,
    annotationsVisibilitySetLocaly: false,

	image_server: null,

    initComponent: function () {

        var me = this;
        
        me.addEvents('annotationsVisibilityChange', 'afterImagesLoaded', 'afterImageChanged',
            'documentLoaded');
            
        me.image_server = getPreference('image_server');
    	
    	if(me.image_server === 'leaflet'){
    		me.imageViewer = Ext.create('EdiromOnline.view.window.image.LeafletFacsimile');
    	}
    	else{
    		me.imageViewer = Ext.create('EdiromOnline.view.window.image.ImageViewer');
    	}

        me.imageViewer.region = 'center';

        me.centerPanel = me.imageViewer;
        
        me.westPanel = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            region: 'west',
            border: 0,
            width: '50%',
            split: true,
            items: [
                {
                    html: '<div id="' + this.id + '_textCont" class="textViewContent"></div>'
                }
            ]
        });

        me.westPanel.on('resize', me.calculateSizes, me);

        me.bottomBar = new EdiromOnline.view.window.BottomBar({owner:me, region:'south'});

        me.items = [
            me.centerPanel,
            me.westPanel,
            me.bottomBar
        ];

        me.callParent();
        
        me.on('afterrender', this.createToolbarEntries, me, {single: true});
        me.window.on('loadInternalLink', this.loadInternalId, me);
    },

    createToolbarEntries: function() {

        var me = this;

		if(me.image_server === 'digilib'){
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
		}

        me.pageSpinner = Ext.create('EdiromOnline.view.window.util.PageSpinner', {
			width: 121,
            cls: 'pageSpinner',
            owner: me
        });
        me.bottomBar.add(me.pageSpinner);
    },

    checkGlobalAnnotationVisibility: function(visible) {
        
        var me = this;
        
        if(me.annotationsVisibilitySetLocaly) return;
        
        me.annotationsVisible = visible;
        if(typeof me.toggleAnnotationVisibility != 'undefined')
            me.toggleAnnotationVisibility.setChecked(visible, true);
        
        //TODO: Controller mit einbeziehen
        if(visible && me.annotationsLoaded)
            me.showAnnotations();
        else
            this.fireEvent('annotationsVisibilityChange', me, visible);
    },

    toggleAnnotations: function(item, state) {
        var me = this;
        me.annotationsVisible = state;
        me.annotationsVisibilitySetLocaly = true;

        //TODO: Controller mit einbeziehen
        if(state && me.annotationsLoaded)
            me.showAnnotations();
        else
            this.fireEvent('annotationsVisibilityChange', me, state);
    },

    toggleNotesVisibility: function(button) {
        var notes = Ext.query('#' + this.id + '_textCont .note');
        Ext.Array.each(notes, function(name, index, notes){
            Ext.get(name).toggleCls('hidden')
        });
    },

    showAnnotations: function(annotations) {
        var me = this;

        if(me.annotationsLoaded) {
            var annos = Ext.query('#' + me.id + '_textCont span.annotation');
            Ext.Array.each(annos, function(anno) {
                Ext.get(anno).show();
            });

            return;
        }

        me.annotationsLoaded = true;

        var tpl = Ext.DomHelper.createTemplate('<span id="{0}" class="annotation {1} {2} {3}" data-edirom-annot-id="{3}"></span>');
        
        tpl.compile();

        annotations.each(function(annotation) {

            var annoId = annotation.get('id');
            var name = annotation.get('title');
            var uri = annotation.get('uri');
            var categories = annotation.get('categories');
            var priority = annotation.get('priority');
            var fn = annotation.get('fn');
            var plist = Ext.Array.toArray(annotation.get('plist'));

            Ext.Array.each(plist, function(p) {
                var targetId = p.id.substring(annoId.length + 2);
                var target = me.el.getById(me.id + '_' + targetId);

                var shape = tpl.append(target, [me.id + '_' + p.id, categories, priority, annotation.get('id')], true);
                
                shape.on('mouseenter', me.highlightShape, me, shape, true);
                shape.on('mouseleave', me.deHighlightShape, me, shape, true);
                shape.on('mousedown', me.listenForShapeLink, me, {
                    stopEvent : true,
                    elem: shape,
                    fn: fn
                });

                var tip = Ext.create('Ext.tip.ToolTip', {
                    target: me.id + '_' + p.id,
                    cls: 'annotationTip',
                    width: 500,
                    maxWidth: 500,
                    height: 300,
                    dismissDelay: 0,
                    anchor: 'left',
                    html: getLangString('Annotation_plus_Title', name)
                });

                tip.on('afterrender', function() {
                    Ext.Ajax.request({
                        url: 'data/xql/getAnnotation.xql',
                        method: 'GET',
                        params: {
                            uri: uri,
                            target: 'tip'
                        },
                        success: function(response){
                            this.update(response.responseText);
                        },
                        scope: this
                    });
                }, tip);

            }, me);

        }, me);
    },
    
    highlightShape: function(event, owner, shape) {
        shape.addCls('highlighted');
        
        var annotId = shape.getAttribute('data-edirom-annot-id');
        Ext.select('div[data-edirom-annot-id=' + annotId + ']', this.el).addCls('combinedHighlight');
        Ext.select('span[data-edirom-annot-id=' + annotId + ']', this.el).addCls('combinedHighlight');
    },

    deHighlightShape: function(event, owner, shape) {
        shape.removeCls('highlighted');
        
        var annotId = shape.getAttribute('data-edirom-annot-id');
        Ext.select('div[data-edirom-annot-id=' + annotId + ']', this.el).removeCls('combinedHighlight');
        Ext.select('span[data-edirom-annot-id=' + annotId + ']', this.el).removeCls('combinedHighlight');
    },

    listenForShapeLink: function(e, dom, args) {
        var me = this;

        if(e.button != 0) return;

        args.elem.on('mouseup', me.openShapeLink, me, {
            single: true,
            stopEvent : true,
            fn: args.fn
        });
    },

    openShapeLink: function(e, dom, args) {
        eval(args.fn);
    },

    hideAnnotations: function() {
        var me = this;
        var annos = Ext.query('#' + me.id + '_textCont span.annotation');
        Ext.Array.each(annos, function(anno) {
            Ext.get(anno).hide();
        });
    },

        //TODO: in mixin verpacken, wenn möglich
    setAnnotationFilter: function(priorities, categories) {
        var me = this;

        if(priorities.getTotalCount() == 0 && categories.getTotalCount() == 0) return;

        me.toggleAnnotationVisibility = Ext.create('Ext.menu.CheckItem', {
            id: me.id + '_showAnnotations',
            checked: me.annotationsVisible,
            text: getLangString('view.window.text.TextView_showAnnotations'),
            checkHandler: Ext.bind(me.toggleAnnotations, me, [], true)
        });

        me.annotMenu =  Ext.create('Ext.button.Button', {
            text: getLangString('view.window.text.TextView_annotMenu'),
            indent: false,
            menu : {
                items: [
                    me.toggleAnnotationVisibility
                ]
            }
        });
        me.window.getTopbar().addViewSpecificItem(me.annotMenu, me.id);

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
            text: getLangString('view.window.text.TextView_prioMenu'),
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
            text: getLangString('view.window.text.TextView_categoriesMenu'),
            menu: me.annotCategoriesMenu
        });

        me.annotMenu.show();
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

        var annotations = Ext.query('#' + this.id + '_textCont span.annotation');
        var fn = Ext.bind(function(annotation) {
            var className = annotation.className.replace('annotation', '').trim();
            var classes = className.split(' ');

            var hasCategory = false;
            var hasPriority = false;

            for(var i = 0; i < classes.length; i++) {
                hasCategory |= Ext.Array.contains(visibleCategories, classes[i]);
                hasPriority |= Ext.Array.contains(visiblePriorities, classes[i]);
            }

            Ext.get(annotation).setVisible(hasCategory & hasPriority);
        }, me);

        if(annotations.each)
            annotations.each(fn);
        else
            Ext.Array.each(annotations, fn);
    },

    setContent: function(text) {
		var me = this;
		Ext.fly(me.id + '_textCont').update(text);
		this.fireEvent('documentLoaded', me);
		
		Tipped.create('#' + me.id + '_textCont .tipped', { position: 'top', maxWidth: 300 });
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
            
        me.fireEvent('afterImageChanged', me, null);
    }, 
    
    getActivePage: function() {
        var me = this;
        return me.activePage.get('id');
    },

	setChapters: function (chapters) {
        var me = this;

		if (chapters.getTotalCount() == 0) return;
		
		me.gotoMenu = Ext.create('Ext.button.Button', {
			text: getLangString('view.window.text.TextView_gotoMenu'),
			indent: false,
			cls: 'menuButton',
			menu: {
				items:[]
			}
		});
		me.window.getTopbar().addViewSpecificItem(me.gotoMenu, me.id);
		
		me.chapters = chapters;
		
		var chapterItems =[];
		chapters.each(function (chapter) {
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
	},
	
	getWeightForInternalLink: function (uri, type, id) {
		var me = this;
		
		if (me.uri != uri)
		return 0;
		
		return 50;
	},
	
	loadInternalId: function (id, type) {
		var me = this;
		
		if(type == 'graphic' || type == 'surface') {
            me.window.requestForActiveView(me);
            me.gotoPage(id);
		}else {
		
    		var container = Ext.fly(me.id + '_textCont');
    		var elem = container.getById(me.id + '_' + id);
    		if (elem) {
    			me.window.requestForActiveView(me);
    			me.scrollToId(id);
        }
    	}
    },

    getContentConfig: function() {
        var me = this;
        return {
            id: this.id
        };
    },

    calculateSizes: function() {
        var me = this;

        try {
            me.westPanel.items.each(function(item) {
                item.setWidth(this.getWidth());
            }, me.westPanel);
        }catch(e) {
        }
    }
});


