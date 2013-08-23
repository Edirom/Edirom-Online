/**
 *  Edirom Online
 *  Copyright (C) 2011 The Edirom Project
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
 *  ID: $Id: XmlView.js 1228 2012-01-20 17:20:51Z daniel $
 */
Ext.define('de.edirom.online.view.window.XmlView', {
    extend: 'Ext.panel.Panel',

    requires: [
    ],

    alias : 'widget.xmlView',

    layout: 'fit',
    cls: 'xmlView',

    editor: null,

    initComponent: function () {

        this.items = [
            {
                html: '<pre id="' + this.id + '_editor" class="aceEditor"></pre>'
            }
        ];

        this.callParent();

        this.on('afterlayout', this.initXmlView, this, {single: true});
        this.on('afterrender', this.createToolbarEntries, this, {single: true});
    },

    initXmlView: function() {
        var XmlMode = require("ace/mode/xml").Mode;

        this.editor = ace.edit(this.id + '_editor');
        this.editor.getSession().setMode(new XmlMode());
        this.editor.getSession().setUseWrapMode(false);       //bisher keine funktionale Änderung festgestellt
        this.editor.setShowPrintMargin(false);
        this.editor.renderer.setHScrollBarAlwaysVisible(false);
        this.editor.setReadOnly(true);  // false for the editable
    },

    createToolbarEntries: function() {

        var me = this;

        me.decreaseFont = Ext.create('Ext.button.Button', {
            text: 'A-',
            cls: 'menuButton',
            handler: Ext.bind(me.decreaseEditorFontSize, me)
        });
        me.increaseFont = Ext.create('Ext.button.Button', {
            text: 'A+',
            cls: 'menuButton',
            handler: Ext.bind(me.increaseEditorFontSize, me)
        });
        me.lineNumbers = Ext.create('Ext.button.Button', {
            text: 'Line #',
            cls: 'menuButton',
            handler: Ext.bind(me.switchGutterVisibility, me)
        });

        me.window.getTopbar().addViewSpecificItem(me.decreaseFont, me.id);
        me.window.getTopbar().addViewSpecificItem(me.increaseFont, me.id);
        me.window.getTopbar().addViewSpecificItem(me.lineNumbers, me.id);
    },

    setXmlContent: function(xml) {
        this.editor.getSession().setValue(xml);
    },

    resize: function(){
        this.editor.renderer.onResize(true);                    //called function ace-uncompressed.js Line 13289
    },

    decreaseEditorFontSize: function(){

        var currentFontSize = Ext.get(this.id + '_editor').getStyle('font-size').split('px')[0];
        var newFontSize = --currentFontSize + 'px';

        Ext.get(this.id + '_editor').setStyle('font-size', newFontSize);
    },

    increaseEditorFontSize: function(){

        var currentFontSize = Ext.get(this.id + '_editor').getStyle('font-size').split('px')[0];
        var newFontSize = ++currentFontSize + 'px';

        Ext.get(this.id + '_editor').setStyle('font-size', newFontSize);
    },

    switchGutterVisibility: function(){
        var status = this.editor.renderer.getShowGutter();
        if(status == true)
            this.editor.renderer.setShowGutter(false);
        else
            this.editor.renderer.setShowGutter(true);

    },
    
    getContentConfig: function() {
        var me = this;
        return {
            id: this.id
        };
    }
});
