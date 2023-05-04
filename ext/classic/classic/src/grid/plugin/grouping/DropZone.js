/**
 * @private
 */
Ext.define('Ext.grid.plugin.grouping.DropZone', {
    extend: 'Ext.dd.DropZone',

    proxyOffsets: [-4, -9],
    groupingPanelSelector: '.' + Ext.baseCSSPrefix + 'grid-group-panel-body',
    groupColumnSelector: '.' + Ext.baseCSSPrefix + 'grid-group-column',

    constructor: function(panel) {
        var me = this;

        me.panel = panel;
        me.ddGroup = me.getDDGroup();
        me.autoGroup = true;
        me.callParent([panel.el]);
    },

    destroy: function() {
        Ext.destroy(this.topIndicator, this.bottomIndicator);
        this.callParent();
    },

    disable: function() {
        this.disabled = true;
    },

    enable: function() {
        this.disabled = false;
    },

    getDDGroup: function() {
        // return the column header dd group so we can allow column
        // dropping inside the grouping panel
        return 'header-dd-zone-' + this.panel.up('[scrollerOwner]').id;
    },

    getTargetFromEvent: function(e) {
        return e.getTarget(this.groupColumnSelector) || e.getTarget(this.groupingPanelSelector);
    },

    getTopIndicator: function() {
        if (!this.topIndicator) {
            this.topIndicator = Ext.getBody().createChild({
                role: 'presentation',
                cls: Ext.baseCSSPrefix + "col-move-top",
                //<debug>
                // tell the spec runner to ignore this element when checking if the dom is clean
                "data-sticky": true,
                //</debug>
                html: "&#160;"
            });
            this.indicatorXOffset = Math.floor((this.topIndicator.dom.offsetWidth + 1) / 2);
        }

        return this.topIndicator;
    },

    getBottomIndicator: function() {
        if (!this.bottomIndicator) {
            this.bottomIndicator = Ext.getBody().createChild({
                role: 'presentation',
                cls: Ext.baseCSSPrefix + "col-move-bottom",
                //<debug>
                // tell the spec runner to ignore this element when checking if the dom is clean
                "data-sticky": true,
                //</debug>
                html: "&#160;"
            });
        }

        return this.bottomIndicator;
    },

    getLocation: function(e, t) {
        var x = e.getXY()[0],
            target = Ext.getCmp(t.id),
            region, pos;

        if (target.isGroupingPanel && target.items.length) {
            region = Ext.fly(target.items.last().el).getRegion();
        }
        else {
            region = Ext.fly(t).getRegion();
        }

        if ((region.right - x) <= (region.right - region.left) / 2) {
            pos = "after";
        }
        else {
            pos = "before";
        }

        return {
            pos: pos,
            header: target,
            node: t
        };
    },

    positionIndicator: function(data, node, e) {
        var me = this,
            dragHeader = data.header,
            dropLocation = me.getLocation(e, node),
            targetHeader = dropLocation.header,
            pos = dropLocation.pos,
            nextHd, prevHd, topIndicator, bottomIndicator, topAnchor, bottomAnchor,
            topXY, bottomXY, headerCtEl, minX, maxX, allDropZones, ln, i, dropZone;

        // Avoid expensive CQ lookups and DOM calculations if dropPosition has not changed
        if (targetHeader === me.lastTargetHeader && pos === me.lastDropPos) {
            return;
        }

        nextHd = dragHeader.nextSibling('groupingpanelcolumn:not([hidden])');
        prevHd = dragHeader.previousSibling('groupingpanelcolumn:not([hidden])');
        me.lastTargetHeader = targetHeader;
        me.lastDropPos = pos;
        data.dropLocation = dropLocation;

        if ((dragHeader !== targetHeader) &&
            ((pos === "before" && nextHd !== targetHeader) ||
                (pos === "after" && prevHd !== targetHeader)) &&
            !targetHeader.isDescendantOf(dragHeader)) {

            // As we move in between different DropZones that are in the same
            // group (such as the case when in a locked grid), invalidateDrop
            // on the other dropZones.
            allDropZones = Ext.dd.DragDropManager.getRelated(me);
            ln = allDropZones.length;
            i = 0;

            for (; i < ln; i++) {
                dropZone = allDropZones[i];

                if (dropZone !== me && dropZone.invalidateDrop) {
                    dropZone.invalidateDrop();
                }
            }

            me.valid = true;
            topIndicator = me.getTopIndicator();
            bottomIndicator = me.getBottomIndicator();

            if (pos === 'before') {
                topAnchor = 'bc-tl';
                bottomAnchor = 'tc-bl';
            }
            else {
                topAnchor = 'bc-tr';
                bottomAnchor = 'tc-br';
            }

            // Calculate arrow positions. Offset them to align exactly with column border line
            if (targetHeader.isGroupingPanel && targetHeader.items.length > 0) {
                // if dropping zone is the container then align the rows to the last column item
                topXY = topIndicator.getAlignToXY(targetHeader.items.last().el, topAnchor);
                bottomXY = bottomIndicator.getAlignToXY(targetHeader.items.last().el, bottomAnchor);
            }
            else {
                topXY = topIndicator.getAlignToXY(targetHeader.el, topAnchor);
                bottomXY = bottomIndicator.getAlignToXY(targetHeader.el, bottomAnchor);
            }

            // constrain the indicators to the viewable section
            headerCtEl = me.panel.innerCt;
            minX = headerCtEl.getX() - me.indicatorXOffset;
            maxX = headerCtEl.getX() + headerCtEl.getWidth();

            topXY[0] = Ext.Number.constrain(topXY[0], minX, maxX);
            bottomXY[0] = Ext.Number.constrain(bottomXY[0], minX, maxX);

            // position and show indicators
            topIndicator.setXY(topXY);
            bottomIndicator.setXY(bottomXY);
            topIndicator.show();
            bottomIndicator.show();

            // invalidate drop operation and hide indicators
        }
        else {
            me.invalidateDrop();
        }
    },

    invalidateDrop: function() {
        this.valid = false;
        this.hideIndicators();
    },

    onNodeOver: function(node, dragZone, e, data) {
        var me = this,
            from = data.groupcol || data.header,
            doPosition = true;

        if (data.header.el.dom === node) {
            doPosition = false;
        }
        else if (from.isColumn) {
            doPosition = from.groupable && me.panel.isNewColumn(from);
        }

        if (doPosition) {
            me.positionIndicator(data, node, e);
        }
        else {
            me.valid = false;
        }

        return me.valid ? me.dropAllowed : me.dropNotAllowed;
    },

    hideIndicators: function() {
        var me = this;

        me.getTopIndicator().hide();
        me.getBottomIndicator().hide();
        me.lastTargetHeader = me.lastDropPos = null;

    },

    onNodeOut: function() {
        this.hideIndicators();
    },

    onNodeDrop: function(node, dragZone, e, data) {
        var me = this,
            dragColumn = data.groupcol || data.header,
            dropLocation = data.dropLocation,
            pos, grouper;

        if (me.valid && dropLocation) {
            /*
                there are 2 possibilities here:
                1. a new grid column should be added to the grouping panel
                2. an existing group column changes its position
            */
            me.invalidateDrop();

            if (dragColumn.isColumn) {
                Ext.suspendLayouts();

                // don't hide this if it's the last column
                if (dragColumn.up('gridpanel').headerCt.getVisibleGridColumns().length > 1) {
                    dragColumn.setVisible(false);
                }

                pos = me.panel.getColumnPosition(dropLocation.header, dropLocation.pos);
                grouper = dragColumn.getGrouper();

                if (!grouper) {
                    grouper = new Ext.util.Grouper({
                        property: dragColumn.displayField || dragColumn.dataIndex,
                        direction: dragColumn.sortState || 'ASC',
                        formatter: dragColumn.groupFormatter
                    });
                }

                me.panel.addColumn({
                    header: dragColumn.text,
                    idColumn: dragColumn.id,
                    grouper: grouper,
                    column: dragColumn
                }, pos, true);

                Ext.resumeLayouts(true);

            }
            else if (dragColumn.isGroupingPanelColumn) {
                // 2nd possibility
                me.panel.moveColumn(dragColumn, dropLocation.header.isGroupingPanel
                    ? dropLocation.header.items.last()
                    : dropLocation.header, dropLocation.pos);
            }

        }

    }
});
