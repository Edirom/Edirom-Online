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
 * Based on Ext.ux.desktop.App
 */
Ext.define('EdiromOnline.view.desktop.App', {

    mixins: {
        observable: 'Ext.util.Observable'
    },

    requires: [
        'Ext.container.Viewport',
        'EdiromOnline.view.desktop.Desktop',
        'EdiromOnline.view.desktop.TaskBar',
        'EdiromOnline.view.desktop.TopBar'
    ],

    isReady: false,
    useQuickTips: true,

    constructor: function (config) {
        var me = this;
        me.addEvents(
            'ready',
            'beforeunload'
        );

        me.mixins.observable.constructor.call(this, config);

        if (Ext.isReady) {
            Ext.Function.defer(me.init, 10, me);
        } else {
            Ext.onReady(me.init, me);
        }
    },

    init: function() {
        var me = this, desktopCfg;

        if (me.useQuickTips) {
            Ext.QuickTips.init();
        }

        desktopCfg = me.getDesktopConfig();
        me.desktop = new EdiromOnline.view.desktop.Desktop(desktopCfg);

        me.viewport = new Ext.container.Viewport({
            layout: 'fit',
            items: [ me.desktop ]
        });

        Ext.EventManager.on(window, 'beforeunload', me.onUnload, me);

        me.isReady = true;
        me.fireEvent('ready', me);
    },

    getDesktopConfig: function () {

        var me = this, cfg = {
            app: me.app,
            taskbarConfig: me.getTaskbarConfig(),
            topbarConfig: me.getTopbarConfig()
        };

        Ext.apply(cfg, me.desktopConfig);
        Ext.apply(cfg, {
            wallpaper: 'resources/wallpapers/Blue-Sencha.jpg',
            wallpaperStretch: false
        });
        
        return cfg;
    },

    createWindow: function(module) {
        var window = module.createWindow();
        window.show();
    },

    getTaskbarConfig: function () {
        var me = this, cfg = {
            app: me
        };

        Ext.apply(cfg, me.taskbarConfig);
        Ext.apply(cfg, {
            quickStart: [
/*                { name: 'Accordion Window', iconCls: 'accordion', module: 'acc-win' },
                { name: 'Grid Window', iconCls: 'icon-grid', module: 'grid-win' }
*/                
            ],
            trayItems: [
                { xtype: 'trayclock', flex: 1 }
            ]
        });

        return cfg;
    },
    
    getTopbarConfig: function () {
        var me = this, cfg = {
            app: me
        };

        Ext.apply(cfg, me.topbarConfig);
        return cfg;
    },

    onReady : function(fn, scope) {
        if (this.isReady) {
            fn.call(scope, this);
        } else {
            this.on({
                ready: fn,
                scope: scope,
                single: true
            });
        }
    },

    getDesktop : function() {
        return this.desktop;
    },

    onUnload : function(e) {
        if (this.fireEvent('beforeunload', this) === false) {
            e.stopEvent();
        }
    }
});
