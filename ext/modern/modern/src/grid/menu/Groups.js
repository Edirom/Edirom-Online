/**
 * This class is used in the column menu of a `Ext.grid.TreeGrouped`/`Ext.grid.Grouped`.
 */
Ext.define('Ext.grid.menu.Groups', {
    extend: 'Ext.menu.Item',

    xtype: 'gridgroupsmenuitem',

    iconCls: Ext.baseCSSPrefix + 'headermenu-groups',

    /**
     * @cfg {String} text
     * The menu item text for the "Groups" menu item.
     * @locale
     */
    text: 'Groups',

    menu: [{
        iconCls: Ext.baseCSSPrefix + 'headermenu-expand-groups',
        text: 'Expand all',
        handler: 'up.expandAll'
    }, {
        iconCls: Ext.baseCSSPrefix + 'headermenu-collapse-groups',
        text: 'Collapse all',
        handler: 'up.collapseAll'
    }]
});
