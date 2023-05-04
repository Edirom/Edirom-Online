/**
 * Multi level grouping feature for the Grid panel.
 *
 * The following functions are added to the grid panel instance:
 *
 * - setSummaryPosition
 * - setGroupSummaryPosition
 * - expandAll
 * - collapseAll
 */
Ext.define('Ext.grid.feature.AdvancedGrouping', {
    extend: 'Ext.grid.feature.Feature',
    alias: 'feature.advancedgrouping',

    requires: [
        'Ext.grid.feature.AdvancedGroupStore',
        'Ext.grid.column.Groups'
    ],

    eventPrefix: 'group',

    eventCls: Ext.baseCSSPrefix + 'grid-advanced-group-row',
    eventSelector: '.' + Ext.baseCSSPrefix + 'grid-advanced-group-row',
    groupSelector: '.' + Ext.baseCSSPrefix + 'grid-advanced-group-hd',
    groupSummaryCls: Ext.baseCSSPrefix + 'grid-advanced-group-summary',
    groupSummarySelector: '.' + Ext.baseCSSPrefix + 'grid-advanced-group-summary',
    groupHeaderExpandedCls: Ext.baseCSSPrefix + 'grid-advanced-group-header-expanded',
    groupHeaderCollapsedCls: Ext.baseCSSPrefix + 'grid-advanced-group-header-collapsed',
    groupTitleSelector: '.' + Ext.baseCSSPrefix + 'grid-advanced-group-title',

    /**
     * @cfg {String} [expandAllText="Expand all"]
     * Text displayed in the grid header menu.
     * @locale
     */
    expandAllText: 'Expand all',

    /**
     * @cfg {String} [collapseAllText="Collapse all"]
     * Text displayed in the grid header menu.
     * @locale
     */
    collapseAllText: 'Collapse all',

    /**
     * @cfg {String} [groupsText="Groups"]
     * Text displayed in the grid header menu.
     * @locale
     */
    groupsText: 'Groups',

    /**
     * @cfg {String} [groupByText="Group by this field"]
     * Text displayed in the grid header menu.
     * @locale
     */
    groupByText: 'Group by this field',

    /**
     * @cfg {String} [addToGroupingText="Add to grouping"]
     * Text displayed in the grid header menu.
     * @locale
     */
    addToGroupingText: 'Add to grouping',

    /**
     * @cfg {String} [removeFromGroupingText="Remove from grouping"]
     * Text displayed in the grid header menu.
     * @locale
     */
    removeFromGroupingText: 'Remove from grouping',

    /**
     * @cfg {Boolean} [startGroupedHeadersHidden=false]
     * True to hide the headers that are currently grouped when the grid
     * is rendered for the first time.
     */
    startGroupedHeadersHidden: true,

    /**
     * @cfg {Boolean} [startCollapsed=false]
     * True to start all groups collapsed when the grid is rendered for the first time.
     */
    startCollapsed: true,

    /**
     * @cfg {Boolean} [enableGroupingMenu=true]
     * True to enable the grouping control in the header menu.
     */
    enableGroupingMenu: true,

    /**
     * @cfg {String} [groupSummaryPosition='hidden']
     * Set the position of the summary row for each group:
     *
     *  * `'hidden'`: Hide the group summary row
     *  * `'top'`: If the group is expanded or collapsed the summary is
     *  shown on the group header
     *  * `'bottom'`: When the group is expanded the summary row is shown
     *  as a group footer, after all records/groups are shown
     */
    groupSummaryPosition: 'hidden',
    /**
     * @cfg {String} [summaryPosition='hidden']
     * Set the position of the summary row for the entire grid:
     *
     *  * `'hidden'`: Hide the summary row
     *  * `'top'`: Show the summary row as the first row in the grid
     *  * `'bottom'`: Show the summary row as the last row in the grid
     */
    summaryPosition: 'hidden',

    /**
     * Width of the grouping column
     * @cfg {Number} groupsColumnWidth
     */
    groupsColumnWidth: 200,

    /**
     * @cfg {String/Array/Ext.Template} groupHeaderTpl
     * A string Template snippet, an array of strings (optionally followed by
     * an object containing Template methods) to be used to construct a
     * Template, or a Template instance.
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
     * @cfg {String} groupHeaderTpl.groupField The field name being grouped by.
     * @cfg {String} groupHeaderTpl.columnName The column header associated with
     * the field being grouped by *if there is a column for the field*,
     * falls back to the groupField name.
     * @cfg {String} groupHeaderTpl.name The name of the group.
     * @cfg {Ext.util.Group} groupHeaderTpl.group The group object.
     */
    groupHeaderTpl: '{name}',

    /**
     * @cfg {String/Array/Ext.Template} groupSummaryTpl
     * A string Template snippet, an array of strings (optionally followed by
     * an object containing Template methods) to be used to construct
     * a Template, or a Template instance.
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
     * @cfg {String} groupSummaryTpl.groupField The field name being grouped by.
     * @cfg {String} groupSummaryTpl.columnName The column header associated
     * with the field being grouped by *if there is a column for the field*,
     * falls back to the groupField name.
     * @cfg {String} groupSummaryTpl.name The name of the group.
     * @cfg {Ext.util.Group} groupSummaryTpl.group The group object.
     */
    groupSummaryTpl: 'Summary ({name})',

    /**
     * @cfg {String/Array/Ext.Template} summaryTpl
     * A string Template snippet, an array of strings (optionally followed by
     * an object containing Template methods) to be used to construct
     * a Template, or a Template instance.
     *
     * - Example (Template snippet):
     *
     *       groupSummaryTpl: 'Summary: {store.data.length}'
     *
     * @cfg {Ext.data.Store} summaryTpl.store The store object.
     */
    summaryTpl: 'Summary ({store.data.length})',

    outerTpl: [
        '{%',
        // Set up the grouping unless we are disabled
        'var me = this.groupingFeature;',
        'if (!(me.disabled)) {',
        'me.setup(values);',
        '}',

        // Process the item
        'this.nextTpl.applyOut(values, out, parent);',
        '%}',
        {
            priority: 200
        }],

    // we need this template to fix the recordIndex; it should have a
    // priority bigger than the outerRowTpl from Ext.view.Table
    rowTpl: [
        '{%',
        'var me = this.groupingFeature;',
        'if (!(me.disabled)) {',
        'me.setupRowData(values);',
        '}',
        // 'values.view.renderColumnSizer(values, out);',
        'this.nextTpl.applyOut(values, out, parent);',
        'if (!(me.disabled)) {',
        'me.resetRenderers();',
        '}',
        '%}',
        {
            priority: 10000
        }
    ],

    init: function(grid) {
        var me = this,
            view = me.view,
            store = view.getStore(),
            ownerGrid = view.ownerGrid,
            lockPartner;

        /**
         * Fires before the grouping changes on the grid store
         *
         * @event beforegroupschange
         * @param {Ext.grid.Panel} grid The grid panel instance
         * @param {Ext.util.Grouper[]} groupers The new groupers
         * @param {Ext.EventObject} e Event object
         */

        /**
         * Fires after the grouping changes on the grid store
         *
         * @event aftergroupschange
         * @param {Ext.grid.Panel} grid The grid panel instance
         * @param {Ext.util.Grouper[]} groupers The new groupers
         * @param {Ext.EventObject} e Event object
         */

        /**
         * Fires when a group is expanded
         *
         * @event groupexpand
         * @param {Ext.grid.Panel} grid The grid panel instance
         * @param {Object} params An object with multiple keys to identify the group
         * @param {Ext.EventObject} e Event object
         */

        /**
         * Fires when a group is collapsed
         *
         * @event groupcollapse
         * @param {Ext.grid.Panel} grid The grid panel instance
         * @param {Object} params An object with multiple keys to identify the group
         * @param {Ext.EventObject} e Event object
         */

        /**
         * Fires when a group header cell is clicked
         *
         * @event groupclick
         * @param {Ext.grid.Panel} grid The grid panel instance
         * @param {Object} params An object with multiple keys to identify the group
         * @param {Ext.EventObject} e Event object
         */

        /**
         * Fires when a group header cell is right clicked
         *
         * @event groupcontextmenu
         * @param {Ext.grid.Panel} grid The grid panel instance
         * @param {Object} params An object with multiple keys to identify the group
         * @param {Ext.EventObject} e Event object
         */

        /**
         * Fires when a group summary cell is clicked
         *
         * @event groupsummaryclick
         * @param {Ext.grid.Panel} grid The grid panel instance
         * @param {Object} params An object with multiple keys to identify the group
         * @param {Ext.EventObject} e Event object
         */

        /**
         * Fires when a group summary cell is right clicked
         *
         * @event groupsummarycontextmenu
         * @param {Ext.grid.Panel} grid The grid panel instance
         * @param {Object} params An object with multiple keys to identify the group
         * @param {Ext.EventObject} e Event object
         */

        /**
         * Fires when a summary cell is clicked
         *
         * @event summaryclick
         * @param {Ext.grid.Panel} grid The grid panel instance
         * @param {Object} params An object with multiple keys to identify the group
         * @param {Ext.EventObject} e Event object
         */

        /**
         * Fires when a summary cell is right clicked
         *
         * @event summarycontextmenu
         * @param {Ext.grid.Panel} grid The grid panel instance
         * @param {Object} params An object with multiple keys to identify the group
         * @param {Ext.EventObject} e Event object
         */

        me.callParent([grid]);

        // we do not support buffered stores yet
        if (store && store.isBufferedStore) {
            // <debug>
            Ext.log('Buffered stores are not supported yet by multi level grouping feature');
            // </debug>

            return;
        }

        // Add a table level processor
        view.addTpl(Ext.XTemplate.getTpl(me, 'outerTpl')).groupingFeature = me;
        // Add a row level processor
        view.addRowTpl(Ext.XTemplate.getTpl(me, 'rowTpl')).groupingFeature = me;

        view.preserveScrollOnRefresh = true;

        view.doGrouping = store.isGrouped();

        if (view.bufferedRenderer) {
            // eslint-disable-next-line max-len
            view.bufferedRenderer.variableRowHeight = view.hasVariableRowHeight() || view.doGrouping;
        }

        lockPartner = me.lockingPartner;

        if (lockPartner && lockPartner.dataSource) {
            me.dataSource = view.dataSource = lockPartner.dataSource;
        }
        else {
            me.dataSource = view.dataSource = new Ext.grid.feature.AdvancedGroupStore({
                summaryPosition: me.summaryPosition,
                groupSummaryPosition: me.groupSummaryPosition,
                startCollapsed: me.startCollapsed,
                gridLocked: grid.isLocked,
                view: me.view,
                source: store
            });

            ownerGrid.expandAll = Ext.bind(me.expandAll, me);
            ownerGrid.collapseAll = Ext.bind(me.collapseAll, me);

            ownerGrid.setGroupSummaryPosition = Ext.bind(me.setGroupSummaryPosition, me);
            ownerGrid.setSummaryPosition = Ext.bind(me.setSummaryPosition, me);
        }

        me.initEventsListeners();

        if (me.enableGroupingMenu) {
            me.injectGroupingMenu();
        }
    },

    destroy: function() {
        var me = this,
            ownerGrid = me.view.ownerGrid;

        ownerGrid.setGroupSummaryPosition = ownerGrid.setSummaryPosition = null;
        ownerGrid.expandAll = ownerGrid.collapseAll = null;
        me.destroyEventsListeners();
        Ext.destroy(me.dataSource);

        me.callParent();
    },

    enable: function() {
        var me = this,
            view = me.view,
            store = view.getStore();

        view.doGrouping = false;

        if (view.lockingPartner) {
            view.lockingPartner.doGrouping = false;
        }

        me.callParent();

        if (me.lastGroupers) {
            store.group(me.lastGroupers);
            me.lastGroupers = null;
        }
    },

    disable: function() {
        var view = this.view,
            store = view.getStore(),
            lastGroupers = store.getGroupers();

        view.doGrouping = false;

        if (view.lockingPartner) {
            view.lockingPartner.doGrouping = false;
        }

        this.callParent();

        if (lastGroupers) {
            this.lastGroupers = lastGroupers.getRange();
            store.clearGrouping();
        }
    },

    /**
     * Change the group summary position
     * @param {String} value Check {@link #groupSummaryPosition}
     */
    setGroupSummaryPosition: function(value) {
        var me = this,
            lockingPartner = me.lockingPartner;

        me.groupSummaryPosition = value;

        if (lockingPartner) {
            lockingPartner.groupSummaryPosition = value;
        }

        me.dataSource.setGroupSummaryPosition(value);
        me.dataSource.refreshData();
    },

    /**
     * Change the summary position
     * @param {String} value Check {@link #summaryPosition}
     */
    setSummaryPosition: function(value) {
        var me = this,
            lockingPartner = me.lockingPartner;

        me.summaryPosition = value;

        if (lockingPartner) {
            lockingPartner.summaryPosition = value;
        }

        me.dataSource.setSummaryPosition(value);
        me.dataSource.refreshData();
    },

    collapse: function(path, options) {
        this.doCollapseExpand(false, path, options);
    },

    expand: function(path, options) {
        this.doCollapseExpand(true, path, options);
    },

    expandAll: function() {
        var me = this;

        Ext.suspendLayouts();
        me.dataSource.setStartCollapsed(false);
        me.dataSource.refreshData(true);
        Ext.resumeLayouts(true);
    },

    collapseAll: function() {
        var me = this;

        Ext.suspendLayouts();
        me.dataSource.setStartCollapsed(true);
        me.dataSource.refreshData(true);
        Ext.resumeLayouts(true);
    },

    doCollapseExpand: function(expanded, path, options, fireArg) {
        var me = this,
            lockingPartner = me.lockingPartner,
            ownerGrid = me.view.ownerGrid,
            record;

        me.isExpandingCollapsing = true;

        record = me.dataSource.doExpandCollapseByPath(path, expanded);

        if (options === true) {
            options = {
                focus: true
            };
        }

        // Sync the group state and focus the row if requested.
        me.afterCollapseExpand(expanded, record, options);

        // Sync the lockingPartner's group state.
        if (lockingPartner) {
            // Clear focus flag (without mutating a passed in object).
            // If we were told to focus, we must focus, not the other side.
            if (options && options.focus) {
                options = Ext.Object.chain(options);
                options.focus = false;
            }

            lockingPartner.afterCollapseExpand(expanded, record, options);
        }

        if (!fireArg) {
            fireArg = Ext.apply({
                record: record,
                column: me.getGroupingColumn(),
                row: me.view.getRowByRecord(record)
            }, me.dataSource.getRenderData(record));
        }

        ownerGrid.fireEvent(expanded ? 'groupexpand' : 'groupcollapse', ownerGrid, fireArg);

        me.isExpandingCollapsing = false;
    },

    afterCollapseExpand: function(expanded, record, options) {
        if (record && options) {
            this.grid.ensureVisible(record, options);
        }
    },

    vetoEvent: function(record, row, rowIndex, e) {
        var shouldVeto = false,
            key = e.getKey();

        // Do not veto mouseover/mouseout and keycode != ENTER
        if (!e.getTarget(this.groupSummarySelector) && e.getTarget(this.eventSelector)) {
            shouldVeto = key
                ? key === e.ENTER
                // eslint-disable-next-line max-len
                : (e.type !== 'mouseover' && e.type !== 'mouseout' && e.type !== 'mouseenter' && e.type !== 'mouseleave');
        }

        if (shouldVeto) {
            return false;
        }
    },

    setup: function(values) {
        var me = this,
            view = values.view,
            store = view.store,
            model = store.model.getSummaryModel(),
            columns = view.headerCt.getGridColumns(),
            length = columns.length,
            column, i;

        // first we check if the store is grouped or not
        me.doGrouping = !me.disabled && view.store.isGrouped();

        if (me.doGrouping) {
            me.dataSource.isRTL = me.isRTL();
        }

        for (i = 0; i < length; i++) {
            column = columns[i];

            // if there is a summaryType configured on the column then use
            // that instead of the one from the model
            if (column.summaryType && column.dataIndex && model) {
                model.setSummaryField(column.dataIndex, column.summaryType);
            }
        }
    },

    setupRowData: function(rowValues) {
        var me = this,
            record = rowValues.record,
            renderData, field, group, header, grouper;

        // the recordIndex needs to be fixed because it is used by the selection models
        rowValues.recordIndex = me.dataSource.indexOf(record);
        renderData = me.dataSource.getRenderData(record);

        if (renderData) {
            if (renderData.isSummary) {
                renderData.store = me.view.getStore();
            }
            else {
                group = renderData.group;
                grouper = group.getGrouper();
                field = grouper.getProperty();
                header = me.getGroupedHeader(grouper);

                Ext.apply(renderData, {
                    groupField: field,
                    columnName: header ? header.text : field,
                    name: group.getLabel()
                });
                renderData.column = header;
                record.ownerGroup = renderData.name;
            }

            me.setupRowValues(rowValues, renderData);
            me.setRenderers(renderData);
        }
    },

    setupRowValues: function(rowValues, renderData) {
        var me = this,
            group = renderData.group;

        rowValues.rowClasses.push(me.eventCls);

        if (renderData.isGroupSummary) {
            rowValues.rowClasses.push(me.groupSummaryCls);
        }

        if (renderData.isGroup && group) {
            // eslint-disable-next-line max-len
            rowValues.rowClasses.push(group.isCollapsed ? me.groupHeaderCollapsedCls : me.groupHeaderExpandedCls);
        }
    },

    isRTL: function() {
        var grid = this.grid;

        if (Ext.isFunction(grid.isLocalRtl)) {
            return grid.isLocalRtl();
        }

        return false;
    },

    setRenderers: function(renderData) {
        var me = this,
            startIdx = me.getGroupingColumnPosition(),
            columns = me.view.headerCt.getGridColumns(),
            length = columns.length,
            position = me.groupSummaryPosition,
            column, group, i;

        if (me.renderersAreSet > 0) {
            // avoid setting renderers again if they were not reset before
            return;
        }

        if (renderData.isSummary) {
            for (i = 0; i < startIdx - 1; i++) {
                column = columns[i];
                column.backupRenderer = column.renderer;
                // eslint-disable-next-line max-len
                column.renderer = (column.summaryType || column.summaryRenderer) ? column.summaryRenderer : Ext.renderEmpty;
            }
        }

        for (i = startIdx; i < length; i++) {
            column = columns[i];
            column.backupRenderer = column.renderer;

            if (renderData.isGroupSummary || renderData.isSummary) {
                column.renderer = column.summaryRenderer;
            }
            else if (renderData.isGroup) {
                group = renderData.group;
                column.renderer = (position === 'bottom' && !group.isCollapsed) ||
                    (position === 'hidden')
                    ? this.renderEmpty
                    : column.summaryRenderer;
            }
        }

        me.renderersAreSet = (me.renderersAreSet || 0) + 1;
    },

    resetRenderers: function() {
        var me = this,
            columns = me.view.headerCt.getGridColumns(),
            length = columns.length,
            column, i;

        if (me.renderersAreSet > 0) {
            me.renderersAreSet--;
        }

        if (!me.renderersAreSet) {
            for (i = 0; i < length; i++) {
                column = columns[i];

                if (column.backupRenderer != null) {
                    column.renderer = column.backupRenderer;
                    column.backupRenderer = null;
                }
            }
        }
    },

    getHeaderNode: function(groupName) {
        var el = this.view.getEl(),
            nodes, i, len, node;

        if (el) {
            nodes = el.query(this.groupTitleSelector);

            for (i = 0, len = nodes.length; i < len; ++i) {
                node = nodes[i];

                if (node.getAttribute('data-groupName') === groupName) {
                    return node;
                }
            }
        }
    },

    /**
     * Returns `true` if the named group is expanded.
     * @param {String} groupName The group name.
     * @return {Boolean} `true` if the group defined by that value is expanded.
     */
    isExpanded: function(groupName) {
        var groups = this.view.getStore().getGroups(),
            group = groups.getByPath(groupName);

        return group && !group.isCollapsed;
    },

    getGroupedHeader: function(grouper) {
        var me = this,
            headers = me.headers,
            headerCt = me.view.headerCt,
            partner = me.lockingPartner,
            selector, header, groupField;

        if (!headers) {
            me.headers = headers = {};
        }

        if (grouper) {
            groupField = grouper.getId();
            header = headers[groupField];

            if (!header) {
                selector = '[grouperId=' + groupField + ']';
                header = headerCt.down(selector);

                // The header may exist in the locking partner, so check there as well
                if (!header && partner) {
                    headers[groupField] = header = partner.view.headerCt.down(selector);
                }
            }
        }

        return header || null;
    },

    getGroupingColumnConfig: function(store) {
        var me = this,
            isGrouped = store ? store.isGrouped() : me.view.getStore().isGrouped();

        me.lastColumnWidth = me.groupsColumnWidth;

        return {
            xtype: 'groupscolumn',
            groupHeaderTpl: me.groupHeaderTpl,
            groupSummaryTpl: me.groupSummaryTpl,
            summaryTpl: me.summaryTpl,
            editRenderer: me.renderEmpty,
            width: isGrouped ? me.lastColumnWidth : 1
        };
    },

    renderEmpty: function() {
        return '\u00a0';
    },

    // add the grouping column to the locked side if we are locked
    // otherwise add it to the normal view
    getGroupingColumn: function() {
        var me = this,
            result = me.groupingColumn,
            view = me.view,
            ownerGrid = view.ownerGrid;

        if (!result || result.destroyed) {
            // Always put the grouping column in the locked side if there is one.
            if (!ownerGrid.lockable || view.isLockedView) {
                result = me.groupingColumn = view.headerCt.down('groupscolumn') ||
                    view.headerCt.add(me.getGroupingColumnPosition(), me.getGroupingColumnConfig());
            }
        }

        return result;
    },

    getGroupingColumnPosition: function() {
        var columns = this.view.headerCt.items.items,
            length = columns.length,
            pos = 0,
            i, column;

        for (i = 0; i < length; i++) {
            column = columns[i];

            // we need to insert the grouping column after the selection model columns
            if (!column.hideable && !column.draggable) {
                pos++;
            }
        }

        return pos;
    },

    onBeforeReconfigure: function(grid, store, columns, oldStore, oldColumns) {
        var me = this,
            view = me.view,
            dataSource = me.dataSource,
            ownerGrid = view.ownerGrid,
            columnsChanged = false,
            column;

        if (columns && (!ownerGrid.lockable || view.isLockedView)) {
            column = me.getGroupingColumnConfig(store && store !== oldStore ? store : null);
            column.locked = ownerGrid.lockable;
            Ext.Array.insert(columns, 0, [column]);
            columnsChanged = true;
        }

        if (store && store !== oldStore) {
            // bufferedStore = store.isBufferedStore;

            Ext.destroy(me.storeListeners);
            me.setupStoreListeners(store);

            me.doGrouping = store.isGrouped();
            dataSource.setSource(store);

            if (!columnsChanged) {
                // we might need to show the groups column if the new store is grouped
                me.onGroupsChange(store, store.getGroupers(false));
            }
        }
    },

    onAfterViewRendered: function(view) {
        var me = this,
            store = view.getStore(),
            groupers = store.getGroupers(),
            length = groupers.length,
            i, header, grouper;

        // create the dedicated groups column
        me.getGroupingColumn();
        view.unbindStoreListeners(store);

        // should we hide columns that are grouped?
        if (me.startGroupedHeadersHidden) {
            for (i = 0; i < length; i++) {
                grouper = groupers.getAt(i);
                header = me.getGroupedHeader(grouper);

                if (header) {
                    header.hide();
                }
            }
        }
    },

    injectGroupingMenu: function() {
        var me = this,
            headerCt = me.view.headerCt;

        headerCt.showMenuBy = Ext.Function.createInterceptor(headerCt.showMenuBy, me.showMenuBy);
        headerCt.getMenuItems = me.getMenuItems();
    },

    showMenuBy: function(clickEvent, t, header) {
        var me = this,
            menu = me.getMenu(),
            grid = me.view.ownerGrid,
            store = me.view.getStore(),
            groupers = store.getGroupers(),
            headerNotGroupable = !header.groupable || !header.dataIndex,
            groupMenuMeth = headerNotGroupable ? 'disable' : 'enable',
            isGrouped = store.isGrouped(),
            grouper = groupers.getByProperty(header.dataIndex);

        menu.down('#groupByMenuItem')[groupMenuMeth]();
        menu.down('#groupsMenuItem').setVisible(isGrouped);

        menu.down('#addGroupMenuItem')[headerNotGroupable || grouper ? 'disable' : 'enable']();
        menu.down('#removeGroupMenuItem')[headerNotGroupable || !grouper ? 'disable' : 'enable']();

        grid.fireEvent('showheadermenuitems', grid, {
            grid: grid,
            column: header,
            menu: menu
        });
    },

    getMenuItems: function() {
        var me = this,
            grid = me.view.ownerGrid,
            getMenuItems = me.view.headerCt.getMenuItems;

        // runs in the scope of headerCt
        return function() {

            // We cannot use the method from HeaderContainer's prototype here
            // because other plugins or features may already have injected an implementation
            var o = getMenuItems.call(this);

            o.push('-', {
                iconCls: Ext.baseCSSPrefix + 'groups-icon',
                itemId: 'groupsMenuItem',
                text: me.groupsText,
                menu: [{
                    itemId: 'expandAll',
                    text: me.expandAllText,
                    handler: me.expandAll,
                    scope: me
                }, {
                    itemId: 'collapseAll',
                    text: me.collapseAllText,
                    handler: me.collapseAll,
                    scope: me
                }]
            }, {
                iconCls: Ext.baseCSSPrefix + 'group-by-icon',
                itemId: 'groupByMenuItem',
                text: me.groupByText,
                handler: me.onGroupByMenuItemClick,
                scope: me
            }, {
                iconCls: Ext.baseCSSPrefix + 'add-group-icon',
                itemId: 'addGroupMenuItem',
                text: me.addToGroupingText,
                handler: me.onAddGroupMenuItemClick,
                scope: me
            }, {
                iconCls: Ext.baseCSSPrefix + 'remove-group-icon',
                itemId: 'removeGroupMenuItem',
                text: me.removeFromGroupingText,
                handler: me.onRemoveGroupMenuItemClick,
                scope: me
            });

            grid.fireEvent('collectheadermenuitems', grid, {
                grid: grid,
                headerContainer: this,
                items: o
            });

            return o;
        };
    },

    /**
     * Group by the header the user has clicked on.
     * @private
     */
    onGroupByMenuItemClick: function(menuItem, e) {
        var me = this,
            hdr = menuItem.parentMenu.activeHeader,
            store = me.view.getStore(),
            groupers = store.getGroupers(),
            length = groupers.length,
            i, header;

        if (me.disabled) {
            me.enable();
        }

        Ext.suspendLayouts();

        for (i = 0; i < length; i++) {
            header = me.getGroupedHeader(groupers.items[i]);

            if (header) {
                header.show();
            }
        }

        hdr.hide();
        groupers.replaceAll(me.createGrouperFromHeader(hdr));

        Ext.resumeLayouts(true);
    },

    /**
     * Group by the header the user has clicked on.
     * @private
     */
    onAddGroupMenuItemClick: function(menuItem, e) {
        var me = this,
            hdr = menuItem.parentMenu.activeHeader,
            groupers = me.view.getStore().getGroupers();

        if (me.disabled) {
            me.enable();
        }

        Ext.suspendLayouts();

        hdr.hide();
        groupers.add(me.createGrouperFromHeader(hdr));

        Ext.resumeLayouts(true);
    },

    /**
     * Create a grouper configuration object out of a grid header
     * @private
     * @param header
     * @return {Object}
     */
    createGrouperFromHeader: function(header) {
        return header.getGrouper() || {
            property: header.dataIndex,
            direction: header.sortState || 'ASC',
            formatter: header.groupFormatter
        };
    },

    /**
     * Remove the grouper
     * @private
     */
    onRemoveGroupMenuItemClick: function(menuItem, e) {
        var me = this,
            hdr = menuItem.parentMenu.activeHeader,
            groupers = me.view.getStore().getGroupers(),
            grouper;

        if (me.disabled) {
            me.enable();
        }

        grouper = groupers.getByProperty(hdr.dataIndex);

        if (grouper) {
            groupers.remove(grouper);
        }
    },

    onCellEvent: function(view, row, e) {
        var me = this,
            record = view.getRecord(row),
            groupHd = e.getTarget(me.groupSelector),
            groupSum = e.getTarget(me.groupSummarySelector),
            cell = e.getTarget(view.getCellSelector()),
            ownerGrid = view.ownerGrid,
            prefix = 'group',
            data = me.dataSource.getRenderData(record),
            fireArg = Ext.applyIf({
                grid: ownerGrid,
                view: view,
                record: record,
                column: view.getHeaderByCell(cell),
                cell: cell,
                row: row,
                feature: me,
                e: e
            }, data);

        if (!(record && data)) {
            return;
        }

        // check if the mouse event occured on a group header
        if (groupHd) {
            if (e.type === 'click') {
                me.doCollapseExpand(data.group.isCollapsed, data.group.getPath(), {
                    focus: true,
                    column: me.getGroupingColumn()
                }, fireArg);
            }
        }

        // check if the mouse event occured on a group summary cell
        if (groupSum) {
            prefix = data.isGroupSummary ? 'groupsummary' : 'summary';
        }

        ownerGrid.fireEvent(prefix + e.type, ownerGrid, fireArg);

        return false;
    },

    onKeyEvent: function(view, rowElement, e) {
        var me = this,
            position = e.position,
            groupHd = e.getTarget(me.groupSelector),
            column = me.getGroupingColumn(),
            record, data, fireArg, cell;

        if (position) {
            cell = position.getCell();
            groupHd = cell.down(me.groupSelector);
        }

        if (e.getKey() === e.ENTER && rowElement && groupHd) {
            record = view.getRecord(rowElement);
            data = me.dataSource.getRenderData(record);

            if (record && record.isGroup && data) {
                fireArg = Ext.applyIf({
                    record: record,
                    column: column,
                    cell: cell,
                    row: rowElement
                }, data);

                me.doCollapseExpand(data.group.isCollapsed, data.group.getPath(), {
                    focus: true,
                    column: column
                }, fireArg);
            }

        }
    },

    onBeforeGroupsChange: function(store, groupers) {
        var view = this.view,
            grid = view.ownerGrid;

        if (!grid.lockable || view.isLockedView) {
            grid.fireEvent('beforegroupschange', grid, groupers);
        }
    },

    onGroupChange: function(store, grouper) {
        this.onGroupsChange(store, grouper ? [grouper] : null);
    },

    onGroupsChange: function(store, groupers) {
        var me = this,
            groupingColumn = me.getGroupingColumn(),
            view = me.view,
            grid = view.ownerGrid,
            isGrouped = groupers && groupers.length,
            width;

        if (groupingColumn) {
            if (groupingColumn.rendered) {
                // we can't hide the grouping column because it may mess up the locked view
                if (isGrouped) {
                    groupingColumn.setWidth(me.lastColumnWidth);
                }
                else {
                    width = groupingColumn.getWidth();

                    if (width > 1) {
                        me.lastColumnWidth = width;
                        groupingColumn.setWidth(1);
                    }
                }
            }
            else if (isGrouped) {
                groupingColumn.width = me.lastColumnWidth;
            }
        }

        if (!grid.lockable || view.isLockedView) {
            me.dataSource.fireRefresh();
            grid.fireEvent('aftergroupschange', grid, groupers);
        }
    },

    privates: {
        getViewListeners: function() {
            var me = this,
                viewListeners = {
                    afterrender: me.onAfterViewRendered,
                    scope: me,
                    destroyable: true
                };

            // after view is rendered we need to add our grouping column
            // after view is rendered start monitoring for group mouse/keyboard events

            viewListeners[me.eventPrefix + 'click'] = me.onCellEvent;
            viewListeners[me.eventPrefix + 'dblclick'] = me.onCellEvent;
            viewListeners[me.eventPrefix + 'contextmenu'] = me.onCellEvent;
            viewListeners[me.eventPrefix + 'keyup'] = me.onKeyEvent;

            return viewListeners;
        },

        getOwnerGridListeners: function() {
            return {
                beforereconfigure: this.onBeforeReconfigure,
                destroyable: true,
                scope: this
            };
        },

        getStoreListeners: function() {
            return {
                beforegroupschange: this.onBeforeGroupsChange,
                groupchange: this.onGroupChange,
                groupschange: this.onGroupsChange,
                scope: this,
                destroyable: true
            };
        },

        initEventsListeners: function() {
            var me = this,
                view = me.view,
                grid = view.ownerGrid,
                lockPartner = me.lockingPartner;

            me.viewListeners = view.on(me.getViewListeners());

            // if grid is reconfigured we need to add our grouping column and monitor the new store
            if (!lockPartner || (lockPartner && !lockPartner.gridListeners)) {
                me.ownerGridListeners = grid.on(me.getOwnerGridListeners());
            }
            // when new columns are added we need to change the menu

            // store needs to be monitored for the group event to refresh the view
            me.setupStoreListeners(view.getStore());
        },

        destroyEventsListeners: function() {
            Ext.destroyMembers(this, 'viewListeners', 'storeListeners', 'ownerGridListeners');
        },

        setupStoreListeners: function(store) {
            Ext.destroy(this.storeListeners);

            this.storeListeners = store.on(this.getStoreListeners());
        }
    }

});
