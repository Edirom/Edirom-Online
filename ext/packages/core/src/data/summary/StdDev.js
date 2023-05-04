/**
 * Calculates the sample standard deviation for a set of data.
 * @since 7.4.0
 */
Ext.define('Ext.data.summary.StdDev', {
    extend: 'Ext.data.summary.Variance',

    alias: 'data.summary.stddev',
    /**
     * Name of the summary function that appears in the {@link Ext.grid.plugin.Summaries} plugin
     */
    text: 'StdDev',

    calculate: function(records, property, root, begin, end) {
        var v = this.callParent([records, property, root, begin, end]);

        if (v != null) {
            v = Math.sqrt(v);
        }

        return v;
    }
});
