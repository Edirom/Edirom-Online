/**
 * Mixin that contains menu items handlers
 * @private
 */
Ext.define('Ext.grid.mixin.Menus', {
    extend: 'Ext.Mixin',

    mixinConfig: {
        id: 'gridmenus',
        before: {
            beforeShowColumnMenu: 'onBeforeShowColumnMenuMixin'
        }
    },

    onGroupByThisMenu: function(menu) {
        var groupers = this.getStore().getGroupers(),
            header = this.getHeaderContainer(),
            len = groupers.length,
            i, grouper, column;

        for (i = 0; i < len; i++) {
            grouper = groupers.items[i];
            column = header.down('[dataIndex=' + grouper.getProperty() + ']');

            if (column) {
                column.show();
            }
        }

        column = menu.up('gridcolumn');

        if (column) {
            column.hide();
            groupers.replaceAll(this.createGrouperFromHeader(column));
        }
    },

    onAddGroupMenu: function(menu) {
        var groupers = this.getStore().getGroupers(),
            column = menu.up('gridcolumn');

        if (column) {
            column.hide();
            groupers.add(this.createGrouperFromHeader(column));
        }
    },

    onRemoveGroupMenu: function(menu) {
        var groupers = this.getStore().getGroupers(),
            column = menu.up('gridcolumn');

        if (column) {
            groupers.remove(this.createGrouperFromHeader(column));
        }
    },

    createGrouperFromHeader: function(column) {
        var grouper = column.getGrouper(),
            sorter = column.getSorter();

        if (!grouper) {
            grouper = new Ext.util.Grouper({
                property: column.getDataIndex(),
                direction: sorter ? sorter.getDirection() : 'ASC',
                formatter: column.getGroupFormatter()
            });
            column.setGrouper(grouper);
        }

        return grouper;
    },

    onBeforeShowColumnMenuMixin: function(column, menu) {
        var store = this.getStore(),
            groupers = store.getGroupers(),
            index = groupers.indexOf(column.getGrouper()),
            groupable = column.getGroupable(),
            groupsMenu = menu.getComponent('groups'),
            addGroupMenu = menu.getComponent('addGroup'),
            removeGroupMenu = menu.getComponent('removeGroup');

        if (groupsMenu) {
            groupsMenu.setHidden(!groupers.length);
        }

        if (addGroupMenu) {
            addGroupMenu.setDisabled(!(groupable && index < 0));
        }

        if (removeGroupMenu) {
            removeGroupMenu.setDisabled(!(groupable && index >= 0));
        }
    }

});
