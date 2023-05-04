/**
 * A row that is used to display group headers
 *
 * Used by {@link Ext.grid.TreeGrouped}
 * @private
 */
Ext.define('Ext.grid.row.Group', {
    extend: 'Ext.grid.Row',
    xtype: 'gridgrouprow',

    isGroupRow: true,
    groupCls: Ext.baseCSSPrefix + 'grid-group',
    summaryCls: Ext.baseCSSPrefix + 'summaryrow',

    updateRecord: function(record, oldRecord) {
        var me = this;

        me.callParent([record, oldRecord]);

        me.removeCls([me.groupCls, me.summaryCls]);

        if (record) {
            if (record.isGroup || record.isSummary) {
                me.addCls(me.groupCls);
            }
            else if (record.isSummaryModel) {
                me.addCls(me.summaryCls);
            }
        }
    },

    refresh: function(context) {
        var me = this,
            cells = me.cells,
            body = me.getBody(),
            len = cells.length,
            expandField = me.getExpandedField(),
            grid = me.getParent(),
            dataSource = grid.store,
            sm = grid.getSelectable(),
            selection = sm.getSelection(),
            isCellSelection = selection.isCells || selection.isColumns,
            i, visibleIndex, cell, record, recordsExpanded,
            column, position, changeCell, renderData, renderCell, group, temp;

        if (!grid.isTreeGroupedGrid) {
            return this.callParent([context]);
        }

        // Allows cells/body to know we are bulk updating so they can avoid
        // things like calling record.getData(true) multiple times.
        me.refreshContext = context = me.beginRefresh(context);

        record = context.record;
        position = grid.getGroupSummaryPosition();
        renderData = dataSource && dataSource.getRenderData(record);
        renderCell = true;

        if (renderData) {
            if (renderData.isGroupSummary || renderData.isSummary) {
                renderCell = true;
            }
            else if (renderData.isGroup) {
                group = renderData.group;
                renderCell = !((position === 'bottom' && !group.isCollapsed) ||
                    (position === 'hidden'));
            }
        }

        me.syncDirty(record);

        for (i = 0, visibleIndex = 0; i < len; ++i) {
            cell = cells[i];

            if (cell) {
                column = cell.getColumn();

                if (column.isGroupsColumn) {
                    changeCell = true;
                }
                else {
                    changeCell = renderCell;
                }

                if (changeCell) {
                    if (cell.getRecord() === record) {
                        cell.refresh(context);
                    }
                    else {
                        cell.refreshContext = context;
                        cell.setRecord(record);
                        cell.refreshContext = null;
                    }

                    if (isCellSelection) {
                        // eslint-disable-next-line max-len
                        cell.toggleCls(grid.selectedCls, sm.isCellSelected(me._recordIndex, visibleIndex));
                    }
                }
                else {
                    temp = context.record;
                    context.record = null;
                    cell.refreshContext = context;
                    cell.setRecord(null);
                    cell.refreshContext = null;
                    context.record = temp;
                }

                // Cell and column selection work on visible index.
                if (!cell.isHidden()) {
                    visibleIndex++;
                }
            }
        }

        context.cell = context.column = context.dataIndex = context.scope = null;

        if (body) {
            body.refreshContext = context;

            if (body.getRecord() === record) {
                body.updateRecord(record);
            }
            else {
                body.setRecord(record);
            }

            body.refreshContext = null;

            // If the plugin knows that the record contains an expanded flag
            // ensure our state is synchronized with our record.
            // Maintainer: We are testing the result of the assignment of expandedField
            // in order to avoid a messy, multiple level if...else.
            if (expandField) {
                me.setCollapsed(!record.get(expandField));
            }
            else {
                recordsExpanded = grid.$recordsExpanded || (grid.$recordsExpanded = {});

                if (grid.hasRowExpander) {
                    me.setCollapsed(!recordsExpanded[record.internalId]);
                }
            }
        }

        me.refreshContext = null;
    }

});
