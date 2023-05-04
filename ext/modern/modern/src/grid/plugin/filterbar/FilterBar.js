/**
 * This class is a grid {@link Ext.plugin.Abstract plugin} that adds a filter bar
 * below the grid column headers.
 *
 * # Example Usage
 *
 *     @example
 *     var shows = Ext.create('Ext.data.Store', {
 *         fields: ['id','show'],
 *         data: [
 *             {id: 0, show: 'Battlestar Galactica'},
 *             {id: 1, show: 'Doctor Who'},
 *             {id: 2, show: 'Farscape'},
 *             {id: 3, show: 'Firefly'},
 *             {id: 4, show: 'Star Trek'},
 *             {id: 5, show: 'Star Wars: Christmas Special'}
 *         ]
 *     });
 *
 *     Ext.create('Ext.grid.Grid', {
 *         renderTo: Ext.getBody(),
 *         title: 'Sci-Fi Television',
 *         height: 250,
 *         width: 250,
 *         store: shows,
 *         plugins: {
 *             gridfilterbar: true
 *         },
 *         columns: [{
 *             dataIndex: 'id',
 *             text: 'ID',
 *             width: 50
 *         },{
 *             dataIndex: 'show',
 *             text: 'Show',
 *             flex: 1,
 *             filterType: 'string'
 *         }]
 *     });
 *
 *     Ext.create('Ext.grid.Grid', {
 *         renderTo: Ext.getBody(),
 *         title: 'Sci-Fi Television',
 *         height: 250,
 *         width: 250,
 *         store: shows,
 *         plugins: {
 *             gridfilterbar: true
 *         },
 *         columns: [{
 *             dataIndex: 'id',
 *             text: 'ID',
 *             width: 50
 *         },{
 *             dataIndex: 'show',
 *             text: 'Show',
 *             flex: 1,
 *             filterType: {
 *                 // required configs
 *                 type: 'string',
 *                 // optional configs
 *                 value: 'star',  // setting a value makes the filter active.
 *                 fieldDefaults: {
 *                     // any Ext.form.field.Text configs accepted
 *                 }
 *             }
 *         }]
 *     });
 *
 * # Features
 *
 * ## Filtering implementations
 *
 * Currently provided filter types are:
 *
 *   * `{@link Ext.grid.plugin.filterbar.filters.Boolean boolean}`
 *   * `{@link Ext.grid.plugin.filterbar.filters.Date date}`
 *   * `{@link Ext.grid.plugin.filterbar.filters.List list}`
 *   * `{@link Ext.grid.plugin.filterbar.filters.Number number}`
 *   * `{@link Ext.grid.plugin.filterbar.filters.String string}`
 *
 *
 * ## Grid functions
 *
 * The following functions are added to the grid:
 * - showFilterBar - will make the filter bar visible
 * - hideFilterBar - will hide the filter bar
 *
 *
 */
Ext.define('Ext.grid.plugin.filterbar.FilterBar', {
    extend: 'Ext.grid.plugin.BaseFilterBar',
    alias: 'plugin.gridfilterbar',

    requires: [
        'Ext.grid.plugin.filterbar.filters.String',
        'Ext.grid.plugin.filterbar.filters.Date',
        'Ext.grid.plugin.filterbar.filters.Number',
        'Ext.grid.plugin.filterbar.filters.Boolean',
        'Ext.grid.plugin.filterbar.filters.None',
        'Ext.grid.plugin.filterbar.filters.List'
    ],

    headerListeners: {
        columnshow: 'onColumnShow',
        columnhide: 'onColumnHide',
        columnadd: 'onColumnAdd',
        columnmove: 'onColumnMove',
        synreservespace: 'syncReserveSpace'
    },

    gridListeners: {
        initialize: 'onGridInitialized',
        columnlayout: 'onHeaderContainerLayout',
        storechange: 'onGridStoreChange'
    },

    createFilterBar: function() {
        var me = this,
            grid = me.getGrid(),
            header = grid.getHeaderContainer(),
            pos = grid.indexOf(header) || 0;

        if (grid.initialized) {
            me.setBar(grid.insert(pos + 1, {
                xtype: 'container',
                hidden: me.getHidden(),
                cls: [me.filterBarCls, Ext.baseCSSPrefix + 'headercontainer'],
                docked: 'top',
                // the column header container has a weight of 100 so we want
                // to dock it after that.
                weight: 110,
                weighted: true,
                autoSize: null,
                layout: {
                    type: 'hbox',
                    align: 'stretch'
                },
                scrollable: {
                    x: false,
                    y: false
                }
            }));
        }
    },

    onGridInitialized: function() {
        this.createFilterBar();
    },

    onGridStoreChange: function(grid, store) {
        this.setStore(store);
    },

    updateGrid: function(grid, oldGrid) {
        var me = this,
            listeners = me.getHeaderListeners();

        me.callParent([grid, oldGrid]);

        me.listenersHeader = Ext.destroy(me.listenersHeader);

        if (grid && listeners) {
            me.listenersHeader = grid.getHeaderContainer().on(Ext.apply(listeners, {
                scope: me,
                destroyable: true
            }));
        }
    },

    updateBar: function(bar) {
        var me = this,
            grid = me.getGrid(),
            header = grid && grid.getHeaderContainer();

        if (bar) {
            header.getScrollable().addPartner(bar.getScrollable(), 'x');
            me.initializeFilters(header.getColumns());
        }
    },

    onColumnAdd: function(header, column, index) {
        var bar = this.getBar(),
            filter = column.getFilterType();

        if (!bar) {
            return;
        }

        if (!filter || !filter.isGridFilter) {
            filter = this.createColumnFilter(column);
        }

        bar.insert(index, filter.getField());
    },

    onColumnMove: function(header, columns, group, fromIndex) {
        var bar = this.getBar(),
            len = columns && columns.length,
            filter, i, column, toIndex;

        if (!bar) {
            return;
        }

        for (i = 0; i < len; i++) {
            column = columns[i];
            filter = column.getFilterType();

            if (!filter || !filter.isGridFilter) {
                filter = this.createColumnFilter(column);
            }

            toIndex = header.indexOf(column);

            if (filter) {
                bar.insert(toIndex, filter.getField());
            }
        }
    },

    onColumnShow: function(header, column) {
        this.setFilterVisibility(column, true);
    },

    onColumnHide: function(header, column) {
        this.setFilterVisibility(column, false);
    },

    onHeaderContainerLayout: function() {
        this.resizeFilters();
    },

    getGridColumns: function() {
        return this.getGrid().getHeaderContainer().getVisibleColumns();
    },

    resizeFilters: function() {
        var columns = this.getGridColumns(),
            len = columns.length,
            bar = this.getBar(),
            i, filter, column;

        if (bar) {
            for (i = 0; i < len; i++) {
                column = columns[i];
                filter = column.getFilterType();

                if (filter && filter.isGridFilter) {
                    filter.resizeField(column.getComputedWidth());
                }
            }
        }
    },

    syncReserveSpace: function(header, value) {
        var bar = this.getBar();

        if (bar) {
            bar.el.setStyle('padding-right', value);
        }
    }
});
