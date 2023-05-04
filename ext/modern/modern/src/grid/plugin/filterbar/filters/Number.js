/**
 * A filter type that supports numeric values.
 */
Ext.define('Ext.grid.plugin.filterbar.filters.Number', {
    extend: 'Ext.grid.plugin.filterbar.filters.SingleFilter',
    alias: 'grid.filterbar.number',

    requires: [
        'Ext.field.Number'
    ],

    operator: '==',
    operators: ['==', '!=', '>', '>=', '<', '<='],

    fieldDefaults: {
        xtype: 'numberfield',
        hideTrigger: true
    }
});
