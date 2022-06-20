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
 *
 */
Ext.define('EdiromOnline.controller.window.source.PageBasedView', {
	
	extend: 'Ext.app.Controller',
	
	views:[
	'window.source.PageBasedView'],
	
	init: function () {
		this.control({
			'pageBasedView': {
				afterlayout: this.onPageBasedViewRendered,
				overlayVisiblityChange: this.onOverlayVisiblityChange,
				single: true
			}
		});
	},
	
	onPageBasedViewRendered: function (view) {
		var me = this;
		
		if (view.initialized) return;
		view.initialized = true;
		
		Ext.Ajax.request({
			url: 'data/xql/getPages.xql',
			method: 'GET',
			params: {
				uri: view.owner.uri
			},
			success: function (response) {
				var data = response.responseText;
				
				var pages = Ext.create('Ext.data.Store', {
					fields:[ 'id', 'name', 'path', 'width', 'height', 'measures', 'annotations'],
					data: Ext.JSON.decode(data)
				});
				
				me.pagesLoaded(pages, view);
			}
		});
	},
	
	pagesLoaded: function (pages, view) {
		view.setImageSet(pages);
	},
	
	onOverlayVisiblityChange: function(viewer, overlays, pageId, uri, sourceView, args) {
        var me = this;
        
        Ext.Array.each(Object.keys(overlays), function(overlayId) {
           
           if(overlays[overlayId]) {  // if visible
           
 			Ext.Ajax.request({
 				url: 'data/xql/getOverlayOnPage.xql',
 				method: 'GET',
 				params: {
 					uri: uri,
 					pageId: pageId,
 					overlayId: overlayId
 				},
 				success: function (response) {
 					var data = response.responseText;
 					
 					if (data.trim() == '') return;
 					
 					var overlay = Ext.create('Ext.data.Store', {
                         fields: ['id', 'svg'],
                         data: Ext.JSON.decode(data)
                     });
 
 					me.overlayLoaded(viewer, pageId, overlayId, overlay, sourceView);
 				}
 			});
           }else {
               viewer.imageViewer.removeSVGOverlay(overlayId);
           }
        });
    },
    
    overlayLoaded: function(viewer, pageId, overlayId, overlay, sourceView) {

        if(pageId != viewer.getActivePage().get('id')) return;

        viewer.imageViewer.addSVGOverlay(overlayId, overlay);
    }
});