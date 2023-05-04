/**
 * This filter type allows you to filter date fields
 */
Ext.define('Ext.grid.plugin.filterbar.filters.Date', {
    extend: 'Ext.grid.plugin.filterbar.filters.SingleFilter',
    alias: 'grid.filterbar.date',

    requires: [
        'Ext.field.Date'
    ],

    type: 'date',
    operators: ['==', '!=', '>', '>=', '<', '<='],

    fieldDefaults: {
        xtype: 'datefield'
    }
});
