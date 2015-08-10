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
Ext.define('EdiromOnline.controller.window.source.VerovioView', {
	
	extend: 'Ext.app.Controller',
	
	views:[
	'window.source.VerovioView'],
	
	init: function () {
		this.control({
			'verovioView': {
				afterlayout: this.onSourceViewRendered,
				// beforedestroy: this.onSourceViewDestroyed,
				single: true
			}
		});
	},
	
	onSourceViewRendered: function (view) {
		var me = this;
		
		if (view.initialized) return;
		view.initialized = true;
		
        var uri = view.uri;
        
		//var uri = 'xmldb:exist:///db/contents/sources/edirom_source_01b5977f-4075-4373-a709-5e762b81e8ca.xml';
		
		Ext.Ajax.request({
			//url: "http://localhost:8080/exist/rest/db/contents/sources/edirom_source_01b5977f-4075-4373-a709-5e762b81e8ca.xml",
			// url: 'data/xql/getPages.xql',
			 url: 'data/xql/getExtendedStaff.xql',
			method: 'GET',
			params: {
			uri: uri
			},
			success: function (response) {
				
				var text = response.responseText;
				
				/*var pages = Ext.create('Ext.data.Store', {
				fields: ['id', 'name', 'path', 'width', 'height', 'measures', 'annotations'],
				data: Ext.JSON.decode(data)
				});*/
				
				// me.pagesLoaded(pages, view);
				
				me.pagesLoaded(text, view);
				
				// me.movementsLoaded(text, view);
			}
		});
	},
	
	pagesLoaded: function (text, view) {
		view.setImageSet(text);
	}
	
	/*movementsLoaded: function(text, view) {
	view.setMovements(text);
	}*/
});