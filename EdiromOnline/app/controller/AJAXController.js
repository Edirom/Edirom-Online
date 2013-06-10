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
 *  ID: $Id$
 */
Ext.define('de.edirom.online.controller.AJAXController', {

    extend: 'Ext.app.Controller',

    init: function() {

        window.doAJAXRequest = Ext.bind(this.doAJAXRequest, this);
    },

    doAJAXRequest: function(url, method, params, successFn, retryNo) {
        var me = this;
        
        var override = window.getPreference(url, true);

        if(override != null)
            url = override;
            
        if(typeof(retryNo) === 'undefined')
            retryNo = 2;

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
            success: fn
        });
    }
});