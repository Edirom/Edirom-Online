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
Ext.define('EdiromOnline.view.window.TopBar', {
    extend: 'Ext.toolbar.Toolbar',

    requires: [
        'Ext.button.Button',
        'Ext.toolbar.Spacer'
    ],

    alias : 'widget.window.topbar',
    cls: 'topBar',
    height: 23,

    enableOverflow: true,

    initComponent: function () {

        var me = this;

        me.viewSpecificItems = new Ext.util.MixedCollection();
        me.viewToMenuItem = new Ext.util.MixedCollection();

        var initViewText = getLangString('view.window.TobBar_View');
        var views = [];

        me.viewSwitchMenu = Ext.create('Ext.menu.Menu', {
            items: views
        });

        me.viewSwitch = Ext.create('Ext.button.Button', {
            text: initViewText,
            indent: false,
            cls: 'menuButton',
            menu: me.viewSwitchMenu
        });

        me.helpButton = Ext.create('Ext.button.Button', {
            id: this.id + '_helpButton',
            text: '?',
            //indent: false,
            enableToggle: true,
            handler: Ext.bind(me.showViewSpecificHelp, me)
        });

        me.printButton = Ext.create('Ext.button.Button', {
            text: 'Print',
            handler: Ext.bind(me.printButton, me)
        });

        me.spaceAfterGenItems = Ext.create('Ext.toolbar.Spacer',{ xtype: 'tbspacer',
            id: me.id+'_spaceAfterGenItems',
            width: 0 });

        me.spaceAfterViewItems = Ext.create('Ext.toolbar.Spacer',{ xtype: 'tbspacer',
            id: me.id+'_spaceAfterViewItems',
            width: 0 });

        me.items = [
            me.viewSwitch,
            me.spaceAfterGenItems/*, TODO
            me.spaceAfterViewItems,
            '->',
            me.printButton,
            me.helpButton*/
        ];

        me.callParent();
    },

    addView: function(view) {
        var me = this;

        var item = Ext.create('Ext.menu.CheckItem', {
            group: me.id + '_views',
            checked: false,
            text: view.label,
            checkHandler: Ext.bind(me.switchView, me, [view.view], false)
        });

        me.viewToMenuItem.add(view.view.id, item);
        me.viewSwitchMenu.add(item);
    },

    switchView: function(view) {

        var me = this;
        me.hideViewSpecificItems(me.window.getActiveView().id);
        me.window.switchView(view);
        me.showViewSpecificItems(me.window.getActiveView().id);
    },

    setActiveView: function(view) {
        var me = this;
        var menuItem = me.viewToMenuItem.get(view.id);
        if(!menuItem.checked) menuItem.setChecked(true);
    },

    addViewSpecificItem: function(item, view, index) {
        var me = this;

        if(!me.viewSpecificItems.containsKey(view))
            me.viewSpecificItems.add(view, new Array());
        
        if(typeof index == 'undefined') {
            var pos = Ext.Array.indexOf(me.items , me.spaceAfterViewItems);
            me.viewSpecificItems.get(view).push(item);
            me.insert(pos, item);
        }else {
            var pos = Ext.Array.indexOf(me.items , me.spaceAfterGenItems);
            var itemBefore = me.viewSpecificItems.get(view)[index - 1];
            
            if(typeof itemBefore != 'undefined')
                pos = Ext.Array.indexOf(me.items , itemBefore) + 1;
            
            Ext.Array.insert(me.viewSpecificItems.get(view), index, [item]);
            me.insert(pos, item);
        }

        var activeView = me.window.getActiveView().id;
        if(activeView != view)
            item.hide();
    },

    removeViewSpecificItem: function(item, view) {
        var me = this;

        if(!me.viewSpecificItems.containsKey(view))
            return

        Ext.Array.remove(me.viewSpecificItems.get(view), item);
        me.remove(item);
    },

    hideViewSpecificItems: function(view) {
        var me = this;

        if(!me.viewSpecificItems.containsKey(view)) return;

        Ext.Array.each(me.viewSpecificItems.get(view), function(item) {
            item.hide();
        });
    },

    showViewSpecificItems: function(view) {
        var me = this;

        if(!me.viewSpecificItems.containsKey(view)) return;

        Ext.Array.each(me.viewSpecificItems.get(view), function(item) {
            item.show();
        });
    },

    showViewSpecificHelp: function(){
        this.window.helpPanel.toggleCollapse(true);
        //this.window.helpPanel.isHidden();

    },
    
    //TODO
    printButton: function(){
        window.open('http://localhost:8089/edirompub/data/xql/edirom_printPreview.xql?&uri=' + this.window.uri + '&type=' + this.window.type);
    }
});