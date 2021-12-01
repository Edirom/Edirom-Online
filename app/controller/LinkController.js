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
Ext.define('EdiromOnline.controller.LinkController', {

    extend: 'Ext.app.Controller',

    existLinkCache: null,

    init: function() {

        window.loadLink = Ext.bind(this.loadLink, this);
        this.existLinkCache = new Ext.util.MixedCollection();
    },

    /**
     * Reads multiple URIs and opens windows with the referenced contents
     * 
     * @param {String[]} uris The array of URIs to process.
     */
    loadLinks: function(uris) {
        var me = this;

        for(var i = 0; i < uris.length; i++) {
            Ext.defer(me.loadLink, i * 200, me, [uris[i]], false);
        }
    },

    /**
     * Reads an URI and opens a window with the referenced content
     *
     * @param {String} uri The URI to process.
     */
    loadLink: function(uri, cfg) {
        
        //TODO: check if links should be opened in new windows

        var config = Ext.apply({}, cfg);

        var uriMasked = uri.replace(/\s|;/g, '\uC280');
        var uris = uriMasked.split('\uC280');

        var uriWindows = new Ext.util.MixedCollection();
        var windowsUsed = new Ext.util.MixedCollection();

        var existingWindows = null;
        if(config['useExisting']) {
            var desktop = this.application.getController('desktop.Desktop').getActiveDesktop();
            existingWindows = desktop.getActiveWindowsSet(true);
        }


        Ext.Array.each(uris, function(singleUri){

            if(singleUri.match(/^edirom:\/\/#id=/)) {
                //TODO: set attribute by id

            }else if(singleUri.match(/^edirom:\/\/\.class=/)) {
                //TODO: set attribute by class
    
            }else if(singleUri.match(/^edirom:\/\//)) {
                this.parseEdiromLink(singleUri);

            }else if(singleUri.match(/^xmldb:exist:\/\//) || singleUri.match(/^textgrid:/)) {

                if(config['useExisting']) {
                    var win = existingWindows.findBy(function(win) {
                        return win.uri.split('#')[0] == singleUri.split('#')[0];
                    });

                    if(win != null) {
                        uriWindows.add(singleUri, win);
                        existingWindows.remove(win);

                    }else if(!config['onlyExisting'])
                        uriWindows.add(singleUri, 'newWindow');

                }else
                    uriWindows.add(singleUri, 'newWindow');
            }else if(singleUri.match(/^#/)) {
                //TODO: internal link
    
            }else if(singleUri.match(/^(http|https|mailto):\/\//)) {
                window.open (singleUri,"_blank");
    
            }else if(singleUri.match(/^(ext|file):\/\//)) {
                //TODO: external (not possible in browser)
    
            }else {
                //TODO: relative path to xml or something
    
            }
    
        }, this);

        var positions = null;
        var i = 0;

        if(config['sort']) {
        
            if(config['sortIncludes'] && Array.isArray(config['sortIncludes']))
                i = config['sortIncludes'].length;
            
            if(config['sort'] == 'sortGrid')
                positions = this.application.getController('desktop.Desktop').getGridPositioning(uriWindows.getCount() + i);
            
            if(config['sort'] == 'sortVertically')
                positions = this.application.getController('desktop.Desktop').getVerticalPositioning(uriWindows.getCount() + i);

            if(config['sort'] == 'sortHorizontally')
                positions = this.application.getController('desktop.Desktop').getHorizontalPositioning(uriWindows.getCount() + i);

            if(i > 0) {
                for(var j = 0; j < config['sortIncludes'].length; j++) {
                    var win = config['sortIncludes'][j];
                    var posConfig = (positions == null?{}:positions['win_' + j]);
                    win.setSize(posConfig['width'], posConfig['height']);
                    win.setPosition(posConfig['x'], posConfig['y']);
                }
            }
        }


        uriWindows.eachKey(function(singleUri) {

            var win = uriWindows.get(singleUri);
            var posConfig = (positions == null?{}:positions['win_' + i]);
            var cfg = Ext.apply(config, posConfig);
            if(win == 'newWindow') {
	            if(cfg['y']) {
	            	cfg['y'] = cfg['y'] - 41; // hack: height of TopBar
	            }
                windowsUsed.add(this.parseExistLink(singleUri, cfg));
            }
            else {

                if(cfg['width']) {
                    win.setSize(cfg['width'], cfg['height']);
                    win.setPosition(cfg['x'], cfg['y']);
                }

                if(singleUri.indexOf('#') != -1) {

                    Ext.Ajax.request({
                        url: 'data/xql/getInternalIdType.xql',
                        method: 'GET',
                        params: {
                            uri: singleUri
                        },
                        success: function(response){
                            win.loadInternalId(singleUri.split('#')[1], response.responseText.trim());
                            win.show();
                        },
                        scope: this
                    });
                }else
                    win.showView('summaryView');
                    
                windowsUsed.add(win);
            }

            i++;
        }, this);
        
        return windowsUsed; 
    },

    /**
     * Parses an URI that points to a resource in an exist database instance
     *
     * @private
     *
     * @param uri The URI to parse.
     */
    parseExistLink: function(uri, cfg) {
        var me = this;
        
        return me.application.getController('window.WindowController').createWindow(uri, cfg);
    },

    parseEdiromLink: function(uri) {
        //TODO: edirom link

        if(uri == 'edirom://searchWindow') {
            //TODO: open search window
            Ext.log('open search window');
            return;

        }else if(uri.match(/^edirom:\/\/searchWindow[type:.*]/)) {
            //TODO: open search window only showing specified category
            return;

        }else if(uri.match(/^edirom:\/\/setPreferences[.*]/)) {
            //TODO: set the specified preference
            return;

        }

        if(uri.indexOf('?') != -1) {
            //TODO: check parameters
        }
    }
});