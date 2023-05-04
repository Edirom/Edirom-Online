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
 *     Ext.create('Ext.grid.Panel', {
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
 *     Ext.create('Ext.grid.Panel', {
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
        'Ext.grid.plugin.filterbar.filters.List',
        'Ext.grid.plugin.filterbar.filters.InList'
    ],

    headerListeners: {
        columnshow: 'onColumnShow',
        columnhide: 'onColumnHide',
        add: 'onColumnAdd',
        remove: 'onColumnRemove',
        afterlayout: 'onHeaderLayout'
    },

    gridListeners: {
        storeChange: 'onGridStoreChanged'
    },

    /**
     *  `"both"` (the default) - The plugin is added to both grids
     *  `"top"` - The plugin is added to the containing Panel
     *  `"locked"` - The plugin is added to the locked (left) grid
     *  `"normal"` - The plugin is added to the normal (right) grid
     *
     * @private
     */
    lockableScope: 'both',

    createFilterBar: function() {
        var me = this,
            bar;

        bar = me.getGrid().addDocked({
            weight: 100,
            xtype: 'container',
            hidden: me.getHidden(),
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            childEls: ['innerCt'],
            scrollable: {
                x: false,
                y: false
            },
            listeners: {
                afterrender: 'onBarRender',
                scope: me
            }
        })[0];

        bar.addCls([me.filterBarCls, Ext.baseCSSPrefix + 'grid-header-ct']);

        me.setBar(bar);
    },

    updateGrid: function(grid, oldGrid) {
        var me = this,
            listeners = me.getHeaderListeners();

        me.callParent([grid, oldGrid]);

        me.listenersHeader = Ext.destroy(me.listenersHeader);

        if (grid && listeners) {
            me.listenersHeader = grid.headerCt.on(Ext.apply(listeners, {
                scope: me,
                destroyable: true
            }));
        }
    },

    setupGridFunctions: function() {
        var me = this,
            grid = me.getGrid(),
            mainGrid;

        if (grid) {
            if (grid.isLocked) {
                mainGrid = grid.ownerGrid;
                mainGrid.showFilterBar = Ext.bind(me.showFilterBarPartners, me);
                mainGrid.hideFilterBar = Ext.bind(me.hideFilterBarPartners, me);
            }

            grid.showFilterBar = Ext.bind(me.showFilterBar, me);
            grid.hideFilterBar = Ext.bind(me.hideFilterBar, me);
        }
    },

    showFilterBar: function() {
        var me = this;

        if (me.isDestroyed) {
            return;
        }

        me.callParent();
        me.getBar().getScrollable().syncWithPartners();
    },

    showFilterBarPartners: function() {
        this.showFilterBar();
        this.lockingPartner.showFilterBar();
    },

    hideFilterBarPartners: function() {
        this.hideFilterBar();
        this.lockingPartner.hideFilterBar();
    },

    onBarRender: function(bar) {
        var grid = this.getGrid();

        grid.getView().getScrollable().addPartner(bar.getScrollable(), 'x');
        this.initializeFilters(grid.columnManager.getColumns());
    },

    onHeaderLayout: function() {
        this.resizeFilters();
        this.adjustFilterBarSize();
    },

    onGridStoreChanged: function(grid, store) {
        this.setStore(store);
        this.resetFilters();
    },

    onColumnAdd: function(header, column, index) {
        var filter = column.getFilterType();

        if (!filter || !filter.isGridFilter) {
            filter = this.createColumnFilter(column);
        }

        this.getBar().insert(index, filter.getField());
        this.adjustFilterBarSize();
    },

    onColumnRemove: function() {
        this.adjustFilterBarSize();
    },

    onColumnShow: function(header, column) {
        this.setFilterVisibility(column, true);
    },

    onColumnHide: function(header, column) {
        this.setFilterVisibility(column, false);
    },

    adjustFilterBarSize: function() {
        var bar = this.getBar(),
            headerCt = this.getGrid().headerCt,
            width;

        if (bar.rendered) {
            width = bar.innerCt.getWidth();

            if (headerCt.tooNarrow) {
                width += Ext.getScrollbarSize().width;
            }

            bar.innerCt.setWidth(width);
        }
    },

    createColumnFilter: function(column) {
        if (column.filter) {
            column.setFilterType(column.filter);
            delete column.filter;
        }

        return this.callParent([column]);
    },

    getGridColumns: function() {
        return this.getGrid().columnManager.getColumns();
    }
});
