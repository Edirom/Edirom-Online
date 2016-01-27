/**
 *  Edirom Online
 *  Copyright (C) 2016 The Edirom Project
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
Ext.define('EdiromOnline.view.window.View', {
    extend: 'Ext.panel.Panel',
    
    mixins: {
        observable: 'Ext.util.Observable'
    },
    
    getContentConfig: function() {
        var me = this;
        return {
            id: me.id
        };
    },
    
    getWeightForInternalLink: function(uri, type, id) {
        var me = this;
        
        if(me.uri != uri)
            return 0;
        
        return 0;
    },
    
    loadInternalId: function(internalId, internalIdType) {
        var me = this;
        return false;
    }
});
/*

createMenuEntries
createToolbarEntries
hideToolbarEntries
showToolbarEntries

*/