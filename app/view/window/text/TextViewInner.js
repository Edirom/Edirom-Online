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
Ext.define('EdiromOnline.view.window.text.TextViewInner', {
    extend: 'Ext.panel.Panel',
   
    layout: 'fit',
   
    initComponent: function () {
		var me = this;
		
		me.html = '<div id="' + me.id + '_textCont" class="textViewContent"></div>';
		
		me.callParent();
        
    },
    
    
    setContent: function(text, uri) {
    
    	var me = this;
    	
    	Ext.fly(me.id + '_textCont').update(text);
       // this.fireEvent('documentLoaded', me);
         
        if (annotationOn) {
			$(document).ready(function () {
				var content = $('#' + me.id + '_textCont').annotator();
				
				content.annotator('addPlugin', 'Auth', {
					tokenUrl: 'http://annotateit.org/api/token',
					autoFetch: true
				});
				
				content.annotator('addPlugin', 'Store', {
					prefix: 'http://annotateit.org/api',
					annotationData: {
						'uri': uri
					},
					loadFromSearch: {
						'limit': 20,
						'uri': uri
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
	
    }
   
    
});


