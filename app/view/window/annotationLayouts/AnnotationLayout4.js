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
Ext.define('EdiromOnline.view.window.annotationLayouts.AnnotationLayout4', {
    extend: 'Ext.panel.Panel',

    requires: [
        'Ext.layout.BorderLayout'
    ],

    layout: 'border',

    /*
               Content
            ----- | ------
            Meta  | Preview
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
        me.southPanel = Ext.create('Ext.panel.Panel', {
            layout: 'hbox',
            region: 'south',
            height: 200,
            border: 0,
            split: true,
            items: [
            ]
        });

        me.southPanel.on('resize', me.calculateSizes, me);

        me.items = [
            me.centerPanel,
            me.southPanel
        ];

        me.callParent();
    },

    setPanels: function(content, meta, preview) {
        var me = this;

        meta.flex = 1;
        preview.flex = 2;

        me.southPanel.add(meta);
        me.southPanel.add({
            xtype: 'splitter'
        });
        me.southPanel.add(preview);

        me.centerPanel.add(content);

        me.calculateSizes();
    },

    calculateSizes: function() {
        var me = this;

        try {
            me.southPanel.items.each(function(item) {
                item.setHeight(this.getHeight());
            }, me.southPanel);
        }catch(e) {
        }
    }
});
