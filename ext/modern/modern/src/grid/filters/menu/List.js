/**
 * @private
 *
 * The list grid filter allows you to create a filter selections for the range
 * of unique values found in a store. If you don't configure a store, the grid's
 * store is used.
 *
 * The menu item uses a {@link Ext.field.ComboBox combobox},
 * which you are free to customize, as shown in the example below.
 *
 * If you're using the range from the grid's store, you can also specify "sorted"
 * and "sortDirection", which are used for the the values shown in the combobox.
 * If you are configuring your own store in the {@link Ext.field.ComboBox combobox}, 
 * that store's sorters are used, and the "sorted" and "sortDirection" configs are ignored.
 *
 * Example List Filter Usage:
 *
 * ```javascript
 * @example({ framework: 'extjs' })
 * Ext.create('Ext.grid.Grid', {
 *     fullscreen: true,
 *     plugins: {
 *         gridfilters: true
 *     },
 *     columns: [{
 *         text: 'First Name',
 *         dataIndex: 'first',
 *         filter: 'list' // These are shown in the order found in the grid's store
 *     }, {
 *         text: 'Last Name',
 *         dataIndex: 'last',
 *         filter: {
 *             type: 'list',
 *             sorted: true,
 *             sortDirection: 'ASC' // ASC (default) or DESC
 *         }
 *     }, {
 *         text: 'Middle Name',
 *         dataIndex: 'middle',
 *         filter: {
 *             type: 'list',
 *             menu: {
 *                 list: {
 *                     multiSelect: true
 *                 }
 *             }
 *         }
 *     }, {
 *         text: 'Department',
 *         dataIndex: 'department',
 *         filter: {
 *             type: 'list',
 *             menu: {
 *                 items: {
 *                     list: {
 *                         valueField: 'dept',
 *                         displayField: 'dept',
 *                         placeholder: 'Choose a dept.',
 *                         store: {
 *                             storeId: 'mystore',
 *                             sorters: ['dept'],
 *                             data: [{
 *                                 dept: 'Receiving' // This won't match anything
 *                             }, {
 *                                 dept: 'Accounting'
 *                             }]
 *                         }
 *                     }
 *                 }
 *             }
 *         }
 *     }, {
 *         text: 'Seniority',
 *         dataIndex: 'seniority'
 *     }, {
 *         text: 'Hired Month',
 *         dataIndex: 'hired'
 *     }, {
 *         text: 'Active',
 *         dataIndex: 'active'
 *     }],
 *     title: 'Filter Grid - List Type',
 *     // We're placing the viewModel down here to make the column configs easier to peruse.
 *     viewModel: {
 *         stores: {
 *             store: {
 * data: [ 
 *     {first: "Michael", middle: "John",   last: "Scott",   department: "Management" },
 *     {first: "Dwight",  middle: "Josef",  last: "Schrute", department: "Sales",     }, 
 *     {first: "Jim",     middle: "Harold", last: "Halpert", department: "Sales",     }, 
 *     {first: "Angela",  middle: "Marie",   last: "Martin",  department: "Accounting" }]
 *             }
 *         }
 *     },
 *     bind: {
 *         store: '{store}'
 *     }
 * });
 * ```
 */
Ext.define('Ext.grid.filters.menu.List', {
    extend: 'Ext.grid.filters.menu.Base',
    alias: 'gridFilters.list',

    menu: {
        items: {
            list: {
                xtype: 'comboboxfield',
                queryMode: 'local',
                cls: 'x-grid-filters-menu-list-combobox',
                // "operator" should have some initial value because Base#syncValue looks for it 
                operator: 'in',
                placeholder: 'Choose',
                listeners: {
                    change: 'up.onInputChange'
                }
            }
        }
    },

    config: {
        sorted: null,
        sortDirection: 'ASC'
    },
    cachedConfig: {
        storeListenersConfig: {
            // Note: add and remove are not fired if the record in question is being filtered
            // out. Under that circumstance the list range for the list menu item isn't 
            // re-calculated. This is consistent with filterbar List.
            load: 'onDataChanged',
            add: 'onDataChanged',
            refresh: 'onDataChanged',
            remove: 'onDataChanged',
            update: 'onDataChanged'
        }

    },

    classCls: Ext.baseCSSPrefix + 'filters-menu-list',

    /**
     * How does this work?
     * 
     * The range of values is shown by a combobox. When the user chooses a value, the 
     * onInputChange() is run, which triggers the base class to update the filters.
     * 
     * The inititialize() method checks to see if we're using the grid's store to
     * determine the range of values, and if so, itializes the combobox and listens
     * for changes to the grid's data. When using the grid's store, the createValueRange()
     * method determines the range.
     * 
     * @param {} store 
     */
    onDataChanged: function(store) {
        this.createValueRange(store);
    },
    oldRange: [],
    createValueRange: function(store) {
        // When using the grid's store, we listen to various events that fire when the data 
        // changes. All of those events are handled by onDataChange, which in turn runs this
        // method. This method revisits this column's data (using dataIndex) to determine 
        // the range of values, and updates the combobox accordingly.
        var range, sortedRange, result, displayField, valueField, recordData,
            me = this,
            dataIndex = me.column.getDataIndex();

        range = store.collect(dataIndex, false, true);

        // sort() does an in-place sort, so we need to clone it first.
        sortedRange = Ext.Array.sort(Ext.clone(range));

        // Bail out if the range is unchanged.
        // Compare the sorted range because the order isn't significant.
        if (Ext.Array.equals(sortedRange, me.oldRange)) {
            return;
        }

        me.oldRange = sortedRange;

        if (me.getSorted()) {
            range = (me.getSortDirection() === 'DESC')
                ? Ext.clone(sortedRange).reverse()
                : sortedRange;
        }

        displayField = me.combobox.getDisplayField();
        valueField = me.combobox.getValueField();
        recordData = range.map(function(value) {
            result = {};
            result[displayField] = value;
            result[valueField] = value;

            return result;
            // The Rhino parser didn't like this version. :-/
            // return {
            //     [displayField]: value,
            //     [valueField]: value
            // };
        });

        me.combobox.getStore().setData(recordData);
    },

    /**
     * @override
     * @param {} filter 
     * @returns filter.value -- which may be a string or [string] -- or undefined.
     */
    getDefaultToFilterBy: function(filter) {
        if (!filter) {
            return; // Bail out if there's no filter config. This should never happen?
        }

        // This is different than the ancestor because it only returns filter.value.
        // The base implementation can return the whole config object.
        return filter.value;
    },
    privates: {
        initialize: function() {
            // If the user configures a store on the combobox, there's not much that
            // initialize() needs to do.But if there isn't a configured store, initialize()
            // sets up listeners to detect changes to the grid's data change, as well as a
            // listener to detect if the grid gets a new store.
            var store,
                me = this;

            me.grid = this.plugin.getOwner(); // Convenience property
            me.combobox = this.getMenu().down('combobox'); // Convenience property

            if (!me.combobox.getStore()) {
                me.combobox.setStore({
                    // Flag that we're using our own store, populated with the grid's range of
                    // values.
                    internalUse: true
                });
                // config setters have already run -- before the combobox is
                // created. Therefore, do first-time inialization here.
                me.doUpdateSorted();

                // Listen for the grid getting a new store.
                me.gridListeners = me.grid.on({
                    scope: me,
                    destroyable: true,
                    'storechange': 'onGridStoreChange'
                });

                // If the grid has a store, listen to its changes.
                store = me.grid.getStore();

                if (store) {
                    me.storeListeners = store.on(Ext.apply({
                        scope: me,
                        destroyable: true
                    }, me.getStoreListenersConfig()));

                    // If the grid's store is already loaded, then populate the combobox.
                    if (store.isLoaded()) {
                        me.onDataChanged(store);
                    }
                }
            }

            me.callParent();
        }
    },
    onInputChange: function(field, value) {
        var me = this;

        me.combobox.operator = me.combobox.getMultiSelect() ? 'in' : '==';
        me.callParent();
    },
    updateSorted: function() {
        this.doUpdateSorted();
    },
    updateSortDirection: function() {
        this.doUpdateSorted();
    },
    doUpdateSorted: function() {
        var me = this,
            store,
            sorted = me.getSorted(),
            direction = me.getSortDirection();

        if (!me.combobox) {
            return;
        } // First time in, the combobox doesn't exist yet

        store = me.combobox.getStore();

        if (!store.internalUse) {
            return;
        } // Bail out if we're not using the internal use store

        if (sorted) {
            store.getSorters().add({
                id: 'sort',
                property: me.combobox.getDisplayField(),
                direction: direction ? direction : 'ASC'
            });
        }
        else {
            store.getSorters().removeByKey('sort');
        }

    },
    onGridStoreChange: function(grid, newStore, oldStore) {
        var me = this;

        if (oldStore) {
            Ext.destroy(me.storeListeners);
        }

        if (newStore) {
            me.storeListeners = newStore.on(Ext.apply({
                scope: me,
                destroyable: true
            }, me.getStoreListenersConfig()));

            // If the grid's store is already loaded, then populate the combobox.
            if (newStore.isLoaded()) {
                me.onDataChanged(newStore);
            }
        }
    }
});
