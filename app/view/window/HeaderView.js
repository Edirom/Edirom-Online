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

    requires: [
    ],

    alias : 'widget.headerView',

    layout: 'fit',
    
    cls: 'headerView',

    initComponent: function () {

        var me = this;

        me.html = '<div id="' + me.id + '_headerCont" class="headerViewContent"></div>';
        
      
        
      /*   if (typeof annotator === 'undefined') {
        alert("Oops! it looks like you haven't built Annotator. " +
              "Either download a tagged release from GitHub, or build the " +
              "package by running `make`");
      } else {
        var app = new annotator.App();
        app.include(annotator.ui.main);
        app.start();
        
       // console.log(annotator);
       // console.log(app);
        
       /\* app.include(annotator.storage.http
        , {
    		prefix: 'http://example.com/api'
		});
		app.start();*\/
      }*/


        me.callParent();
    },

    setContent: function(data) {
        var me = this;
        var contEl = me.el.getById(me.id + '_headerCont');
        contEl.update(data);
        
       
		$(document).ready(function() {
		//	console.log('test');
		  // Call Annotator JS
		  var content = $('#'+me.id + '_headerCont').annotator();   
		  //console.log(content);
		  //content.annotator('setupPlugins');
		  // +++ Auth Plugin +++
		  /*content.annotator('addPlugin', 'Permissions', {
			  user: 'silkeh1113'
		  });*/
		  // +++ Auth Plugin +++
		  content.annotator('addPlugin', 'Auth', {

		    // The URL to request the token from. Defaults to /auth/token
		    tokenUrl: 'http://annotateit.org/api/token',
		    // If this is present it will not be requested from the server above. Defaults to null.
		   // token: 'eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJ1c2VySWQiOiAic2lsa2VoMTExMyIsICJ0dGwiOiA4NjQwMCwgImNvbnN1bWVyS2V5IjogImFubm90YXRlaXQiLCAiaXNzdWVkQXQiOiAiMjAxNS0xMC0yNlQwNjoxODowNiswMDowMCJ9.xq7yBEZ27g1AI3bkO39IL7qYD9gJRrjsTMXk4RPOygE',
	    // Whether to fetch the token when the plugin is loaded. Defaults to true
		    autoFetch: true
		  });
		  // +++ Store +++
		  content.annotator('addPlugin', 'Store', {
		    // This is the API endpoint. If the server supports Cross Origin Resource
		    // Sharing (CORS) a full URL can be used here. Defaults to /store. The
		    // trailing slash should be omitted.
		    prefix: 'http://annotateit.org/api',
		    // Custom meta data that will be attached to every annotation that is sent
		    // to the server. This will override previous values. E.g. attach the uri of the
		    // current page to all annotations to allow search.
		    annotationData: {
		      /*'uri': 'file:///Users/elena/Downloads/account_manager/index.html'*/
		  },
		    // An object literal containing query string parameters to query the store.
		    // If loadFromSearch is set, then we load the first batch of annotations
		    // from the ‘search’ URL as set in options.urls instead of the registry path
		    // ‘prefix/read’. Defaults to false.
		    loadFromSearch: {
		      'limit': 20
		     /* 'all_fields': 1,*/
		     /* 'uri': 'file:///Users/elena/Downloads/account_manager/index.html'*/
		    },
		    // The server URLs for each available action (excluding prefix). These URLs
		    // can point anywhere but must respond to the appropriate HTTP method. The
		    // :id token can be used anywhere in the URL and will be replaced with the
		    // annotation id.
		    // Methods for actions are as follows:
		    // create:  POST
		    // update:  PUT
		    // destroy: DELETE
		    // search:  GET
		    urls: {
		      // These are the default URLs.
		      create:  '/annotations',
		      update:  '/annotations/:id',
		      destroy: '/annotations/:id',
		      search:  '/search'
		    },
		    // If true will display the "anyone can view this annotation" checkbox.
		    showViewPermissionsCheckbox: true,
		    // If true will display the "anyone can edit this annotation" checkbox.
		    showEditPermissionsCheckbox: true
		  });
		});
    },
    
    getContentConfig: function() {
        var me = this;
        return {
            id: this.id
        };
    }
});

