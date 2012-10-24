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
 *  ID: $Id: AnnotationLayout2.js 1341 2012-06-22 14:10:08Z daniel $
 */
Ext.define('de.edirom.online.view.window.annotationLayouts.AnnotationLayout2', {
    extend: 'Ext.panel.Panel',

    requires: [
        'Ext.layout.BorderLayout'
    ],

    layout: 'border',

    /*
            Content | Meta
            ------- | ------
                 Preview
     */

    initComponent: function () {

        var me = this;

        me.centerPanel = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            region: 'center',
            border: 0,
            items: [
            ]
        });
        me.northPanel = Ext.create('Ext.panel.Panel', {
            layout: 'hbox',
            region: 'north',
            height: 200,
            border: 0,
            split: true,
            items: [
            ]
        });

        me.northPanel.on('resize', me.calculateSizes, me);

        me.items = [
            me.centerPanel,
            me.northPanel
        ];

        me.callParent();
    },

    setPanels: function(content, meta, preview) {
        var me = this;

        me.northPanel.add(content);
        me.northPanel.add({
            xtype: 'splitter'
        });
        me.northPanel.add(meta);

        me.centerPanel.add(preview);

        me.calculateSizes();
    },

    calculateSizes: function() {
        var me = this;

        try {
            me.northPanel.items.each(function(item) {
                item.setHeight(this.getHeight());
            }, me.northPanel);
        }catch(e) {
        }
    }
});
