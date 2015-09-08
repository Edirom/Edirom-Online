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
Ext.define('EdiromOnline.view.window.source.VerovioView', {
	extend: 'Ext.panel.Panel',
	
	mixins: {
		observable: 'Ext.util.Observable'
	},
	
	requires:[
	'EdiromOnline.view.window.image.VerovioImage',
	
	'Ext.draw.Component',
	'Ext.slider.Single',
	'Ext.form.ComboBox',
	'Ext.window.MessageBox'],
	
	alias: 'widget.verovioView',
	
	layout: 'border',
	
	border: 0,
	
	// renderer: null,
	// currId: null,
	bottomBar: null,
	//pageBasedView: null,
	
	
	/*pagesOrigButton: null,
	stretchHightButton: null,
	stretchWidthButton: null,
	pagesButton: null,
	pageSpinner: null,*/
	
	//imageSet: null,
	imageToShow: null,
	
	cls: 'verovioView',
	
	initComponent: function () {
		
		var me = this;
		
		//  me.currId = me.id;
		
		// me.renderer = new verovio.toolkit(),
		
		pageBasedView = Ext.create('EdiromOnline.view.window.image.VerovioImage');
		
		me.viewerContainer = Ext.create('Ext.panel.Panel', {
			region: 'center',
			border: 0,
			layout: 'card',
			items:[
			pageBasedView]
		});
		
		
		me.bottomBar = new EdiromOnline.view.window.BottomBar({
			owner: me, region: 'south', enableOverflow: false
		});
		
		me.items =[
		me.viewerContainer,
		me.bottomBar];
		
		me.callParent();
		
		// me.on('afterrender', me.createMenuEntries, me, {single: true});
		me.on('afterrender', me.createToolbarEntries, me, {
			single: true
		});
		
		// me.window.on('loadInternalLink', me.loadInternalId, me);
	},
	
	setImageSet: function (imageSet) {
		var me = this;
		
		 me.imageSet = imageSet;
		
		//pageSpinner.setStore(me.imageSet);
		
		/*if(me.imageToShow != null) {
		me.pageSpinner.setPage(me.imageSet.getById(me.imageToShow));
		me.imageToShow = null;
		
		}else if(me.imageSet.getCount() > 0)
		me.pageSpinner.setPage(me.imageSet.getAt(0));*/
		
		//me.owner.fireEvent('afterImagesLoaded', me.owner, imageSet);
		
		pageBasedView.setImageSet(me.imageSet);
		
		pageBasedView.setMovements();
	},
	
	createToolbarEntries: function () {
		
		var me = this;
		
		var entries = me.createPageSpinner();
		console.log('entries');
		console.log(entries);
		Ext.Array.each(entries, function (entry) {
			me.bottomBar.add(entry);
		});
	},
	
	/**
	 * Create button with menu
	 * @param {string} ceSource: name.
	 * @param {string} ceId.
	 * @param {object} ceMenu.
	 * @param {object} ceHandler.
	 */
	createCEButton: function (ceSource, ceId, ceMenu, ceHandler) {
		var ceButton = Ext.create('Ext.button.Button', {
			xtype: 'button',
			text: ceSource,
			//id: ceId,
			//scope: this,
			//menu: ceMenu,
			scale: 'medium',
			handler: ceHandler
		});
		
		return ceButton;
	},
	
	/**
	 * Listener on page click: add items to page menu.
	 */
	pageOrigClick: function () {
	
	 console.log('Ckick pageOrigbutton');
	 pageSpinner.setDisabled(true);
	 pageBasedView.setMovements();
	},
	
	
	/**
	 * Listener on page click: add items to page menu.
	 */
	stretchHightClick: function () {
	
	 console.log('Ckick stretchHightbutton');
	 pageSpinner.setDisabled(true);
	 pageBasedView.setMovements_2();
	},
	
	/**
	 * Listener on page click: add items to page menu.
	 */
	stretchWidthClick: function () {
	 //var me = this;
	 console.log('Ckick stretchWidthbutton');
	 pageSpinner.setDisabled(true);
	 pageBasedView.setMovements_1();
	 //console.log(imageSet);
	},
	
	
	/**
	 * Listener on page click: add items to page menu.
	 */
	pageClick: function () {	
	
	 console.log('Ckick pagebutton');
	 pageSpinner.setDisabled(false);
	},
	
	createPageSpinner: function () {
		
		var me = this;
		
		var separator1 = Ext.create('Ext.toolbar.Separator');
		var separator2 = Ext.create('Ext.toolbar.Separator');
		var separator3 = Ext.create('Ext.toolbar.Separator');
		
		pagesOrigButton = this.createCEButton('Orig', 'pages',[ {
			//handler: this.pagesOnItemClick
		}], this.pageOrigClick);
		
		
		stretchHightButton = this.createCEButton('Bild', 'strHight',[ {
			//handler: this.pagesOnItemClick
		}], this.stretchHightClick);
	
	
		stretchWidthButton = this.createCEButton( '->', 'strWidth',[ {
			//handler: this.pagesOnItemClick
		}], this.stretchWidthClick);
	
		pagesButton = this.createCEButton( 'Page', 'strWidth',[ {
			//handler: this.pagesOnItemClick
		}], this.pageClick);
	
		pageSpinner = Ext.create('EdiromOnline.view.window.source.PageSpinner', {
			width: 111,
			cls: 'pageSpinner'
			//owner: me
		});
		
		
		return[pagesOrigButton, separator1, stretchHightButton, separator2, stretchWidthButton, separator3, pagesButton, pageSpinner];
	}
});

Ext.define('EdiromOnline.view.window.source.PageSpinner', {
	extend: 'Ext.container.Container',
	
	alias: 'widget.pageSpinner',
	
	layout: 'hbox',
	
	storeTemp: null,
	
	initComponent: function () {
	
	 this.items = [
        ];
        this.callParent();
		
		var me = this;
		
		me.store = new Array("1", "2", "3");
		
		this.combo = Ext.create('Ext.form.ComboBox', {
			width: 35,
			hideTrigger: true,
			queryMode: 'local',
			store: me.store,
			displayField: 'name',
			valueField: 'id',
			cls: 'pageInputBox',
			autoSelect: true
		});
		
		this.items =[ {
			xtype: 'button',
			cls: 'prev toolButton',
			// tooltip: { text: getLangString('view.window.source.SourceView_PageBasedView_previousPage'), align: 'bl-tl' },
			listeners: {
				scope: this,
				click: this.prev
			}
		},
		this.combo, {
			xtype: 'button',
			cls: 'next toolButton',
			//tooltip: { text: getLangString('view.window.source.SourceView_PageBasedView_nextPage'), align: 'bl-tl' },
			listeners: {
				scope: this,
				click: this.next
			}
		}];
		this.callParent();
	},
	
	next: function () {
		
		this.store.clearFilter(false);
		
		var oldIndex = this.store.findExact('id', this.combo.getValue());
		if(oldIndex + 1 < this.store.getCount())
		    this.setPage(this.store.getAt(oldIndex + 1).get('id'));
		
	},
	
	prev: function () {
		
		this.store.clearFilter(false);
		
		var oldIndex = this.store.findExact('id', this.combo.getValue());
		 if(oldIndex > 0)
		this.setPage(this.store.getAt(oldIndex - 1).get('id'));
	},
	
	/*setPage: function(id) {
	this.combo.setValue(id);
	this.owner.setPage(this.combo, this.combo.store);
	},*/
	
	setStore: function (store) {
		
		this.removeAll();
		
		//this.store = store;
		
		this.store = new Array("1", "2", "3");
		
		this.combo = Ext.create('Ext.form.ComboBox', {
			width: 35,
			hideTrigger: true,
			queryMode: 'local',
			store: this.store,
			displayField: 'name',
			valueField: 'id',
			cls: 'pageInputBox',
			autoSelect: true
		});
		
		this.add([ {
			xtype: 'button',
			cls: 'prev toolButton',
			// tooltip: { text: getLangString('view.window.source.SourceView_PageBasedView_previousPage'), align: 'bl-tl' },
			listeners: {
				scope: this,
				click: this.prev
			}
		},
		this.combo, {
			xtype: 'button',
			cls: 'next toolButton',
			//tooltip: { text: getLangString('view.window.source.SourceView_PageBasedView_nextPage'), align: 'bl-tl' },
			listeners: {
				scope: this,
				click: this.next
			}
		}]);
		
		//this.combo.on('select', this.owner.setPage, this.owner);
	}
});