/**
 *  Edirom Online
 *  Copyright (C) 2011 The Edirom Project
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
 *  ID: $Id: RenderingView.js 1336 2012-06-14 13:22:12Z daniel $
 */
Ext.define('de.edirom.online.controller.window.RenderingView', {

    extend: 'Ext.app.Controller',

    views: [
        'window.RenderingView'
    ],

    init: function() {
        this.control({
            'renderingView': {
               afterlayout : this.onAfterLayout,
               single: true
            }
        });
    },

    onAfterLayout: function(view) {
		
		var me = this;
        
        if(view.initialized) return;
        view.initialized = true;
        
        view.on('gotoMovement', me.onGotoMovement, me);
        
        Ext.Ajax.request({
            url: 'data/xql/getMovements.xql',
            method: 'GET',
            params: {
                uri: view.uri
            },
            success: function(response){
                var data = response.responseText;

                var movements = Ext.create('Ext.data.Store', {
                    fields: ['id', 'name'],
                    data: Ext.JSON.decode(data)
                });

                me.movementsLoaded(movements, view);
            }
        });
        

    },
    
    movementsLoaded: function(movements, view) {
    	view.createToolbarEntries(movements);
    }
        
    /*
    onGotoMovement: function(view, movementId) {
    	var me = this;
    	
		Ext.Ajax.request({
            url: 'data/xql/getRendering.xql',
            method: 'GET',
            params: {
                uri: view.uri,
                movementId: movementId
            },
            success: function(response){
                view.setContent(response.responseText);
            },
            scope: this
        });
		
    },

      */
});
