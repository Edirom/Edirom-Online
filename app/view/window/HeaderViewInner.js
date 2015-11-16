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
Ext.define('EdiromOnline.view.window.HeaderViewInner', {
	extend: 'Ext.panel.Panel',
	
	layout: 'fit',
	
	initComponent: function () {
		
		var me = this;
		
		me.html = '<div id="' + me.id + '_headerCont" class="headerViewContent"></div>';
		
		me.callParent();
	},
	

	setContent: function (data, uri) {
		var me = this;
		me.contEl = me.el.getById(me.id + '_headerCont');
		me.contEl.update(data);
		
		if (annotationOn) {
			me.showAnnotations(uri, me.id);	
		}
	},
	
	showAnnotations: function(placeHolder, viewId){		
			$(document).ready(function () {		
				content = $('#' + viewId + '_headerCont').annotator();
				content.annotator('addPlugin', 'Auth', {
					tokenUrl: 'http://annotateit.org/api/token',
					autoFetch: true
				});
				
				content.annotator('addPlugin', 'Store', {
					prefix: 'http://annotateit.org/api',
					annotationData: {
						'uri': placeHolder
					},
					loadFromSearch: {
						'limit': 20,
						'uri': placeHolder
					},
					urls: {
						create: '/annotations',
						update: '/annotations/:id',
						destroy: '/annotations/:id',
						search: '/search'
					},
					
					showViewPermissionsCheckbox: true,
					
					showEditPermissionsCheckbox: true
				});
				console.log('showAnnotations');
			});
		
	}

});