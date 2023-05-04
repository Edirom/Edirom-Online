/**
 * Calculates the sample variance for a set of data.
 * @since 7.4.0
 */
Ext.define('Ext.data.summary.Variance', {
    extend: 'Ext.data.summary.Base',

    requires: [
        'Ext.data.summary.Average'
    ],

    alias: 'data.summary.variance',
    /**
     * Name of the summary function that appears in the {@link Ext.grid.plugin.Summaries} plugin
     */
    text: 'Var',

    constructor: function(config) {
        this.callParent([config]);
        this.avg = Ext.Factory.dataSummary('average');
    },

    calculate: function(records, property, root, begin, end) {
        var n = end - begin,
            avg = this.avg.calculate(records, property, root, begin, end),
            total = 0,
            i, v, ret;

        if (avg != null && avg !== 0) {
            for (i = 0; i < n; ++i) {
                v = this.extractValue(records[begin + i], property, root);

                total += Math.pow(Ext.Number.from(v, 0) - avg, 2);
            }
        }

        if (total !== 0 && n > 1) {
            ret = total / (n - 1);
        }

        return ret;
    }
});
