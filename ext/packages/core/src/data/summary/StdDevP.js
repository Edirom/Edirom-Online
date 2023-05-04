/**
 * Calculates the population standard deviation for a set of data.
 * @since 7.4.0
 */
Ext.define('Ext.data.summary.StdDevP', {
    extend: 'Ext.data.summary.VarianceP',

    alias: 'data.summary.stddevp',
    /**
     * Name of the summary function that appears in the {@link Ext.grid.plugin.Summaries} plugin
     */
    text: 'StdDevP',

    calculate: function(records, property, root, begin, end) {
        var v = this.callParent([records, property, root, begin, end]);

        if (v != null) {
            v = Math.sqrt(v);
        }

        return v;
    }
});
