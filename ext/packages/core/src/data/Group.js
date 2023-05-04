/**
 * Encapsulates a group of records. Can provide a
 * {@link #getSummaryRecord} summary record.
 *
 * @since 6.5.0
 */
Ext.define('Ext.data.Group', {
    extend: 'Ext.util.Group',

    isDataGroup: true,

    store: null,
    isCollapsed: false,

    updateParent: function(parent, oldParent) {
        if (!this.isCollapsed && parent && parent.isGroup) {
            this.isCollapsed = parent.isCollapsed;
        }

        this.callParent([parent, oldParent]);
    },

    /**
     * Mark this group as expanded.
     * @param {Boolean} [includeChildren=false] Set to true to expand the children groups too.
     */
    expand: function(includeChildren) {
        this.doExpandCollapse(true, includeChildren);
    },

    /**
     * Mark this group as collapsed.
     * @param {Boolean} [includeChildren=false] Set to true to collapse the children groups too.
     */
    collapse: function(includeChildren) {
        this.doExpandCollapse(false, includeChildren);
    },

    doExpandCollapse: function(expanded, includeChildren) {
        var groups = this.getGroups(),
            len, i;

        this.isCollapsed = !expanded;

        if (includeChildren && groups) {
            len = groups.length;

            for (i = 0; i < len; i++) {
                groups.items[i].doExpandCollapse(expanded, includeChildren);
            }
        }
    },

    /**
     * Mark this group as collapsed or expanded depending on the current state.
     */
    toggleCollapsed: function() {
        this.doExpandCollapse(this.isCollapsed);
    },

    /**
     * Returns the group header summary results for the group.
     * @return {Ext.data.Model}
     */
    getGroupRecord: function() {
        var record = this.getNewSummaryRecord('groupRecord', true);

        record.isGroup = true;

        return record;
    },

    /**
     * Returns the summary results for the group.
     * @return {Ext.data.Model}
     */
    getSummaryRecord: function() {
        var record = this.getNewSummaryRecord('summaryRecord', true);

        record.isSummary = true;

        return record;
    },

    getNewSummaryRecord: function(property, calculate) {
        var me = this,
            summaryRecord = me[property],
            store = me.store,
            generation = store.getData().generation,
            M, T, idProperty;

        if (!summaryRecord) {
            M = store.getModel();
            T = M.getSummaryModel();
            me[property] = summaryRecord = new T();
            idProperty = M.idField.name;
            summaryRecord.data[idProperty] = summaryRecord.id = M.identifier.generate();
            summaryRecord.group = me;
            summaryRecord.commit();
        }

        if (!store.getRemoteSummary() && !summaryRecord.isRemote &&
            summaryRecord.summaryGeneration !== generation && calculate === true) {
            summaryRecord.calculateSummary(me.items);
            summaryRecord.summaryGeneration = generation;
        }
        else if (store.getRemoteSummary() && summaryRecord.isRemote) {
            // reset values that have no summary config anymore
            me.fixRemoteSummary(summaryRecord);
        }

        summaryRecord.isNonData = true;

        return summaryRecord;
    },

    // remove all data for the summaries that are no more available
    fixRemoteSummary: function(summaryRecord) {
        var fields = summaryRecord.getFields(),
            len = fields.length,
            i, result, summary, name, field;

        for (i = 0; i < len; ++i) {
            field = fields[i];
            summary = field.getSummary();
            result = result || {};
            name = field.name;

            if (name !== 'id' && !summary) {
                result[name] = null;
            }
        }

        if (result) {
            summaryRecord.set(result, summaryRecord._commitOptions);
        }
    },

    recalculateSummaries: function() {
        var items = this.items;

        this.getGroupRecord().calculateSummary(items);
        this.getSummaryRecord().calculateSummary(items);
    },

    eject: function() {
        var me = this;

        me.callParent();

        if (me.groupRecord) {
            me.groupRecord.summaryGeneration = 0;
        }

        if (me.summaryRecord) {
            me.summaryRecord.summaryGeneration = 0;
        }
    }

});
