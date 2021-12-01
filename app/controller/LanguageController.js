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
Ext.define('EdiromOnline.controller.LanguageController', {

    extend: 'Ext.app.Controller',

    requires: [
        'Ext.String',
        'EdiromOnline.controller.PreferenceController'
    ],

    langFiles: null,

    init: function() {
        window.getLangString = Ext.bind(this.getLanguageString, this);
        window.getLanguage = Ext.bind(this.getLanguage, this);
        this.langFiles = new Ext.util.MixedCollection();
    },

    initLangFile: function(editionURI, lang) {

        Ext.Ajax.request({
            url: 'data/xql/getLanguageFile.xql',
            async: false,
            method: 'GET',
            params: {
                lang: lang,
                mode: 'json',
                edition: editionURI
            },success: function(response){

                this.langFiles.add(lang, Ext.JSON.decode(response.responseText));
            },
            scope: this
        });
    },

    getLanguageString: function(key) {

        var me = this;

        var lang = me.getLanguage();

        var args = Ext.Array.toArray(arguments, 1);

        var string = me.langFiles.get(lang)['keys'][key];

        if(!string) {
            Ext.Error.raise({
                msg: 'No language string found with this key',
                key: key,
                lang: lang,
                level: 'warn' //warn, error, fatal
            });

            return null;
        }

        return string.replace(Ext.String.formatRe, function(m, i) {
            return args[i];
        });
    },
    
    getLanguage: function() {
        if(window.getCookie('edirom-language') !== '')
            return window.getCookie('edirom-language');
        
        return getPreference('application_language');
    }
});