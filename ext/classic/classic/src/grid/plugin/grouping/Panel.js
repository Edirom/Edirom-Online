/**
 * The grouping panel used by {@link Ext.grid.plugin.GroupingPanel}
 */
Ext.define('Ext.grid.plugin.grouping.Panel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.groupingpanel',

    requires: [
        'Ext.grid.plugin.grouping.Column',
        'Ext.grid.plugin.grouping.DragZone',
        'Ext.grid.plugin.grouping.DropZone',
        'Ext.layout.container.Column'
    ],

    mixins: [
        'Ext.mixin.FocusableContainer'
    ],

    isGroupingPanel: true,

    position: 'top',
    border: false,
    enableFocusableContainer: true,

    // the column header container has a weight of 100 so we want to dock it before that.
    weight: 50,
    height: 'auto',
    layout: 'column',

    childEls: ['innerCt', 'targetEl'],

    cls: Ext.baseCSSPrefix + 'grid-group-panel-body',
    hintTextCls: Ext.baseCSSPrefix + 'grid-group-panel-hint',

    config: {
        grid: null,
        store: null,
        columnConfig: {
            xtype: 'groupingpanelcolumn'
        }
    },

    keyEventRe: /^key/,

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

    initComponent: function() {
        var me = this;

        Ext.apply(me, {
            header: {
                dock: 'left',
                title: {
                    hidden: true
                },
                padding: 0,
                tools: [{
                    type: 'gear',
                    handler: me.showPanelMenu,
                    scope: me
                }]
            }
        });

        me.callParent(arguments);
    },

    doDestroy: function() {
        var me = this;

        // eslint-disable-next-line max-len
        Ext.destroyMembers(me, 'infoEl', 'dragZone', 'dropZone', 'contextMenu', 'panelListeners', 'columnListeners', 'storeListeners', 'columnMenu', 'panelMenu');

        me.setGrid(null);

        me.callParent();
    },

    afterRender: function() {
        var me = this,
            el = me.getEl();

        me.callParent();

        me.dragZone = new Ext.grid.plugin.grouping.DragZone(me);
        me.dropZone = new Ext.grid.plugin.grouping.DropZone(me);

        me.panelListeners = me.mon(el, {
            contextmenu: me.showPanelMenu,
            scope: me,
            destroyable: true
        });

        me.columnListeners = me.mon(el, {
            delegate: '.' + Ext.baseCSSPrefix + 'grid-group-column',
            click: me.handleColumnEvent,
            keypress: me.handleColumnEvent,
            scope: me,
            destroyable: true
        });

        me.infoEl = me.innerCt.createChild({
            cls: me.hintTextCls + ' ' + Ext.baseCSSPrefix + 'unselectable',
            html: me.groupingPanelText
        });
        me.setInfoElVisibility();

        me.initGroupingColumns();
    },

    show: function() {
        var me = this,
            dragZone = me.dragZone,
            dropZone = me.dropZone,
            grid = me.getGrid();

        if (dragZone) {
            dragZone.enable();
        }

        if (dropZone) {
            dropZone.enable();
        }

        me.callParent();
        grid.fireEvent('showgroupingpanel', me);
    },

    hide: function() {
        var me = this,
            dragZone = me.dragZone,
            dropZone = me.dropZone,
            grid = me.getGrid();

        if (dragZone) {
            dragZone.disable();
        }

        if (dropZone) {
            dropZone.disable();
        }

        me.callParent();
        grid.fireEvent('hidegroupingpanel', me);
    },

    updateGrid: function(grid) {
        var me = this,
            store = null;

        Ext.destroy(me.gridListeners);

        if (grid) {
            // catch this event to refresh the grouping columns in case one of them changed its name
            me.gridListeners = grid.on({
                reconfigure: me.onGridReconfigure,
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
                groupchange: me.initGroupingColumns,
                groupschange: me.initGroupingColumns,
                scope: me,
                destroyable: true
            });
            me.initGroupingColumns();
        }
    },

    onAdd: function() {
        this.setInfoElVisibility();
    },

    onRemove: function() {
        this.setInfoElVisibility();
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

        if (!this.items.length) {
            el.show();
        }
        else {
            el.hide();
        }
    },

    handleColumnEvent: function(e) {
        var isKeyEvent = this.keyEventRe.test(e.type),
            fly, cmp;

        if ((isKeyEvent && e.getKey() === e.SPACE) || (e.button === 0)) {
            fly = Ext.fly(e.target);

            if (fly && (cmp = fly.component) && cmp.isGroupingPanelColumn) {
                this.showColumnMenu(e, cmp);
            }
        }
    },

    showColumnMenu: function(e, target) {
        var me = this,
            grid = me.getGrid(),
            menu, options;

        Ext.destroy(me.columnMenu);

        menu = me.columnMenu = Ext.menu.Manager.get(me.getColumnMenu(target));

        options = {
            menu: menu,
            column: target
        };

        if (grid.fireEvent('beforeshowgroupingcolumnmenu', me, options) !== false) {
            menu.showBy(target);
            menu.focus();
            grid.fireEvent('showgroupingcolumnmenu', me, options);
        }
        else {
            Ext.destroy(menu);
        }

        e.stopEvent();
    },

    getColumnMenu: function(target) {
        var me = this,
            items = [],
            owner = target.ownerCt,
            sibling;

        items.push({
            text: me.sortAscText,
            direction: 'ASC',
            iconCls: me.ascSortIconCls,
            column: target,
            handler: me.sortColumn
        }, {
            text: me.sortDescText,
            direction: 'DESC',
            iconCls: me.descSortIconCls,
            column: target,
            handler: me.sortColumn
        }, {
            xtype: 'menuseparator'
        }, {
            text: me.removeText,
            handler: Ext.bind(me.removeColumn, me, [target])
        }, {
            text: me.moveLeftText,
            disabled: !(sibling = target.previousSibling()),
            handler: Ext.bind(me.moveColumn, me, [target, sibling, 'before'])
        }, {
            text: me.moveRightText,
            disabled: !(sibling = target.nextSibling()),
            handler: Ext.bind(me.moveColumn, me, [target, sibling, 'after'])
        }, {
            text: me.moveBeginText,
            disabled: !(sibling = target.previousSibling()),
            handler: Ext.bind(me.moveColumn, me, [target, owner.items.first(), 'before'])
        }, {
            text: me.moveEndText,
            disabled: !(sibling = target.nextSibling()),
            handler: Ext.bind(me.moveColumn, me, [target, owner.items.last(), 'after'])
        });

        return {
            defaults: {
                scope: me
            },
            items: items
        };
    },

    showPanelMenu: function(e, target) {
        var me = this,
            grid = me.getGrid(),
            isKeyEvent = me.keyEventRe.test(e.type),
            menu, options;

        Ext.destroy(me.panelMenu);
        target.focus();

        menu = me.panelMenu = Ext.menu.Manager.get(me.getPanelMenu());

        options = {
            menu: menu
        };

        if (grid.fireEvent('beforeshowgroupingpanelmenu', me, options) !== false) {
            if (isKeyEvent) {
                menu.showBy(target);
            }
            else {
                menu.show();
                menu.setPosition(e.getX(), e.getY());
            }

            menu.focus();
            grid.fireEvent('showgroupingpanelmenu', me, options);
        }
        else {
            Ext.destroy(menu);
        }

        e.stopEvent();
    },

    getPanelMenu: function() {
        var me = this,
            items = [],
            groupers = me.getStore().getGroupers();

        items.push({
            iconCls: me.groupingPanelIconCls,
            text: me.hideGroupingPanelText,
            handler: me.hide
        }, {
            iconCls: me.clearGroupIconCls,
            text: me.clearGroupText,
            disabled: !groupers || !groupers.length,
            handler: me.clearGrouping
        });

        return {
            defaults: {
                scope: me
            },
            items: items
        };
    },

    clearGrouping: function() {
        var me = this,
            items = me.items.items,
            length = items.length,
            i, item, column;

        Ext.suspendLayouts();

        // make column headers visible in the grid
        for (i = 0; i < length; i++) {
            item = items[i];
            column = item.getColumn();

            if (column) {
                column.show();
            }
        }

        me.getStore().group(null);
        me.getHeader().focus();
        Ext.resumeLayouts(true);
    },

    sortColumn: function(target) {
        var grouper = target.column.getGrouper();

        if (grouper) {
            grouper.setDirection(target.direction);
        }
    },

    /**
     * Check if the specified grid column is already added to the panel
     *
     * @param {Ext.grid.column.Column} col
     */
    isNewColumn: function(col) {
        return this.items.findIndex('idColumn', col.id) < 0;
    },

    addColumn: function(config, pos, notify) {
        var me = this,
            colConfig = Ext.apply({}, me.getColumnConfig()),
            newCol;

        Ext.suspendLayouts();

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

        Ext.resumeLayouts(true);
    },

    getColumnPosition: function(column, position) {
        var me = this,
            pos;

        if (column.isGroupingPanelColumn) {
            // we have to insert before or after this column
            pos = me.items.indexOf(column);
            pos = (position === 'before') ? pos : pos + 1;
        }
        else {
            pos = -1;
        }

        return pos;
    },

    moveColumn: function(from, to, position) {
        var me = this;

        Ext.suspendLayouts();

        if (from !== to) {
            if (position === 'before') {
                me.moveBefore(from, to);
            }
            else {
                me.moveAfter(from, to);
            }

            me.notifyGroupChange();
        }

        Ext.resumeLayouts(true);
    },

    removeColumn: function(column) {
        var me = this,
            col = column.getColumn(),
            sibling = column.nextSibling() || column.previousSibling() || me.getHeader();

        Ext.suspendLayouts();

        if (col) {
            col.show();
        }

        if (sibling) {
            sibling.focus();
        }

        me.remove(column, true);
        me.notifyGroupChange();
        Ext.resumeLayouts(true);
    },

    showGridColumn: function(col) {
        col.show();
    },

    hideGridColumn: function(col) {
        col.hide();
    },

    notifyGroupChange: function() {
        var me = this,
            store = me.getStore(),
            items = me.items.items,
            length = items.length,
            groupers = [],
            i, column, grouper;

        for (i = 0; i < length; i++) {
            column = items[i];
            grouper = column.getGrouper();

            if (grouper) {
                groupers.push(grouper);
            }
        }

        if (!groupers.length) {
            store.group(null);
        }
        else {
            store.setGroupers(groupers);
        }
    },

    onGridReconfigure: function(grid, store) {
        if (store) {
            this.setStore(store);
        }
    },

    /**
     * Check if the grid store has groupers and add them to the grouping panel
     */
    initGroupingColumns: function() {
        var me = this,
            grid = me.getGrid(),
            store = me.getStore(),
            groupers = store.getGroupers(),
            length = groupers.length,
            columns = Ext.Array.toValueMap(grid.headerCt.getGridColumns(), 'dataIndex'),
            i, column, grouper;

        Ext.suspendLayouts();

        // remove all previously created columns
        me.removeAll(true);

        for (i = 0; i < length; i++) {
            grouper = groupers.items[i];
            column = columns[grouper.getProperty()];

            if (column) {
                me.addColumn({
                    header: column.text,
                    idColumn: column.id,
                    grouper: grouper,
                    column: column
                }, -1);
            }
        }

        Ext.resumeLayouts(true);
    }
});
