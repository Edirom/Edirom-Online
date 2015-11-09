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
	bottomBar: null,
	
	imageToShow: null,
	
	pageSpinner: null,
	
	pageBasedView: null,
	
	displayFormCombo: null,
	
	cls: 'verovioView',
	
	initComponent: function () {
		
		var me = this;
		
		me.pageBasedView = Ext.create('EdiromOnline.view.window.image.VerovioImage');
		
		me.viewerContainer = Ext.create('Ext.panel.Panel', {
			region: 'center',
			border: 0,
			layout: 'card',
			items:[
			me.pageBasedView]
		});
		
		
		me.bottomBar = new EdiromOnline.view.window.BottomBar({
			owner: me, region: 'south', enableOverflow: false
		});
		
		me.items =[
		me.viewerContainer,
		me.bottomBar];
		
		me.callParent();
		
		me.on('afterrender', me.createToolbarEntries, me);
	},
	
	setIFrameURL: function (imageSet) {
		var me = this;
		me.imageSet = imageSet;
		me.pageBasedView.setImageSet(me.imageSet);
	},
	
	createToolbarEntries: function () {
		var me = this;
		var entries = me.createPageSpinner();
		Ext.Array.each(entries, function (entry) {
			me.bottomBar.add(entry);
		});
	},
	
	stretchHightClick: function (me) {
		me.pageSpinner.setDisabled(true);
		me.pageBasedView.showContinuousHight();
	},
	
	stretchWidthClick: function (me) {
		me.pageSpinner.setDisabled(true);
		me.pageBasedView.showContinuousWidth();
	},
	
	pageClick: function (me) {
		me.pageSpinner.setDisabled(false);
		me.pageBasedView.showPage(1, true);
	},
	
	pageOriginalClick: function (me) {
		me.pageSpinner.setDisabled(true);
		me.pageBasedView.showAllPages();
	},
	
	createMenuItems: function (me, displayForm) {
		var items = new Array(17);
		
		var item = Ext.create('Ext.menu.Item', {
			text: 'Ouverture',
			style: {
        		backgroundColor:'#E8E8E8'
    		},
			handler: function (item) {
				me.displayFormCombo.setText(displayForm+'/'+item.text);
				me.pageBasedView.setImageSet('data/xql/getExtendedStaff.xql?uri='+me.uri+'?'+displayForm+'/'+item.text+'.xml');
			}
			});
			items[0] = item;
			
		for (var i = 1; i <= 16; i++) {
			var satzItem = Ext.create('Ext.menu.Item', {
			text: 'Satz_'+i,
			style: {
        		backgroundColor:'#E8E8E8'
    		},
			handler: function (item) {
				me.displayFormCombo.setText(displayForm+'/'+item.text);
				me.pageBasedView.setImageSet('data/xql/getExtendedStaff.xql?uri='+me.uri+'?'+displayForm+'/'+item.text+'.xml');
			}
			});
			items[i] = satzItem;
		}
		
		return items;
	},
	
	createPageSpinner: function () {
		
		var me = this;
		
		/*var displayLabel  = Ext.create('Ext.form.Label', {
			xtype: 'label',
        	text: 'Darstellung'
		});*/
			
		me.displayFormCombo = Ext.create('Ext.button.Button', {
			xtype: 'button',
			width: 150,
			ui: 'plain',
 			style:'background-color:#E8E8E8',
			menu:[Ext.create('Ext.menu.Item', {
				text: 'abbr',
				style: {
        			backgroundColor:'#E8E8E8'
    			},
				menu: me.createMenuItems(me, 'abbr')
			}),
			
			Ext.create('Ext.menu.Item', {
				text: 'expan',
				style: {
        			backgroundColor:'#E8E8E8'
    			},
				menu: me.createMenuItems(me,'expan')
			})]
		});
		me.displayFormCombo.setText('expan/Ouverture');
			
		var storeField = new Array('Original', 'Pages', 'Continuous Hight', 'Continuous Width');		
		var combo = Ext.create('Ext.form.ComboBox', {
			fieldLabel: 'Rendering View',
			store: storeField,
			queryMode: 'local',
			width: 230,
			displayField: 'name',
			editable: false,			
			listeners: {
				select: function (combo, record, index) {
					if (combo.getValue() === 'Original') {
						me.pageOriginalClick(me);
					} else if (combo.getValue() === 'Pages') {
						me.pageClick(me);
					} else if (combo.getValue() === 'Continuous Hight') {
						me.stretchHightClick(me);
					} else if (combo.getValue() === 'Continuous Width') {
						me.stretchWidthClick(me);
					}
				}
			}
		});
		combo.setValue(storeField[0]);
		
		me.pageSpinner = Ext.create('EdiromOnline.view.window.source.VerovioPageSpinner', {
			width: 120,
			cls: 'pageSpinner'
		});		
		me.pageBasedView.setPageSpinner(me.pageSpinner);
		me.pageSpinner.setPageBasedView(me.pageBasedView);
		
		return[me.displayFormCombo, combo, me.pageSpinner];
	}
});

Ext.define('EdiromOnline.view.window.source.VerovioPageSpinner', {
	extend: 'Ext.container.Container',
	
	alias: 'widget.verovioPageSpinner',
	
	layout: 'hbox',
	
	pageBasedView: null,
	
	initComponent: function () {
		
		this.items =[];
		this.callParent();
	},
	
	next: function () {
		var newValue = this.combo.getValue() + 1;
		if (this.store.indexOf(newValue) != -1) {
			this.setPage(newValue);
			this.pageBasedView.showPage(newValue, false);
		}
	},
	
	prev: function () {
		var newValue = this.combo.getValue() -1;
		if (this.store.indexOf(newValue) != -1) {
			this.setPage(newValue);
			this.pageBasedView.showPage(newValue, false);
		}
	},
	
	setPageBasedView: function (pageBasedView) {
		this.pageBasedView = pageBasedView;
	},
	
	setPage: function (id) {
		this.combo.setValue(id);
	},
	
	setStore: function (test) {
		
		var me = this;
		
		this.removeAll();
		
		var storeField = new Array(test-1);
		var value = 1;
		for (var i = 0; i <= test-1; i++) {
			storeField[i] = value++;
		}
		
		this.store = storeField;
		
		this.combo = Ext.create('Ext.form.ComboBox', {
			width: 35,
			hideTrigger: true,
			queryMode: 'local',
			store: this.store,
			displayField: 'name',
			editable: true,
			valueField: 'id',
			cls: 'pageInputBox',
			autoSelect: true,
			enableKeyEvents: true,
			listeners: {			
				keydown:function (combo, e, eOpts) {
            		if (e.getKey() == 13) {
            			me.setPage(combo.getValue());
						me.pageBasedView.showPage(combo.getValue(), false);
            		}
        		}
			}
		});
		
		this.add([ {
			xtype: 'button',
			cls: 'prev toolButton',
			listeners: {
				scope: this,
				click: this.prev
			}
		},
		this.combo, 
		{
        xtype: 'label',
        text: 'von '+ test,
        margins: '5 0 0 5'
    },
		{
			xtype: 'button',
			cls: 'next toolButton',
			listeners: {
				scope: this,
				click: this.next
			}
		}]);
	}
});