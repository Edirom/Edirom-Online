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
Ext.define('EdiromOnline.controller.window.SummaryView', {
	
	extend: 'Ext.app.Controller',
	
	views:[
	'window.SummaryView'],
	
	init: function () {
		this.control({
			'summaryView': {
				show: this.onAfterLayout
			}
		});
	},
	
	onAfterLayout: function (view) {
		
		var me = this;
		
		if (view.initialized) return;
		view.initialized = true;
		
		var uri = view.uri;
		var type = view.type;
		var app = EdiromOnline.getApplication();
		var activeEdition = app.activeEdition
		
		Ext.Ajax.request({
			url: 'data/xql/getSummary.xql',
			method: 'GET',
			params: {
				uri: uri,
				type: type,
				edition: activeEdition
			},
			success: function (response) {				
				var data = response.responseText;

                view.setContent(data);
			},
			scope: this
		});
	}
});