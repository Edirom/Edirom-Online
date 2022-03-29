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

/*
 * Based on Ext.ux.desktop.TaskBar
 */
Ext.define('EdiromOnline.view.desktop.TaskBar', {
    extend: 'Ext.toolbar.Toolbar',

    requires: [
        'Ext.button.Button',
        'Ext.resizer.Splitter',
        'Ext.menu.Menu'
    ],

    alias: 'widget.taskbar',

    id: 'ediromTaskbar',
    cls: 'ux-taskbar',

    initComponent: function () {
        var me = this;

        me.addEvents('switchDesktop',
                    'sortGrid',
                    'sortHorizontally',
                    'sortVertically',
                    'openConcordanceNavigator',
                    'openSearchWindow',
                    'switchLanguage');

        me.windowSort = new Ext.toolbar.Toolbar(me.getWindowSortConfig());
        me.globalTools = new Ext.toolbar.Toolbar(me.getGlobalToolsConfig());
        me.desktopSwitch = new Ext.toolbar.Toolbar(me.getDesktopSwitchConfig());
        me.quickStart = new Ext.toolbar.Toolbar(me.getQuickStartConfig());

        me.windowBar1 = new Ext.toolbar.Toolbar(me.getWindowBarConfig());
        me.windowBar2 = new Ext.toolbar.Toolbar(me.getWindowBarConfig());
        me.windowBar3 = new Ext.toolbar.Toolbar(me.getWindowBarConfig());
        me.windowBar4 = new Ext.toolbar.Toolbar(me.getWindowBarConfig());

        me.helpPrefs = new Ext.toolbar.Toolbar(me.getHelpPrefConfig());
        me.tray = new Ext.toolbar.Toolbar(me.getTrayConfig());

        me.items = [
            me.windowSort,
            me.globalTools,
            //me.desktopSwitch,
            me.quickStart,
            {
                xtype: 'splitter', html: '&#160;',
                height: 14, width: 2, // TODO - there should be a CSS way here
                cls: 'x-toolbar-separator x-toolbar-separator-horizontal ediTaskBarSep'
            },
            me.windowBar1,
            me.windowBar2,
            me.windowBar3,
            me.windowBar4,
            '-',
            //me.helpPrefs,
            me.tray
        ];

        me.setActiveWindowBar(1);

        me.callParent();
    },

    afterLayout: function () {
        var me = this;
        me.callParent();
        me.windowBar1.el.on('contextmenu', me.onButtonContextMenu, me);
        me.windowBar2.el.on('contextmenu', me.onButtonContextMenu, me);
        me.windowBar3.el.on('contextmenu', me.onButtonContextMenu, me);
        me.windowBar4.el.on('contextmenu', me.onButtonContextMenu, me);
    },

    getWindowSortConfig: function () {
        var me = this;
        return {
            width: 90,
            items: [
                {
                    xtype: 'button',
                    cls: 'taskSquareButton grid',
                    tooltip: { text: getLangString('view.desktop.TaskBar_Sort_grid'), align: 'bl-tl' },
                    handler: Ext.bind(this.fireEvent, me, ['sortGrid'], false)
                },
                {
                    xtype: 'button',
                    cls: 'taskSquareButton vertical',
                    tooltip: { text: getLangString('view.desktop.TaskBar_Sort_vertical'), align: 'bl-tl' },
                    handler: Ext.bind(this.fireEvent, me, ['sortVertically'], false)
                },
                {
                    xtype: 'button',
                    cls: 'taskSquareButton horizontal',
                    tooltip: { text: getLangString('view.desktop.TaskBar_Sort_horizontal'), align: 'bl-tl' },
                    handler: Ext.bind(this.fireEvent, me, ['sortHorizontally'], false)
                }
            ]
        };
    },

    getGlobalToolsConfig: function() {
        var me = this;

        me.measureNumberButton = Ext.create('Ext.button.Button', {
            id: 'measureNumberBtn',
            cls: 'taskSquareButton measureNumbers',
            enableToggle: true,
            tooltip: { text: getLangString('view.desktop.TaskBar_measureNumbers'), align: 'bl-tl' },
            action: 'toggleMeasureVisibility'
        });

        me.annotationsButton = Ext.create('Ext.button.Button', {
            id: 'annotationsBtn',
            cls: 'taskSquareButton annotations',
            enableToggle: true,
            tooltip: { text: getLangString('view.desktop.TaskBar_annotations'), align: 'bl-tl' },
            action: 'toggleAnnotationVisibility'
        });

        return {
            width: 60,
            items: [
                me.measureNumberButton,
                me.annotationsButton
            ]
        };
    },

    getDesktopSwitchConfig: function () {
        var me = this, ret = {
            width: 30,
            items: []
        };

        for(var i = 1; i <= 1; i++)
            ret.items.push(
                {
                    cls: 'taskSquareButton desktop',
                    tooltip: { text: getLangString('view.desktop.TaskBar_Desktop', i), align: 'bl-tl' },
                    action: i,
                    handler: Ext.bind(this.fireEvent, me, ['switchDesktop', i], false)
                }
            );

        return ret;
    },

    getQuickStartConfig: function () {
        var me = this;

        me.concordanceButton = Ext.create('Ext.button.Button', {
            id: 'taskbarConcordanceBtn',
            cls: 'taskSquareButton concordance',
            tooltip: { text: getLangString('view.desktop.TaskBar_concordanceNav'), align: 'bl-tl' },
            handler: Ext.bind(me.fireEvent, me, ['openConcordanceNavigator'], false)
        });

        return {
            width: 32,
            items: [
                me.concordanceButton
            ]
        };
    },

    getWindowBarConfig: function () {
        return {
            flex: 1,
            cls: 'ux-desktop-windowbar',
            items: [ '&#160;' ],
            layout: { overflowHandler: 'Scroller' }
        };
    },

    /**
     * This method returns the configuration object for the Tray toolbar. A derived
     * class can override this method, call the base version to build the config and
     * then modify the returned object before returning it.
     */
    getTrayConfig: function () {
        var ret = {
            items: this.trayItems
        };
        delete this.trayItems;
        return ret;
    },

    getWindowBtnFromEl: function (el) {
        var c = this['windowBar' + this.activeWindowBar].getChildByElement(el);
        return c || null;
    },

    getHelpPrefConfig: function () {
        var me = this;

        me.prefButton = Ext.create('Ext.button.Button', {
            id: 'prefBtn',
            cls: 'taskSquareButton pref',
            tooltip: { text: getLangString('view.desktop.TaskBar_pref'), align: 'bl-tl' }//,
            //handler: Ext.bind(me.fireEvent, me, ['openConcordanceNavigator'], false)
        });

        me.langButton = Ext.create('Ext.button.Button', {
            id: 'langBtn',
            cls: 'taskSquareButton lang',
            tooltip: { text: getLangString('view.desktop.TaskBar_lang'), align: 'bl-tl' },
            handler: Ext.bind(me.fireEvent, me, ['switchLanguage'], false)
        });

    
        me.helpButton = Ext.create('Ext.button.Button', {
            id: 'helpBtn',
            cls: 'taskSquareButton help',
            tooltip: { text: getLangString('view.desktop.TaskBar_help'), align: 'bl-tl' },
            handler: Ext.bind(me.fireEvent, me, ['openHelp'], false)
        });

        return {
            width: 64,
            items: [
                me.helpButton,
                me.langButton/*,
                me.prefButton*/
            ]
        };
    },

    onButtonContextMenu: function (e) {
        var me = this, t = e.getTarget(), btn = me.getWindowBtnFromEl(t);
        if (btn) {
            e.stopEvent();
            me.windowMenu.theWin = btn.win;
            me.windowMenu.showBy(t);
        }
    },

    onWindowBtnClick: function (btn) {
        var win = btn.win;

        if (win.minimized || win.hidden) {
            btn.disable();
            win.show(null, function() {
                btn.enable();
            });
        } else if (win.active) {
            btn.disable();
            win.on('hide', function() {
                btn.enable();
            }, null, {single: true});
            win.minimize();
        } else {
            win.toFront();
        }
    },

    addTaskButton: function(win) {

        var me = this;

        var isConcWin = (Ext.getClassName(win) == 'EdiromOnline.view.window.concordanceNavigator.ConcordanceNavigator');
        var isHelpWin = (Ext.getClassName(win) == 'EdiromOnline.view.window.HelpWindow');
        var isSearchWin = (Ext.getClassName(win) == 'EdiromOnline.view.window.search.SearchWindow');

        var config = {
            iconCls: win.iconCls,
            cls: 'taskbarWindowButton',
            enableToggle: true,
            toggleGroup: 'all',
            width: 140,
            margin: '0 5 0 0',
            padding: '2 10 2 0',
            text: Ext.util.Format.ellipsis(win.title, 16),
            listeners: {
                click: this.onWindowBtnClick,
                scope: this
            },
            win: win
        };

        if(isConcWin) {
            Ext.apply(config, {hidden: true});
            win.animateTarget = me.concordanceButton.el;
            win.on('show', Ext.bind(me.updateConcordanceButton, me, [true], true));
            win.on('hide', Ext.bind(me.updateConcordanceButton, me, [false], true));
        }

        if(isHelpWin) {
            Ext.apply(config, {hidden: true});
            win.animateTarget = me.helpButton.el;
            win.on('show', Ext.bind(me.updateHelpButton, me, [true], true));
            win.on('hide', Ext.bind(me.updateHelpButton, me, [false], true));
        }

        if(isSearchWin) {
            Ext.apply(config, {hidden: true});
        }

        var cmp = this['windowBar' + this.activeWindowBar].add(config);
        cmp.toggle(true);
        return cmp;
    },

    updateConcordanceButton: function(win, args, visible) {
        var me = this;
        me.concordanceButton.toggle(visible);
    },

    updateHelpButton: function(win, args, visible) {
        var me = this;
        me.helpButton.toggle(visible);
    },

    removeTaskButton: function (btn) {
        var found, me = this;
        me['windowBar' + this.activeWindowBar].items.each(function (item) {
            if (item === btn) {
                found = item;
            }
            return !found;
        });
        if (found) {
            me['windowBar' + this.activeWindowBar].remove(found);
        }
        return found;
    },

    setActiveButton: function(btn) {
        if (btn) {
            btn.toggle(true);
        } else {
            this['windowBar' + this.activeWindowBar].items.each(function (item) {
                if (item.isButton) {
                    item.toggle(false);
                }
            });
        }
    },

    setActiveWindowBar: function(num) {

        this.activeWindowBar = num;

        this.windowBar1.setVisible(num == 1);
        this.windowBar2.setVisible(num == 2);
        this.windowBar3.setVisible(num == 3);
        this.windowBar4.setVisible(num == 4);
    },
    
    setConcordanceNavigatorButtonToggleState: function(state, suppressEvent) {
        this.concordanceButton.toggle(state, suppressEvent);
    }
});

/**
 * @class Ext.ux.desktop.TrayClock
 * @extends Ext.toolbar.TextItem
 * This class displays a clock on the toolbar.
 */
Ext.define('EdiromOnline.view.desktop.TrayClock', {
    extend: 'Ext.toolbar.TextItem',

    alias: 'widget.trayclock',

    cls: 'ux-desktop-trayclock',

    html: '&#160;',

    timeFormat: 'g:i A',

    tpl: '{time}',

    initComponent: function () {
        var me = this;

        me.callParent();

        if (typeof(me.tpl) == 'string') {
            me.tpl = new Ext.XTemplate(me.tpl);
        }
    },

    afterRender: function () {
        var me = this;
        Ext.Function.defer(me.updateTime, 100, me);
        me.callParent();
    },

    onDestroy: function () {
        var me = this;

        if (me.timer) {
            window.clearTimeout(me.timer);
            me.timer = null;
        }

        me.callParent();
    },

    updateTime: function () {
        var me = this, time = Ext.Date.format(new Date(), me.timeFormat),
            text = me.tpl.apply({ time: time });
        if (me.lastText != text) {
            me.setText(text);
            me.lastText = text;
        }
        me.timer = Ext.Function.defer(me.updateTime, 10000, me);
    }
});
