/**
 * @private
 */
Ext.define('Ext.grid.grouped.selection.Records', {
    extend: 'Ext.dataview.selection.Records',
    alias: 'selection.groupedrecords',

    /**
     * @return {Number} The row index of the first row in the range or zero if no range.
     */
    getFirstRowIndex: function() {
        return this.getCount() ? this.view.store.indexOf(this.getSelected().first()) : 0;
    },

    /**
     * @return {Number} The row index of the last row in the range or -1 if no range.
     */
    getLastRowIndex: function() {
        return this.getCount() ? this.view.store.indexOf(this.getSelected().last()) : -1;
    },

    privates: {
        addRecordRange: function(start, end) {
            var tmp = end;

            if (start > end) {
                end = start;
                start = tmp;
            }

            this.getSelected().add(this.view.store.getRange(start, end || start));
        },

        removeRecordRange: function(start, end) {
            var tmp = end;

            if (start > end) {
                end = start;
                start = tmp;
            }

            this.getSelected().remove(this.view.store.getRange(start, end || start));
        },

        getContiguousSelection: function() {
            var store = this.view.store,
                selection, len, i;

            selection = Ext.Array.sort(this.getSelected().getRange(), function(r1, r2) {
                return store.indexOf(r1) - store.indexOf(r2);
            });
            len = selection.length;

            if (len) {
                if (len === 1 && store.indexOf(selection[0]) === -1) {
                    return false;
                }

                for (i = 1; i < len; i++) {
                    if (store.indexOf(selection[i]) !== store.indexOf(selection[i - 1]) + 1) {
                        return false;
                    }
                }

                return [store.indexOf(selection[0]), store.indexOf(selection[len - 1])];
            }
        },

        refresh: function() {
            var me = this,
                view = me.view,
                selModel = me.getSelectionModel(),
                storeCollection = view.store.getData(),
                filterFn = storeCollection.getFilters().getFilterFn(),
                ignoredFilter = selModel.ignoredFilter,
                selected = me.getSelected(),
                lastSelected = selModel.getLastSelected(),
                newLastSelected,
                selections,
                toDeselect = [],
                toReselect = [],
                selectionLength, i, rec,
                matchingSelection;

            // Uncover the unfiltered selection if it's there.
            // We only want to prune from the selection records which are
            // *really* no longer in the store.
            if (ignoredFilter) {
                if (ignoredFilter.getDisabled()) {
                    ignoredFilter = null;
                }
                else {
                    ignoredFilter.setDisabled(true);
                    storeCollection = storeCollection.getSource() || storeCollection;
                }
            }

            // Update the lastSelected instance with the new version from the store if any.
            if (lastSelected) {
                newLastSelected = storeCollection.get(storeCollection.getKey(lastSelected));

                // We are using the unfiltered source collection, so we must
                // filter using all filters except the ignored filter.
                // This is to accommodate a ComboBox's primaryFilter which must not
                // evict selected records from the selection.
                if (newLastSelected && ignoredFilter && !filterFn(newLastSelected)) {
                    newLastSelected = null;
                }
            }

            // If there is a current selection, build the toDeselect and toReselect lists
            if (me.getCount()) {
                selections = selected.getRange();
                selectionLength = selections.length;

                for (i = 0; i < selectionLength; i++) {
                    rec = selections[i];
                    matchingSelection = storeCollection.get(storeCollection.getKey(rec));

                    // If we are using the unfiltered source because of having to ignore only one
                    // filter, then test the filter condition here with that one filter disabled.
                    // Evict the record if it still does not pass the filter.
                    if (matchingSelection && ignoredFilter && !filterFn(matchingSelection)) {
                        matchingSelection = null;
                    }

                    if (matchingSelection) {
                        if (matchingSelection !== rec) {
                            toDeselect.push(rec);
                            toReselect.push(matchingSelection);
                        }
                    }
                    else {
                        toDeselect.push(rec);
                    }
                }

                // Give the view an opportunity to intervene in the selection model refresh.
                // BoundLists remove any interactively added "isEntered" records from the
                // toDeselect array because they are outside the scope of the field's
                // supplied Store.
                if (view.beforeSelectionRefresh) {
                    view.beforeSelectionRefresh(toDeselect, toReselect);
                }

                // Update the selected Collection.
                // Records which are no longer present will be in the toDeselect list
                // Records which have the same id which have returned will be in the toSelect list.
                // The SelectionModel will react to successful removal as an observer.
                // It will need to know at that time whether the event is suppressed.
                selected.suppressEvent = true;
                selected.splice(selected.getCount(), toDeselect, toReselect);
                selected.suppressEvent = false;
            }

            if (ignoredFilter) {
                ignoredFilter.setDisabled(false);
            }

            // Keep any lastSelected up to date with what's now in the store
            selModel.setLastSelected(newLastSelected || toReselect[toReselect.length - 1] || null);
        }

    }
});
