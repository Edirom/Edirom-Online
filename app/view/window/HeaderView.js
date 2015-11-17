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
Ext.define('EdiromOnline.view.window.HeaderView', {
	extend: 'Ext.panel.Panel',
	
	requires:[],
	
	alias: 'widget.headerView',
	
	layout: 'fit',
	
	cls: 'headerView',
	
	pageBasedView: null,
	dataStored: null,
	
	initComponent: function () {
		
		var me = this;
		
		me.pageBasedView = Ext.create('EdiromOnline.view.window.HeaderViewInner');
	
		me.items =[
		me.pageBasedView];
		
		me.callParent();
		
		me.on('afterrender', me.createMenuEntries, me, {single: true});
	},
	
	setContent: function (data, uri) {
		var me = this;
		me.dataStored = data;
		me.pageBasedView.setContent(data, uri);
	},
	
	createMenuEntries: function() {
		var me = this;
		
		var reloadIcon = Ext.create('Ext.panel.Tool', {
			type: 'refresh',
            tooltip: 'aktiviere Annotations',
			handler: function () {
				if (annotationOn) {
				var uri = me.uri;
        		var type = me.type;
        		var dataStoredTMP = me.dataStored;
				
				me.pageBasedView.destroy();					
				me.pageBasedView = Ext.create('EdiromOnline.view.window.HeaderViewInner');
				me.add(me.pageBasedView);
                me.pageBasedView.setContent(dataStoredTMP, uri+'?type'+type);
				}
				else{
					alert('Annotation-Anzeige ist nicht aktiv: \nSie sind nicht auf AnnotaeIt-Seite angemeldet.');
				}
			}
		});
		
        me.window.getTopbar().addViewSpecificItem(reloadIcon, me.id);
	},
	
	getContentConfig: function () {
		var me = this;
		return {
			id: this.id
		};
	}
});