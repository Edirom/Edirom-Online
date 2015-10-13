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
Ext.define('EdiromOnline.view.window.HeaderView', {
    extend: 'Ext.panel.Panel',

    requires: [
    ],

    alias : 'widget.headerView',

    layout: 'fit',
    
    cls: 'headerView',

    initComponent: function () {

        var me = this;

        me.html = '<div id="' + me.id + '_headerCont" class="headerViewContent"></div>';
        
         if (typeof annotator === 'undefined') {
        alert("Oops! it looks like you haven't built Annotator. " +
              "Either download a tagged release from GitHub, or build the " +
              "package by running `make`");
      } else {
        var app = new annotator.App();
        app.include(annotator.ui.main);
        app.start();
       // console.log(annotator);
       // console.log(app);
        
       /* app.include(annotator.storage.http
        , {
    		prefix: 'http://example.com/api'
		});
		app.start();*/
      }


        me.callParent();
    },

    setContent: function(data) {
        var me = this;
        var contEl = me.el.getById(me.id + '_headerCont');
        contEl.update(data);
    },
    
    getContentConfig: function() {
        var me = this;
        return {
            id: this.id
        };
    }
});

