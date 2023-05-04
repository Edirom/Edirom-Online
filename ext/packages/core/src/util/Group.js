/**
 * Encapsulates a grouped collection of records within a {@link Ext.util.Collection}
 */
Ext.define('Ext.util.Group', {
    extend: 'Ext.util.Collection',

    isGroup: true,

    config: {
        /**
         * @cfg {Number} level
         * @readOnly
         *
         * The group level in the {@link Ext.util.GroupCollection} hierarchy.
         */
        level: 1,
        /**
         * @cfg {String} path
         * @readOnly
         *
         * This is the path to the group in the {@link Ext.util.GroupCollection} hierarchy.
         * The path is compound of all parent groups keys separated by the `pathSeparator`.
         */
        path: null,
        /**
         * @cfg {Object} data
         * @readOnly
         *
         * Custom data to set on this group. Check out `setCustomData` and `getCustomData` methods.
         */
        data: null,
        /**
         * @cfg {Ext.util.Grouper} grouper
         * @readOnly
         *
         * That's the grouper object used to generate this group.
         */
        grouper: null,
        /**
         * @cfg {String} label
         *
         * Group label
         */
        label: null,
        /**
         * @cfg {String} groupKey
         * @readOnly
         *
         * That's the group's key
         */
        groupKey: null,
        // similar to label
        groupValue: null,
        /**
         * @cfg {Ext.util.Group/Ext.util.GroupCollection}
         * @readOnly
         *
         * Reference to the parent group or the {@link Ext.util.GroupCollection}
         * if it's a top level group.
         */
        parent: null
    },

    /**
     * @private
     */
    pathSeparator: '<||>',

    // Group collections must have a higher priority than normal collections.  This ensures
    // that their endupdate handlers for filters and sorters run prior to the endupdate
    // handler of the store's main collection, and so when the user handles events such
    // as sort/datachanged, the groups have already been sorted and filtered.
    $endUpdatePriority: 2001,

    manageSorters: false,

    constructor: function(config) {
        this.callParent([config]);
        this.on('remove', 'onGroupItemsRemove', this);
    },

    destroy: function() {
        var parent = this.getParent(),
            groups;

        if (parent) {
            // remove us from the parent group
            if (parent.isGroup) {
                groups = parent.getGroups();
            }
            else if (parent.isGroupCollection) {
                groups = parent;
            }

            if (groups) {
                groups.remove(this);
            }
        }

        this.callParent();
    },

    clear: function() {
        var groups = this.getGroups(),
            length, i, ret;

        ret = this.callParent();

        if (groups) {
            length = groups.length;

            for (i = 0; i < length; i++) {
                groups.items[i].clear();
            }

            groups.clear();
        }

        return ret;
    },

    getData: function() {
        var data = this._data;

        if (!data) {
            data = {};
            this.setData(data);
        }

        return data;
    },

    /**
     * Set additional data for this group besides the label.
     *
     * @param property
     * @param value
     */
    setCustomData: function(property, value) {
        this.getData()[property] = value;
    },

    /**
     * Fetch custom data set for this group.
     *
     * @param property
     * @return {Object}
     */
    getCustomData: function(property) {
        return this.getData()[property];
    },

    updateLabel: function(label) {
        var me = this,
            grouper = me.getGrouper();

        if (grouper) {
            me.setCustomData(grouper.getProperty(), label);
        }
        else {
            me.setData({});
        }

        me.setGroupValue(label);
    },

    // we need this for compatibility with the old grouping functionality only
    getGrouper: function() {
        return this._grouper;
    },

    // to override the collection fn
    updateGrouper: Ext.emptyFn,

    updateSorters: function(sorters, oldSorters) {
        var children = this.getGroups(),
            length, i;

        this.callParent([sorters, oldSorters]);

        if (!children || this.ejectTime) {
            return;
        }

        length = children.length;

        for (i = 0; i < length; i++) {
            children.items[i].setSorters(sorters);
        }
    },

    updateGroupKey: function() {
        this.refreshPath();
    },

    updateParent: function() {
        this.refreshPath();
    },

    refreshPath: function() {
        var me = this,
            level = 1,
            parent, path;

        if (!me.refreshingPath) {
            me.refreshingPath = true;
            parent = me.getParent();
            path = me.getGroupKey();

            if (parent && parent.isGroup) {
                level += parent.getLevel();
                path = parent.getPath() + me.pathSeparator + path;
            }

            me.setLevel(level);
            me.setPath(path);
            me.refreshingPath = false;
        }
    },

    /**
     * Check if this group is the first group in its parent groups.
     * @return {Boolean}
     */
    isFirst: function() {
        var parent = this.getParent(),
            collection = parent ? (parent.isGroup ? parent.getGroups() : parent) : null,
            first = false;

        if (collection) {
            first = (collection.indexOf(this) === 0);
        }

        return first;
    },

    /**
     * Check if this group is the last group in its parent groups.
     * @return {Boolean}
     */
    isLast: function() {
        var parent = this.getParent(),
            collection = parent ? (parent.isGroup ? parent.getGroups() : parent) : null,
            last = false;

        if (collection) {
            last = (collection.indexOf(this) === collection.length - 1);
        }

        return last;
    },

    groupItems: function() {
        if (!this.ejectTime) {
            return this.callParent();
        }
    },

    sortItems: function() {
        if (!this.ejectTime) {
            return this.callParent();
        }
    },

    eject: function() {
        var me = this;

        me.ejectTime = Ext.now();
        me.setConfig({
            sorters: null,
            groupers: null,
            parent: null,
            grouper: null,
            groups: null
        });
    },

    privates: {
        /**
         * Returns true if the specified item can belong to this group.
         *
         * @param {Object} item
         * @return {Boolean}
         * @private
         */
        canOwnItem: function(item) {
            // we check the grouper result against the group key since
            // the group label could be different
            return this.getGroupKey() === this.getGrouper().getGroupString(item);
        },

        removeItems: function(items) {
            var groups = this.getGroups(),
                len = groups ? groups.length : 0,
                removeGroups = [],
                i, group;

            for (i = 0; i < len; ++i) {
                group = groups.items[i];
                group.remove(items);

                if (!group.length) {
                    removeGroups.push(group);
                }
            }

            if (removeGroups.length) {
                // empty groups should be removed
                groups.remove(removeGroups);
            }
        },

        onGroupItemsRemove: function(collection, info) {
            this.removeItems(info.items);
        }
    }

});
