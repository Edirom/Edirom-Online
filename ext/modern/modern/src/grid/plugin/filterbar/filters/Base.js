/**
 * Base class for a filter type used by the {@link Ext.grid.plugin.FilterBar plugin}
 */
Ext.define('Ext.grid.plugin.filterbar.filters.Base', {
    mixins: [
        'Ext.mixin.Factoryable'
    ],

    requires: [
        'Ext.field.Text',
        'Ext.grid.plugin.filterbar.Operator'
    ],

    factoryConfig: {
        type: 'grid.filterbar'
    },

    $configPrefixed: false,
    $configStrict: false,

    config: {
        /**
         * @cfg {Object} fieldDefaults
         *
         * Default settings for the field that is created for this filter
         */
        fieldDefaults: {
            xtype: 'textfield',
            hideLabel: true,
            selectOnFocus: true,
            autoComplete: false
        },

        /**
         * @cfg {Ext.grid.Grid} grid
         *
         * The reference to the grid
         */
        grid: null,
        /**
         * @cfg {Ext.grid.column.Column} column
         *
         * The reference to the grid column
         */
        column: null,

        field: null,

        /**
         * @cfg {String} dataIndex
         * The {@link Ext.data.Store} dataIndex of the field this filter represents.
         * The dataIndex does not actually have to exist in the store.
         */
        dataIndex: null,

        /**
         * @cfg {String} operator
         *
         * Default operator for this filter
         */
        operator: '==',
        /**
         * @cfg {String[]} operators
         *
         * Array of operators available for this filter. Check {@link Ext.util.Filter} for
         * a list of operators supported by store filtering. This list can be extended
         * with your own operators.
         */
        operators: null,

        /**
         * @cfg {Number} updateBuffer
         * Number of milliseconds to wait after user interaction to fire an update. Only supported
         * by filters: 'list', 'numeric', and 'string'.
         */
        updateBuffer: 500,

        /**
         * @cfg {Function} [serializer]
         * A function to post-process any serialization. Accepts a filter state object
         * containing `property`, `value` and `operator` properties, and may either
         * mutate it, or return a completely new representation.
         */
        serializer: null,

        fieldListeners: {
            change: 'onValueChange',
            operatorchange: 'onOperatorChange',
            initialize: 'onFieldRender',
            specialkey: 'onFieldSpecialKey'
        }
    },

    /**
     * @property {Boolean} active
     * True if this filter is active. Use setActive() to alter after configuration. If
     * you set a value, the filter will be actived automatically.
     */
    /**
     * @cfg {Boolean} active
     * Indicates the initial status of the filter (defaults to false).
     */
    active: false,

    /**
     * The prefix for id's used to track stateful Store filters.
     * @private
     */
    filterIdPrefix: Ext.baseCSSPrefix + 'gridfilter',

    isGridFilter: true,
    defaultRoot: 'data',
    fieldCls: Ext.baseCSSPrefix + 'grid-filter-base',

    /**
     * Initializes the filter given its configuration.
     * @param {Object} config
     */
    constructor: function(config) {
        var me = this;

        // Calling Base constructor is very desirable for testing
        //<debug>
        me.callParent([config]);
        //</debug>

        me.initConfig(config);

        me.initFilter(config);

        me.createField();

        me.task = new Ext.util.DelayedTask(me.setValue, me);
    },

    destroy: function() {
        var me = this;

        if (me.task) {
            me.task.cancel();
            me.task = null;
        }

        me.setColumn(null);
        me.setField(null);
        me.setGrid(null);

        me.callParent();
    },

    initFilter: Ext.emptyFn,

    createField: function() {
        this.setField(Ext.widget(this.getFieldConfig()));
    },

    getFieldConfig: function() {
        var me = this,
            column = me.getColumn(),
            filter = me.filter,
            config = {};

        if (column) {
            config.width = column.getWidth();
            config.hidden = column.getHidden();
        }

        if (filter) {
            config.value = filter.getValue();
        }

        return Ext.apply(config, me.getFieldDefaults());
    },

    addStoreFilter: function(filter) {
        var filters = this.getGridStore().getFilters(),
            idx = filters.indexOf(filter),
            existing = idx !== -1 ? filters.getAt(idx) : null;

        // If the filter being added doesn't exist in the collection we should add it.
        // But if there is a filter with the same id (indexOf tests for the same id), we should
        // check if the filter being added has the same properties as the existing one
        if (!existing || !Ext.util.Filter.isEqual(existing, filter)) {
            filters.add(filter);
        }
    },

    createFilter: function(config, key) {
        var filter = new Ext.util.Filter(this.getFilterConfig(config, key));

        filter.isGridFilter = true;

        return filter;
    },

    getFilterConfig: function(config, key) {
        config.id = this.getBaseIdPrefix();

        if (!config.property) {
            config.property = this.dataIndex;
        }

        if (!config.root) {
            config.root = this.defaultRoot;
        }

        if (key) {
            config.id += '-' + key;
        }

        config.serializer = this.getSerializer();

        return config;
    },

    getActiveState: function(config, value) {
        // An `active` config must take precedence over a `value` config.
        var active = config.active;

        return (active !== undefined) ? active : value !== undefined;
    },

    getBaseIdPrefix: function() {
        return this.filterIdPrefix + '-' + this.dataIndex;
    },

    getGridStore: function() {
        return this.grid.getStore();
    },

    getStoreFilter: function(key) {
        var me = this,
            filters = me.getGridStore().getFilters(false),
            id = me.getBaseIdPrefix(),
            filter, f, len, i, oldKey;

        if (key) {
            id += '-' + key;
        }

        if (filters) {
            filter = filters.get(id);

            if (!filter) {
                // let's search by dataIndex
                len = filters.length;

                for (i = 0; i < len; i++) {
                    f = filters.items[i];

                    if (f.getProperty() === me.dataIndex) {
                        filter = f;
                        // we need to change the id and reindex the filters
                        oldKey = filters.getKey(f);
                        filter.setId(id);
                        filters.itemChanged(f, ['id'], oldKey);
                        break;
                    }
                }
            }
        }

        return filter;
    },

    /**
     * Sets the status of the filter and fires the appropriate events.
     * @param {Boolean} active The new filter state.
     */
    setActive: function(active) {
        var me = this,
            filterCollection;

        if (me.active !== active) {
            me.active = active;

            me.changingFilters = true;
            filterCollection = me.getGridStore().getFilters();
            filterCollection.beginUpdate();

            if (active) {
                me.activate();
            }
            else {
                me.deactivate();
            }

            filterCollection.endUpdate();
            me.changingFilters = false;

            me.setColumnActive(active);
            me.grid.fireEventArgs(active ? 'filteractivate' : 'filterdeactivate', [me, me.column]);
        }
    },

    activate: Ext.emptyFn,
    deactivate: Ext.emptyFn,

    setColumnActive: function(active) {
        this.column[active ? 'addCls' : 'removeCls'](this.owner.filterCls);
    },

    /**
     * @private
     * Handler method called when there is a significant event on an input item.
     */
    onValueChange: function(field, value) {
        var me = this,
            updateBuffer = me.updateBuffer;

        if (field.isValid()) {
            if (value === me.value) {
                return;
            }

            if (updateBuffer) {
                me.task.delay(updateBuffer, null, null, [value]);
            }
            else {
                me.setValue(value);
            }
        }
    },

    onOperatorChange: function(field, operator) {
        var value = field.getValue(),
            emptyOp = (operator === 'empty' || operator === 'nempty');

        this.setOperator(operator);

        if (!Ext.isEmpty(value) && !emptyOp) {
            this.setValue(value);
        }
    },

    removeStoreFilter: function(filter) {
        this.getGridStore().getFilters().remove(filter);
    },

    updateColumn: function(column) {
        var me = this;

        me.columnListeners = Ext.destroy(me.columnListeners);

        if (column) {
            if (!me.getDataIndex()) {
                me.setDataIndex(column.getDataIndex());
            }

            me.columnListeners = column.on({
                destroy: me.destroy,
                scope: me,
                destroyable: true
            });
        }
    },

    updateField: function(field, oldField) {
        var me = this;

        if (!this.grid.isDestroying) {
            Ext.destroy(oldField);
        }

        if (field) {
            field.addCls(me.fieldCls);

            if (field.isFormField) {
                field.addPlugin({
                    type: 'operator',
                    operator: me.getOperator(),
                    operators: me.getOperators()
                });
                field.on(Ext.apply({
                    scope: me
                }, me.getFieldListeners()));
            }
        }
    },

    updateOperator: function(operator) {
        var me = this,
            field = me.getField();

        if (!me.isConfiguring && me.filter) {
            me.filter.setOperator(operator);

            if (field && field.setOperator) {
                field.setOperator(operator);
            }
        }
    },

    updateStoreFilter: function() {
        this.getGridStore().getFilters().notify('endupdate');
    },

    onFieldRender: function() {
        this.resizeField();
    },

    resizeField: function(width) {
        var field = this.getField(),
            column = this.getColumn();

        if (field && field.rendered && column && column.rendered) {
            field.flex = null;

            if (width != null) {
                field.setWidth(width);
            }
            else {
                field.setWidth(column.getWidth());
            }
        }
    },

    resetFilter: Ext.emptyFn,

    /**
     * Handles "specialkey" event of filter editor and clears it when user hits ESC.
     *
     * @param {*} field
     * @param {*} e
     * @private
     */
    onFieldSpecialKey: function(field, e) {
        if ((e.getKey() === e.ESC) && !Ext.isEmpty(field.getValue())) {
            if (field.clearValue) {
                field.clearValue();
            }
            else {
                field.setValue(null);
            }
        }
    }
});
