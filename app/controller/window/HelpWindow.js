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
Ext.define('EdiromOnline.controller.window.HelpWindow', {

    extend: 'Ext.app.Controller',

    views: [
        'window.HelpWindow'
    ],

    init: function() {
        this.control({
            'helpWindow': {
                render: this.onWindowRendered,
                single: true
            }
        });
    },

    onWindowRendered: function(win) {
        var me = this;

        if(win.initialized) return;
        win.initialized = true;

        window.doAJAXRequest('data/xql/getHelp.xql',
            'GET', 
            {
                uri: win.uri,
                lang: window.getLanguage(),
                idPrefix: win.id
            },
            Ext.bind(function(response){
                win.setContent(response.responseText);
            }, me)
        );
    }
});