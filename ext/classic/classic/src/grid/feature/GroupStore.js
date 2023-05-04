/**
 * Private record store class which takes the place of the view's data store to provide a grouped
 * view of the data when the Grouping feature is used.
 *
 * Relays granular mutation events from the underlying store as refresh events to the view.
 *
 * On mutation events from the underlying store, updates the summary rows by firing update events
 * on the corresponding summary records.
 * @private
 */
Ext.define('Ext.grid.feature.GroupStore', {
    extend: 'Ext.util.Observable',

    isStore: true,

    // Number of records to load into a buffered grid before it has been bound to a view
    // of known size
    defaultViewSize: 100,

    // Use this property moving forward for all feature stores. It will be used to ensure
    // that the correct object is used to call various APIs. See EXTJSIV-10022.
    isFeatureStore: true,

    badGrouperKey: '[object Object]',

    constructor: function(groupingFeature, store) {
        var me = this;

        me.callParent();
        me.groupingFeature = groupingFeature;
        me.bindStore(store);

        // We don't want to listen to store events in a locking assembly.
        if (!groupingFeature.grid.isLocked) {
            me.bindViewStoreListeners();
        }
    },

    bindStore: function(store) {
        var me = this;

        if (!store || me.store !== store) {
            Ext.destroy(me.storeListeners);
            me.store = null;
        }

        if (store) {
            me.storeListeners = store.on({
                datachanged: me.onDataChanged,
                groupchange: me.onGroupChange,
                idchanged: me.onIdChanged,
                update: me.onUpdate,
                scope: me,
                destroyable: true
            });

            me.store = store;
            me.processStore(store);
        }
    },

    bindViewStoreListeners: function() {
        var view = this.groupingFeature.view,
            listeners = view.getStoreListeners(this);

        listeners.scope = view;

        this.on(listeners);
    },

    each: function(fn, scope, includeOptions) {
        this.store.each(fn, scope, includeOptions);
    },

    getGroupedRecords: function(store, collapseAll) {
        var me = this,
            feature = me.groupingFeature,
            groups = store.getGroups(),
            groupCount = groups ? groups.length : 0,
            groupField = store.getGroupField(),
            group, grouper, i, key, metaGroup, records;

        if (!groupCount) {
            return store.getRange();
        }

        for (i = 0, records = []; i < groupCount; i++) {
            group = groups.getAt(i);

            // Cache group information by group name.
            key = group.getGroupKey();

            // If there is no store grouper and the groupField looks up a complex data type,
            // the store will stringify it and the group name will be '[object Object]'.
            // To fix this, groupers can be defined in the feature config, so we'll
            // simply do a lookup here and re-group the store.
            //
            // Note that if a grouper wasn't defined on the feature that we'll just default
            // to the old behavior and still try to group.
            // eslint-disable-next-line max-len
            if (me.badGrouperKey === key && (grouper = feature.getGrouper(groupField))) {
                // We must reset the value because store.group() will call
                // into processStore again!
                store.getGroups().remove(group);
                feature.startCollapsed = collapseAll;
                store.group(grouper);

                return null; // signal processStore to return as well
            }

            metaGroup = feature.getMetaGroup(group);

            // This is only set at initialization time to handle startCollapsed
            if (collapseAll) {
                metaGroup.isCollapsed = collapseAll;
            }

            // Collapsed group - add the group's placeholder.
            if (metaGroup.isCollapsed) {
                records.push(metaGroup.placeholder);
            }
            // Expanded group - add the group's child records.
            else {
                records.push.apply(records, group.items);
            }
        }

        return records;
    },

    processStore: function(store) {
        var me = this,
            feature = me.groupingFeature,
            data = me.data,
            refreshed = false,
            collapseAll, i, records;

        if (!data) {
            me.data = data = new Ext.util.Collection({
                rootProperty: 'data',
                extraKeys: {
                    byInternalId: {
                        property: 'internalId',
                        rootProperty: ''
                    }
                }
            });
        }

        if (store.getCount()) {
            // When loading or paging, our two counts (store.loadCount and feature.storeLoadCount)
            // will not match so we apply the startCollapsed setting and use to what was set in the
            // initial config. After loading/paging our two counts will match so when we change data
            // on the page (and process the store again) we do not expand or collapse any of the
            // groups and things look/work as expected.
            if (store.getId() !== feature.previousStoreId ||
                feature.storeLoadCount !== store.loadCount) {
                feature.storeLoadCount = store.loadCount;
                feature.previousStoreId = store.getId();
                collapseAll = feature.startCollapsed;
            }

            records = me.getGroupedRecords(store, collapseAll);

            // If we have the same number of records that we had before, see if they are
            // exactly the same records.
            if (records) {
                for (i = data.length, refreshed = i !== records.length; !refreshed && i-- > 0;) {
                    refreshed = data.items[i] !== records[i];
                }

                if (refreshed) {
                    if (data.length) {
                        data.clear();
                    }

                    if (records.length) {
                        data.add(records);
                    }
                }
            }
        }
        else if (data.length) {
            data.clear();
            refreshed = true;
        }

        return refreshed;
    },

    isCollapsed: function(name) {
        return this.groupingFeature.getCache()[name].isCollapsed;
    },

    isLoading: function() {
        return false;
    },

    getData: function() {
        return this.data;
    },

    getCount: function() {
        return this.data.getCount();
    },

    getTotalCount: function() {
        return this.data.getCount();
    },

    first: function() {
        var data = this.data,
            item = null;

        if (data) {
            item = data.first();

            if (item && item.isCollapsedPlaceholder) {
                item = this.store.first();
            }
        }

        return item;
    },

    last: function() {
        var data = this.data,
            item = null;

        if (data) {
            item = data.last();

            if (item && item.isCollapsedPlaceholder) {
                item = this.store.last();
            }
        }

        return item;
    },

    // This class is only created for fully loaded, non-buffered stores
    rangeCached: function(start, end) {
        return end < this.getCount();
    },

    getRange: function(start, end, options) {
        // Collection's getRange is exclusive.
        // Do NOT mutate the value: it is passed to the callback.
        var result = this.data.getRange(start, Ext.isNumber(end) ? end + 1 : end);

        if (options && options.callback) {
            options.callback.call(options.scope || this, result, start, end, options);
        }

        return result;
    },

    getAt: function(index) {
        return this.data.getAt(index);
    },

    /**
     * Get the Record with the specified id.
     *
     * This method is not affected by filtering, lookup will be performed from all records
     * inside the store, filtered or not.
     *
     * @param {Mixed} id The id of the Record to find.
     * @return {Ext.data.Model} The Record with the passed id. Returns null if not found.
     */
    getById: function(id) {
        return this.store.getById(id);
    },

    /**
     * @private
     * Get the Record with the specified internalId.
     *
     * This method is not effected by filtering, lookup will be performed from all records
     * inside the store, filtered or not.
     *
     * @param {Mixed} internalId The id of the Record to find.
     * @return {Ext.data.Model} The Record with the passed internalId. Returns null if not found.
     */
    getByInternalId: function(internalId) {
        // Find the record in the base store.
        // If it was a placeholder, then it won't be there, it will be in our data Collection.
        return this.store.getByInternalId(internalId) || this.data.byInternalId.get(internalId);
    },

    expandGroup: function(group) {
        var me = this,
            groupingFeature = me.groupingFeature,
            lockingPartner = groupingFeature.lockingPartner,
            metaGroup, placeholder, startIdx, items;

        if (typeof group === 'string') {
            group = groupingFeature.getGroup(group);
        }

        if (group) {
            items = group.items;
            metaGroup = groupingFeature.getMetaGroup(group);
            placeholder = metaGroup.placeholder;
        }

        if (items.length && (startIdx = me.data.indexOf(placeholder)) !== -1) {
            // Any event handlers must see the new state
            metaGroup.isCollapsed = false;

            if (lockingPartner) {
                lockingPartner.getMetaGroup(group).isCollapsed = false;
            }

            me.isExpandingOrCollapsing = 1;

            // Remove the collapsed group placeholder record
            me.data.removeAt(startIdx);

            // Insert the child records in its place
            me.data.insert(startIdx, group.items);

            // Update views
            me.fireEvent('replace', me, startIdx, [placeholder], group.items);

            me.fireEvent('groupexpand', me, group);
            me.isExpandingOrCollapsing = 0;
        }
    },

    collapseGroup: function(group) {
        var me = this,
            groupingFeature = me.groupingFeature,
            lockingPartner = groupingFeature.lockingPartner,
            startIdx,
            placeholder,
            len, items;

        if (typeof group === 'string') {
            group = groupingFeature.getGroup(group);
        }

        if (group) {
            items = group.items;
        }

        if (items && (len = items.length) && (startIdx = me.data.indexOf(items[0])) !== -1) {
            // Any event handlers must see the new state
            groupingFeature.getMetaGroup(group).isCollapsed = true;

            if (lockingPartner) {
                lockingPartner.getMetaGroup(group).isCollapsed = true;
            }

            me.isExpandingOrCollapsing = 2;

            // Remove the group child records
            me.data.removeAt(startIdx, len);

            // Insert a placeholder record in their place
            me.data.insert(startIdx, placeholder = me.getGroupPlaceholder(group));

            // Update views
            me.fireEvent('replace', me, startIdx, items, [placeholder]);

            me.fireEvent('groupcollapse', me, group);
            me.isExpandingOrCollapsing = 0;
        }
    },

    getGroupPlaceholder: function(group) {
        var metaGroup = this.groupingFeature.getMetaGroup(group);

        if (!metaGroup.placeholder) {
            // eslint-disable-next-line vars-on-top, one-var
            var store = this.store,
                Model = store.getModel(),
                modelData = {},
                key = group.getGroupKey(),
                groupPlaceholder;

            modelData[store.getGroupField()] = key;
            groupPlaceholder = metaGroup.placeholder = new Model(modelData, store.session, true);
            groupPlaceholder.isNonData = groupPlaceholder.isCollapsedPlaceholder = true;

            // Adding the groupKey instead of storing a reference to the group
            // itself. The latter can cause problems if the store is reloaded and the referenced
            // group is lost. See EXTJS-18655
            groupPlaceholder.groupKey = key;
        }

        return metaGroup.placeholder;
    },

    // Find index of record in group store.
    // If it's in a collapsed group, then it's -1, not present
    indexOf: function(record) {
        var ret = -1;

        if (record && !record.isCollapsedPlaceholder) {
            ret = this.data.indexOf(record);
        }

        return ret;
    },

    contains: function(record) {
        return this.indexOf(record) > -1;
    },

    indexOfPlaceholder: function(record) {
        return this.data.indexOf(record);
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
        return this.data.indexOfKey(id);
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
        return this.store.indexOf(record);
    },

    onIdChanged: function(store, rec, oldId, newId) {
        this.data.updateKey(rec, oldId);
    },

    onUpdate: function(store, record, operation, modifiedFieldNames) {
        var me = this,
            groupingFeature = me.groupingFeature,
            group, metaGroup, firstRec, lastRec, items;

        // The grouping field value has been modified.
        // This could either move a record from one group to another, or introduce a new group.
        // Either way, we have to refresh the grid
        if (store.isGrouped()) {
            // Updating a single record, attach the group to the record for Grouping.setupRowData
            // to use.
            group = record.group = groupingFeature.getGroup(record);

            // Make sure that still we have a group and that the last member of it
            // wasn't just filtered. See EXTJS-18083.
            if (group) {
                metaGroup = groupingFeature.getMetaGroup(record);

                if (modifiedFieldNames &&
                    Ext.Array.contains(modifiedFieldNames, groupingFeature.getGroupField())) {
                    me.onDataChanged();
                    delete record.group;

                    return;
                }

                // Fire an update event on the collapsed metaGroup placeholder record
                if (metaGroup.isCollapsed) {
                    me.fireEvent('update', me, metaGroup.placeholder);
                }

                // Not in a collapsed group, fire update event on the modified record
                // and, if in a grouped store, on the first and last records in the group.
                else {
                    Ext.suspendLayouts();

                    // Propagate the record's update event
                    me.fireEvent('update', me, record, operation, modifiedFieldNames);

                    // Fire update event on first and last record in group (only once
                    // if a single row group)
                    // So that custom header TPL is applied, and the summary row is updated
                    items = group.items;
                    firstRec = items[0];
                    lastRec = items[items.length - 1];

                    // Fire an update on the first and last row in the group (ensure we don't refire
                    // update on the modified record). This is to give interested Features
                    // the opportunity to update the first item (a wrapped group header + data row),
                    // and last item (a wrapped data row + group summary)
                    if (firstRec !== record) {
                        firstRec.group = group;
                        me.fireEvent('update', me, firstRec, 'edit', modifiedFieldNames);
                        delete firstRec.group;
                    }

                    if (lastRec !== record && lastRec !== firstRec &&
                        groupingFeature.showSummaryRow) {
                        lastRec.group = group;
                        me.fireEvent('update', me, lastRec, 'edit', modifiedFieldNames);
                        delete lastRec.group;
                    }

                    Ext.resumeLayouts(true);
                }
            }

            delete record.group;
        }
        else {
            // Propagate the record's update event
            me.fireEvent('update', me, record, operation, modifiedFieldNames);
        }
    },

    // Relay the groupchange event
    onGroupChange: function(store, grouper) {
        if (!grouper) {
            this.processStore(store);
        }

        this.fireEvent('groupchange', store, grouper);
    },

    onDataChanged: function() {
        var me = this;

        if (me.processStore(me.store)) {
            me.fireEvent('refresh', me);
        }
    },

    destroy: function() {
        var me = this;

        me.bindStore(null);
        Ext.destroy(me.data);

        me.groupingFeature = null;

        me.callParent();
    }
});
