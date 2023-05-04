/**
 * @private
 */
Ext.define('Ext.grid.plugin.header.DropZone', {
    extend: 'Ext.grid.HeaderDropZone',

    groups: 'groupHeaders',
    dropIndicator: Ext.baseCSSPrefix + 'grid-column-drop-indicator',

    grid: null,
    view: null,

    onDragMove: function(info) {
        var me = this,
            ddManager = Ext.dd.Manager,
            targetCmp = ddManager.getTargetComp(info),
            isDragTarget = targetCmp.isDragColumn,
            sourceCmp = ddManager.getSourceComp(info),
            notHeader = !targetCmp.isHeaderContainer ||
                !(sourceCmp.isHeaderContainer || sourceCmp.isGroupingPanelColumn),
            highlight, positionCls;

        // Return on same column, not a column, on drag indicator column
        // or on header end if space is available
        if (notHeader || targetCmp === sourceCmp || isDragTarget ||
            targetCmp.getParent() === me.view) {
            if (this.ddEl) {
                this.removeDropMarker();
            }

            return;
        }

        highlight = ddManager.getPosition(info, targetCmp, 'x');
        positionCls = me.dropMarkerCls + '-' + highlight;

        if (targetCmp.hasCls(positionCls)) {
            return;
        }

        if (this.ddEl) {
            this.removeDropMarker();
        }

        if (targetCmp.isGroupsColumn && highlight === 'before') {
            return;
        }

        if (me.isValidDrag(targetCmp, sourceCmp)) {
            me.ddEl = targetCmp;
            me.addDropMarker(targetCmp, [me.dropIndicator, positionCls]);
        }
    },

    onDrop: function(info) {
        var me = this,
            data = info.data,
            groupingPanel = data && data.panel,
            dropMethod = 'insertBefore',
            ddManager, targetCmp, headerCt,
            sourceCmp, dropAt, position,
            relativeToItem, fromCtRoot, fromIdx,
            sourceCmpParent, groupColumn;

        if (!me.ddEl) {
            return;
        }

        ddManager = Ext.dd.Manager;
        targetCmp = ddManager.getTargetComp(info);
        headerCt = targetCmp.getParent() || targetCmp.getRootHeaderCt();
        sourceCmp = ddManager.getSourceComp(info);

        if (sourceCmp.isGroupingPanelColumn) {
            groupColumn = sourceCmp;
            sourceCmp = sourceCmp.getColumn();
        }

        fromCtRoot = sourceCmp.getRootHeaderCt();
        fromIdx = fromCtRoot.indexOf(sourceCmp);
        dropAt = headerCt.indexOf(targetCmp);
        position = ddManager.getPosition(info, targetCmp, 'x');
        sourceCmpParent = sourceCmp.getParent();

        me.removeDropMarker();

        if (dropAt === -1) {
            return;
        }

        if (position === 'after') {
            relativeToItem = headerCt.getAt(dropAt + 1);

            if (!relativeToItem) {
                dropMethod = 'insertAfter';
                relativeToItem = targetCmp;
            }
        }
        else {
            relativeToItem = headerCt.getAt(dropAt);
        }

        headerCt[dropMethod](sourceCmp, (relativeToItem || null));

        me.trackHeaderMove(sourceCmpParent, fromCtRoot);

        fromCtRoot.fireEvent('move', fromCtRoot, sourceCmp, dropAt, fromIdx);

        if (groupColumn) {
            groupColumn.destroy();
            sourceCmp.show();

            if (groupingPanel) {
                groupingPanel.notifyGroupChange();
            }
        }
    }
});
