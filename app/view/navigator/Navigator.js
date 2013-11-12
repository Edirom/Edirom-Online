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
 *  ID: $Id: Navigator.js 1279 2012-03-19 13:16:43Z daniel $
 */
Ext.define('de.edirom.online.view.navigator.Navigator', {
    extend: 'Ext.window.Window',

    alias : 'widget.navigator',

    minHeight: 0,
    height: 400,
    width: 250,
    id: 'navigator',

    preventHeader: true,
    shadow: false,

    closable: false,
    draggable: false,
    resizable: true,
    resizeHandles: 'w s',

    layout: 'fit',

    initComponent: function () {
        var me = this;

        me.callParent();
        me.userHeight = me.height;
    },

    afterRender: function() {
        var me = this;
        me.callParent();

        /* adding event handlers */
        me.resizer.on('resize', me.onResize, me);

        me.el.style = {
            backgroundColor: '#ffffff'
        };
    },

    getUserHeight: function() {
        return this.userHeight;
    },

    onResize: function(resizer, width, height) {
        var me = this;
        me.userHeight = height;
    }
});