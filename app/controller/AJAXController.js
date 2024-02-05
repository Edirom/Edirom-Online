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
 *  ID: $Id$
 */
Ext.define('EdiromOnline.controller.AJAXController', {

    extend: 'Ext.app.Controller',

    init: function() {

        window.doAJAXRequest = Ext.bind(this.doAJAXRequest, this);
    },

    /**
     * Performs an AJAX request.
     *
     * @param {String}   url       The URL of the requestet site or end point.
     * @param {String}   method    The HTTP method like 'PUT', 'GET', 'POST'.
     * @param {Object}   params    An object containing key-value-pairs of parameters for the request.
     * @param {Function} successFn A callback function which is called when the AJAX request was successfull.
     * @param {Number}   retryNo   The number of retries, if the requests fails. Standard is 2 retries.
     * @param {Boolean}  async     Defines the async parameter for AJAX calls. Default is 'true'.
     */
    doAJAXRequest: function(url, method, params, successFn, retryNo, async) {
        var me = this;
        
        var editionId = this.application.activeEdition;
        params = Ext.applyIf(params, {edition: editionId});
        
        var lang = window.getLanguage();
        params = Ext.applyIf(params, {lang: lang});

        // define some requests that will make Edirom Online fail if it looks for an override
        var doNotOverride  = [
            'data/xql/getEditionURI.xql',
            'data/xql/getPreferences.xql',
            'data/xql/getWorkID.xql',
        ];

        var override = null;

        if(doNotOverride.indexOf(url) == -1)
            override = window.getPreference(url, true);

        if(override != null)
            url = override;
            
        if(typeof retryNo === 'undefined')
            retryNo = 2;
            
        if(typeof async === 'undefined')
            async = true;

        var fn = Ext.bind(function(response, options, retryNoInt) {
        
            try {
                successFn(response);
            }catch(e) {
                
                console.log(e);
                
                if(retryNoInt && retryNoInt > 0)
                    Ext.defer(me.doAJAXRequest, 500, me, [url, method, params, successFn, retryNoInt - 1], false);
            }
        }, me, [retryNo], true);

        Ext.Ajax.request({
            url: url,
            method: method,
            params: params,
            success: fn,
            async: async
        });
    }
});