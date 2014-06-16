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
Ext.define('EdiromOnline.controller.window.WindowController', {

    extend: 'Ext.app.Controller',

    requires: [
        'EdiromOnline.view.window.Window'
    ],

    init: function() {

    },

    createWindow: function(uri, cfg) {
        var activeDesktop = this.application.getController('desktop.Desktop').getActiveDesktop();
        var sizePos = activeDesktop.getSizeAndPosition();
        
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

        var win = new EdiromOnline.view.window.Window(config);
        this.application.getController('desktop.Desktop').addWindowToActiveDesktop(win);
        win.show();
        
        return win;
    }
});