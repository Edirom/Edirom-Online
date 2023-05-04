/**
 * This class is used in the column menu of a `Ext.grid.TreeGrouped`/`Ext.grid.Grouped`.
 */
Ext.define('Ext.grid.menu.AddGroup', {
    extend: 'Ext.menu.Item',

    xtype: 'gridaddgroupmenuitem',

    iconCls: Ext.baseCSSPrefix + 'headermenu-add-group',

    /**
     * @cfg {String} text
     * The menu item text for the "Add to grouping" menu item.
     * @locale
     */
    text: 'Add to grouping'
});
