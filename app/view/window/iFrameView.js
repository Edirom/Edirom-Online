/**
 *  Edirom Online
 *  Copyright (C) 2016 The Edirom Project
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
Ext.define('EdiromOnline.view.window.iFrameView', {
	extend: 'EdiromOnline.view.window.View',
	
	requires:[],
	
	alias: 'widget.iFrameView',
	
	layout: 'fit',
	
	cls: 'iFrameView',
	
	idView: null,
	placeHolder: null,
	content: null,
	
	initComponent: function () {
		
		var me = this;
		
		me.html = '<div id="' + me.id + '_iFrameViewCont" class="iFrameViewContent"><iframe id="' + me.id +
		'_iFrameViewContIFrame" style="width:100%; height:100%; border:none; background-color:white;"></iframe></div>';
		
		me.callParent();
		
	},
	
	setContent: function (url) {
		var me = this;
		var contEl = me.el.getById(me.id + '_iFrameViewContIFrame');
		contEl.on('load', function() { this.updateTitle(); }, me);
		contEl.set({'src': url});
	},
	
	getContentConfig: function () {
		var me = this;
		return {
			id: this.id
		};
	},

	updateTitle: function() {
		var me = this;
		var contEl = me.el.getById(me.id + '_iFrameViewContIFrame');
		var title = contEl.dom.contentDocument.title;
		me.window.setTitle(title);
	}
});
