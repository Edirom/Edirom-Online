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
    
    navwin: null,

    views: [
        'window.concordanceNavigator.ConcordanceNavigator'
    ],

    init: function() {
	    
	    this.application.addListener('workSelected', this.onWorkSelected, this);
	    
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
    
    onWorkSelected: function(workId) {
	    //console.log('Werk gewechselt, von Conc registriert!');
	    //console.log(workId);
	    

	    var me = this;
	    if(me.navwin != null) {
	    	var app = me.application;
			app.callFunctionOfEdition(me.navwin, 'getConcordances', Ext.bind(me.concordancesLoaded, me, [me.navwin], true));
		}
	    
    },

    onWindowRendered: function(win) {
        var me = this;

        if(win.initialized) return;
        win.initialized = true;
        
        this.navwin = win;

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