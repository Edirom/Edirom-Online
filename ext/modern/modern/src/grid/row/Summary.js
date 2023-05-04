/**
 * @private
 */
Ext.define('Ext.grid.row.Summary', {
    extend: 'Ext.grid.Row',
    xtype: 'groupedgridsummaryrow',

    requires: [
        'Ext.data.summary.*'
    ],

    isSummaryRow: true,

    config: {
        group: null
    },

    defaultCellUI: 'summary',

    classCls: Ext.baseCSSPrefix + 'summaryrow',

    updateGroup: function() {
        this.syncSummary();
    },

    privates: {
        beginRefresh: function(context) {
            var me = this;

            context = me.callParent([context]);

            context.group = me.getGroup();
            context.records = (context.group || me.parent.getStore().getData()).items;
            context.summary = true;

            return context;
        },

        syncSummary: function() {
            var me = this,
                owner = me.getGroup() || me.parent.getStore(),
                record = owner.getSummaryRecord(),
                viewModel = me.getViewModel();

            if (record === me.getRecord()) {
                me.refresh();
            }
            else {
                me.setRecord(record);

                if (viewModel) {
                    viewModel.setData({
                        record: record
                    });
                }
            }
        }
    } // privates

});
