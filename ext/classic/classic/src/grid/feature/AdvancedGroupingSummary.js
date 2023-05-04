/**
 * This feature can display summaries for all nested groups and a grand summary
 * for the entire store assigned to the grid panel.
 */
Ext.define('Ext.grid.feature.AdvancedGroupingSummary', {
    extend: 'Ext.grid.feature.AdvancedGrouping',
    alias: 'feature.advancedgroupingsummary',

    groupSummaryPosition: 'bottom',
    /**
     * @cfg summaryPosition
     * @inheritdoc
     * @localdoc
     *  * `'docked'`: Show the summary row docked at the top/bottom
     *  of the grid. Used together with the {@link dock} config
     */
    summaryPosition: 'docked',

    /**
     * @cfg {String} dock
     * Configure `'top'` or `'bottom'` to create a fixed summary row
     * either above or below the scrollable table.
     *
     */
    dock: 'bottom',

    dockedSummaryCls: Ext.baseCSSPrefix + 'docked-grid-summary',
    summaryCls: Ext.baseCSSPrefix + 'grid-summary',
    summarySelector: '.' + Ext.baseCSSPrefix + 'grid-summary',
    summaryTableCls: Ext.baseCSSPrefix + 'grid-item',

    init: function(grid) {
        var me = this;

        me.refreshBarTask = new Ext.util.DelayedTask(me.onStoreUpdate, me);

        me.callParent([grid]);

        grid.headerCt.on({
            columnschanged: me.refreshBar, // this includes columns visibility
            afterlayout: me.afterHeaderCtLayout,
            scope: me
        });
        grid.on({
            beforerender: me.onBeforeGridRendered,
            afterrender: me.onAfterGridRendered,
            scope: me,
            single: true
        });
    },

    destroy: function() {
        var me = this;

        me.refreshBarTask.cancel();
        me.summaryBar = Ext.destroy(me.summaryBar);

        me.callParent();
    },

    /**
     * @inheritDoc
     */
    setSummaryPosition: function(value) {
        var me = this,
            lockingPartner = me.lockingPartner,
            bar = me.getSummaryBar(),
            dock = me.dock;

        me.showSummary = (value === 'docked' && (dock === 'top' || dock === 'bottom'));
        bar.setHidden(!me.showSummary);

        if (lockingPartner) {
            lockingPartner.getSummaryBar().setHidden(!me.showSummary);
        }

        me.callParent([value]);
    },

    onBeforeGridRendered: function() {
        var me = this,
            view = me.view,
            grid = me.grid,
            dock = me.dock,
            pos = me.summaryPosition,
            tableCls = [me.summaryTableCls],
            showSummary;

        me.showSummary = showSummary = (pos === 'docked' && (dock === 'top' || dock === 'bottom'));

        if (view.columnLines) {
            tableCls[tableCls.length] = view.ownerCt.colLinesCls;
        }

        me.summaryBar = grid.addDocked({
            focusable: true,
            childEls: ['innerCt', 'item'],
            renderTpl: [
                '<div id="{id}-innerCt" data-ref="innerCt" role="presentation">',
                // eslint-disable-next-line max-len
                '<table id="{id}-item" data-ref="item" cellPadding="0" cellSpacing="0" class="' + tableCls.join(' ') + '">',
                '<tr class="' + me.summaryCls + '"></tr>',
                '</table>',
                '</div>'
            ],
            scrollable: {
                x: false,
                y: false
            },
            itemId: 'summaryBar',
            hidden: !showSummary,
            cls: [me.dockedSummaryCls, me.dockedSummaryCls + '-' + dock],
            xtype: 'component',
            dock: dock,
            weight: 10000000
        })[0];

    },

    onAfterGridRendered: function() {
        var me = this,
            bar = me.summaryBar;

        me.view.getScrollable().addPartner(bar.getScrollable(), 'x');
        me.onStoreUpdate();

        bar.innerCt.on({
            click: 'onBarEvent',
            dblclick: 'onBarEvent',
            contextmenu: 'onBarEvent',
            delegate: '.' + Ext.baseCSSPrefix + 'grid-cell',
            scope: me
        });
    },

    getSummaryBar: function() {
        var me = this;

        if (!me.summaryBar) {
            me.onBeforeGridRendered();
            me.onAfterGridRendered();
        }

        return me.summaryBar;
    },

    setupRowValues: function(rowValues, renderData) {
        this.callParent([rowValues, renderData]);

        if (renderData.isSummary && this.showSummary) {
            Ext.Array.remove(rowValues.rowClasses, this.eventCls);
            rowValues.rowClasses.push('x-grid-row', this.summaryCls);
        }
    },

    onStoreUpdate: function() {
        var me = this,
            view = me.view,
            selector = me.summarySelector,
            record, newRowDom, oldRowDom, p, data;

        if (!view || !view.rendered || !me.showSummary) {
            return;
        }

        record = view.getStore().getSummaryRecord();
        data = me.dataSource.renderData[record.getId()] = {
            isSummary: true
        };

        me.setRenderers(data);
        newRowDom = Ext.fly(view.createRowElement(record, -1)).down(selector, true);
        me.resetRenderers();

        if (!newRowDom) {
            return;
        }

        // Summary row is inside the docked summaryBar Component
        p = me.summaryBar.item.dom.firstChild;
        oldRowDom = p.firstChild;

        p.insertBefore(newRowDom, oldRowDom);
        p.removeChild(oldRowDom);
    },

    refreshBar: function() {
        this.refreshBarTask.delay(10);
    },

    // Synchronize column widths in the docked summary Component or the inline summary row
    // depending on whether we are docked or not.
    afterHeaderCtLayout: function(headerCt) {
        var me = this,
            view = me.view,
            columns = view.getVisibleColumnManager().getColumns(),
            len = columns.length,
            summaryEl, el, width, innerCt, column, i;

        if (me.showSummary && view.refreshCounter) {
            summaryEl = me.summaryBar.el;
            width = headerCt.getTableWidth();
            innerCt = me.summaryBar.innerCt;

            // Stretch the innerCt of the summary bar upon headerCt layout
            me.summaryBar.item.setWidth(width);

            // headerCt's tooNarrow flag is set by its layout if the columns overflow.
            // Must not measure+set in after layout phase, this is a write phase.
            if (headerCt.tooNarrow) {
                width += Ext.getScrollbarSize().width;
            }

            innerCt.setWidth(width);

            // If the layout was in response to a clearView, there'll be no summary element
            if (summaryEl) {
                for (i = 0; i < len; i++) {
                    column = columns[i];
                    el = summaryEl.down(view.getCellSelector(column), true);

                    if (el) {
                        Ext.fly(el).setWidth(column.width ||
                            (column.lastBox ? column.lastBox.width : 100));
                    }
                }
            }
        }
    },

    onBarEvent: function(e, cell) {
        var me = this,
            view = me.view,
            grid = view.ownerGrid,
            record = view.getStore().getSummaryRecord(),
            fireArg = Ext.apply({
                record: record,
                column: view.getHeaderByCell(cell),
                cell: cell,
                row: me.summaryBar.getEl(),
                grid: grid,
                feature: me,
                e: e
            }, me.dataSource.getRenderData(record));

        return grid.fireEvent('summary' + e.type, grid, fireArg);
    },

    privates: {
        getOwnerGridListeners: function() {
            var listeners = this.callParent();

            return Ext.apply(listeners, {
                columnmove: this.onStoreUpdate
            });
        },

        getStoreListeners: function() {
            var me = this,
                listeners = me.callParent();

            return Ext.apply(listeners, {
                update: me.refreshBar,
                datachanged: me.refreshBar,
                remotesummarieschanged: me.refreshBar,
                summarieschanged: me.refreshBar
            });
        }
    }

});
