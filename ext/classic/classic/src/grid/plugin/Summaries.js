/**
 * This plugin allows users to change summaries on grid columns using:
 *
 * - a context menu on the summary row cell
 * - a header menu entry
 *
 * On each column of the grid you can define what summary functions are available
 * to the user by configuring {@link Ext.grid.column.Column#summaries}. They will
 * be displayed
 */
Ext.define('Ext.grid.plugin.Summaries', {
    extend: 'Ext.grid.plugin.BaseSummaries',

    alias: 'plugin.gridsummaries',

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
        groupcontextmenu: 'onGroupContextMenu',
        groupsummarycontextmenu: 'onGroupSummaryContextMenu',
        summarycontextmenu: 'onSummaryContextMenu',
        collectheadermenuitems: 'onCollectMenuItems',
        showheadermenuitems: 'onShowHeaderMenu'
    },

    onGroupContextMenu: function(grid, params) {
        var pos = params.feature.groupSummaryPosition,
            group = params.group;

        if (pos === 'hide') {
            return;
        }

        if (pos === 'top' || (group && group.isCollapsed && pos === 'bottom') || params.isSummary) {
            this.showMenu(params);
        }
    },

    onGroupSummaryContextMenu: function(grid, params) {
        this.showMenu(params);
    },

    onSummaryContextMenu: function(grid, params) {
        this.showMenu(params);
    },

    canShowMenu: function(params) {
        var groupIndex = params.feature.groupingColumn && params.feature.groupingColumn.getIndex();

        return this.callParent([params]) && !(groupIndex >= 0 &&
            groupIndex >= params.column.getIndex());
    },

    onCollectMenuItems: function(grid, params) {
        params.items.push({
            text: this.summaryText,
            itemId: 'summaryMenuItem',
            iconCls: Ext.baseCSSPrefix + 'summaries-icon'
        });
    },

    onShowHeaderMenu: function(grid, params) {
        var menuItem = params.menu.down('#summaryMenuItem');

        if (!menuItem) {
            return;
        }

        menuItem.setVisible(!params.column.isGroupsColumn);
        menuItem.setMenu(this.getSummaryMenu(params.column));
    }

});
