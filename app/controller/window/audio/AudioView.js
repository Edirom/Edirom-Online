/**
 *  Edirom Online
 *  Copyright (C) 2024 The Edirom Project
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
Ext.define('EdiromOnline.controller.window.audio.AudioView', {

    extend: 'Ext.app.Controller',

    views: [
        'window.audio.AudioView'
    ],

    init: function() {
        this.control({
            'audioView': {
               afterlayout : this.onAfterLayout
            }
        });
    },

    onAfterLayout: function(view) {

        var me = this;

        if(view.initialized) return;
        view.initialized = true;

        var uri = view.uri;
        
        window.doAJAXRequest('data/xql/getAudio.xql',
            'GET', 
            {
                uri: uri
            },
            Ext.bind(function(response){
                var audioConfig = response.responseText;

                settings = `{
                    "height":"200px",
                    "playlist":"true",
                    "progressbar":"true",
                    "tracks":"${audioConfig.replaceAll('"', '&quot;')}"
                }`;

/**
                            {"title": "Mercy", "composer": "Vernon Maytone", "work": "Brotheration Reggae 2015", "src": "https://pixabay.com/de/music/download/id-140277.mp3", "type": "audio/mpeg"},
                            {"title": "Walk Good", "composer": "Daddy Roy", "work": "Brotheration Records 2016", "src": "https://pixabay.com/de/music/download/id-140285.mp3", "type": "audio/mpeg"}, 
                            {"title": "To be free", "composer": "Composer 1", "work": "Own work", "src": "https://upload.wikimedia.org/wikipedia/commons/1/12/03may2020-tobefree.mp3", "type": "audio/mpeg"}, 
                            {"title": "A Tale of Distant Lands", "composer": "Robert Schumann", "work": "Own work", "src": "https://upload.wikimedia.org/wikipedia/commons/e/ec/A_Tale_of_Distant_Lands.mp3", "type": "audio/mpeg"}, 
                            {"title": "Funky Souls", "composer": "Amarià", "work": "Soundcloud: Funky Souls (2019)", "src": "https://upload.wikimedia.org/wikipedia/commons/2/2e/Amari%C3%A0_-_Funky_Souls_%282019%29.mp3", "type": "audio/mpeg"} */

                view.setContent(settings);

            }, this)
        );

    }

});
