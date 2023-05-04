/**
 * This class is used in the column menu of a `Ext.grid.TreeGrouped`/`Ext.grid.Grouped`.
 */
Ext.define('Ext.grid.menu.RemoveGroup', {
    extend: 'Ext.menu.Item',

    xtype: 'gridremovegroupmenuitem',

    iconCls: Ext.baseCSSPrefix + 'headermenu-remove-group',

    /**
     * @cfg {String} text
     * The menu item text for the "Remove from grouping" menu item.
     * @locale
     */
    text: 'Remove from grouping'
});
