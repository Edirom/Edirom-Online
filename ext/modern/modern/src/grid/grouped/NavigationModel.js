/**
 * Navigation model for the {@link Ext.grid.TreeGrouped} component
 * @private
 */
Ext.define('Ext.grid.grouped.NavigationModel', {
    extend: 'Ext.grid.NavigationModel',
    alias: 'navmodel.groupedgrid',

    groupHeaderSelector: '.' + Ext.baseCSSPrefix + 'grid-group-header-collapsible',

    privates: {
        onKeyEnter: function(e) {
            var me = this,
                l = me.location,
                groupHeader = e.getTarget(me.groupHeaderSelector),
                store = me.getView().store,
                info = (store && store.isMultigroupStore) ? store.getRenderData(l.record) : null;

            // Stop the keydown event so that an ENTER keyup does not get delivered to
            // any element which focus is transferred to in a click handler.
            e.stopEvent();

            if (info && (info.isGroup || info.isGroupSummary || info.isSummary)) {
                // we stop actionables on group header/footer
                if (groupHeader) {
                    // expand/collapse the group
                    store.doExpandCollapseByPath(info.group.getPath(), info.group.isCollapsed);
                }
            }
            else {
                me.callParent([e]);
            }
        }
    }
});
