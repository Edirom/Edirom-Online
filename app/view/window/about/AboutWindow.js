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
 */
Ext.define('EdiromOnline.view.window.about.AboutWindow', {

    extend: 'Ext.window.Window',

    mixins: {
        observable: 'Ext.util.Observable'
    },
    
    alias: 'widget.aboutWindow',

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

    cls: 'ediromWindow aboutWindow',

    defaults: {
        border:false
    },

    initComponent: function() {
        var me = this;
        
        me.title = getLangString('view.window.about.AboutWindow_Title');

        me.items = [
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

    close: function() {
        this.hide();
    }
});