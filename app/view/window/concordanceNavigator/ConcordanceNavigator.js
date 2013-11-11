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
 *  ID: $Id: ConcordanceNavigator.js 1334 2012-06-14 12:40:33Z daniel $
 */
Ext.define('de.edirom.online.view.window.concordanceNavigator.ConcordanceNavigator', {

    extend: 'Ext.window.Window',

    mixins: {
        observable: 'Ext.util.Observable'
    },
    
    alias: 'widget.concordanceNavigator',

    requires: [
        'Ext.button.Button',
        'Ext.container.Container',
        'Ext.form.field.Text',
        'de.edirom.online.view.utils.EnhancedSlider'
    ],

    stateful: false,
    isWindow: true,
    //closeAction: 'hide',
    constrainHeader: true,
    minimizable: false,
    maximizable: false,
    closable: true,
    resizeHandles: 'e w',
    shadow: false,

    layout: 'anchor',
    border: 0,
    bodyBorder: false,

    padding: 0,
    
    
    bodyPadding: '12',

    cls: 'ediromConcordanceNavigatorWindow ediromWindow',

    defaults: {
        border:false
    },

    items: [],

    expandedHeight: 210,
    collapsedHeight: 165,

    width: 300,
    height: 165,
    x: 300,
    y: 200,

    initComponent: function() {
        var me = this;

        me.addEvents('showConnection');

        me.title = getLangString('view.window.concordanceNavigator.ConcordanceNavigator_Title');

        me.items = [
            me.createConcordanceSelector(),
            me.createGroupSelector(),
            me.createItemSelector(),
            me.createButtons()
        ];

        me.callParent();
    },

    createConcordanceSelector: function() {
        var me = this;

        me.concordanceSelectorMenu = Ext.create('Ext.menu.Menu', {
        });

        me.concordanceSelector = Ext.create('Ext.button.Button', {
                text: '',
                indent: false,
                menu: me.concordanceSelectorMenu
            });

        return Ext.create('Ext.container.Container', {
            width: '100%',
            anchor: '100%',
            layout: 'fit',
            items: [
                me.concordanceSelector
            ]
        });
    },

    createGroupSelector: function() {
        var me = this;

        me.groupSelectorMenu = Ext.create('Ext.menu.Menu', {
        });

        me.groupSelector = Ext.create('Ext.button.Button', {
                text: '',
                indent: false,
                anchor: '100%',
                menu: me.groupSelectorMenu
            });

        me.groupSelectionLabel = Ext.create('Ext.form.Label', {
            text: '',
            anchor: '100%'
        });

        me.groupContainer = Ext.create('Ext.container.Container', {
            width: '100%',
            anchor: '100%',
            margin: '5 0 0 0',
            layout: 'anchor',
            items: [
                me.groupSelectionLabel,
                me.groupSelector
            ]
        });

        return me.groupContainer;
    },

    setGroupSelectorVisibility: function(visible) {
        var me = this;
        me.setHeight(visible?me.expandedHeight:me.collapsedHeight);
        me.groupContainer.setVisible(visible);
    },

    createItemSelector: function() {
        var me = this;

        me.itemSelection = Ext.create('Ext.form.field.Text', {
            fieldCls: 'textCentered borderless',
            anchor: '100%',
            listeners: {
                blur: Ext.bind(me.blurOnInput, me),
                specialkey: Ext.bind(me.specialKeyOnInput, me)
            }
        });

        me.itemSlider = Ext.create('de.edirom.online.view.utils.EnhancedSlider', {
            anchor: '100%',
            listeners: {
                change: Ext.bind(me.itemSelectionChanged, me)
            }
        });

        me.itemSelectionLabel = Ext.create('Ext.form.Label', {
            text: '',
            anchor: '100%'
        });

        return Ext.create('Ext.container.Container', {
            width: '100%',
            layout: 'anchor',
            anchor: '100%',
            margin: '5 0 0 0',
            items: [
                me.itemSelectionLabel,
                me.itemSlider,
                me.itemSelection
            ]
        });
    },

    blurOnInput: function(field) {
        //TODO: Was machen wir beim Fokus-Verlust? Zurücksetzen oder Übernehmen
    },
    
    specialKeyOnInput: function(field, e){
        var me = this;

        if (e.getKey() == e.ENTER) {
            var success = me.itemSlider.setEnhancedValue(me.itemSelection.getValue());
            if(!success)
                me.itemSelection.setValue(me.itemSlider.getEnhancedValue());

            me.itemSelection.blur();

        } else if (e.getKey() == e.ESC) {
            me.itemSelection.setValue(me.itemSlider.getEnhancedValue());
        }
    },

    itemSelectionChanged: function(slider, newValue, thumb, eOpts) {
        var me = this;
        me.itemSelection.setValue(slider.getEnhancedValue());
    },

    createButtons: function() {
        var me = this;

        return Ext.create('Ext.container.Container', {
            width: '100%',
            layout: 'hbox',
            anchor: '100%',
            margin: '2 0 0 0',
            items: [
                {
                    xtype: 'button',
                    text: '<',
                    margin: '0 3 0 0',
                    handler: Ext.bind(me.showPrevConnection, me)
                },
                {
                    xtype: 'button',
                    text: getLangString('view.window.concordanceNavigator.ConcordanceNavigator_Show'),
                    flex: 2,
                    handler: Ext.bind(me.showConnection, me)
                },
                {
                    xtype: 'button',
                    text: '>',
                    margin: '0 0 0 3',
                    handler: Ext.bind(me.showNextConnection, me)
                }
            ]
        });
    },

    showConnection: function() {
        var me = this;
        me.fireEvent('showConnection', me, me.itemSlider.getRawValue()['plist']);
    },

    showPrevConnection: function() {
        var me = this;
        var success = me.itemSlider.prev();
        if(success) me.showConnection();
    },

    showNextConnection: function() {
        var me = this;
        var success = me.itemSlider.next();
        if(success) me.showConnection();
    },

    setConcordances: function(concordanceStore) {
        var me = this;

        this.concordanceSelectorMenu.removeAll();

        concordanceStore.each(function(concordance) {
            me.concordanceSelectorMenu.add({
                xtype: 'menucheckitem',
                group: 'concordances',
                checked: concordanceStore.getAt(0) == concordance,
                text: concordance.get('name'),
                checkHandler: Ext.bind(me.switchConcordance, me, [concordance, concordance.get('name')], true)
            });
        });

        if(concordanceStore.getTotalCount() > 0)
            me.switchConcordance(null, true, concordanceStore.getAt(0), concordanceStore.getAt(0).get('name'));
    },

    switchConcordance: function(menuItem, checked, concordance, label) {
        var me = this;

        if(!checked) return;

        me.concordanceSelector.setText(label);

        var hasGroups = concordance.get('groups') != null
        me.setGroupSelectorVisibility(hasGroups);

        if(hasGroups) {
            me.groupSelectionLabel.setText(concordance.get('groups')['label']);
            me.setGroups(concordance.get('groups')['groups']);
        }else {
            me.itemSelectionLabel.setText(concordance.get('connections')['label']);
            me.itemSlider.setData(concordance.get('connections')['connections'], 'name');
            me.itemSelection.setValue(me.itemSlider.getEnhancedValue());
        }
    },

    setGroups: function(groups) {
        var me = this;

        this.groupSelectorMenu.removeAll();

        Ext.Array.each(groups, function(group) {
            this.groupSelectorMenu.add({
                xtype: 'menucheckitem',
                group: 'groups',
                checked: groups[0] == group,
                text: group['name'],
                checkHandler: Ext.bind(me.switchGroup, me, [group, group['name']], true)
            });
        }, me);

        if(groups.length > 0)
            me.switchGroup(null, true, groups[0], groups[0]['name']);
    },

    switchGroup: function(menuItem, checked, group, label) {
        var me = this;

        if(!checked) return;

        me.groupSelector.setText(label);
        me.itemSelectionLabel.setText(group['connections']['label']);
        me.itemSlider.setData(group['connections']['connections'], 'name');
        me.itemSelection.setValue(me.itemSlider.getEnhancedValue());
    }, 
    
    close: function() {
        this.hide();
    }
});