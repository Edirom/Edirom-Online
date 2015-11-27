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
Ext.define('EdiromOnline.view.window.image.VerovioImage', {
	extend: 'Ext.panel.Panel',
	
	layout: 'fit',
	
	currId: null,
	renderer: null,
	text: null,
	imageSet: null,
	bodyDoc: null,
	pageSpinner: null,
	pageHeight: null,
	pageWidth: null,
	numberPages: null,
	
	iframe: null,
	
	initComponent: function () {
		
		var me = this;
		me.currId = me.id;
		
		me.html = '<div id="' + me.id + '_rendCont" class="renderingViewContent"><iframe id="' + me.id +
		'_rendContIFrame" style="width:100%; height:100%; border:none; background-color:white;"></iframe></div>';
		
		me.callParent();
	},
	
	setBody: function (bodyDoc) {
		var me = this;
		me.bodyDoc = bodyDoc;
	},
	
	setImageSet: function (imageSet) {
		var me = this;
		me.imageSet = imageSet;
		
		var contEl = me.el.getById(me.id + '_rendContIFrame');
		contEl.set({
			'src': imageSet
		});
		
	},
	
	showPage: function (pageNr, isSetCount) {
		var me = this;
		
		var iframe = Ext.getDom(me.id + '_rendContIFrame').contentWindow;
		if (isSetCount) {
			var pageCount = iframe.numberPages;
			me.pageSpinner.setStore(pageCount);
			me.pageSpinner.setPage(1);
		}
		iframe.loadPage(pageNr);
	},
	
	showAllPages: function () {
		var me = this;
		
		var iframe = Ext.getDom(me.id + '_rendContIFrame').contentWindow;
		iframe.allPages();
	},
	
	showContinuousWidth: function () {
		var me = this;
		var iframe = Ext.getDom(me.id + '_rendContIFrame').contentWindow;
		iframe.loadContinuousWidth();
	},
	
	showContinuousHight: function () {
		var me = this;
		var iframe = Ext.getDom(me.id + '_rendContIFrame').contentWindow;
		iframe.loadContinuousHight();
	},
	
	setPageSpinner: function (pageSpinner) {
		this.pageSpinner = pageSpinner;
	}
});