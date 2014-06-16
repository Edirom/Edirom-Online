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
Ext.define('EdiromOnline.controller.window.XmlView', {

    extend: 'Ext.app.Controller',

    views: [
        'window.XmlView'
    ],

    init: function() {
        this.control({
            'xmlView': {
               afterlayout : this.xmlViewAfterLayout
            },
            'xmlView':{
                resize : this.resize
            }
        });
    },

    xmlViewAfterLayout: function(xmlview) {

        var me = this;

        if(xmlview.initialized) return;
        xmlview.initialized = true;

        xmlview.initXmlView();

        var uri = xmlview.uri;
        var internalId = xmlview.internalId;

        Ext.Ajax.request({
            url: 'data/xql/getXml.xql',
            method: 'GET',
            params: {
                uri: uri,
                internalId: internalId
            },
            success: function(response){
                xmlview.setXmlContent(response.responseText);
            },
            scope: this
        });
    },

    resize: function(xmlview, width, height){
        this.xmlViewAfterLayout(xmlview);
        xmlview.resize();
    }
});
