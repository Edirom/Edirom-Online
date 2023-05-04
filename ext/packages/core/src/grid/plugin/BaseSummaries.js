/**
 * That's a base class for the {@link Ext.grid.plugin.Summaries} plugin
 * and it's shared by both toolkits.
 * @private
 */
Ext.define('Ext.grid.plugin.BaseSummaries', {
    extend: 'Ext.plugin.Abstract',

    requires: [
        'Ext.data.summary.*'
    ],

    config: {
        /**
         * @cfg {Boolean} [enableContextMenu=true]
         * True to enable the summary grid cell context menu.
         */
        enableContextMenu: true,
        /**
         * @cfg {Boolean} [enableSummaryMenu=true]
         * True to enable the summary menu items in the header menu.
         */
        enableSummaryMenu: true,

        /**
         * @private
         */
        gridListeners: null,
        /**
         * @private
         */
        grid: null,
        /**
         * @private
         */
        contextMenu: null
    },

    textNone: 'None',
    summaryText: 'Summary',

    init: function(grid) {
        this.setGrid(grid);
    },

    destroy: function() {
        var me = this;

        me.setContextMenu(null);
        me.setGrid(null);
        me.callParent();
    },

    updateGrid: function(grid) {
        var me = this;

        me.gListeners = Ext.destroy(me.gListeners);

        if (grid) {
            me.gListeners = grid.on(Ext.apply({
                scope: me,
                destroyable: true
            }, me.getGridListeners()));
        }
    },

    updateContextMenu: function(newMenu, oldMenu) {
        Ext.destroy(oldMenu);
    },

    getDataIndex: function(column) {
        return column.dataIndex;
    },

    canShowMenu: function(params) {
        return this.getEnableContextMenu() && this.getDataIndex(params.column);
    },

    showMenu: function(params) {
        var me = this,
            grid = me.getGrid(),
            target = params.cell,
            e = params.e,
            menu, options;

        if (!me.canShowMenu(params)) {
            return;
        }

        menu = me.getSummaryMenu(params.column);

        if (!menu) {
            return;
        }

        menu = me.createMenu(menu);
        me.setContextMenu(menu);

        options = {
            menu: menu,
            params: params
        };

        if (grid.fireEvent('beforeshowsummarycontextmenu', me, options) !== false) {
            menu.showBy(target, 'tl-bl?');
            menu.focus();
            grid.fireEvent('showsummarycontextmenu', me, options);
        }
        else {
            me.setContextMenu(null);
        }

        e.stopEvent();
    },

    createMenu: function(menu) {
        return Ext.menu.Manager.get(menu);
    },

    getSummaryMenu: function(column) {
        var me = this,
            summaries = column.getListOfSummaries(),
            dataIndex = me.getDataIndex(column),
            summaryType = me.getSummaryFieldType(dataIndex),
            items = [{
                text: me.textNone,
                summary: null,
                checked: !summaryType
            }],
            i, len, fns, value;

        fns = me.fns = me.fns || {};

        if (!summaries || !summaries.length) {
            return false;
        }

        len = summaries.length;

        for (i = 0; i < len; i++) {
            value = summaries[i];

            if (!fns[value]) {
                fns[value] = Ext.Factory.dataSummary(value);
            }

            items.push({
                text: fns[value].text,
                summary: fns[value],
                checked: (summaryType === fns[value].type)
            });
        }

        return {
            defaults: {
                xtype: 'menucheckitem',
                column: column,
                hideOnClick: true,
                dataIndex: dataIndex,
                handler: me.onChangeSummary,
                group: 'summaries',
                scope: me
            },
            items: items
        };
    },

    onChangeSummary: function(menu) {
        var store = this.getGrid().getStore(),
            column = menu.column;

        // if this plugin is active then we don't need to monitor summaryType
        // in the MultiGrouping feature
        column.summaryType = null;

        if (column.onSummaryChange) {
            // this function is useful to change the summary renderer/formatter
            column.onSummaryChange(menu.summary);
        }

        if (store.isGroupStore) {
            store = store.getSource();
        }

        store.setFieldSummary(menu.dataIndex, menu.summary);
    },

    getSummaryFieldType: function(name) {
        var store = this.getGrid().getStore(),
            model = store.getModel().getSummaryModel(),
            field = model.getField(name),
            summary = field ? field.getSummary() : false;

        return summary ? summary.type : false;
    },

    onCollectMenuItems: function(grid, params) {
        params.items.push({
            text: this.summaryText,
            itemId: 'summaryMenuItem'
        });
    },

    onShowHeaderMenu: function(grid, params) {
        var menuItem = params.menu.down('#summaryMenuItem');

        if (!menuItem) {
            return;
        }

        menuItem.setVisible(!params.column.isGroupsColumn);
        menuItem.setMenu(this.getSummaryMenu(params.column));
    }

});
