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
Ext.define('EdiromOnline.controller.window.AnnotationView', {

    extend: 'Ext.app.Controller',

    views: [
        'window.AnnotationView'
    ],

    init: function() {
        this.control({
            'annotationView': {
                afterlayout : this.onAfterLayout,
                showAnnotation: this.onShowAnnotation
            },
            'annotationView  button[action=openAll]': {
                click: this.onOpenAllParticipants
            },
            'annotationView  button[action=closeAll]': {
                click: this.onCloseAllParticipants
            }
        });
    },

    onAfterLayout: function(view) {

        return;

        var me = this;

        if(view.initialized) return;
        view.initialized = true;
    },

    onShowAnnotation: function(view, uri) {

        var editionId = this.application.activeEdition;
        var lang = getPreference('application_language');
    
        Ext.Ajax.request({
            url: 'data/xql/getAnnotationText.xql',
            method: 'GET',
            params: {
                uri: uri,
                lang: lang
            },
            success: function(response){
                view.setContent(response.responseText);
            },
            scope: this
        });

        Ext.Ajax.request({
            url: 'data/xql/getAnnotationMeta.xql',
            method: 'GET',
            params: {
                uri: uri,
                lang: lang
            },
            success: function(response){
                view.setMeta(response.responseText);
            },
            scope: this
        });

        window.doAJAXRequest('data/xql/getAnnotationPreviews.xql',
            'GET', 
            {
                uri: uri,
                edition: editionId,
                lang: lang
            },
            Ext.bind(function(response){
                var data = Ext.JSON.decode(response.responseText);
                view.setPreview(data['participants']);
            }, this)
        );
        
    },
    
    onOpenAllParticipants: function(btn, e) {
        var me = this;
        var view = btn.view;
        
        // Are there allready opened windows from the last action?
        if(view.closeAllButton.windows != null) {
            view.closeAllButton.windows.each(function(win) {
                if(win)
                    win.close();
            });
        }

        var linkController = this.application.getController('LinkController');
        
        window.doAJAXRequest('data/xql/getAnnotationOpenAllUris.xql',
            'GET', 
            {
                uri: view.uri,
                annotId: view.activeSingleAnnotation
            },
            Ext.bind(function(response){
                var participantUris = response.responseText;
                var windows = linkController.loadLink(participantUris, {sort:'sortGrid', useExisting: false, onlyExisting: false, sortIncludes: [view.window]});
                view.closeAllButton.windows = windows;
                view.closeAllButton.enable();
            }, me)
        );
    },
    
    onCloseAllParticipants: function(btn, e) {
        var me = this;
        btn.disable();
        
        btn.windows.each(function(win) {
            if(win)
                win.close();
        });
        
        btn.windows = null;
    }
});
