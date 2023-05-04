/**
 * Calculates the average for a set of data.
 * @since 6.5.0
 */
Ext.define('Ext.data.summary.Average', {
    extend: 'Ext.data.summary.Sum',

    alias: 'data.summary.average',

    /**
     * Name of the summary function that appears in the {@link Ext.grid.plugin.Summaries} plugin
     */
    text: 'Average',

    calculate: function(records, property, root, begin, end) {
        var len = end - begin,
            value;

        if (len > 0) {
            value = this.callParent([records, property, root, begin, end]) / len;
        }

        return value;
    }
});
