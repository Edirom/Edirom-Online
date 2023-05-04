/**
 * @private
 */
Ext.define('Ext.grid.plugin.header.DragZone', {
    extend: 'Ext.plugin.dd.DragZone',

    autoDestroy: false,
    groups: 'groupHeaders',

    resizerCls: Ext.baseCSSPrefix + 'resizer-el',
    maskCls: Ext.baseCSSPrefix + 'mask',
    handle: '.' + Ext.baseCSSPrefix + 'gridcolumn',

    platformConfig: {
        phone: {
            activateOnLongPress: true
        }
    },

    beforeDragStart: function(info) {
        var me = this,
            targetCmp = Ext.dd.Manager.getSourceComp(info),
            targetEl = targetCmp.renderElement,
            hoveredNodeEl = Ext.dd.Manager.getTargetEl(info),
            isDragSuspended = targetEl.isSuspended('drag') || targetEl.isSuspended('longpress');

        if (isDragSuspended || targetCmp.isDragColumn || targetCmp.getDraggable() === false ||
            targetCmp.isGroupsColumn ||
            Ext.fly(info.eventTarget).hasCls(me.resizerCls) ||
            Ext.fly(hoveredNodeEl).hasCls(me.maskCls)) {
            return false;
        }

        info.setData('column', targetCmp);
        info.setData('panel', me.view);
        info.setData('grid', me.grid);

        me.callParent([info]);
    },

    getDragText: function(info) {
        var targetCmp = Ext.dd.Manager.getTargetComp(info);

        return (targetCmp.getText && targetCmp.getText()) || '';
    }

});
