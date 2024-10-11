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
Ext.define('EdiromOnline.view.window.SummaryView', {
	extend: 'Ext.panel.Panel',
	
	xtype: 'layout-border',
	requires:[
	'Ext.layout.container.Border'],
	layout: 'border',
	
	bodyBorder: false,
	
	defaults: {
		collapsible: true,
		split: true,
		bodyPadding: 10
	},
	
	alias: 'widget.summaryView',
	
	cls: 'summaryView',
	
	image_server: null,
	imageViewer: null,
	
	initComponent: function () {
		
		var me = this;
		
		me.html = '<div id="' + me.id + '_summaryCont" class="summaryViewContent"></div>';
		
		me.image_server = getPreference('image_server');
		
		me.items =[];

		me.callParent();
	},
	
	setContent: function (data) {
		var me = this;
		
		var fragment = document.createDocumentFragment('div');
		var tempDiv = document.createElement('div');
		fragment.appendChild(tempDiv);
		tempDiv.innerHTML = data;
		var name = tempDiv.getElementsByClassName("summaryViewSource");
				
		me.add({
			collapsible: false,
			region: 'center',
			html: data
		});
	},
	
	getContentConfig: function () {
		var me = this;
		return {
			id: this.id
		};
	}
});