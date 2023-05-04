/**
 * @private
 */
Ext.define('Ext.grid.filters.menu.Base', {
    extend: 'Ext.menu.CheckItem',

    isFilterMenuItem: true,

    mixins: [
        'Ext.mixin.Bufferable'
    ],

    /**
     * @cfg {String} text
     * The menu item text for the filters sub-menu.
     * @locale
     */
    text: 'Filter',

    menu: {
        indented: false
    },

    weight: -70,

    bufferableMethods: {
        onInputChange: 300
    },

    syncFilter: function() {
        var me = this,
            dataIndex = me.column.getDataIndex(),
            query = me.plugin.getQuery(),
            filters = query.getFilters(),
            items = me.getMenu().getItems().items,
            f, i, k, item, value;

        for (i = items.length; i-- > 0; /* empty */) {
            item = items[i];

            if (item.operator) {
                value = null;

                for (k = dataIndex && filters && filters.length; k-- > 0; /* empty */) {
                    f = filters[k];

                    if (f.property === dataIndex && f.operator === item.operator) {
                        value = f.value;
                        break;
                    }
                }

                item.setValue(value);
            }
        }
    },

    syncQuery: function() {
        var me = this,
            dataIndex = me.column.getDataIndex(),
            plugin = me.plugin,
            grid = plugin.getOwner(),
            query = plugin.getQuery(),
            added = 0,
            removed = 0,
            active, filters, i, item, items, value;

        if (dataIndex) {
            filters = Ext.clone(query.getFilters());
            items = me.getMenu().getItems().items;

            for (i = filters && filters.length; i-- > 0; /* empty */) {
                if (filters[i].property === dataIndex) {
                    filters.splice(i, 1);
                    ++removed;
                }
            }

            if (me.getChecked()) {
                for (i = items.length; i-- > 0;) {
                    item = items[i];

                    if (item.operator) {
                        value = item.getValue();

                        if (value !== null && value !== '') {
                            ++added;

                            if (Ext.isDate(value)) {
                                value = Ext.Date.format(value, 'C');
                            }

                            (filters || (filters = [])).push({
                                property: dataIndex,
                                operator: item.operator,
                                value: value
                            });
                        }
                    }
                }
            }

            if (!added) {
                me.setChecked(false);
            }

            if (added || removed) {
                plugin.setActiveFilter(filters);
            }

            active = filters && Ext.Array.contains(Ext.Array.pluck(filters, 'property'), dataIndex);
            me.setColumnActive(active);
            grid.fireEventArgs(active ? 'filteractivate' : 'filterdeactivate', [me, me.column]);
        }
    },

    setColumnActive: function(active) {
        this.column[active ? 'addCls' : 'removeCls'](this.plugin.filterCls);
    },

    /**
     * @param {*} filter 
     * @returns filter.value property, the filter config object, or undefined. 
     */
    getDefaultToFilterBy: function(filter) {
        if (Ext.isObject(filter) && filter.value !== undefined) {
            return filter.value;
        }
        else {
            return filter;
        }
    },

    privates: {
        doOnInputChange: function() {
            this.setChecked(true);
            this.syncQuery();
        },

        /**
         * The initialization update the filters options with the default(s) values
         * specified in the column configuration, that could be specified:
         *
         * As one unique value, as:
         *
         *     filter: {
         *         value: 'saturday'
         *     }
         *
         *  As more than one value, indicating the operator to use with each one, as shown below.
         *  Note that the list type is a single combobox which does not use the operator:value 
         *  syntax. In that case, the initial value is provided by overriding 
         *  getDefaultToFilterBy().
         *
         *     filter: {
         *         '>': 0,
         *         '<': 100
         *     }
         *
         *     or
         *
         *     filter: {
         *         value: {
         *              '>': 0,
         *              '<': 100
         *         }
         *     }
         *
         *  If the filter is defined with only one value with not operation specification,
         *  it ill be assigned to the menu element witch has the next property:
         *
         *       defaultFilter: true
         */
        initialize: function() {
            var filter = this.column.getFilter(),
                item,
                defaultToFilterBy,
                menuItems = this.getMenu().getItems().items,
                prop, itemIndex, itemToAssignValue;

            if (filter) {

                defaultToFilterBy = this.getDefaultToFilterBy(filter);

                if (defaultToFilterBy !== undefined) {

                    if (Ext.isObject(defaultToFilterBy)) {
                        for (prop in defaultToFilterBy) {
                            for (itemIndex = menuItems.length; itemIndex-- > 0;) {
                                item = menuItems[itemIndex];

                                if (item.operator && item.operator === prop) {
                                    item.setValue(defaultToFilterBy[prop]);
                                }
                            }
                        }

                    }
                    else {

                        if (menuItems.length === 1) {
                            itemToAssignValue = menuItems[0];
                        }
                        else {
                            for (itemIndex = menuItems.length; itemIndex-- > 0;) {
                                item = menuItems[itemIndex];

                                if (item.defaultFilter === true ||
                                    item.getValue() === defaultToFilterBy) {
                                    itemToAssignValue = item;
                                }
                            }
                        }

                        if (itemToAssignValue) {
                            // If it's a check element.
                            if (itemToAssignValue.setChecked) {
                                itemToAssignValue.setChecked(true);
                            }
                            else {
                                itemToAssignValue.setValue(defaultToFilterBy);
                            }
                        }

                    }
                }

            }

            this.callParent();
        }

    }
});
