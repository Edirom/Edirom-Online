/**
 * That's a base class for the {@link Ext.grid.plugin.FilterBar} plugin
 * and it's shared by both toolkits.
 * @private
 */
Ext.define('Ext.grid.plugin.BaseFilterBar', {
    extend: 'Ext.plugin.Abstract',

    config: {
        /**
         * @cfg {Boolean} hidden
         *
         * Should the filterbar be visible or hidden when created?
         */
        hidden: false,

        headerListeners: null,

        gridListeners: null,

        storeListeners: {
            filterchange: 'onFilterChanged'
        },

        grid: null,
        store: null,
        bar: null,
        header: null
    },

    filterBarCls: Ext.baseCSSPrefix + 'grid-filterbar',
    filterCls: Ext.baseCSSPrefix + 'grid-filterbar-filtered-column',

    init: function(grid) {
        this.setGrid(grid);
    },

    destroy: function() {
        var me = this;

        me.setStore(null);
        me.setGrid(null);
        me.setBar(null);
        me.callParent();
    },

    /**
     * Show filter bar
     */
    showFilterBar: function() {
        if (this.isDestroyed) {
            return;
        }

        this.getBar().show();
    },

    /**
     * Hide filter bar
     */
    hideFilterBar: function() {
        if (this.isDestroyed) {
            return;
        }

        this.getBar().hide();
    },

    /**
     * Clear all store filters
     */
    clearFilters: function() {
        var filters = this.getGrid().getStore().getFilters(false);

        if (filters) {
            filters.removeAll();
        }
    },

    setupGridFunctions: function(grid) {
        var me = this;

        if (grid) {
            grid.showFilterBar = Ext.bind(me.showFilterBar, me);
            grid.hideFilterBar = Ext.bind(me.hideFilterBar, me);
        }
    },

    unsetupGridFunctions: function(grid) {
        if (grid) {
            grid.showFilterBar = grid.hideFilterBar = null;
        }
    },

    updateGrid: function(grid, oldGrid) {
        var me = this,
            listeners = me.getGridListeners();

        me.listenersGrid = Ext.destroy(me.listenersGrid);
        me.unsetupGridFunctions(oldGrid);

        if (oldGrid) {
            me.setStore(null);
        }

        if (grid) {
            if (listeners) {
                me.listenersGrid = grid.on(Ext.apply({
                    scope: me,
                    destroyable: true
                }, listeners));
            }

            me.setStore(grid.getStore());
            me.setupGridFunctions(grid);
            me.createFilterBar();
        }
    },

    updateStore: function(store) {
        var me = this;

        Ext.destroy(me.listenersStore);

        if (store) {
            me.listenersStore = store.on(Ext.apply({
                scope: me,
                destroyable: me
            }, me.getStoreListeners()));
        }
    },

    createFilterBar: Ext.emptyFn,
    getGridColumns: Ext.emptyFn,

    initializeFilters: function(columns) {
        var len = columns.length,
            bar = this.getBar(),
            i, filter;

        for (i = 0; i < len; i++) {
            filter = this.createColumnFilter(columns[i]);
            bar.add(filter.getField());
        }
    },

    setFilterVisibility: function(column, visible) {
        var filter = column.getFilterType(),
            field = filter && filter.isGridFilter ? filter.getField() : null;

        if (field) {
            field[visible ? 'show' : 'hide']();
        }
    },

    createColumnFilter: function(column) {
        var filter = column.getFilterType(),
            config = {
                grid: this.getGrid(),
                column: column,
                owner: this
            };

        if (!filter) {
            config.type = 'none';
            filter = Ext.Factory.gridFilterbar(config);
        }
        else if (!filter.isGridFilter) {
            if (Ext.isString(filter)) {
                config.type = filter;
            }
            else {
                Ext.apply(config, filter);
            }

            filter = Ext.Factory.gridFilterbar(config);
        }

        column.setFilterType(filter);

        return filter;
    },

    onFilterChanged: function() {
        this.resetFilters();
    },

    resetFilters: function() {
        var columns = this.getGridColumns(),
            len = columns.length,
            i, filter;

        for (i = 0; i < len; i++) {
            filter = columns[i].getFilterType();

            if (filter && filter.isGridFilter) {
                filter.resetFilter();
            }
        }
    },

    resizeFilters: function() {
        var columns = this.getGridColumns(),
            len = columns.length,
            i, filter;

        for (i = 0; i < len; i++) {
            filter = columns[i].getFilterType();

            if (filter && filter.isGridFilter) {
                filter.resizeField();
            }
        }
    }

});
