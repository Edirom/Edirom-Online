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
Ext.define('EdiromOnline.controller.PreferenceController', {

    extend: 'Ext.app.Controller',

    requires: [
        'Ext.Error'
    ],

    init: function() {
        window.getPreference = Ext.bind(this.getPreference, this);
    },

    initPreferences: function(editionURI) {

        Ext.Ajax.request({
            url: 'data/xql/getPreferences.xql',
            async: false,
            method: 'GET',
            params: {
                mode: 'json',
                edition: editionURI
            },success: function(response){
                this.setPreferences(Ext.JSON.decode(response.responseText));
            },
            scope: this
        });
    },

    setPreferences: function(preferences) {
        var me = this;
        me.preferences = preferences;

        for(var key in me.preferences) {
            if(key.indexOf('plugin_') == 0)
                Ext.Ajax.request({
                    url: me.preferences[key],
                    method: 'GET',
                    success: function(response){
                        eval(response.responseText);
                    },
                    scope: this
                });
        }
    },

    getPreference: function(key, lax) {
        var me = this;

        if(!me.preferences[key] && lax)
            return null;
        
        if(key == "application_language") {
	        var lang = me.getURLParameter("lang");
	        if(lang) {
		        return lang;
	        } else {
		        return "en";
	        }
        }
        
        if(me.preferences[key] == "" && key == "image_prefix") {
            return "";
        }

        if(!me.preferences[key]) {
            Ext.Error.raise({
                msg: 'No preference found with this key',
                key: key,
                level: 'warn' //warn, error, fatal
            });

            return null;
        }

        return me.preferences[key];
    },
    
    // copied from Application.js
    getURLParameter: function(parameter) {
        return decodeURIComponent((new RegExp('[?|&]' + parameter + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
    }
});