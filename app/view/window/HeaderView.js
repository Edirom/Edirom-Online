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
	
	idView: null,
	placeHolder: null,
	content: null,
	
	initComponent: function () {
		
		var me = this;
		
		me.html = '<div id="' + me.id + '_headerCont" class="headerViewContent"></div>';
		
		me.idView = me.id + '_headerCont';
		
		me.callParent();
		
		me.on('afterrender', me.createMenuEntries, me, {
			single: true
		});
	},
	
	setContent: function (data, uri) {
		var me = this;
		var contEl = me.el.getById(me.id + '_headerCont');
		contEl.update(data);
		
		me.placeHolder = uri;
		
		if (annotationOn) {
			if (me.content != null && typeof me.content !== 'undefined') {
				me.content.annotator('destroy');
			}
			
			$(document).ready(function () {
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
			});
		}
	},
	
	refreshUserAnnot: function () {
		var me = this;
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
		} else {
			if (me.content != null && typeof me.content !== 'undefined') {
				me.content.annotator('destroy');
			}
		}
	},
	
	createMenuEntries: function () {
		var me = this;
		
		var reloadIcon = Ext.create('Ext.panel.Tool', {
			type: 'refresh',
			tooltip: 'aktiviere Annotations',
			handler: function () {
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
				} else {
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