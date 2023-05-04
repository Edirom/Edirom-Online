/**
 * This plugin allows users to change summaries on grid columns using:
 *
 * - a context menu on the summary row cell
 * - a header menu entry
 *
 * On each column of the grid you can define what summary functions are available
 * to the user by configuring {@link Ext.grid.column.Column#summaries}. They will
 * be displayed in the context menu on the summary cell.
 *
 * This plugin adds a docked summary row to the grid.
 *
 * **Note** To be used with a {@link Ext.grid.TreeGrouped}
 */
Ext.define('Ext.grid.plugin.Summaries', {
    extend: 'Ext.grid.plugin.BaseSummaries',

    alias: [
        'plugin.summaries',
        'plugin.gridsummaries'
    ],

    requires: [
        'Ext.grid.row.Summary'
    ],

    mixins: [
        'Ext.mixin.Bufferable',
        'Ext.mixin.StoreWatcher'
    ],

    config: {
        row: {
            lazy: true,
            $value: {
                xtype: 'groupedgridsummaryrow',
                docked: 'bottom',
                scrollable: {
                    x: false,
                    y: false
                }
            }
        },
        /**
         * @cfg {Boolean} [enableContextMenu=true]
         * True to enable the summary grid cell context menu.
         */
        enableContextMenu: true,
        /**
         * @cfg {Boolean} [enableSummaryMenu=true]
         * True to enable the summary menu items in the header menu.
         */
        enableSummaryMenu: true,

        headerListeners: {
            synreservespace: 'syncReserveSpace'
        },

        gridListeners: {
            childlongpress: 'onSummaryGridCellContextMenu',
            childcontextmenu: 'onSummaryGridCellContextMenu',
            columnadd: 'onGridColumnAdd',
            beforeshowcolumnmenu: 'onBeforeShowColumnMenu',
            summaryPositionChange: 'onSummaryPositionChanged'
        },
        summaryRowListeners: {
            longpress: 'onSummaryCellContextMenu',
            contextmenu: 'onSummaryCellContextMenu'
        },

        /**
         * @private
         */
        summaryPosition: null
    },

    inheritUi: true,

    storeListeners: {
        add: 'syncSummary',
        clear: 'syncSummary',
        remove: 'syncSummary',
        datachanged: 'syncSummary',
        update: 'syncSummary',
        summarieschanged: 'onSummariesChanged'
    },

    bufferableMethods: {
        // buffer updates to reduce re-summarization passes over the entire store.
        syncSummary: 5
    },

    summaryRowSelector: '.' + Ext.baseCSSPrefix + 'summaryrow',
    summaryGroupSelector: '.' + Ext.baseCSSPrefix + 'grid-group',

    destroy: function() {
        var me = this;

        me.setOwner(null);
        me.setRow(null);
        me.lastSummaryMenuItem = Ext.destroy(me.lastSummaryMenuItem);

        me.callParent();
    },

    createRow: function(config) {
        return Ext.apply({
            viewModel: this.getGrid().getItemConfig().viewModel
        }, config);
    },

    applyRow: function(row) {
        if (row) {
            row = this.createRow(row);
            row = this.cmp.add(row);
        }

        return row;
    },

    updateRow: function(row, oldRow) {
        Ext.destroy(oldRow);

        if (row && row.element) {
            row.element.on(
                Ext.apply({
                    scope: this
                }, this.getSummaryRowListeners())
            );
        }
    },

    updateStore: function(store, oldStore) {
        var source = store && store.isMultigroupStore ? store.getSource() : store;

        this.mixins.storewatcher.updateStore.call(this, source, oldStore);

        if (source && source.isLoaded()) {
            // if the store is already loaded then we update summaries
            this.syncSummary();
        }
    },

    updateGrid: function(grid, oldGrid) {
        var me = this,
            listeners = me.getHeaderListeners(),
            row = me.getRow(),
            scrollable;

        me.listenersHeader = Ext.destroy(me.listenersHeader);

        if (row && oldGrid) {
            scrollable = oldGrid.getScrollable();

            if (scrollable) {
                scrollable.removePartner(row.getScrollable());
            }
        }

        if (grid) {
            scrollable = grid.getScrollable();

            if (row && scrollable) {
                scrollable.addPartner(row.getScrollable(), 'x');
            }

            me.setOwner(grid);

            me.setSummaryPosition(grid.getSummaryPosition());

            grid.addCls(Ext.baseCSSPrefix + 'grid-has-summaryrow');

            if (listeners) {
                me.listenersHeader = grid.getHeaderContainer().on(Ext.apply(listeners, {
                    scope: me,
                    destroyable: true
                }));
            }

            me.parseSummariesFromColumns(grid, grid.getColumns());
        }

        me.callParent([grid, oldGrid]);
    },

    updateSummaryPosition: function(position) {
        var row = this.getRow();

        row.setHidden(position !== 'docked');
    },

    onSummaryPositionChanged: function(grid, position) {
        this.setSummaryPosition(position);
    },

    onGridColumnAdd: function(grid, column) {
        this.parseSummariesFromColumns(grid, [column]);
    },

    parseSummariesFromColumns: function(grid, columns) {
        var len = columns.length,
            store = grid.getStore(),
            changed = false,
            values = {},
            i, column, summary;

        if (!store || store.isDestroyed) {
            return;
        }

        if (store.isMultigroupStore) {
            store = store.getSource();
        }

        for (i = 0; i < len; i++) {
            column = columns[i];
            summary = column.getSummary();

            if (summary) {
                values[column.getDataIndex()] = summary;
                column.setSummary(null);
                changed = true;
            }
        }

        if (changed) {
            store.setFieldsSummaries(values);
        }
    },

    onSummariesChanged: function(store) {
        var grid = this.getGrid(),
            dataItems = grid ? grid.innerItems : [],
            len = dataItems.length,
            i, row;

        for (i = 0; i < len; i++) {
            row = dataItems[i];

            if (row.isSummaryRows) {
                row.syncSummary();
            }
        }
    },

    onSummaryGridCellContextMenu: function(grid, location) {
        this.showMenu(this.getParams(location.event));
    },

    onSummaryCellContextMenu: function(event, cell) {
        this.showMenu(this.getParams(event));
    },

    getDataIndex: function(column) {
        return column.getDataIndex();
    },

    canShowMenu: function(params) {
        var row = params.row;

        return row && (row.isGroupRow || row.isSummaryRows || row.isSummaryRow) &&
            this.callParent([params]);
    },

    getParams: function(event) {
        var rowEl = event.getTarget(this.summaryRowSelector) ||
            event.getTarget(this.summaryGroupSelector),
            summaryRow = Ext.fly(rowEl),
            cell = Ext.fly(event.getTarget('.' + Ext.baseCSSPrefix + 'gridcell')),
            params = {
                e: event,
                row: summaryRow && summaryRow.component
            };

        if (summaryRow && cell && cell.component) {
            cell = cell.component;
            params.cell = cell;
            params.column = cell.getColumn();
        }

        return params;
    },

    createMenu: function(menu) {
        menu.xtype = 'menu';

        return Ext.create(menu);
    },

    onBeforeShowColumnMenu: function(grid, column, menu) {
        var menuItem = menu.down('#summaryMenuItem');

        if (!menuItem) {
            menuItem = menu.add({
                text: this.summaryText,
                itemId: 'summaryMenuItem',
                iconCls: Ext.baseCSSPrefix + 'summaries-icon'
            });
        }

        menuItem.setHidden(column.isGroupsColumn);
        menuItem.setMenu(this.getSummaryMenu(column));
        // let's save a reference to the menu item
        // so we can remove it when the plugin is destroyed
        this.lastSummaryMenuItem = menuItem;
    },

    syncReserveSpace: function(header, value) {
        var row = this.getRow();

        if (row) {
            row.cellsElement.setStyle('padding-right', value);
        }
    },

    privates: {
        doSyncSummary: function() {
            var row = this.getRow();

            if (row) {
                row.syncSummary();
            }
        }
    }

});
