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
Ext.define('EdiromOnline.view.window.annotationLayouts.AnnotationLayout1', {
    extend: 'Ext.panel.Panel',

    requires: [
        'Ext.layout.BorderLayout'
    ],

    layout: 'border',

    /*
            Content |
            ------- | Preview
            Meta    |
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
        me.westPanel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            region: 'west',
            border: 0,
            width: 200,
            split: true,
            items: [
            ]
        });

        me.westPanel.on('resize', me.calculateSizes, me);

        me.items = [
            me.centerPanel,
            me.westPanel
        ];

        me.callParent();
    },

    setPanels: function(content, meta, preview) {
        var me = this;

        me.westPanel.add(content);
        me.westPanel.add({
            xtype: 'splitter'
            
        });
        me.westPanel.add(meta);

        me.centerPanel.add(preview);

        me.calculateSizes();
    },

    calculateSizes: function() {
        var me = this;

        try {
            me.westPanel.items.each(function(item) {
                item.setWidth(this.getWidth());
            }, me.westPanel);
        }catch(e) {
        }
    }
});
