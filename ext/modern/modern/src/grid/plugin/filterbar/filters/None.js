/**
 * This filter type is used for grid columns that have no filter configured
 */
Ext.define('Ext.grid.plugin.filterbar.filters.None', {
    extend: 'Ext.grid.plugin.filterbar.filters.Base',
    alias: 'grid.filterbar.none',

    fieldDefaults: {
        xtype: 'component',
        cls: Ext.baseCSSPrefix + 'grid-filter-none'
    }
});
