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
	extend: 'EdiromOnline.view.window.View',
	
	requires:[],
	
	alias: 'widget.headerView',
	
	layout: 'fit',
	
	cls: 'headerView',
	
	idView: null,
	placeHolder: null,
	content: null,
	
	initComponent: function () {
		
		var me = this;
		
		me.html = '<div id="' + me.id + '_headerCont" class="headerViewContent"></div>';
		
		me.idView = me.id + '_headerCont';
	
		me.callParent();
	
	},
	
	setContent: function (data) {
		var me = this;
		var contEl = me.el.getById(me.id + '_headerCont');
		contEl.update(data);
		
		me.placeHolder = me.uri;
		
	
		if (annotationOn) {
		
		// $(document).ready(function () {
			if (me.content != null && typeof me.content !== 'undefined') {
				me.content.annotator('destroy');
			}
			
				me.content = $('#' + me.id + '_headerCont').annotator();
				me.content.annotator('addPlugin', 'Auth', {
					tokenUrl: 'http://annotateit.org/api/token',
					autoFetch: true
				});
				
				me.content.annotator('addPlugin', 'Store', {
					prefix: 'http://annotateit.org/api',
					annotationData: {
						'uri': me.placeHolder
					},
					loadFromSearch: {
						'limit': 20,
						'uri': me.placeHolder
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
							
				me.content.annotator('addPlugin', 'RefreshViews');	
		//})		
		}
		
	},
	
	refreshUserAnnot: function () {
		var me = this;
		// $(document).ready(function () {
		if (annotationOn) {
			if (me.content != null && typeof me.content !== 'undefined') {
				me.content.annotator('destroy');
			}
			
			me.content = $('#' + me.idView).annotator();
			
			me.content.annotator('addPlugin', 'Auth', {
				tokenUrl: 'http://annotateit.org/api/token',
				autoFetch: true
			});
			
			me.content.annotator('addPlugin', 'Store', {
				prefix: 'http://annotateit.org/api',
				annotationData: {
					'uri': me.placeHolder
				},
				loadFromSearch: {
					'limit': 20,
					'uri': me.placeHolder
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
			
				me.content.annotator('addPlugin', 'RefreshViews');	
		} else {
			if (me.content != null && typeof me.content !== 'undefined') {
				me.content.annotator('destroy');
			}
		}
		//})
		
	},
	
	getContentConfig: function () {
		var me = this;
		return {
			id: this.id
		};
	}
});