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
Ext.define('EdiromOnline.controller.window.search.SearchWindow', {

    extend: 'Ext.app.Controller',

    views: [
        'window.search.SearchWindow'
    ],

    init: function() {
        this.control({
            'searchWindow': {
                render: {fn: this.onWindowRendered, single: true},
                doSearch: this.doSearch
            },
            'searchWindow #searchTextField': {
                specialkey: this.onSpecialKey
            },
            'searchWindow button[action=doSearch]': {
                click: this.onDoSearch
            }
        });
    },

    onWindowRendered: function(win) {
        var me = this;
    
        me.win = win;

        if(win.initialized) return;
        win.initialized = true;
    },
    
    onSpecialKey: function(field, e) {
        if (e.getKey() == e.ENTER) {
            this.doSearch(field.getValue());
        }
    },
    
    onDoSearch: function(button, event, args) {
        var term = button.textField.getValue();
        this.doSearch(term);
    },
    
    doSearch: function(term) {
        var me = this;
        
        //if(term.match(/^\s*$/)) return; 
        
        window.doAJAXRequest('data/xql/search.xql',
            'GET', 
            {
                term: term,
                lang: getPreference('application_language')
            },
            Ext.bind(function(response){
                me.win.setResult(response.responseText);
            }, me)
        );        
    }
});