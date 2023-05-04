/**
 * @private
 */
Ext.define('Ext.grid.feature.AdvancedGroupStore', {
    extend: 'Ext.grid.AdvancedGroupStore',

    config: {
        view: null,
        gridLocked: false
    },

    fireReplaceEvent: true,

    // Number of records to load into a buffered grid before it has been
    // bound to a view of known size
    defaultViewSize: 100,

    // Use this property moving forward for all feature stores. It will be used to ensure
    // that the correct object is used to call various APIs. See EXTJSIV-10022.
    isFeatureStore: true,

    destroy: function() {
        Ext.destroy(this.viewListeners);
        this.callParent();
    },

    updateSource: function(store, oldStore) {
        var me = this;

        if (!me.getGridLocked()) {
            me.bindViewStoreListeners();
        }

        me.callParent([store, oldStore]);
    },

    bindViewStoreListeners: function() {
        var me = this,
            view = me.getView(),
            listeners = view.getStoreListeners(me);

        listeners.scope = view;
        listeners.destroyable = true;

        Ext.destroy(me.viewListeners);

        me.viewListeners = me.on(listeners);
    }
});
