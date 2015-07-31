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
	
	mixins: {
		observable: 'Ext.util.Observable'
	},
	
	layout: 'fit',
	
	currId: null,
	renderer: null,
	border: 0,
	
	initComponent: function () {
		
		var me = this;
		me.currId = me.id;
		
		app = EdiromOnline.getApplication();
		me.renderer = app.getRenderer();
		
		me.callParent();
	},
	
	setMovements: function (text) {
		
		var me = this;
		
		var options = JSON.stringify({
			/*pageHeight: 450,
			pageWidth: 850,
			ignoreLayout: 25,
			border: 0,
			scale: 33*/
			pageHeight: 2100,
			pageWidth: 4200,
			ignoreLayout: 1,
			border: 100,
			scale: 50
		});
		me.renderer.setOptions(options);
		me.renderer.loadData(text);
		// var svg = renderer.renderPage( 1, options );
		var svg = me.renderer.renderData(text, options);
		
		$('#' + me.currId + '-body').html(svg);
	}
});