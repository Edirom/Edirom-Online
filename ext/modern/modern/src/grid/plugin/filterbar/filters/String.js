/**
 * A filter type that supports string values
 */
Ext.define('Ext.grid.plugin.filterbar.filters.String', {
    extend: 'Ext.grid.plugin.filterbar.filters.SingleFilter',
    alias: 'grid.filterbar.string',

    type: 'string',
    operator: 'like',
    operators: ['like', '==', '!=', 'empty', 'nempty'],

    fieldDefaults: {
        xtype: 'textfield'
    }
});
