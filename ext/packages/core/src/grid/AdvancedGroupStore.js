/**
 * This class simulates a store. It is capable of monitoring a store for grouping changes
 * and will create an internal data collection for the records it holds.
 *
 * @private
 */
Ext.define('Ext.grid.AdvancedGroupStore', {
    extend: 'Ext.util.Observable',

    mixins: [
        'Ext.mixin.Bufferable'
    ],

    cachedConfig: {
        storeEventListeners: {
            beforeload: 'onBeforeLoad',
            load: 'onLoad',
            datachanged: 'onDataChanged',
            groupchange: 'onGroupChange',
            groupschange: 'onGroupsChange',
            idchanged: 'onIdChanged',
            update: 'onUpdate',
            remotesummarieschanged: 'fireRefresh'
        }
    },

    config: {
        autoDestroy: true,
        autoLoad: false,
        source: null,
        summaryPosition: null,
        groupSummaryPosition: null,
        startCollapsed: null,
        fireReplaceEvent: true
    },

    isMultigroupStore: true,
    isGroupStore: true,
    isStore: true,
    isVirtualStore: false,

    $applyConfigs: false,

    bufferableMethods: {
        fireRefresh: 5
    },

    constructor: function(config) {
        var me = this;

        me.data = new Ext.util.Collection({
            rootProperty: 'data',
            extraKeys: {
                byInternalId: {
                    property: 'internalId',
                    rootProperty: ''
                }
            }
        });
        me.renderData = {};

        return me.callParent([config]);
    },

    destroy: function() {
        this.setSource(null);
        this.callParent();
    },

    updateGroupSummaryPosition: function() {
        if (!this.isConfiguring) {
            this.refreshData();
        }
    },

    updateSummaryPosition: function() {
        if (!this.isConfiguring) {
            this.refreshData();
        }
    },

    updateSource: function(store, oldStore) {
        var me = this;

        if (oldStore) {
            Ext.destroy(me.storeListeners);
        }

        if (store) {
            me.storeListeners = store.on(Ext.apply({
                scope: me,
                destroyable: true
            }, me.getStoreEventListeners()));

            me.refreshData();
        }
    },

    processStore: function(forceStartCollapsed) {
        var me = this,
            data = me.data,
            position = me.getSummaryPosition(),
            store = me.getSource(),
            startCollapsed = me.getStartCollapsed(),
            items, placeholder, groups, length, i;

        if (data) {
            data.clear();
            me.renderData = {};
        }
        else {
            return;
        }

        if (store) {
            groups = store.getGroups();
            length = groups && groups.length;

            if (length > 0) {
                if (forceStartCollapsed) {
                    for (i = 0; i < length; i++) {
                        groups.items[i].doExpandCollapse(!startCollapsed, true);
                    }
                }
                else if (startCollapsed) {
                    for (i = 0; i < length; i++) {
                        groups.items[i].collapse(true);
                    }
                }

                me.setStartCollapsed(false);
                items = me.processGroups(groups.items);
            }
            else {
                items = store.getRange();
            }

            data.add(items);

            if (position === 'top' || position === 'bottom') {
                placeholder = store.getSummaryRecord();
                me.renderData[placeholder.getId()] = {
                    isSummary: true
                };

                if (position === 'top') {
                    data.insert(0, placeholder);
                }
                else {
                    data.add(placeholder);
                }
            }
        }
    },

    processGroups: function(groups) {
        var me = this,
            data = [],
            groupCount = groups ? groups.length : 0,
            addSummary = false,
            position = me.getGroupSummaryPosition(),
            i, j, group, groupPlaceholder, depth, children;

        // For each record added to the data collection we need to prepare the
        // renderData object. This one will have info for:
        // - summaryData objects
        // - depth level to be able to align the record
        // - if this is the first record in a group
        // - if this is the last record in a group
        // All this info will be used by the feature setupRowData

        if (groupCount <= 0) {
            return data;
        }

        for (i = 0; i < groupCount; i++) {
            group = groups[i];
            addSummary = false;

            // if the group placeholder defined then create one
            groupPlaceholder = group.getGroupRecord();
            data.push(groupPlaceholder);
            me.renderData[groupPlaceholder.getId()] = {
                group: group,
                depth: group.getLevel(),
                isGroup: true
            };

            if (!group.isCollapsed) {
                children = group.getGroups();

                if (children && children.length > 0) {
                    Ext.Array.insert(data, data.length, me.processGroups(children.items));
                }
                else {
                    Ext.Array.insert(data, data.length, group.items);

                    for (j = 0; j < group.items.length; j++) {
                        me.renderData[group.items[j].getId()] = {
                            group: group,
                            depth: group.getLevel()
                        };
                    }
                }
            }

            if (position === 'bottom') {
                addSummary = !group.isCollapsed;
                depth = group.getLevel();
            }

            if (addSummary) {
                groupPlaceholder = group.getSummaryRecord();
                data.push(groupPlaceholder);
                me.renderData[groupPlaceholder.getId()] = {
                    group: group,
                    depth: depth,
                    isGroupSummary: true
                };
            }
        }

        return data;
    },

    isLoading: function() {
        return false;
    },

    getData: function() {
        return this.data;
    },

    getCount: function() {
        var data = this.data;

        return data ? data.getCount() : 0;
    },

    getTotalCount: function() {
        var data = this.data;

        return data ? data.getCount() : 0;
    },

    /**
     * Convenience function for getting the first model instance in the store.
     *
     * When store is filtered, will return first item within the filter.
     *
     * @return {Ext.data.Model/undefined} The first model instance in the store, or undefined
     */
    first: function() {
        var data = this.data,
            item = null;

        if (data) {
            item = data.first();
        }

        return item;
    },

    /**
     * Convenience function for getting the last model instance in the store.
     *
     * When store is filtered, will return last item within the filter.
     *
     * @return {Ext.data.Model/undefined} The last model instance in the store, or undefined
     */
    last: function() {
        var data = this.data,
            item = null;

        if (data) {
            item = data.last();
        }

        return item;
    },

    // This class is only created for fully loaded, non-buffered stores
    rangeCached: function(start, end) {
        return end < this.getCount();
    },

    getRange: function(start, end, options) {
        // Collection's getRange is exclusive. Do NOT mutate the value:
        // it is passed to the callback.
        var data = this.data,
            result = data
                ? data.getRange(start, Ext.isNumber(end) ? end + 1 : end)
                : [];

        if (options && options.callback) {
            options.callback.call(options.scope || this, result, start, end, options);
        }

        return result;
    },

    getAt: function(index) {
        var data = this.data;

        return data ? data.getAt(index) : null;
    },

    getById: function(id) {
        return this.getSource().getById(id);
    },

    getByInternalId: function(internalId) {
        var data = this.data,
            item = null;

        if (data) {
            item = data.byInternalId.get(internalId);
        }

        return item;
    },

    getRenderData: function(record) {
        return (record && record.isModel ? this.renderData[record.getId()] : null);
    },

    toggleCollapsedByRecord: function(record) {
        var data = this.renderData[record.getId()];

        if (!data) {
            return;
        }

        return this.doExpandCollapse(data.group, data.group.isCollapsed);
    },

    doExpandCollapseByPath: function(path, expanded) {
        var group = this.getSource().getGroups().getByPath(path);

        if (!group) {
            return;
        }

        return this.doExpandCollapse(group, expanded);
    },

    doExpandCollapse: function(group, expanded) {
        var me = this,
            fireReplaceEvent = me.getFireReplaceEvent(),
            startIdx, items, oldItems,
            len;

        oldItems = me.processGroups([group]);
        group.doExpandCollapse(expanded);
        items = me.processGroups([group]);

        if (items.length && (startIdx = me.data.indexOf(group.getGroupRecord())) !== -1) {
            if (group.isCollapsed) {
                me.isExpandingOrCollapsing = 2;
                len = oldItems.length;
                oldItems = me.data.getRange(startIdx, startIdx + len);

                // Remove the group child records
                me.data.removeAt(startIdx, len);

                me.data.insert(startIdx, items);

                if (fireReplaceEvent) {
                    me.fireEvent('replace', me, startIdx, oldItems, items);
                }
                else {
                    me.fireRefresh();
                }

                me.fireEvent('groupcollapse', me, group);
            }
            else {
                me.isExpandingOrCollapsing = 1;

                // Remove the collapsed group placeholder record
                me.data.removeAt(startIdx);

                me.data.insert(startIdx, items);

                if (fireReplaceEvent) {
                    me.fireEvent('replace', me, startIdx, oldItems, items);
                }
                else {
                    me.fireRefresh();
                }

                me.fireEvent('groupexpand', me, group);
            }

            me.isExpandingOrCollapsing = 0;
        }

        return items[0];
    },

    isInCollapsedGroup: function(record) {
        var expanded = true,
            groups = this.getSource().getGroups(),
            i, length, group;

        if (groups) {
            groups = groups.getGroupsByItem(record);
        }

        if (groups) {
            length = groups.length;

            for (i = 0; i < length; i++) {
                group = groups[i];
                expanded = expanded && !group.isCollapsed;
            }
        }

        return !expanded;
    },

    expandToRecord: function(record) {
        var groups = this.getSource().getGroups(),
            i, j, length, group;

        if (groups) {
            groups = groups.getGroupsByItem(record);
        }

        if (groups) {
            length = groups.length;

            for (i = 0; i < length; i++) {
                group = groups[i];

                if (group.isCollapsed) {
                    // expand from here
                    for (j = i + 1; j < length; j++) {
                        groups[j].isCollapsed = false;
                    }

                    this.doExpandCollapse(group, true);
                    break;
                }
            }
        }
    },

    contains: function(record) {
        return this.indexOf(record) > -1;
    },

    // Find index of record in group store.
    indexOf: function(record) {
        var data = this.data;

        return data ? data.indexOf(record) : null;
    },

    /**
     * Get the index within the store of the Record with the passed id.
     *
     * Like #indexOf, this method is effected by filtering.
     *
     * @param {String} id The id of the Record to find.
     * @return {Number} The index of the Record. Returns -1 if not found.
     */
    indexOfId: function(id) {
        var data = this.data;

        return data ? data.indexOfKey(id) : null;
    },

    /**
     * Get the index within the entire dataset. From 0 to the totalCount.
     *
     * Like #indexOf, this method is effected by filtering.
     *
     * @param {Ext.data.Model} record The Ext.data.Model object to find.
     * @return {Number} The index of the passed Record. Returns -1 if not found.
     */
    indexOfTotal: function(record) {
        return this.getSource().indexOf(record);
    },

    getGrouper: function() {
        return null;
    },

    getGroups: function() {
        return null;
    },

    hasPendingLoad: function() {
        var store = this.getSource();

        return store ? store.hasPendingLoad() : false;
    },

    onUpdate: function(store, record, operation, modifiedFieldNames) {
        // Propagate the record's update event
        this.fireEvent('update', this, record, operation, modifiedFieldNames);
    },

    onDataChanged: function() {
        this.refreshData();
    },

    onIdChanged: function(store, rec, oldId, newId) {
        var data = this.data;

        if (data) {
            data.updateKey(rec, oldId);
        }
    },

    // Relay the groupschange event
    onGroupsChange: function(store, groupers) {
        if (!groupers || !groupers.length) {
            this.refreshData();
        }

        this.fireEvent('groupschange', store, groupers);
    },

    onGroupChange: function(store, grouper) {
        this.onGroupsChange(store, grouper ? [grouper] : null);
    },

    refreshData: function(forceStartCollapsed) {
        this.processStore(forceStartCollapsed);
        this.fireRefresh();
    },

    onBeforeLoad: function() {
        this.fireEvent('beforeload', this);
    },

    onLoad: function(store) {
        this.currentPage = store.currentPage;
        this.pageSize = store.pageSize;
        this.fireEvent('load', this);
    },

    privates: {
        doFireRefresh: function() {
            this.fireEvent('refresh', this);
        }
    }

}, function(GroupStore) {
    var target = GroupStore.prototype;

    // Within reason we want to mimic the Ext.data.Store interface
    Ext.each([
        // Collection
        'add', 'addFilter', 'addSorted', 'aggregate', 'average',
        'beginUpdate', 'clearFilter', 'clearGrouping', 'collect',
        'commitChanges', 'contains', 'count', 'createActiveRange',
        'each', 'enableBubble', 'endUpdate', 'filter', 'filterBy',
        'find', 'findBy', 'findExact', 'findRecord', 'flushLoad', 'getAsynchronousLoad',
        'getAutoLoad', 'getAutoSync', 'getBatchUpdateMode', 'getClearOnPageLoad',
        'getClearRemovedOnLoad', 'getFields', 'getFilters', 'getGroupDir',
        'getGroupField', 'getGrouper', 'getGroupers', 'getGroups', 'getModel',
        'getModifiedRecords', 'getNewRecords', 'getPageSize',
        'getProxy', 'getReloadOnClearSorters', 'getRemoteFilter',
        'getRemoteSort', 'getRemoteSummary', 'getRemovedRecords', 'getSession',
        'getSortOnLoad', 'getSorters', 'getStatefulFilters', 'getStoreId',
        'getSummaryRecord', 'getTrackRemoved', 'getUpdatedRecords',
        'group', 'insert', 'isFiltered', 'isGrouped', 'isLoaded',
        'isLoading', 'isSorted', 'load', 'loadData', 'loadPage',
        'loadRawData', 'loadRecords', 'max', 'min', 'nextPage', 'previousPage',
        'query', 'queryBy', 'rejectChanges', 'reload', 'remove', 'removeAll',
        'removeAt', 'removeFilters', 'resumeAutoSync', 'setAsynchronousLoad',
        'setAutoDestroy', 'setAutoLoad', 'setAutoSync', 'setBatchUpdateMode',
        'setClearOnPageLoad', 'setClearRemovedOnLoad', 'setFields', 'setFilters',
        'setFieldsSummaries', 'setFieldSummary', 'setGroupDir', 'setGroupField',
        'setGrouper', 'setGroupers', 'setModel', 'setPageSize', 'setProxy',
        'setReloadOnClearSorters', 'setRemoteFilters', 'setRemoteSort',
        'setRemoteSummary', 'setSession', 'setSortOnLoad', 'setSorters',
        'setStatefulFilters', 'setStoreId', 'setTrackRemoved', 'sort',
        'sum', 'suspendAutoSync', 'sync'
    ], function(name) {
        // We need Ext.each() to produce a new function closure per iteration...
        if (!target[name]) {
            target[name] = function() {
                var store = this.getSource();

                return store && store[name].apply(store, arguments);
            };
        }
    });
});
