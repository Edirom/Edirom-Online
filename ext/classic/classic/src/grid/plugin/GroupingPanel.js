/**
 *  This plugin enables a grouping panel above the grid to allow easy grouping.
 *
 *  It adds the following methods to the grid panel instance:
 *
 *  - showGroupingPanel
 *  - hideGroupingPanel
 */
Ext.define('Ext.grid.plugin.GroupingPanel', {
    extend: 'Ext.grid.plugin.BaseGroupingPanel',

    alias: 'plugin.groupingpanel',

    requires: [
        'Ext.grid.plugin.grouping.Panel'
    ],

    /**
     *  `"both"` (the default) - The plugin is added to both grids
     *  `"top"` - The plugin is added to the containing Panel
     *  `"locked"` - The plugin is added to the locked (left) grid
     *  `"normal"` - The plugin is added to the normal (right) grid
     *
     * @private
     */
    lockableScope: 'top',

    gridListeners: {
        render: 'onAfterGridRendered'
    },

    updateGrid: function(grid, oldGrid) {
        this.callParent([grid, oldGrid]);

        if (grid) {
            this.injectGroupingMenu();
        }
    },

    injectGroupingMenu: function() {
        var me = this,
            grid = me.getGrid(),
            headerCt;

        // "getMenuItems" is only called once on the grid header container
        // so we need to inject our fn before the grid is rendered

        if (grid.enableLocking) {
            headerCt = grid.normalGrid.headerCt;
            // eslint-disable-next-line max-len
            headerCt.showMenuBy = Ext.Function.createInterceptor(headerCt.showMenuBy, me.showMenuBy);
            headerCt.getMenuItems = me.getMenuItems(headerCt);

            headerCt = grid.lockedGrid.headerCt;
            // eslint-disable-next-line max-len
            headerCt.showMenuBy = Ext.Function.createInterceptor(headerCt.showMenuBy, me.showMenuBy);
            headerCt.getMenuItems = me.getMenuItems(headerCt);
        }
        else {
            headerCt = grid.headerCt;
            // eslint-disable-next-line max-len
            headerCt.showMenuBy = Ext.Function.createInterceptor(headerCt.showMenuBy, me.showMenuBy);
            headerCt.getMenuItems = me.getMenuItems(headerCt);
        }
    },

    showMenuBy: function(clickEvent, t, header) {
        var me = this,
            menuItem = me.getMenu().down('#groupingPanel'),
            panel = me.grid.ownerGrid.down('groupingpanel');

        if (panel && menuItem) {
            menuItem.setText(panel.getHidden()
                ? panel.showGroupingPanelText
                : panel.hideGroupingPanelText);
        }
    },

    getMenuItems: function(headerCt) {
        var me = this,
            bar = me.getBar(),
            getMenuItems = headerCt.getMenuItems;

        // runs in the scope of headerCt
        return function() {

            // We cannot use the method from HeaderContainer's prototype here
            // because other plugins or features may already have injected an implementation
            var o = getMenuItems.call(this);

            o.push('-', {
                iconCls: bar
                    ? bar.groupingPanelIconCls
                    : Ext.baseCSSPrefix + 'grid-group-panel-icon',
                itemId: 'groupingPanel',
                text: '', // text will be updated when menu is shown
                handler: 'toggleGroupingPanel',
                scope: me
            });

            return o;
        };
    },

    addGroupingPanel: function() {
        var me = this,
            ret;

        ret = me.getGrid().addDocked(me.getPanel());
        ret = ret && ret.length ? ret[0] : ret;

        return ret;
    }

});
