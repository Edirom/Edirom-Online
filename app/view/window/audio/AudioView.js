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
Ext.define('EdiromOnline.view.window.audio.AudioView', {

    extend: 'EdiromOnline.view.window.View',

    requires: [
    ],

    alias : 'widget.audioView',

    layout: 'fit',
    
    cls: 'audioView',

    initComponent: function () {

        var me = this;

        me.html = '<div id="' + me.id + '_audioCont" class="audioViewContent"><iframe id="' + me.id + '_audioContIFrame" src="" seamless="seamless" style="width:100%; height:100%; border:none;"></div>';

        me.callParent();
    },

    setIFrameURL: function(url) {
        var me = this;
        var contEl = me.el.getById(me.id + '_audioContIFrame');
        contEl.set({'src': url});
    },
    
    getContentConfig: function() {
        var me = this;
        return {
            id: this.id
        };
    }
});