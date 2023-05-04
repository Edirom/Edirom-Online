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
        'Ext.form.field.ComboBox'
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
        editable: true,
        matchFieldWidth: true
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
        var me = this;

        Ext.destroy(me.storeListeners, me.gridListeners);

        me.callParent();
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
            store = me.getGridStore();

        if (!options) {
            // no options provided so we need to extract them from the grid store
            options = Ext.Array.sort(store.collect(me.getDataIndex(), false, true));
        }

        return options;
    },

    resetFilter: function() {
        var me = this;

        if (me.resettingFilter) {
            return;
        }

        me.resettingFilter = true;
        me.monitorStore(me.getGridStore());
        me.callParent();
        me.resetFieldStore();
        me.resettingFilter = false;
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
