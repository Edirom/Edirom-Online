/**
 * @private
 */
Ext.define('Ext.grid.grouped.selection.Model', {
    extend: 'Ext.grid.selection.Model',
    alias: 'selmodel.groupedgrid',

    requires: [
        'Ext.grid.grouped.selection.Rows',
        'Ext.grid.grouped.selection.Records'
    ],

    isGroupedGridSelectionModel: true,

    selection: {
        type: 'groupedrecords'
    },

    getSelection: function(what, reset) {
        var result, config;

        // The two are interchangeable, to callers, but virtual stores use
        // row range selection as opposed to record collection.
        if (what === 'rows' || what === 'records') {
            what = 'grouped' + (this.getStore().isVirtualStore ? 'rows' : 'records');
        }

        result = this.callParent();

        // If called with a required type, ensure that the selection object
        // is of that type.
        if (what) {
            what = what.toLowerCase();

            if (!result || result.type !== what) {
                config = {
                    type: what
                };

                if (what === 'records') {
                    config.selected = this.getSelected();
                }

                this.setSelection(config);
                result = this.callParent();
            }
            else if (reset) {
                result.clear(true);
            }
        }

        return result;
    },

    privates: {
        applySelection: function(selection, oldSelection) {
            var store;

            if (oldSelection) {
                // Reconfigure if type not changing
                if (oldSelection.type === selection.type) {
                    oldSelection.setConfig(selection);

                    return oldSelection;
                }

                Ext.destroy(oldSelection);
            }

            if (selection) {
                store = this.getStore();

                selection = Ext.Factory.selection(Ext.apply({
                    selectionModel: this,
                    type: 'grouped' + ((store && store.isVirtualStore) ? 'rows' : 'records'),
                    selected: this.getSelected()
                }, selection));
            }

            return selection;
        }
    }
});
