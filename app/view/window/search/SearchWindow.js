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
 */
Ext.define('de.edirom.online.view.window.search.SearchWindow', {

    extend: 'Ext.window.Window',

    mixins: {
        observable: 'Ext.util.Observable'
    },
    
    alias: 'widget.searchWindow',

    requires: [
    ],

    stateful: false,
    isWindow: true,
    //closeAction: 'hide',
    constrainHeader: true,
    minimizable: false,
    maximizable: false,
    closable: true,
    shadow: false,

    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    border: 0,
    bodyBorder: false,

    padding: 0,
    
    bodyPadding: '0',

    cls: 'ediromWindow searchWindow',

    defaults: {
        border:false
    },

    initComponent: function() {
        var me = this;

        me.addEvents('doSearch');
        
        me.title = getLangString('view.window.search.SearchWindow_Title');

        me.searchButton = Ext.create('Ext.button.Button', {
            id: 'doSearchBtn',
            cls: 'menuButton taskSquareButton search',
            tooltip: { text: getLangString('view.desktop.TaskBar_search'), align: 'bl-tl' },
            action: 'doSearch',
            margin: '0 2 0 2'
        });
        
        me.searchTextField = Ext.create('Ext.form.TextField', {
            id: 'searchTextField',
            margin: '0 0 0 2',
            flex: 1
        });
        
        // access to text field
        me.searchButton.textField = me.searchTextField;

        me.tbar = [
            me.searchTextField,
            me.searchButton
        ];
        me.items = [
            /*{
                xtype: 'panel',
                height: 30,
                layout: 'hbox',
                margin: '2 6 2 6',
                items: [
                    me.searchTextField,
                    me.searchButton
                ]
            },*/
            {
                xtype: 'panel',
                flex: 1,
                html: '<div id="' + this.id + '_textCont" class="textViewContent"></div>'
            }
        ];

        me.callParent();
    },
    
    setResult: function(text) {
        Ext.fly(this.id + '_textCont').update(text);
        this.fireEvent('documentLoaded', this);
    },
        
    doSearch: function(term) {
        var me = this;
        
        Ext.fly(this.id + '_textCont').update('');
        
/*        if(term.match(/^\s*$/)) {
            return;
        }
*/        
        me.searchTextField.setValue(term);
        me.fireEvent('doSearch', term);
    }, 
    
    close: function() {
        this.hide();
    }
});