/**
 * A grid cell type used by {@link Ext.grid.column.Groups}
 * @private
 */
Ext.define('Ext.grid.cell.Group', {
    extend: 'Ext.grid.cell.Cell',
    xtype: 'groupcell',

    config: {
        innerGroupStyle: null,
        innerGroupCls: null,
        userGroupStyle: null,
        userGroupCls: null
    },

    innerTemplate: [{
        reference: 'iconElement',
        classList: [
            Ext.baseCSSPrefix + 'grid-group-icon',
            Ext.baseCSSPrefix + 'font-icon'
        ]
    }, {
        reference: 'groupElement',
        classList: [
            Ext.baseCSSPrefix + 'grid-group-title'
        ]
    }],

    noGroupCls: Ext.baseCSSPrefix + 'gridcell-nogroup',
    groupHeaderCls: Ext.baseCSSPrefix + 'grid-group-header',
    groupHeaderCollapsibleCls: Ext.baseCSSPrefix + 'grid-group-header-collapsible',
    groupHeaderCollapsedCls: Ext.baseCSSPrefix + 'grid-group-header-collapsed',

    nestedGroupPadding: 25,
    encodeHtml: false,

    handleEvent: function(type, e) {
        var me = this,
            row = me.row,
            grid = row.getGrid(),
            record = me.getRecord(),
            store = grid.store,
            info = (store && store.isMultigroupStore) ? store.getRenderData(record) : null,
            prefix = 'group',
            fireArg = Ext.applyIf({
                grid: grid,
                record: record,
                column: me.getColumn(),
                cell: me,
                row: row,
                e: e
            });

        if (!info) {
            return;
        }

        if (info.isGroup && info.group && type === 'tap' && store) {
            store.doExpandCollapseByPath(info.group.getPath(), info.group.isCollapsed);
        }

        if (info.isGroupSummary) {
            prefix = 'groupsummary';
        }
        else if (info.isSummary) {
            prefix = 'summary';
        }

        grid.fireEvent(prefix + type, grid, fireArg, e);

        return false;
    },

    updateInnerGroupCls: function(cls, oldCls) {
        this.groupElement.replaceCls(oldCls, cls);
    },

    updateRawValue: function(rawValue) {
        var dom = this.groupElement.dom,
            value = rawValue == null ? '' : rawValue;

        if (this.getEncodeHtml()) {
            dom.textContent = value;
        }
        else {
            dom.innerHTML = value;
        }
    },

    refresh: function(context) {
        var me = this,
            record = me.getRecord(),
            grid = me.row.getGrid(),
            dataSource = grid.store,
            cellCls = me.noGroupCls,
            info = dataSource && dataSource.getRenderData(record),
            padding, group;

        if (info && record) {
            group = info.group;

            if (group) {
                cellCls = me.groupHeaderCls;

                if (info.isGroup) {
                    padding = me.nestedGroupPadding * (info.group.getLevel() - 1);
                }
                else {
                    padding = me.nestedGroupPadding * info.group.getLevel();
                }

                // eslint-disable-next-line max-len
                me.bodyElement.setStyle(grid.isRTL() ? 'padding-right' : 'padding-left', padding + 'px');
            }
            else {
                me.bodyElement.setStyle(grid.isRTL() ? 'padding-right' : 'padding-left', '0px');
            }

            if (info.isGroup) {
                cellCls += ' ' + me.groupHeaderCollapsibleCls;

                if (group.isCollapsed) {
                    cellCls += ' ' + me.groupHeaderCollapsedCls;
                }
            }
        }

        me.setCellCls(cellCls);

        me.callParent([context]);
    },

    refreshValue: function(context) {
        var grid = this.row.getGrid(),
            record = context.record,
            column = context.column,
            dataSource = grid.store,
            data = dataSource && dataSource.getRenderData(record),
            value = '&#160;',
            tpl, tplData;

        if (data) {
            if (data.isGroup) {
                tpl = column.getGroupHeaderTpl();
            }
            else if (data.isGroupSummary) {
                tpl = column.getGroupSummaryTpl();
            }
            else if (data.isSummary) {
                tpl = column.getSummaryTpl();
                tplData = {
                    store: grid.getStore().getSource()
                };
            }
        }
        else if (record.isSummaryModel) {
            tpl = column.getSummaryTpl();
            tplData = {
                store: grid.getStore().getSource()
            };
        }

        if (tpl) {
            if (!tplData) {
                tplData = Ext.apply({
                    groupField: column.getDataIndex(),
                    columnName: column.getText(),
                    name: record.group.getLabel(),
                    column: column
                }, data);
            }

            value = tpl.apply(tplData);
        }

        return value;
    }
});
