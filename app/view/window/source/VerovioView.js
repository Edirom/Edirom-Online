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
	
	cls: 'verovioView',
	
	initComponent: function () {
		
		var me = this;
		
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
		
		me.on('afterrender', me.createToolbarEntries, me, {
			single: true
		});
	},
	
	setImageSet: function (imageSet) {
		var me = this;
		
		me.imageSet = imageSet;
		
		pageBasedView.setImageSet(me.imageSet);
		
		pageBasedView.showPage(1);
	},
	
	createToolbarEntries: function () {
		
		var me = this;
		
		var entries = me.createPageSpinner();
		
		Ext.Array.each(entries, function (entry) {
			me.bottomBar.add(entry);
		});
	},
	
	stretchHightClick: function () {
		pageSpinner.setDisabled(true);
		pageBasedView.showContinuousHight();
	},
	
	stretchWidthClick: function () {
		pageSpinner.setDisabled(true);
		pageBasedView.showContinuousWidth();
	},

	pageClick: function () {
		pageSpinner.setDisabled(false);
		pageBasedView.showPage(1);
	},
	
	createPageSpinner: function () {
		
		var me = this;
		
		var storeField = new Array('Pages', 'Continuous Hight', 'Continuous Width');
		
		var combo = Ext.create('Ext.form.ComboBox', {
			fieldLabel: 'Rendering View',
			store: storeField,
			queryMode: 'local',
			displayField: 'name',
			editable: false,
			
			listeners: {
				select: function (combo, record, index) {
					console.log(combo);
					console.log(record);
					console.log(index);
					if (combo.getValue() === 'Pages') {
						me.pageClick();
					} else if (combo.getValue() === 'Continuous Hight') {
						me.stretchHightClick();
					} else if (combo.getValue() === 'Continuous Width') {
						me.stretchWidthClick();
					}
				}
			}
		});
		combo.setValue(storeField[0]);
		
		pageSpinner = Ext.create('EdiromOnline.view.window.source.PageSpinner', {
			width: 111,
			cls: 'pageSpinner'
		});
		
		pageBasedView.setPageSpinner(pageSpinner);
		
		return[combo, pageSpinner];
	}
});

Ext.define('EdiromOnline.view.window.source.PageSpinner', {
	extend: 'Ext.container.Container',
	
	alias: 'widget.pageSpinner',
	
	layout: 'hbox',
	
	initComponent: function () {
		
		this.items =[];
		this.callParent();
	},
	
	next: function () {
		console.log(this.combo.getValue());
		var newValue = this.combo.getValue() + 1;
		console.log(newValue);
		if (this.store.indexOf(newValue) != -1) {
			this.setPage(newValue);
			pageBasedView.showPage(newValue);
		}
	},
	
	prev: function () {
		var newValue = this.combo.getValue() -1;
		if (this.store.indexOf(newValue) != -1) {
			this.setPage(newValue);
			pageBasedView.showPage(newValue);
		}
	},
	
	setPage: function (id) {
		this.combo.setValue(id);
	},
	
	setStore: function (test) {
		
		this.removeAll();
		
		var storeField = new Array(test);
		var value = 0;
		for (var i = 0; i <= test; i++) {
			storeField[i] = value++;
		}
		
		this.store = storeField;
		
		this.combo = Ext.create('Ext.form.ComboBox', {
			width: 35,
			hideTrigger: true,
			queryMode: 'local',
			store: storeField,
			displayField: 'name',
			valueField: 'id',
			cls: 'pageInputBox',
			autoSelect: true
		});
		
		this.add([ {
			xtype: 'button',
			cls: 'prev toolButton',
			listeners: {
				scope: this,
				click: this.prev
			}
		},
		this.combo, {
			xtype: 'button',
			cls: 'next toolButton',
			listeners: {
				scope: this,
				click: this.next
			}
		}]);
	}
});