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
 *  ID: $Id: WindowController.js 1343 2012-06-22 14:58:42Z daniel $
 */
Ext.define('de.edirom.online.controller.window.WindowController', {

    extend: 'Ext.app.Controller',

    requires: [
    ],

    init: function() {

    },

    createWindow: function(uri, cfg) {
        var activeDesktop = this.application.getController('desktop.Desktop').getActiveDesktop();
        var sizePos = this.getSizeAndPosition(activeDesktop);
        
        if(typeof cfg.width != 'undefined') {
            var usableSize = activeDesktop.getUsableSize();
            var maxWidth = usableSize.width - 10 - sizePos.x;
            if(maxWidth < cfg.width) cfg.width = maxWidth;
        }
        
        var config = Ext.applyIf(cfg, sizePos);
        Ext.apply(config, {
            application: this.application,
            uri: uri
        });

        var win = new de.edirom.online.view.window.Window(config);
        this.application.getController('desktop.Desktop').addWindowToActiveDesktop(win);
        win.show();
        
        return win;
    },

    getSizeAndPosition: function(activeDesktop) {

        var usableSize = activeDesktop.getUsableSize();

        var width = Math.max(300, usableSize.width - 20);
        var height = Math.max(300, usableSize.height - 20);

        var position = [10, 5];
        while(activeDesktop.hasWindowOnPosition(position)) {
            position = [position[0] + 20, position[1] + 15];
            width -= 20;
            height -= 15;
        }

        return {
            width: width,
            height: height,
            x: position[0],
            y: position[1]
        };
    }
});