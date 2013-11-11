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
 *  ID: $Id: Desktop.js 1347 2012-06-25 14:55:54Z daniel $
 */
Ext.define('de.edirom.online.view.desktop.Desktop' ,{

    extend: 'Ext.panel.Panel',

    alias: 'widget.desktop',

    uses: [
        'Ext.util.MixedCollection',
        'Ext.menu.Menu',
        'Ext.window.Window',

        'de.edirom.online.view.desktop.TaskBar',
        'de.edirom.online.view.desktop.TopBar',
        'de.edirom.online.view.navigator.Navigator',

        'de.edirom.online.view.window.concordanceNavigator.ConcordanceNavigator',
        'de.edirom.online.view.window.HelpWindow',
        'de.edirom.online.view.window.search.SearchWindow',

        'Ext.ux.desktop.FitAllLayout'
    ],

    activeWindowCls: 'ux-desktop-active-win',
    inactiveWindowCls: 'ux-desktop-inactive-win',
    bodyCls: 'ediromDesktop',
    
    lastActiveWindow: null,

    border: false,
    html: '&#160;',
    layout: 'fitall',

    xTickSize: 1,
    yTickSize: 1,

    app: null,

    /**
     * @cfg {Object} taskbarConfig
     * The config object for the TaskBar.
     */
    taskbarConfig: null,

    windowMenu: null,

    activeDesktop: 1,

    initComponent: function () {
        var me = this;

        me.windowMenu = new Ext.menu.Menu(me.createWindowMenu());
        me.windowMenu.addCls('taskbarMenu');

        me.bbar = me.taskbar = new de.edirom.online.view.desktop.TaskBar(me.getTaskbarConfig());
        me.taskbar.windowMenu = me.windowMenu;

        me.tbar = me.topbar = new de.edirom.online.view.desktop.TopBar(me.getTopbarConfig());

        me.navigator = new de.edirom.online.view.navigator.Navigator(me.getNavigatorConfig());

        me.items = [
        ];

        me.windows = {
            desktop1: new Ext.util.MixedCollection(),
            desktop2: new Ext.util.MixedCollection(),
            desktop3: new Ext.util.MixedCollection(),
            desktop4: new Ext.util.MixedCollection()
        };
        me.contextMenu = new Ext.menu.Menu(me.createDesktopMenu());

        me.callParent();
    },

    afterRender: function () {
        var me = this;
        me.callParent();

        /* adding event handlers */
        me.on({
            resize: me.onResize,
            scope: me
        });
        me.el.on('contextmenu', me.onDesktopMenu, me);

        me.navigator.show();
        me.setNavigatorPosition();
    },

    switchDesktop: function(desk) {
        var me = this;

        me.getActiveWindowsSet().each(function(win) {
            win.hide();
        });

        me.activeDesktop = desk;
        me.taskbar.setActiveWindowBar(desk);

        me.getActiveWindowsSet().each(function(win) {
            if(win.hidden && !win.minimized)
                win.show();
        });
    },

    openConcordanceNavigator: function() {

        var me = this;
        var nav = null;

        me.getActiveWindowsSet().each(function(win) {
            if(Ext.getClassName(win) == 'de.edirom.online.view.window.concordanceNavigator.ConcordanceNavigator')
                nav = win;
        });

        if(nav == null) {
            nav = new de.edirom.online.view.window.concordanceNavigator.ConcordanceNavigator();
            
            var x = me.body.getWidth(true) - nav.width - 5;
            var y = me.navigator.getHeight() + 10;
            
            if(me.body.getHeight(true) - nav.height < y) {
                x = me.body.getWidth(true) - me.navigator.getWidth() - nav.width - 10;
                y = me.body.getHeight(true) - nav.height - 5;
            }
            
            Ext.apply(nav, {y: y, x: x});           
            
            me.addWindow(nav);
            nav.show();

        }else if(nav != me.getActiveWindow())
            nav.show();

        else
            nav.hide();
    },

    openHelp: function() {

        var me = this;
        var help = null;

        me.getActiveWindowsSet().each(function(win) {
            if(Ext.getClassName(win) == 'de.edirom.online.view.window.HelpWindow')
                help = win;
        });

        if(help == null) {
            help = Ext.create('de.edirom.online.view.window.HelpWindow', me.getSizeAndPosition(500, 400));
            me.addWindow(help);
            help.show();

        }else if(help != me.getActiveWindow())
            help.show();

        else
            help.hide();
    },

    openSearchWindow: function(term) {

        var me = this;
        var win = null;

        me.getActiveWindowsSet().each(function(window) {
            if(Ext.getClassName(window) == 'de.edirom.online.view.window.search.SearchWindow')
                win = window;
        });

        if(win == null) {
            win = Ext.create('de.edirom.online.view.window.search.SearchWindow', me.getSizeAndPosition(700, 600));
            me.addWindow(win);
            win.show();

        }else if(win != me.getActiveWindow())
            win.show();

        else
            win.hide();
            
        //win.doSearch(term);
    },

    getSizeAndPosition: function(maxWidth, maxHeight) {

        var me = this;
        var usableSize = me.getUsableSize();

        var width = Math.max(300, (usableSize.width / 3 * 2) - 20);
        var height = Math.max(300, usableSize.height - 20);
        
        var position = [10, 5];
        while(me.hasWindowOnPosition(position)) {
            position = [position[0] + 20, position[1] + 15];
            width -= 20;
            height -= 15;
        }

        if(typeof maxWidth != 'undefined') width = Math.min(maxWidth, width);
        if(typeof maxHeight != 'undefined') height = Math.min(maxHeight, height);

        return {
            width: width,
            height: height,
            x: position[0],
            y: position[1]
        };
    },

    getActiveWindowsSet: function(excludeSpecial) {
        if(!excludeSpecial)
            return this.windows['desktop' + this.activeDesktop];

        var set = new Ext.util.MixedCollection();

        this.windows['desktop' + this.activeDesktop].each(function(win) {

            if(Ext.getClassName(win) == 'de.edirom.online.view.window.concordanceNavigator.ConcordanceNavigator')
                ;
            else if(Ext.getClassName(win) == 'de.edirom.online.view.window.HelpWindow')
                ;
            else if(Ext.getClassName(win) == 'de.edirom.online.view.window.search.SearchWindow')
                ;
            else
                set.add(win);
        });

        return set;
    },

    getTaskbarConfig: function () {
        return {
            app: this.app,
            desktop: this
        };
    },

    getTopbarConfig: function () {
        return {
            desktop: this
        };
    },

    getNavigatorConfig: function() {
        return {
            desktop: this
        };
    },

    setNavigatorPosition: function() {
        var me = this;
        me.navigator.setPosition(me.getWidth() - me.navigator.getWidth(), me.topbar.getHeight(), false);
    },

    resizeNavigator: function() {
        var me = this;
        var maxHeight = me.getHeight() - me.topbar.getHeight() - me.taskbar.getHeight();
        var height = me.navigator.getHeight();
        var userHeight = me.navigator.getUserHeight();

        if(userHeight > maxHeight)
            me.navigator.setHeight(maxHeight);
        else
            me.navigator.setHeight(userHeight);
    },

    getUsableSize: function() {
        var me = this;
        var width = me.body.getWidth(true);
        var height = me.body.getHeight(true);

        width -= me.navigator.getWidth();

        return {
            width: width,
            height: height
        };
    },

    //------------------------------------------------------
    // Overrideable configuration creation methods

    createDesktopMenu: function () {
        var me = this, ret = {
            items: me.contextMenuItems || []
        };

        if (ret.items.length) {
            ret.items.push('-');
        }

        ret.items.push(
                { text: getLangString('view.desktop.Desktop_Tile'), handler: me.tileWindows, scope: me, minWindows: 1 },
                { text: getLangString('view.desktop.Desktop_Cascade'), handler: me.cascadeWindows, scope: me, minWindows: 1 })

        return ret;
    },

    createWindowMenu: function () {
        var me = this;
        return {
            defaultAlign: 'br-tr',
            items: [
                { text: getLangString('view.desktop.Desktop_Restore'), handler: me.onWindowMenuRestore, scope: me },
                { text: getLangString('view.desktop.Desktop_Minimize'), handler: me.onWindowMenuMinimize, scope: me },
                { text: getLangString('view.desktop.Desktop_Maximize'), handler: me.onWindowMenuMaximize, scope: me },
                '-',
                { text: getLangString('view.desktop.Desktop_Close'), handler: me.onWindowMenuClose, scope: me },
                '-',
                { text: getLangString('view.desktop.Desktop_CloseOther'), handler: me.onWindowMenuCloseOther, scope: me },
                { text: getLangString('view.desktop.Desktop_CloseAll'), handler: me.onWindowMenuCloseAll, scope: me }
            ],
            listeners: {
                beforeshow: me.onWindowMenuBeforeShow,
                hide: me.onWindowMenuHide,
                scope: me
            }
        };
    },

    //------------------------------------------------------
    // Event handler methods

    onDesktopMenu: function (e) {
        var me = this, menu = me.contextMenu;
        e.stopEvent();
        if (!menu.rendered) {
            menu.on('beforeshow', me.onDesktopMenuBeforeShow, me);
        }
        menu.showAt(e.getXY());
        menu.doConstrain();
    },

    onDesktopMenuBeforeShow: function (menu) {
        var me = this, count = me.getActiveWindowsSet().getCount();

        menu.items.each(function (item) {
            var min = item.minWindows || 0;
            item.setDisabled(count < min);
        });
    },

    onResize: function(e) {
        this.setNavigatorPosition();
        this.resizeNavigator();
    },

    onWindowClose: function(win) {
        var me = this;
        me.getActiveWindowsSet().remove(win);
        me.taskbar.removeTaskButton(win.taskButton);

        me.getActiveWindowsSet().each(function(win) {
            this.addWindowListeners(win);
        }, me);


        me.updateActiveWindow();
    },

    onWindowTitleChange: function(win, title) {
        win.taskButton.setText(title);
    },

    //------------------------------------------------------
    // Window context menu handlers

    onWindowMenuBeforeShow: function (menu) {
        var items = menu.items.items, win = menu.theWin;
        items[0].setDisabled(win.maximized !== true && win.hidden !== true); // Restore
        items[1].setDisabled(win.minimized === true); // Minimize
        items[2].setDisabled(win.maximized === true || win.hidden === true); // Maximize
    },

    onWindowMenuClose: function () {
        var me = this, win = me.windowMenu.theWin;

        win.close();
    },

    onWindowMenuCloseOther: function () {
        var me = this, win = me.windowMenu.theWin;

        me.getActiveWindowsSet().each(function(w) {
            if(win != w)
                w.close();
        }, me);
    },

    onWindowMenuCloseAll: function () {
        var me = this;

        me.getActiveWindowsSet().each(function(win) {
            win.close();
        }, me);
    },

    onWindowMenuHide: function (menu) {
        menu.theWin = null;
    },

    onWindowMenuMaximize: function () {
        var me = this, win = me.windowMenu.theWin;

        win.maximize();
    },

    onWindowMenuMinimize: function () {
        var me = this, win = me.windowMenu.theWin;

        win.minimize();
    },

    onWindowMenuRestore: function () {
        var me = this, win = me.windowMenu.theWin;

        me.restoreWindow(win);
    },

    //------------------------------------------------------
    // Dynamic (re)configuration methods

    setTickSize: function(xTickSize, yTickSize) {
        var me = this,
            xt = me.xTickSize = xTickSize,
            yt = me.yTickSize = (arguments.length > 1) ? yTickSize : xt;

        me.getActiveWindowsSet().each(function(win) {
            var dd = win.dd, resizer = win.resizer;
            dd.xTickSize = xt;
            dd.yTickSize = yt;
            resizer.widthIncrement = xt;
            resizer.heightIncrement = yt;
        });
    },

    //------------------------------------------------------
    // Window management methods

    cascadeWindows: function() {
        var x = 0, y = 0,
            zmgr = this.getDesktopZIndexManager();

        zmgr.eachBottomUp(function(win) {
            if (win.isWindow && win.isVisible() && !win.maximized) {
                win.setPosition(x, y);
                x += 20;
                y += 20;
            }
        });
    },

    addWindow: function(window) {

        var me = this;
        var win = me.getActiveWindowsSet().add(window);

        me.add(win);

        win.taskButton = me.taskbar.addTaskButton(win);
        win.animateTarget = win.taskButton.el;

        me.addWindowListeners(win);

        // replace normal window close w/fadeOut animation:
        win.doClose = function ()  {
            win.doClose = Ext.emptyFn; // dblclick can call again...
            win.el.disableShadow();
            win.el.fadeOut({
                listeners: {
                    afteranimate: function () {
                        win.destroy();
                    }
                }
            });
        };

        return win;
    },

    addWindowListeners: function(win) {
        win.on({
            activate: this.updateActiveWindow,
            beforeshow: this.updateActiveWindow,
            deactivate: this.updateActiveWindow,
            minimize: this.minimizeWindow,
            destroy: this.onWindowClose,
            titlechange: this.onWindowTitleChange,
            scope: this
        });
    },

    getActiveWindow: function () {
        var win = null,
            zmgr = this.getDesktopZIndexManager();

        if (zmgr) {
            // We cannot rely on activate/deactive because that fires against non-Window
            // components in the stack.

            zmgr.eachTopDown(function (comp) {
                if (comp.isWindow && !comp.hidden) {
                    win = comp;
                    return false;
                }
                return true;
            });
        }

        return win;
    },

    getDesktopZIndexManager: function () {
        var windows = this.getActiveWindowsSet();
        return (windows.getCount() && windows.getAt(0).zIndexManager) || null;
    },

    getWindow: function(id) {
        return this.getActiveWindowsSet().get(id);
    },

    minimizeWindow: function(win) {
        win.minimized = true;
        win.hide();
    },

    restoreWindow: function (win) {
        if (win.isVisible()) {
            win.restore();
            win.toFront();
        } else {
            win.show();
        }
        return win;
    },

    tileWindows: function() {
        var me = this, availWidth = me.body.getWidth(true);
        var x = me.xTickSize, y = me.yTickSize, nextY = y;

        me.getActiveWindowsSet().each(function(win) {
            if (win.isVisible() && !win.maximized) {
                var w = win.el.getWidth();

                // Wrap to next row if we are not at the line start and this Window will
                // go off the end
                if (x > me.xTickSize && x + w > availWidth) {
                    x = me.xTickSize;
                    y = nextY;
                }

                win.setPosition(x, y);
                x += w + me.xTickSize;
                nextY = Math.max(nextY, y + win.el.getHeight() + me.yTickSize);
            }
        });
    },

    updateActiveWindow: function () {
        var me = this, activeWindow = me.getActiveWindow(), last = me.lastActiveWindow;
        if (activeWindow === last) {
            return;
        }

        if (last) {
            if (last.el.dom) {
                last.addCls(me.inactiveWindowCls);
                last.removeCls(me.activeWindowCls);
            }
            last.active = false;
        }

        me.lastActiveWindow = activeWindow;

        if (activeWindow) {
            activeWindow.addCls(me.activeWindowCls);
            activeWindow.removeCls(me.inactiveWindowCls);
            activeWindow.minimized = false;
            activeWindow.active = true;
        }

        me.taskbar.setActiveButton(activeWindow && activeWindow.taskButton);
    },

    hasWindowOnPosition: function(position) {

        var found = false;

        this.getActiveWindowsSet().each(function(win) {
            if(!win.hidden
                    && !win.minimized
                    && Math.abs(win.getPosition()[0] - position[0]) < 10
                    && Math.abs(win.getPosition()[1] - position[1]) < 10)
                found = true;
        });

        return found;
    }
});

