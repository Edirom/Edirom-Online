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
Ext.define('EdiromOnline.controller.window.concordanceNavigator.ConcordanceNavigator', {

    extend: 'Ext.app.Controller',

    views: [
        'window.concordanceNavigator.ConcordanceNavigator'
    ],

    init: function() {
        this.control({
            'concordanceNavigator': {
                render: this.onWindowRendered,
                single: true
            }
        });
        
        this.control({
            'concordanceNavigator': {
                showConnection: this.onShowConnection
            }
        });
    },

    onWindowRendered: function(win) {
        var me = this;

        if(win.initialized) return;
        win.initialized = true;

        //win.on('showConnection', me.onShowConnection, me);

        var app = me.application;
        app.callFunctionOfEdition(win, 'getConcordances', Ext.bind(me.concordancesLoaded, me, [win], true));
    },

    concordancesLoaded: function(concordanceStore, concordanceWindow) {
        concordanceWindow.setConcordances(concordanceStore);
    },

    onShowConnection: function(navigator, plist) {
        var me = this;
        var linkController = me.application.getController('LinkController');
        linkController.loadLink(plist, {useExisting: true, onlyExisting: true}); //TODO: in Preferences einbauen; TODO: grid sorting vorerst rausgenommen
    }
});