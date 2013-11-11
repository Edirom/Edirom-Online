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
 *  ID: $Id: TaskBar.js 1219 2012-01-20 08:33:28Z daniel $
 */
Ext.define('de.edirom.online.controller.desktop.TaskBar', {

    extend: 'Ext.app.Controller',

    views: [
        'desktop.TaskBar'
    ],

    init: function() {
        var me = this;
        
        me.taskbars = new Array();

        me.control({
            'taskbar button[action=toggleMeasureVisibility]': {
                click: me.onMeasureVisibilityChanged
            },
            'taskbar button[action=toggleAnnotationVisibility]': {
                click: me.onAnnotationVisibilityChanged
            }
        });
    },
    
    onMeasureVisibilityChanged: function(button, event) {
        var me = this;
        
        var tools = me.application.getController('ToolsController');
        tools.setGlobalMeasureVisibility(button.pressed);
    },
    
    onAnnotationVisibilityChanged: function(button, event) {
        var me = this;
        
        var tools = me.application.getController('ToolsController');
        tools.setGlobalAnnotationVisibility(button.pressed);
    }
});

