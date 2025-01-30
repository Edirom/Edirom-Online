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

    requires: [ ],
    alias : 'widget.audioView',
    layout: 'fit',    
    cls: 'audioView',

    // default settings
    settings: {
        'tracks': '[{"title": "Mercy", "composer": "Vernon Maytone", "work": "Brotheration Reggae 2015", "src": "https://pixabay.com/de/music/download/id-140277.mp3", "type": "audio/mpeg"}]',
        'height': '500px',
        'width': '500px',
        'state': 'pause',
        'track': '0',
        'start': '0.0',
        'end': '',
        'playbackrate': '1.0',
        'playbackmode': 'one',
        'playlist': 'true',
        'progressbar': 'true'
    },


    initComponent: function () {
        var me = this;
        me.html = '<div id="' + me.id + '_audioCont" class="audioCont"></div>';
        me.callParent();
    },


    setContent: function(data) {
        
        // loop through data and overwrite settings
        data = Ext.decode(data);
        for (var key in data) {
            this.settings[key] = data[key];
        }

        // set up custom element
        text = "<edirom-audio-player id='" + this.id + "_audioPlayer' tracks='"+this.settings.tracks+"' height='"+this.settings.height+"' width='"+this.settings.width+"' state='"+this.settings.state+"' track='"+this.settings.track+"' start='"+this.settings.start+"' end='"+this.settings.end+"' playbackrate='"+this.settings.playbackrate+"' playbackmode='"+this.settings.playbackmode+"' playlist='"+this.settings.playlist+"' progressbar='"+this.settings.progressbar+"'></edirom-audio-player>";

        Ext.fly(this.id + '_audioCont').update(text);
        this.fireEvent('documentLoaded', this);

    },

    close: function() {
        this.hide();
    }
});