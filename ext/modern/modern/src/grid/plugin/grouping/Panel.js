/**
 * The grouping panel
 */
Ext.define('Ext.grid.plugin.grouping.Panel', {
    extend: 'Ext.Panel',
    alias: 'widget.groupingpanel',

    requires: [
        'Ext.grid.plugin.grouping.Column',
        'Ext.grid.plugin.grouping.DragZone',
        'Ext.grid.plugin.grouping.DropZone'
    ],

    isGroupingPanel: true,

    config: {
        grid: null,
        store: null,
        columnConfig: {
            xtype: 'groupingpanelcolumn'
        }
    },

    docked: 'top',
    weight: 90, // the column header container has a weight of 100 so we want to dock it after that.
    weighted: true,
    height: 36,
    layout: 'hbox',
    border: false,

    header: false,
    padding: 0,

    touchAction: {
        panX: false,
        pinchZoom: false,
        doubleTapZoom: false
    },

    cls: Ext.baseCSSPrefix + 'grid-group-panel-body',
    hintTextCls: Ext.baseCSSPrefix + 'grid-group-panel-hint',

    groupingPanelText: 'Drag a column header here to group by that column',
    showGroupingPanelText: 'Show Group By Panel',
    hideGroupingPanelText: 'Hide Group By Panel',
    clearGroupText: 'Clear Group',
    sortAscText: 'Sort Ascending',
    sortDescText: 'Sort Descending',
    moveLeftText: 'Move left',
    moveRightText: 'Move right',
    moveBeginText: 'Move to beginning',
    moveEndText: 'Move to end',
    removeText: 'Remove',

    ascSortIconCls: Ext.baseCSSPrefix + 'grid-group-column-sort-icon-asc',
    descSortIconCls: Ext.baseCSSPrefix + 'grid-group-column-sort-icon-desc',
    groupingPanelIconCls: Ext.baseCSSPrefix + 'grid-group-panel-icon',
    clearGroupIconCls: Ext.baseCSSPrefix + 'grid-group-panel-clear-icon',

    initialize: function() {
        var me = this,
            grid = me.getGrid();

        me.dragZone = new Ext.grid.plugin.grouping.DragZone({
            element: me.el,
            view: me,
            grid: grid,
            constrain: Ext.getBody()
        });
        me.dropZone = new Ext.grid.plugin.grouping.DropZone({
            element: me.el,
            view: me,
            grid: grid
        });

        me.infoEl = me.bodyElement.createChild({
            cls: me.hintTextCls + ' ' + Ext.baseCSSPrefix + 'unselectable',
            html: me.groupingPanelText
        });
        me.setInfoElVisibility();

        me.manageBorders = false;
        me.callParent();
    },

    destroy: function() {
        var me = this;

        Ext.destroy(me.dragZone, me.dropZone);
        me.callParent();
    },

    /**
     * The container has an info text displayed inside. This function makes it visible or hidden.
     *
     * @private
     */
    setInfoElVisibility: function() {
        var el = this.infoEl;

        if (!el) {
            return;
        }

        if (!this.getItems().length) {
            el.show();
        }
        else {
            el.hide();
        }
    },

    dragDropColumn: function(from, column, index) {
        var me = this,
            sorter, grouper;

        if (column.isGroupingPanelColumn) {
            me.insert(index, column);
        }
        else if (column.isGridColumn) {
            sorter = column.getSorter();
            grouper = column.getGrouper();

            if (!grouper) {
                grouper = new Ext.util.Grouper({
                    property: column.getDataIndex(),
                    direction: sorter ? sorter.getDirection() : 'ASC',
                    formatter: column.getGroupFormatter()
                });
                column.setGrouper(grouper);
            }

            me.addColumn({
                text: column.getText(),
                idColumn: column.getId(),
                grouper: grouper,
                column: column
            }, index);

            column.hide();
        }

        me.notifyGroupChange();
    },

    notifyGroupChange: function() {
        var me = this,
            items = me.getInnerItems(),
            len = items && items.length,
            groupers = [],
            store = this.getStore(),
            i, grouper, column;

        for (i = 0; i < len; i++) {
            column = items[i];
            grouper = column.getGrouper();

            if (grouper) {
                groupers.push(grouper);
            }
        }

        me.suspendChanges = true;

        if (!groupers.length) {
            store.clearGrouping();
        }
        else {
            store.setGroupers(groupers);
        }

        me.setInfoElVisibility();
    },

    updateGrid: function(grid) {
        var me = this,
            store = null;

        Ext.destroy(me.gridListeners);

        if (grid) {
            // catch this event to refresh the grouping columns in case one of them changed its name
            me.gridListeners = grid.on({
                storechange: me.onGridStoreChange,
                scope: me,
                destroyable: true
            });

            store = grid.getStore();
        }

        me.setStore(store);
    },

    updateStore: function(store) {
        var me = this;

        Ext.destroy(me.storeListeners);

        if (store) {
            me.storeListeners = store.on({
                groupschange: me.initGroupingColumns,
                groupchange: me.initGroupingColumns,
                scope: me,
                destroyable: true
            });
            me.initGroupingColumns();
        }
    },

    onGridStoreChange: function(grid, store) {
        this.setStore(store);
    },

    addColumn: function(config, pos, notify) {
        var me = this,
            colConfig = Ext.apply({}, me.getColumnConfig()),
            newCol;

        newCol = Ext.create(Ext.apply(colConfig, config));

        if (pos !== -1) {
            me.insert(pos, newCol);
        }
        else {
            me.add(newCol);
        }

        if (notify === true) {
            newCol.focus();
            me.notifyGroupChange();
        }
    },

    /**
     * Check if the grid store has groupers and add them to the grouping panel
     */
    initGroupingColumns: function() {
        var me = this,
            grid = me.getGrid(),
            store = me.getStore(),
            groupers = store.getGroupers(false),
            length = groupers && groupers.length,
            columns = grid.getColumns(),
            len = columns.length,
            columnsMap = Ext.Array.toValueMap(columns, '_dataIndex'),
            i, j, column, grouper, found;

        if (me.suspendChanges) {
            me.suspendChanges = false;

            return;
        }

        // remove all previously created columns
        me.removeAll(true);

        Ext.suspendLayouts();

        for (i = 0; i < length; i++) {
            grouper = groupers.items[i];
            found = false;

            for (j = 0; j < len; j++) {
                column = columns[j];

                if (column.getGrouper() === grouper) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                column = columnsMap[grouper.getProperty()];
                column.setGrouper(grouper);
            }

            if (column) {
                me.addColumn({
                    text: column.getText(),
                    idColumn: column.getId(),
                    grouper: grouper,
                    column: column
                }, -1);
                column.hide();
            }
        }

        me.setInfoElVisibility();
        Ext.resumeLayouts(true);
    }
});
