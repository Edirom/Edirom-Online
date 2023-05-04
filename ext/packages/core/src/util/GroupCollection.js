/**
 * @private
 * A collection containing the result of applying grouping to the records in the store.
 */
Ext.define('Ext.util.GroupCollection', {
    extend: 'Ext.util.Collection',

    requires: [
        'Ext.util.Group',

        // Since Collection uses sub-collections of various derived types we step up to
        // list all the requirements of Collection. The idea being that instead of a
        // "requires" of Ext.util.Collection (which cannot pull everything) you instead
        // do a "requires" of Ext.util.GroupCollection and it will.
        'Ext.util.SorterCollection',
        'Ext.util.FilterCollection',
        'Ext.util.GrouperCollection'
    ],

    isGroupCollection: true,

    config: {
        grouper: null,
        groupConfig: null,
        itemRoot: null
    },

    observerPriority: -100,

    emptyGroupRetainTime: 300000, // Private timer to hang on to emptied groups. Milliseconds.

    rootProperty: '_data', // this is required by the sorter

    constructor: function(config) {
        this.emptyGroups = {};
        this.callParent([config]);
        this.on('remove', 'onGroupRemove', this);
    },

    /**
     * Returns the `Ext.util.Group` associated with the given record.
     *
     * @param {Object} item The item for which the group is desired.
     * @return {Ext.util.Group}
     * @since 6.5.0
     */
    getItemGroup: function(item) {
        var grouper = this.lastMonitoredGrouper,
            key, group;

        if (!grouper && this.items.length) {
            grouper = this.items[0].getGrouper();
        }

        if (grouper) {
            key = grouper.getGroupString(item);
            group = this.get(key);
        }

        return group;
    },

    /**
     * Find the group that matches the specified path or `false` if not found.
     *
     * @param {String} path Path to the group
     * @return {Ext.util.Group}
     */
    getByPath: function(path) {
        var paths = path ? String(path).split(Ext.util.Group.prototype.pathSeparator) : [],
            len = paths.length,
            items = this,
            group = false,
            i;

        if (!len) {
            group = items.get(path);
        }

        for (i = 0; i < len; i++) {
            if (!items || items.length === 0) {
                break;
            }

            group = items.get(paths[i]);

            if (group) {
                items = group.getGroups();
            }
        }

        return group || false;
    },

    /**
     * Find all groups that contain the specified item
     *
     * @param {Object} item
     * @return {Ext.util.Group[]}
     */
    getGroupsByItem: function(item) {
        var me = this,
            groups = [],
            length = me.items.length,
            i, group, children;

        if (item) {
            for (i = 0; i < length; i++) {
                group = me.items[i];

                if (group.indexOf(item) >= 0) {
                    groups.push(group);
                    children = group.getGroups();

                    if (children) {
                        /* eslint-disable-next-line max-len */
                        return Ext.Array.insert(groups, groups.length, children.getGroupsByItem(item));
                    }
                }
            }
        }

        return groups;
    },

    //-------------------------------------------------------------------------
    // Calls from the source Collection:

    onCollectionAdd: function(source, details) {
        if (!this.isConfiguring) {
            this.addItemsToGroups(source, details.items, details.at);
        }
    },

    onCollectionBeforeItemChange: function(source, details) {
        this.changeDetails = details;
    },

    onCollectionBeginUpdate: function() {
        this.beginUpdate();
    },

    onCollectionEndUpdate: function() {
        this.endUpdate();
    },

    onCollectionItemChange: function(source, details) {
        // Check if the change to the item caused the item to move. If it did, the group
        // ordering will be handled by virtue of being removed/added to the collection.
        // If not, check whether we're in the correct group and fix up if not.
        if (!details.indexChanged) {
            this.syncItemGrouping(source, details);
        }

        this.changeDetails = null;
    },

    onCollectionRefresh: function(source) {
        if (source.generation) {
            // eslint-disable-next-line vars-on-top
            var me = this,
                itemGroupKeys = me.itemGroupKeys = {},
                groupData, entries, groupKey, i, len, entry, j;

            me.groupersChanged = true;

            groupData = me.createEntries(source, source.items);
            entries = groupData.entries;

            // The magic of Collection will automatically update the group with its new
            // members.
            for (i = 0, len = entries.length; i < len; ++i) {
                entry = entries[i];

                // Will add or replace
                entry.group.splice(0, 1e99, entry.items);

                // Add item key -> group mapping for every entry
                for (j = 0; j < entry.items.length; j++) {
                    itemGroupKeys[source.getKey(entry.items[j])] = entry.group;
                }
            }

            // Remove groups to which we have not added items.
            entries = null;

            for (groupKey in me.map) {
                if (!(groupKey in groupData.groups)) {
                    (entries || (entries = [])).push(me.map[groupKey]);
                }
            }

            if (entries) {
                me.remove(entries);
            }

            // autoSort is disabled when adding new groups because
            // it relies on there being at least one record in the group
            me.sortItems();

            me.groupersChanged = false;
        }
    },

    onCollectionRemove: function(source, details) {
        var me = this,
            groupers = source.getGroupers(),
            changeDetails = me.changeDetails,
            itemGroupKeys = me.itemGroupKeys || (me.itemGroupKeys = {}),
            entries, entry, group, i, n, j, removeGroups, item;

        if (!groupers || !groupers.length) {
            return;
        }

        if (source.getCount()) {
            if (changeDetails) {
                // The item has changed, so the group key may be different, need
                // to look it up
                item = changeDetails.item || changeDetails.items[0];
                entries = me.createEntries(source, [item], false).entries;
                entries[0].group =
                    itemGroupKeys['oldKey' in details ? details.oldKey : source.getKey(item)];
            }
            else {
                entries = me.createEntries(source, details.items, false).entries;
            }

            for (i = 0, n = entries.length; i < n; ++i) {
                group = (entry = entries[i]).group;

                if (group) {
                    group.remove(entry.items);
                }

                // Delete any item key -> group mapping
                for (j = 0; j < entry.items.length; j++) {
                    delete itemGroupKeys[source.getKey(entry.items[j])];
                }

                if (group && !group.length) {
                    (removeGroups || (removeGroups = [])).push(group);
                }
            }
        }
        // Straight cleardown
        else {
            me.itemGroupKeys = {};
            removeGroups = me.items;

            for (i = 0, n = removeGroups.length; i < n; ++i) {
                removeGroups[i].clear();
            }
        }

        if (removeGroups) {
            me.remove(removeGroups);
        }
    },

    // If the SorterCollection instance is not changing, the Group will react to
    // changes inside the SorterCollection, but if the instance changes we need
    // to sync the Group to the new SorterCollection.
    onCollectionSort: function(source) {
        // sorting the collection effectively sorts the items in each group...
        var me = this,
            sorters = source.getSorters(false),
            items, length, i, group;

        if (sorters) {
            items = me.items;
            length = me.length;

            for (i = 0; i < length; ++i) {
                group = items[i];

                if (group.getSorters() === sorters) {
                    group.sortItems();
                }
                else {
                    group.setSorters(sorters);
                }
            }
        }
    },

    onCollectionUpdateKey: function(source, details) {
        if (!details.indexChanged) {
            details.oldIndex = source.indexOf(details.item);
            this.syncItemGrouping(source, details);
        }
    },

    onCollectionGroupersChanged: function(source) {
        var me = this,
            groupers = source.getGroupers(),
            grouper;

        if (groupers.length > 0) {
            grouper = groupers.items[0];
            me.changeSorterFn(grouper);

            if (me.lastMonitoredGrouper) {
                me.lastMonitoredGrouper.removeObserver(me);
            }

            me.lastMonitoredGrouper = grouper;
            grouper.addObserver(me);
        }
        else {
            me.removeAll();
        }
    },

    onGrouperDirectionChange: function(grouper) {
        // if the grouper changes its direction then we need to sort again our groups
        this.changeSorterFn(grouper);
        this.onEndUpdateSorters(this.getSorters());
    },

    onEndUpdateSorters: function(sorters) {
        var me = this,
            was = me.sorted,
            is = (me.grouped && me.getAutoGroup()) ||
                (me.getAutoSort() && sorters && sorters.length > 0);

        if (was || is) {
            // ensure flag property is a boolean.
            // sorters && (sorters.length > 0) may evaluate to null
            me.sorted = !!is;
            me.onSortChange(sorters);
        }
    },

    //-------------------------------------------------------------------------
    // Private

    changeSorterFn: function(grouper) {
        var me = this,
            sorters = me.getSorters(),
            // this group collection needs to be sorted
            sorter = {
                root: me.getRootProperty()
            };

        sorter.direction = grouper.getDirection();

        if (grouper) {
            sorter.id = grouper.getProperty();

            if (grouper.initialConfig.sorterFn) {
                sorter.sorterFn = grouper.initialConfig.sorterFn;
            }
            else {
                sorter.property = grouper.getSortProperty() || grouper.getProperty();
            }
        }

        if (sorter.property || sorter.sorterFn) {
            if (sorters.length === 0) {
                sorters.add(sorter);
            }
            else {
                sorters.items[0].setConfig(sorter);
            }
        }
        else {
            sorters.clear();
        }
    },

    addItemsToGroups: function(source, items, at, oldIndex) {
        var me = this,
            itemGroupKeys = me.itemGroupKeys || (me.itemGroupKeys = {}),
            entries = me.createEntries(source, items).entries,
            index = -1,
            sourceStartIndex, entry, i, len, j, group, firstIndex, item;

        for (i = 0, len = entries.length; i < len; ++i) {
            entry = entries[i];
            group = entry.group;

            // A single item moved - from onCollectionItemChange
            if (oldIndex || oldIndex === 0) {
                item = items[0];

                if (group.getCount() > 0 && source.getSorters().getCount() === 0) {
                    // We have items in the group & it's not sorted, so find the
                    // correct position in the group to insert.
                    firstIndex = source.indexOf(group.items[0]);

                    if (oldIndex < firstIndex) {
                        index = 0;
                    }
                    else {
                        index = oldIndex - firstIndex;
                    }
                }

                if (index === -1) {
                    group.add(item);
                }
                else {
                    group.insert(index, item);
                }
            }
            else {
                if (me.length > 1 && at) {
                    sourceStartIndex = source.indexOf(entries[0].group.getAt(0));
                    at = Math.max(at - sourceStartIndex, 0);
                }

                entry.group.insert(at != null ? at : group.items.length, entry.items);

                // Add item key -> group mapping
                for (j = 0; j < entry.items.length; j++) {
                    itemGroupKeys[source.getKey(entry.items[j])] = entry.group;
                }
            }
        }

        // autoSort is disabled when adding new groups because
        // it relies on there being at least one record in the group
        me.sortItems();
    },

    createEntries: function(source, items, createGroups) {
        // Separate the items out into arrays by group
        var me = this,
            groups = {},
            entries = [],
            groupers = source.getGroupers().getRange(),
            grouper, entry, group, groupKey, i, item, len;

        if (groupers.length) {
            grouper = groupers.shift();
            groupers = groupers.length ? Ext.clone(groupers) : null;

            for (i = 0, len = items.length; i < len; ++i) {
                groupKey = grouper.getGroupString(item = items[i]);

                if (!(entry = groups[groupKey])) {
                    group = me.getGroup(source, item, grouper, groupers, createGroups);

                    entries.push(groups[groupKey] = entry = {
                        group: group,
                        items: []
                    });
                }

                // Collect items to add/remove for each group
                // which has items in the array
                entry.items.push(item);
            }
        }

        return {
            groups: groups,
            entries: entries
        };
    },

    syncItemGrouping: function(source, details) {
        var me = this,
            itemGroupKeys = me.itemGroupKeys || (me.itemGroupKeys = {}),
            item = details.item,
            groupers = source.getGroupers().getRange(),
            grouper,
            oldKey,
            itemKey,
            oldGroup,
            group;

        if (!groupers.length) {
            return;
        }

        grouper = groupers.shift();
        groupers = groupers.length ? Ext.clone(groupers) : null;

        itemKey = source.getKey(item);
        oldKey = 'oldKey' in details ? details.oldKey : itemKey;

        // The group the item was in before the change took place.
        oldGroup = itemGroupKeys[oldKey];

        // Look up/create the group into which the item now must be added.
        group = me.getGroup(source, item, grouper, groupers);

        details.group = group;
        details.oldGroup = oldGroup;
        details.groupChanged = (group !== oldGroup);

        // The change did not cause a change in group
        if (group === oldGroup) {
            // Inform group about change
            oldGroup.itemChanged(item, details.modified, details.oldKey, details);
        }
        else {
            // Remove from its old group if there was one.
            if (oldGroup) {
                // Ensure Group knows about any unknown key changes, or item will not be removed.
                oldGroup.updateKey(item, oldKey, itemKey);
                oldGroup.remove(item);

                // Queue newly empy group for destruction.
                if (!oldGroup.length) {
                    me.remove(oldGroup);
                }
            }

            // Add to new group
            me.addItemsToGroups(source, [item], null, details.oldIndex);
        }

        // Keep item key -> group mapping up to date
        delete itemGroupKeys[oldKey];
        itemGroupKeys[itemKey] = group;
    },

    getGroup: function(source, item, grouper, groupers, createGroups) {
        var me = this,
            key = grouper.getGroupString(item),
            prop = grouper.getSortProperty(),
            root = grouper.getRoot(),
            group = me.get(key),
            autoSort = me.getAutoSort(),
            label;

        if (group) {
            group.setSorters(source.getSorters());

            if (me.groupersChanged) {
                // if the groupers changed then we need to update the groupers on the existing group
                label = group.getLabel();
                group.setLabel(null);
                group.setGroupers(groupers);
                group.setGrouper(grouper);
                group.setParent(source.isGroup ? source : me);
                group.setLabel(label);
            }
        }
        else if (createGroups !== false) {
            group = me.emptyGroups[key];

            if (group && group.destroyed) {
                delete me.emptyGroups[key];
                group = null;
            }

            if (group) {
                group.setLabel(null);
            }
            else {
                group = Ext.create(Ext.apply({
                    xclass: 'Ext.util.Group',
                    groupConfig: me.getGroupConfig()
                }, me.getGroupConfig()));
            }

            me.setAutoSort(false);

            group.setConfig({
                groupKey: key,
                grouper: grouper,
                groupers: groupers,
                label: key,
                rootProperty: me.getItemRoot(),
                sorters: source.getSorters(),
                autoSort: autoSort,
                autoGroup: me.getAutoGroup(),
                parent: source.isGroup ? source : me
            });

            group.ejectTime = null;
            me.add(group);
            me.setAutoSort(autoSort);

            if (prop) {
                group.setCustomData(prop, (root ? item[root] : item)[prop]);
            }
        }

        return group;
    },

    getKey: function(item) {
        return item.getGroupKey();
    },

    createSortFn: function() {
        return this.getSorters().getSortFn();
    },

    // override the collection fn
    getGrouper: function() {
        return this.lastMonitoredGrouper;
    },

    // override the collection fn
    updateGrouper: Ext.emptyFn,

    updateAutoGroup: function(autoGroup) {
        var len = this.length,
            i;

        // the group collection is not grouped but sorting could be
        // disabled when autoGroup is false in the source Collection
        this.setAutoSort(autoGroup);

        for (i = 0; i < len; i++) {
            this.items[i].setAutoGroup(autoGroup);
        }

        // Important to call this so it can clear the .sorted flag
        // as needed
        this.onEndUpdateSorters(this._sorters);
    },

    destroy: function() {
        var me = this,
            grouper = me.lastMonitoredGrouper;

        if (grouper) {
            grouper.removeObserver(me);
        }

        me.$groupable = null;

        // Ensure group objects get destroyed, they may have
        // added listeners to the main collection sorters.
        me.destroyGroups(me.items);
        Ext.undefer(me.checkRemoveQueueTimer);
        me.callParent();
    },

    privates: {
        destroyGroups: function(groups) {
            var len = groups.length,
                i;

            for (i = len - 1; i >= 0; i--) {
                groups[i].destroy();
            }
        },

        onGroupRemove: function(collection, info) {
            var me = this,
                groups = info.items,
                emptyGroups = me.emptyGroups,
                len, group, i;

            groups = Ext.Array.from(groups);

            for (i = 0, len = groups.length; i < len; i++) {
                group = groups[i];

                group.eject();
                emptyGroups[group.getGroupKey()] = group;
            }

            // Removed empty groups are reclaimable by getGroup for
            // emptyGroupRetainTime milliseconds
            me.checkRemoveQueue();
        },

        checkRemoveQueue: function() {
            var me = this,
                emptyGroups = me.emptyGroups,
                groupKey, group, reschedule;

            for (groupKey in emptyGroups) {
                group = emptyGroups[groupKey];

                if (!group || group.destroyed) {
                    delete emptyGroups[groupKey];
                }
                // If the group's retain time has expired, destroy it.
                else if (!group.length && Ext.now() - group.ejectTime > me.emptyGroupRetainTime) {
                    Ext.destroy(group);
                    delete emptyGroups[groupKey];
                }
                else {
                    reschedule = true;
                }
            }

            // Still some to remove in the future. Check back in emptyGroupRetainTime
            if (reschedule) {
                Ext.undefer(me.checkRemoveQueueTimer);
                me.checkRemoveQueueTimer =
                    Ext.defer(me.checkRemoveQueue, me.emptyGroupRetainTime, me);
            }
        }
    }
});
