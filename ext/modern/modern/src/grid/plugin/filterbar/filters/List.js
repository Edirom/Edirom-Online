/**
 * This filter type will provide a combobox with a store. The options available in the store
 * can be configured.
 *
 * If no options are provided then they are extracted from the grid store
 */
Ext.define('Ext.grid.plugin.filterbar.filters.List', {
    extend: 'Ext.grid.plugin.filterbar.filters.SingleFilter',
    alias: 'grid.filterbar.list',

    requires: [
        'Ext.field.ComboBox'
    ],

    config: {
        /**
         * @cfg {String[]/Ext.data.Store} options
         *
         * An array of values or a store configuration
         */
        options: null
    },

    type: 'list',

    operator: '==',
    operators: ['==', '!=', 'empty', 'nempty'],

    fieldDefaults: {
        xtype: 'combobox',
        queryMode: 'local',
        forceSelection: true,
        clearable: true,
        editable: true,
        matchFieldWidth: false,
        valueField: 'value',
        displayField: 'text'
    },

    constructor: function(config) {
        var me = this,
            options;

        me.callParent([config]);

        options = me.getOptions();

        if (!options) {
            me.monitorStore(me.getGridStore());
        }
    },

    destroy: function() {
        Ext.destroy(this.storeListeners);

        this.callParent();
    },

    monitorStore: function(store) {
        var me = this;

        Ext.destroy(me.storeListeners);
        me.storeListeners = store.on({
            add: 'resetFieldStore',
            remove: 'resetFieldStore',
            load: 'resetFieldStore',
            scope: me,
            destroyable: true
        });
    },

    getFieldConfig: function() {
        var config = this.callParent();

        config.store = this.createOptionsStore();

        return config;
    },

    createOptionsStore: function() {
        var me = this,
            options = me.getOptions(),
            store = me.getGridStore(),
            list, len, i;

        if (!options) {
            // no options provided so we need to extract them from the grid store
            list = Ext.Array.sort(store.collect(me.getDataIndex(), false, true));
            len = list.length;
            options = [];

            for (i = 0; i < len; i++) {
                options.push({
                    value: list[i],
                    text: list[i]
                });
            }

            options = {
                type: 'store',
                fields: [
                    { name: 'value', type: 'auto' },
                    { name: 'text', type: 'auto' }
                ],
                data: options
            };
        }

        return options;
    },

    resetFieldStore: function() {
        var me = this,
            field = me.getField();

        if (field) {
            field.setStore(me.createOptionsStore());

            if (me.active) {
                field.suspendEvents();
                field.setValue(me.filter.getValue());
                field.resumeEvents(true);
            }
        }
    }

});
