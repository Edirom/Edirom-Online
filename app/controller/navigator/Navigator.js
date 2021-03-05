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
Ext.define('EdiromOnline.controller.navigator.Navigator', {

    extend: 'Ext.app.Controller',

    views: [
        'navigator.Navigator'
    ],

    init: function() {

        this.application.addListener('workSelected', this.onWorkSelected, this);

        this.navigators = new Array();
        this.navigatorContents = new Ext.util.MixedCollection();

        this.control({
            'navigator': {
                afterrender: this.onNavigatorRendered
            }
        });
    },

    hasNavigatorContent: function(workId) {
        return this.navigatorContents.containsKey(workId);
    },

    fetchNavigatorContent: function(workId) {

        var editionId = this.application.activeEdition;
        var lang = window.getLanguage('application_language');

        Ext.Ajax.request({
            url: 'data/xql/getNavigatorConfig.xql',
            params: {
                editionId: editionId,
                workId: workId,
                lang: lang
            },
            success: function(response){

                this.navigatorContents.add(workId, response.responseText);

                Ext.Array.each(this.navigators, function(navigator) {
                    navigator.body.update(this.getNavigatorContent(workId));
                    navigator.setLoading(false);
                }, this);
            },
            scope: this
        });
    },

    getNavigatorContent: function(workId) {
        if(this.navigatorContents.containsKey(workId))
            return this.navigatorContents.get(workId);

        return null;
    },

    onNavigatorRendered: function(navigator) {
        if(this.hasNavigatorContent(this.application.activeWork))
            navigator.body.update(this.getNavigatorContent(this.application.activeWork));
        else {
            this.fetchNavigatorContent(this.application.activeWork);
        }

        this.navigators.push(navigator);
    },

    onWorkSelected: function(workId) {

        if(this.hasNavigatorContent(workId)) {
            Ext.Array.each(this.navigators, function(navigator) {
                navigator.body.update(this.getNavigatorContent(workId));
                navigator.setLoading(false);
            }, this);
        }else {
            Ext.Array.each(this.navigators, function(navigator) {
                navigator.setLoading(true);
            });
            this.fetchNavigatorContent(workId);
        }
    }
});

