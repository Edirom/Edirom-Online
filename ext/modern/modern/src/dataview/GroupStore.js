/**
 * This specialized type of Store is created by a `list` or `grid` when the `collapsed`
 * config is specified. It presents a view of the underlying store with the records in
 * collapsed groups replaced by a placeholder.
 * @private
 */
Ext.define('Ext.dataview.GroupStore', {
    extend: 'Ext.data.ChainedStore',

    isGroupStore: true,

    syncSourceGrouping: true,

    /*
                                     +-----------------+
                               +---->| GroupCollection |
                              /      +-----------------+
            +------------+   /              ^   |
            | GroupStore |--+               :   |
            +------------+   \              :   v
                 ^ | ^        \         +------------+      +------------------+
                 : | :         +------->| Collection |----->| SorterCollection |
                 : | :................. +------------+      +------------------+
                 : |                        ^   |                   ^  |
        observer : | source                 :   |                   :  |
                 : |                        :   v                   :  v
                 : | .................. +------------+      +------------------+
                 : | :         +------->| Collection |----->| SorterCollection |
                 : v v        /         +------------+      +------------------+
               +-------+     /              :   ^
               | Store |----+               :   |
               +-------+     \              v   |
                              \      +-----------------+
                               +---->| GroupCollection |
                                     +-----------------+
     */

    getRootSource: function() {
        var source = this.source;

        while (source && source.getSource) {
            source = source.getSource();
        }

        return source;
    },

    getTotalCount: function() {
        return this.getRootSource().getTotalCount();
    },

    /**
     * @method load
     * @inheritdoc Ext.data.ProxyStore#load
     */
    load: function(options) {
        var source = this.getRootSource();

        if (!source) {
            return;
        }

        return source.load.apply(source, arguments);
    },

    /**
     * @method loadPage
     * @inheritdoc Ext.data.ProxyStore#loadPage
     */
    loadPage: function(page, options) {
        var me = this,
            source = this.getRootSource();

        me.currentPage = page;

        if (!source) {
            return;
        }

        return source.loadPage.apply(source, arguments);
    },

    /**
     * @method sync
     * @inheritdoc Ext.data.ProxyStore#sync
     */
    sync: function(options) {
        var source = this.getRootSource();

        //<debug>
        if (!source) {
            Ext.raise('Cannot sync records with no source.');
        }
        //</debug>

        return source.sync.apply(source, arguments);
    },

    /**
     * @method erase
     * @inheritdoc Ext.data.ProxyStore#erase
     */
    erase: function(options) {
        var source = this.getRootSource();

        //<debug>
        if (!source) {
            Ext.raise('Cannot erase records with no source.');
        }
        //</debug>

        return source.erase.apply(source, arguments);
    },

    /**
     * Loads the next 'page' in the current data set
     * @param {Object} options See options for {@link #method-load}
     */
    nextPage: function(options) {
        this.loadPage(this.currentPage + 1, options);
    },

    /**
     * Loads the previous 'page' in the current data set
     * @param {Object} options See options for {@link #method-load}
     */
    previousPage: function(options) {
        this.loadPage(this.currentPage - 1, options);
    },

    setGrouper: function(grouper) {
        var me = this,
            source = me.getSource();

        if (source && grouper !== source.getGrouper()) {
            source.setGrouper(grouper);

            grouper = source.getGrouper();
        }

        me.callParent([ grouper ]);

        me.refreshFromSource();
    },

    constructDataCollection: function() {
        var me = this,
            collection = me.callParent();

        // This maintains the indirection via name unlike "...bind(me)":
        collection.transformItems = function(items) {
            return me.transformItems(collection, items);
        };

        return collection;
    },

    createFiltersCollection: function() {
        return this.getSource().getFilters();
    },

    refreshFromSource: function() {
        var data = this.getData(),
            list = this.list,
            was = list.getScrollToTopOnRefresh();

        list.setScrollToTopOnRefresh(false);

        data.onCollectionRefresh(data.getSource());

        list.setScrollToTopOnRefresh(was);
    },

    transformItems: function(collection, records) {
        var me = this,
            n = records.length,
            list = me.list,
            collapser = list.isGrouping() && list.getCollapsible(),
            ret = records,
            groupMap = {},
            source = me.getSource(),
            M = source.getModel(),
            groupField = collapser && source.getGrouper().getProperty(),
            collapsed, copy, group, groupKey, i, placeholder, rec, sourceGroups, srcGroup,
            startCollapsed;

        if (collapser) {
            sourceGroups = collection.getSource().getGroups();
            startCollapsed = collapser.getCollapsed();

            for (i = 0; i < n; ++i) {
                rec = records[i];
                srcGroup = sourceGroups.getItemGroup(rec);
                group = list.groupFrom(groupKey = srcGroup.getGroupKey());
                collapsed = group ? group.collapsed : startCollapsed;

                if (collapsed) {
                    if (!copy) {
                        copy = ret = records.slice(0, i);
                    }

                    if (!groupMap[groupKey]) {
                        if (!(placeholder = srcGroup.placeholderRec)) {
                            srcGroup.placeholderRec = placeholder = new M();

                            placeholder.data[groupField] = placeholder.$groupKey = groupKey;
                            placeholder.$groupValue = srcGroup.getGroupValue();
                            placeholder.$collapsedGroupPlaceholder = true;
                            placeholder.$srcGroup = srcGroup;
                        }

                        groupMap[groupKey] = placeholder;

                        copy.push(placeholder);
                    }
                }
                else if (copy) {
                    copy.push(rec);
                }
            }
        }

        return ret;
    },

    updateSource: function(source, oldSource) {
        var me = this;

        if (source) {
            me.list.store = me;
        }

        if (oldSource && !oldSource.destroyed && oldSource.getAutoDestroy()) {
            oldSource.destroy();
        }

        me.callParent([ source, oldSource ]);

        if (source && !me.destroying) {
            me.getSorters().setSource(source.getSorters());
        }
    }
});
