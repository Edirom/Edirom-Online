/**
 * This grid extension allows users to see the grouped data as a tree with
 * groups that can be expanded or collapsed.
 *
 * The component reacts to changes in store groupers.
 *
 * **Note** It doesn't work with a {@link Ext.data.virtual.Store}
 */
Ext.define('Ext.grid.TreeGrouped', {
    extend: 'Ext.grid.Grid',
    xtype: 'treegroupedgrid',

    mixins: [
        'Ext.grid.mixin.Menus'
    ],

    requires: [
        'Ext.grid.grouped.NavigationModel',
        'Ext.grid.grouped.selection.Model',
        'Ext.grid.AdvancedGroupStore',
        'Ext.grid.column.Groups',
        'Ext.grid.row.Group',
        'Ext.grid.menu.Groups',
        'Ext.grid.menu.AddGroup',
        'Ext.grid.menu.RemoveGroup'
    ],

    isTreeGroupedGrid: true,

    /**
     * @event grouptap
     * Fires whenever a group's tap event fires
     * @param {Ext.grid.TreeGrouped} this
     * @param {Object} params An object with multiple keys to identify the group
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event groupsingletap
     * Fires whenever a group's singletap event fires
     * @param {Ext.grid.TreeGrouped} this
     * @param {Object} params An object with multiple keys to identify the group
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event groupdoubletap
     * Fires whenever a group's doubletap event fires
     * @param {Ext.grid.TreeGrouped} this
     * @param {Object} params An object with multiple keys to identify the group
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event grouptaphold
     * Fires whenever a group's taphold event fires
     * @param {Ext.grid.TreeGrouped} this
     * @param {Object} params An object with multiple keys to identify the group
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event groupcontextmenu
     * Fires whenever a group's contextmenu event fires
     * @param {Ext.grid.TreeGrouped} this
     * @param {Object} params An object with multiple keys to identify the group
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event groupsummarytap
     * Fires whenever a group's summary tap event fires
     * @param {Ext.grid.TreeGrouped} this
     * @param {Object} params An object with multiple keys to identify the group
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event groupsummarysingletap
     * Fires whenever a group's summary singletap event fires
     * @param {Ext.grid.TreeGrouped} this
     * @param {Object} params An object with multiple keys to identify the group
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event groupsummarydoubletap
     * Fires whenever a group's summary doubletap event fires
     * @param {Ext.grid.TreeGrouped} this
     * @param {Object} params An object with multiple keys to identify the group
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event groupsummarytaphold
     * Fires whenever a group's summary taphold event fires
     * @param {Ext.grid.TreeGrouped} this
     * @param {Object} params An object with multiple keys to identify the group
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event groupsummarycontextmenu
     * Fires whenever a group's summary contextmenu event fires
     * @param {Ext.grid.TreeGrouped} this
     * @param {Object} params An object with multiple keys to identify the group
     * @param {Ext.event.Event} e The event object
     */

    eventedConfig: {
        /**
         * @cfg {String} [summaryPosition='hidden']
         * Set the position of the summary row for the entire grid:
         *
         *  * `'hidden'`: Hide the summary row
         *  * `'top'`: Show the summary row as the first row in the grid
         *  * `'bottom'`: Show the summary row as the last row in the grid
         *  * `'docked'`: Show the summary row docked at the bottom of the grid (when
         *  the {@link Ext.grid.plugin.Summaries} plugin is used)
         */
        summaryPosition: 'bottom',
        /**
         * @cfg {String} [groupSummaryPosition='hidden']
         * Set the position of the summary row for each group:
         *
         *  * `'hidden'`: Hide the group summary row
         *  * `'top'`: If the group is expanded or collapsed the summary is shown on the
         *  group header
         *  * `'bottom'`: When the group is expanded the summary row is shown as a
         *  group footer, after all records/groups are shown
         */
        groupSummaryPosition: 'bottom'
    },

    config: {
        groupsColumn: {
            xtype: 'groupscolumn',
            minWidth: 150
        },
        /**
         * @cfg {Boolean} [startCollapsed=false]
         * True to start all groups collapsed when the grid is rendered for the first time.
         */
        startCollapsed: true,

        /**
         * @cfg {String/Array/Ext.Template} groupHeaderTpl
         * A string Template snippet, an array of strings (optionally followed by an object
         * containing Template methods) to be used to construct a Template, or a Template instance.
         *
         * - Example 1 (Template snippet):
         *
         *       groupHeaderTpl: 'Group: {name} ({group.items.length})'
         *
         * - Example 2 (Array):
         *
         *       groupHeaderTpl: [
         *           'Group: ',
         *           '<div>{name:this.formatName}</div>',
         *           {
         *               formatName: function(name) {
         *                   return Ext.String.trim(name);
         *               }
         *           }
         *       ]
         *
         * - Example 3 (Template Instance):
         *
         *       groupHeaderTpl: Ext.create('Ext.XTemplate',
         *           'Group: ',
         *           '<div>{name:this.formatName}</div>',
         *           {
         *               formatName: function(name) {
         *                   return Ext.String.trim(name);
         *               }
         *           }
         *       )
         *
         * @cfg {String}           groupHeaderTpl.groupField The field name being grouped by.
         * @cfg {String}           groupHeaderTpl.columnName The column header associated with
         * the field being grouped by *if there is a column for the field*, falls back
         * to the groupField name.
         * @cfg {String}           groupHeaderTpl.name The name of the group.
         * @cfg {Ext.util.Group}   groupHeaderTpl.group The group object.
         */
        groupHeaderTpl: '{name}',

        /**
         * @cfg {String/Array/Ext.Template} groupSummaryTpl
         * A string Template snippet, an array of strings (optionally followed by an object
         * containing Template methods) to be used to construct a Template, or a Template instance.
         *
         * - Example 1 (Template snippet):
         *
         *       groupSummaryTpl: 'Group: {name}'
         *
         * - Example 2 (Array):
         *
         *       groupSummaryTpl: [
         *           'Group: ',
         *           '<div>{name:this.formatName}</div>',
         *           {
         *               formatName: function(name) {
         *                   return Ext.String.trim(name);
         *               }
         *           }
         *       ]
         *
         * - Example 3 (Template Instance):
         *
         *       groupSummaryTpl: Ext.create('Ext.XTemplate',
         *           'Group: ',
         *           '<div>{name:this.formatName}</div>',
         *           {
         *               formatName: function(name) {
         *                   return Ext.String.trim(name);
         *               }
         *           }
         *       )
         *
         * @cfg {String}           groupSummaryTpl.groupField The field name being grouped by.
         * @cfg {String}           groupSummaryTpl.columnName The column header associated with
         * the field being grouped by *if there is a column for the field*, falls back
         * to the groupField name.
         * @cfg {String}           groupSummaryTpl.name The name of the group.
         * @cfg {Ext.util.Group}   groupSummaryTpl.group The group object.
         */
        groupSummaryTpl: 'Summary ({name})',

        /**
         * @cfg {String/Array/Ext.Template} summaryTpl
         * A string Template snippet, an array of strings (optionally followed by an object
         * containing Template methods) to be used to construct a Template, or a Template instance.
         *
         * - Example (Template snippet):
         *
         *       groupSummaryTpl: 'Summary: {store.data.length}'
         *
         * @cfg {Ext.data.Store}   summaryTpl.store The store object.
         */
        summaryTpl: 'Summary ({store.data.length})'
    },

    itemConfig: {
        xtype: 'gridgrouprow'
    },

    columnMenu: {
        items: {
            showInGroups: false,
            groups: {
                xtype: 'gridgroupsmenuitem',
                separator: true,
                weight: -70
            },
            groupByThis: {
                separator: false,
                weight: -60,
                handler: 'up.onGroupByThisMenu'
            },
            addGroup: {
                xtype: 'gridaddgroupmenuitem',
                weight: -50,
                handler: 'up.onAddGroupMenu'
            },
            removeGroup: {
                xtype: 'gridremovegroupmenuitem',
                weight: -40,
                handler: 'up.onRemoveGroupMenu'
            }
        }
    },

    selectionModel: 'groupedgrid',
    navigationModel: 'groupedgrid',
    cellSelector: '.' + Ext.baseCSSPrefix + 'gridcell',
    variableHeights: true,
    // disable this because we have our own drag/drop zones
    enableColumnMove: false,

    initialize: function() {
        var me = this,
            store = me.getStore(),
            groupers = store && store.getGroupers(false);

        me.groupingColumn = me.registerColumn(Ext.merge({
            groupHeaderTpl: me.getGroupHeaderTpl(),
            groupSummaryTpl: me.getGroupSummaryTpl(),
            summaryTpl: me.getSummaryTpl(),
            hidden: !(groupers && groupers.length)
        }, me.getGroupsColumn()));

        me.callParent();
    },

    /**
     * Expand all groups
     */
    expandAll: function() {
        var store = this.store;

        if (store && store.isMultigroupStore) {
            store.setStartCollapsed(false);
            store.refreshData(true);
        }
    },

    /**
     * Collapse all groups
     */
    collapseAll: function() {
        var store = this.store;

        if (store && store.isMultigroupStore) {
            store.setStartCollapsed(true);
            store.refreshData(true);
        }
    },

    updateSummaryPosition: function(pos) {
        var store = this.store;

        if (store && store.isMultigroupStore && !this.isConfiguring) {
            store.setSummaryPosition(pos);
        }
    },

    updateGroupSummaryPosition: function(pos) {
        var store = this.store;

        if (store && store.isMultigroupStore && !this.isConfiguring) {
            store.setGroupSummaryPosition(pos);
        }
    },

    isRTL: function() {
        if (Ext.isFunction(this.isLocalRtl)) {
            return this.isLocalRtl();
        }

        return false;
    },

    onStoreRefresh: function(store) {
        var me = this,
            col = me.groupingColumn,
            realStore = me.getStore(),
            groupers = realStore && realStore.getGroupers(false);

        if (col) {
            col.setHidden(!(groupers && groupers.length > 0));
        }

        if (store.isMultigroupStore && me.dataRange) {
            me.dataRange.records = store.getRange();
        }

        me.callParent(arguments);
    },

    onChildTap: function(context) {
        this.handleRowEvent('tap', context.event);
        this.callParent([context]);
    },

    onChildTapHold: function(context) {
        this.handleRowEvent('taphold', context.event);
        this.callParent([context]);
    },

    onChildSingleTap: function(context) {
        this.handleRowEvent('singletap', context.event);
        this.callParent([context]);
    },

    onChildDoubleTap: function(context) {
        this.handleRowEvent('doubletap', context.event);
        this.callParent([context]);
    },

    onChildContextMenu: function(context) {
        this.handleRowEvent('contextmenu', context.event);
        this.callParent([context]);
    },

    handleRowEvent: function(type, e) {
        var cell = Ext.fly(e.getTarget(this.cellSelector)),
            navModel = this.getNavigationModel(),
            location;

        // the cell type might have been changed
        if (cell && cell.component && cell.component.handleEvent) {
            cell.component.handleEvent(type, e);

            if (navModel) {
                location = navModel.getLocation();

                if (location) {
                    location.refresh();
                }
            }
        }
    },

    isGrouping: function() {
        return false;
    },

    privates: {
        applyStore: function(store, oldStore) {
            var me = this,
                ret = me.callParent([ store, oldStore ]);

            if (ret) {
                me.store = ret = new Ext.grid.AdvancedGroupStore({
                    fireReplaceEvent: false,
                    source: ret,
                    groupSummaryPosition: me.getGroupSummaryPosition(),
                    summaryPosition: me.getSummaryPosition(),
                    startCollapsed: me.getStartCollapsed(),
                    storeEventListeners: {
                        sort: 'onStoreSort'
                    },
                    onStoreSort: function(source, sorters) {
                        this.fireEvent('sort', source, sorters);
                    }
                });

                // <debug>
                if (ret.isVirtualStore) {
                    Ext.raise('Virtual stores are not supported');
                }
                // </debug>
            }

            return ret;
        }
    }

});
