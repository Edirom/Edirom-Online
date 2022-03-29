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
				single: true
			}
		});
	},
	
	onSourceViewRendered: function (view) {
		var me = this;
		
		if (view.initialized) return;
		view.initialized = true;
		
		var uri = view.uri;
		view.setIFrameURL('data/xql/getExtendedStaff.xql?uri=' + uri + "&edition=" + this.application.activeEdition);

		view.on('gotoMeasureByName', me.onGotoMeasureByName, me);
		view.on('gotoMeasure', me.onGotoMeasure, me);
		
		Ext.Ajax.request({
			url: 'data/xql/getMovements.xql',
			method: 'GET',
			params: {
				uri: view.uri
			},
			success: function (response) {
				var data = response.responseText;
				
				var movements = Ext.create('Ext.data.Store', {
					fields:[ 'id', 'name'],
					data: Ext.JSON.decode(data)
				});
				
				me.movementsLoaded(movements, view);
			}
		});
	},

	movementsLoaded: function (movements, view) {
		view.setMovements(movements);
	},

	onGotoMeasureByName: function (view, measure, movementId) {
		var me = this;
		
		Ext.Ajax.request({
			url: 'data/xql/getMeasurePage.xql',
			method: 'GET',
			params: {
				id: view.uri,
				measure: measure,
				movementId: movementId
			},
			success: Ext.bind(function (response) {
				var data = response.responseText;
				this.gotoMeasure(Ext.JSON.decode(data)[0], view);
			},
			me)
		});
	},

	onGotoMeasure: function (view, measureId) {
		
		var me = this;
		
		Ext.Ajax.request({
			url: 'data/xql/getMeasure.xql',
			method: 'GET',
			params: {
				id: view.uri,
				measureId: measureId
			},
			success: Ext.bind(function (response) {
				var data = response.responseText;
				this.gotoMeasure(Ext.JSON.decode(data), view);
			},
			me)
		});
	},
	
	gotoMeasure: function (result, view) {
		var me = this;
		
		var measureId = result.measureId;
		var movementId = result.movementId;
		var measureCount = result.measureCount;
		
		if (measureId != '' && movementId != '') {
			view.showMeasure(movementId, measureId, measureCount);
		}
	},
	
	pagesLoaded: function (text, view) {
		view.setImageSet(text);
	}
});
