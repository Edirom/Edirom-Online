/**
 *  This plugin enables a grouping panel above the grid to allow easy grouping.
 *
 *  It adds the following methods to the grid panel instance:
 *
 *  - showGroupingPanel
 *  - hideGroupingPanel
 *
 * **Note** To be used with a {@link Ext.grid.TreeGrouped}
 *
 */
Ext.define('Ext.grid.plugin.GroupingPanel', {
    extend: 'Ext.grid.plugin.BaseGroupingPanel',

    alias: 'plugin.groupingpanel',

    requires: [
        'Ext.grid.plugin.grouping.Panel',
        'Ext.grid.plugin.header.DragZone',
        'Ext.grid.plugin.header.DropZone'
    ],

    gridListeners: {
        initialize: 'onAfterGridRendered',
        beforeshowcolumnmenu: 'onBeforeShowColumnMenu'
    },

    destroy: function() {
        var me = this;

        me.menus = Ext.destroy(me.menus, me.dragZone, me.dropZone);
        me.callParent();
    },

    updateGrid: function(grid, oldGrid) {
        var me = this,
            header;

        if (grid) {
            header = grid.getHeaderContainer();

            me.dragZone = new Ext.grid.plugin.header.DragZone({
                element: header.bodyElement,
                view: grid,
                grid: grid,
                constrain: Ext.getBody()
            });
            me.dropZone = new Ext.grid.plugin.header.DropZone({
                element: header.el,
                view: grid,
                grid: grid
            });
        }

        me.callParent([grid, oldGrid]);
    },

    onBeforeShowColumnMenu: function(grid, column, menu) {
        var me = this,
            menuItem = menu.down('#groupingPanel'),
            panel = me.getBar();

        if (!menuItem) {
            menu.add('-');
            menuItem = menu.add({
                itemId: 'groupingPanel',
                iconCls: Ext.baseCSSPrefix + 'headermenu-group-by-this',
                handler: 'toggleGroupingPanel',
                scope: me
            });
            me.menus = menuItem;
        }

        // eslint-disable-next-line max-len
        menuItem.setText(panel.getHidden() ? panel.showGroupingPanelText : panel.hideGroupingPanelText);
    },

    addGroupingPanel: function() {
        var me = this,
            grid = me.getGrid(),
            header = grid.getHeaderContainer(),
            pos = grid.indexOf(header) || 0,
            config = Ext.apply({
                grid: grid
            }, me.getPanel()),
            ret;

        ret = grid.insert(pos, config);
        ret = ret && ret.length ? ret[0] : ret;

        return ret;
    }
});
