/**
 * This class provides a flexible means to control the
 * `{@link Ext.util.Collection#cfg!groupers groupers}` of a
 * `{@link Ext.util.Collection Collection}`. Instances of this class are created
 * automatically when groupers are added to Collections.
 *
 * This collection can be directly manipulated by application code to gain full
 * control over the groupers of the owner collection.
 *
 * Items in this collection are `Ext.util.Grouper` instances and can be managed
 * individually by their `id`. This is the recommended way to manage application
 * groupers while preserving sorter applied from other sources.
 *
 * Bulk changes to this collection should be wrapped in
 * `{@link Ext.util.Collection#method!beginUpdate beginUpdate}` and
 * `{@link Ext.util.Collection#method!endUpdate endUpdate}` (as with any collection).
 * During these bulk updates all reactions to sorter changes will be suspended.
 */
Ext.define('Ext.util.GrouperCollection', {
    extend: 'Ext.util.SorterCollection',

    requires: [
        'Ext.util.Grouper'
    ],

    isGrouperCollection: true,

    constructor: function(config) {
        this.callParent([config]);
        this.setDecoder(this.decodeGrouper);
    },

    decodeGrouper: function(grouper) {
        var cfg = grouper;

        if (typeof grouper === 'function') {
            cfg = {
                groupFn: grouper
            };
        }

        return this.decodeSorter(cfg, 'Ext.util.Grouper');
    },

    addGroupersObserver: function(observer) {
        var items = this.items,
            length = items.length,
            i;

        for (i = 0; i < length; i++) {
            items[i].addObserver(observer);
        }
    },

    removeGroupersObserver: function(observer) {
        var items = this.items,
            length = items.length,
            i;

        for (i = 0; i < length; i++) {
            items[i].removeObserver(observer);
        }
    }
});
