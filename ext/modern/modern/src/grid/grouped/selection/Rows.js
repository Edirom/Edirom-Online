/**
 * @private
 */
Ext.define('Ext.grid.grouped.selection.Rows', {
    extend: 'Ext.dataview.selection.Rows',
    alias: 'selection.groupedrows',

    isSelected: function(record) {
        var me = this,
            ranges = me.getSelected().spans,
            len = ranges.length,
            recIndex, range, i;

        recIndex = record.isEntity ? me.view.store.indexOf(record) : record;

        for (i = 0; i < len; i++) {
            range = ranges[i];

            if (recIndex >= range[0] && recIndex < range[1]) {
                return true;
            }
        }

        return false;
    },

    eachCell: function(fn, scope) {
        var me = this,
            selection = me.getSelected(),
            view = me.view,
            columns = view.ownerGrid.getVisibleColumnManager().getColumns(),
            range = me.dragRange,
            colCount,
            i,
            j,
            location,
            recCount,
            abort = false;

        if (columns) {
            colCount = columns.length;
            location = new Ext.grid.Location(view);

            // Use Collection#each instead of copying the entire dataset into an array and
            // iterating that.
            if (selection) {
                me.eachRow(function(recordIndex) {
                    location.setItem(recordIndex);

                    for (i = 0; i < colCount; i++) {
                        location.setColumn(columns[i]);

                        // eslint-disable-next-line max-len
                        if (fn.call(scope || me, location, location.columnIndex, location.recordIndex) === false) {
                            abort = true;

                            return false;
                        }
                    }
                });
            }

            // If called during a drag select, or SHIFT+arrow select, include the drag range
            if (!abort && range != null) {
                me.view.store.getRange(range[0], range[1], {
                    forRender: false,
                    callback: function(records) {
                        recCount = records.length;

                        for (i = 0; !abort && i < recCount; i++) {
                            location.setItem(records[i]);

                            for (j = 0; !abort && j < colCount; j++) {
                                location.setColumn(columns[j]);

                                // eslint-disable-next-line max-len
                                if (fn.call(scope || me, location, location.columnIndex, location.recordIndex) === false) {
                                    abort = true;
                                }
                            }
                        }
                    }
                });
            }
        }
    }

});
