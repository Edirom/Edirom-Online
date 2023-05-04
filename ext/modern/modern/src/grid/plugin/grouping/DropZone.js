/**
 * @private
 */
Ext.define('Ext.grid.plugin.grouping.DropZone', {
    extend: 'Ext.grid.HeaderDropZone',

    groups: 'groupHeaders',
    dropIndicator: Ext.baseCSSPrefix + 'grid-column-drop-indicator',

    grid: null,
    view: null,

    onDragMove: function(info) {
        var me = this,
            column = info.data.column,
            items = me.view.getItems(),
            len = items.length,
            ddManager = Ext.dd.Manager,
            targetCmp = ddManager.getTargetComp(info),
            ok = column && (me.grid === info.data.grid) &&
                (column.isGroupingPanelColumn || (column.isGridColumn && column.getGroupable())),
            index = -1,
            highlight, positionCls, targetInd, item, i;

        if (ok && column.isGridColumn) {
            // let's find out if it's already added
            for (i = 0; i < len; i++) {
                item = items.items[i];

                ok = ok && (item.getColumn() !== column);
            }
        }

        if (!ok) {
            if (me.ddEl) {
                me.removeDropMarker();
            }

            return;
        }

        targetInd = targetCmp;

        if (targetCmp === me.view) {
            if (items.length === 0) {
                highlight = 'before';
                index = 0;
            }
            else {
                targetInd = items.last();
                index = items.length;
                highlight = 'after';
            }
        }
        else {
            highlight = ddManager.getPosition(info, targetCmp, 'x');
        }

        positionCls = me.dropMarkerCls + '-' + highlight;

        if (targetInd.hasCls(positionCls)) {
            return;
        }

        if (me.ddEl) {
            me.removeDropMarker();
        }

        me.ddEl = targetInd;
        me.addDropMarker(targetInd, [me.dropIndicator, positionCls]);

        if (index < 0) {
            index = me.findNewIndex(targetCmp, highlight, info);
        }

        info.setData('index', index);
    },

    onDrop: function(info) {
        var me = this,
            data = info.data,
            column = data.column,
            source = data.panel,
            index = data.index,
            view = me.view;

        if (!me.ddEl || !view) {
            return;
        }

        me.removeDropMarker();

        view.dragDropColumn(source, column, index);
    },

    findNewIndex: function(overItem, pos, info) {
        var items = this.view.getItems(),
            index = items.indexOf(overItem),
            currentIndex = items.indexOf(info.data.column),
            prev = currentIndex >= 0 && currentIndex < index;

        if (pos === 'before') {
            index = prev ? index - 1 : index;
        }
        else {
            index = prev ? index : index + 1;
        }

        return index;
    }
});
