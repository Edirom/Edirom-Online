/**
 * @private
 */
Ext.define('Ext.grid.plugin.grouping.DragZone', {
    extend: 'Ext.dd.DragZone',

    groupColumnSelector: '.' + Ext.baseCSSPrefix + 'grid-group-column',
    groupColumnInnerSelector: '.' + Ext.baseCSSPrefix + 'grid-group-column-inner',
    maxProxyWidth: 120,
    dragging: false,

    constructor: function(panel) {
        var me = this;

        me.panel = panel;
        me.ddGroup = me.getDDGroup();
        me.callParent([panel.el]);
    },

    getDDGroup: function() {
        // return the column header dd group so we can allow column
        // dropping inside the grouping panel
        return 'header-dd-zone-' + this.panel.up('[scrollerOwner]').id;
    },

    getDragData: function(e) {
        var header, headerCmp, headerCol, ddel;

        if (e.getTarget(this.groupColumnInnerSelector)) {
            header = e.getTarget(this.groupColumnSelector);

            if (header) {
                headerCmp = Ext.getCmp(header.id);
                headerCol = Ext.getCmp(headerCmp.idColumn);

                if (!this.panel.dragging) {
                    ddel = document.createElement('div');
                    ddel.innerHTML = headerCmp.getHeader();

                    return {
                        ddel: ddel,
                        header: headerCol,
                        groupcol: headerCmp
                    };
                }
            }
        }

        return false;
    },

    onBeforeDrag: function() {
        return !(this.panel.dragging || this.disabled);
    },

    onInitDrag: function() {
        this.panel.dragging = true;
        this.callParent(arguments);
    },

    onDragDrop: function() {
        var me = this,
            dropCol, groupCol;

        if (!me.dragData.dropLocation) {
            me.panel.dragging = false;
            me.callParent(arguments);

            return;
        }

        /*
            when a column is dragged out from the grouping panel we have to do the following:
            1. remove the column from grouping panel
            2. adjust the grid groupers
        */
        dropCol = me.dragData.dropLocation.header;
        groupCol = me.dragData.groupcol;

        if (dropCol.isColumn) {
            me.panel.removeColumn(groupCol);
        }

        me.panel.dragging = false;
        me.callParent(arguments);
    },

    afterRepair: function() {
        this.callParent();
        this.panel.dragging = false;
    },

    getRepairXY: function() {
        return this.dragData.header.el.getXY();
    },

    disable: function() {
        this.disabled = true;
    },

    enable: function() {
        this.disabled = false;
    }

});
