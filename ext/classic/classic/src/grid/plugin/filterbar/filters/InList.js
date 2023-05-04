/**
 * You can use this filter type to add an `in` or `notin` type of filter.
 *
 * You need to provide the `options` that the user can choose from.
 */
Ext.define('Ext.grid.plugin.filterbar.filters.InList', {
    extend: 'Ext.grid.plugin.filterbar.filters.List',
    alias: 'grid.filterbar.inlist',

    type: 'inlist',

    operator: 'in',
    operators: ['in', 'notin', 'empty', 'nempty'],

    fieldDefaults: {
        multiSelect: true
    }
});
