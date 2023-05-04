/**
 * @private
 */
Ext.define('Ext.grid.plugin.grouping.Column', {
    extend: 'Ext.Component',
    alias: 'widget.groupingpanelcolumn',

    requires: [
        'Ext.menu.Menu',
        'Ext.menu.CheckItem',
        'Ext.menu.Item',
        'Ext.menu.Separator'
    ],

    childEls: ['textCol', 'filterCol', 'sortCol'],

    tabIndex: 0,
    focusable: true,
    isGroupingPanelColumn: true,

    renderTpl:
        // eslint-disable-next-line max-len
        '<div id="{id}-configCol" role="button" class="' + Ext.baseCSSPrefix + 'grid-group-column-inner" >' +
        // eslint-disable-next-line max-len
        '<span id="{id}-customCol" role="presentation" class="' + Ext.baseCSSPrefix + 'grid-group-column-btn-customize ' + Ext.baseCSSPrefix + 'border-box ' + Ext.baseCSSPrefix + 'grid-group-column-btn ' + Ext.baseCSSPrefix + 'grid-group-column-btn-image"></span>' +
        // eslint-disable-next-line max-len
        '<span id="{id}-sortCol" role="presentation" data-ref="sortCol" class="' + Ext.baseCSSPrefix + 'border-box ' + Ext.baseCSSPrefix + 'grid-group-column-btn"></span>' +
        // eslint-disable-next-line max-len
        '<span id="{id}-textCol" role="presentation" data-ref="textCol" data-qtip="{header}" class="' + Ext.baseCSSPrefix + 'grid-group-column-text ' + Ext.baseCSSPrefix + 'column-header-text ' + Ext.baseCSSPrefix + 'border-box">' +
        '{header}' +
        '</span>' +
        '</div>',

    maxWidth: 200,

    baseCls: Ext.baseCSSPrefix + 'grid-group-column',
    overCls: Ext.baseCSSPrefix + 'grid-group-column-over',
    cls: Ext.baseCSSPrefix + 'unselectable',

    btnIconCls: Ext.baseCSSPrefix + 'grid-group-column-btn-image',
    btnAscSortIconCls: Ext.baseCSSPrefix + 'grid-group-column-btn-sort-asc',
    btnDescSortIconCls: Ext.baseCSSPrefix + 'grid-group-column-btn-sort-desc',

    config: {
        header: '&#160;',
        grouper: null,
        idColumn: '',
        column: null
    },

    doDestroy: function() {
        this.setGrouper(null);
        this.callParent();
    },

    initRenderData: function() {
        return Ext.apply(this.callParent(arguments), {
            header: this.header
        });
    },

    afterRender: function() {
        this.changeSortCls();
        this.callParent();
    },

    updateGrouper: function() {
        this.changeSortCls();
    },

    changeSortCls: function() {
        var me = this,
            grouper = me.getGrouper(),
            sortCol = me.sortCol,
            direction;

        if (grouper && sortCol) {
            direction = grouper.getDirection();

            if (direction === 'ASC' || !direction) {
                sortCol.addCls(me.btnAscSortIconCls);
                sortCol.removeCls(me.btnDescSortIconCls);
            }
            else {
                sortCol.addCls(me.btnDescSortIconCls);
                sortCol.removeCls(me.btnAscSortIconCls);
            }

            sortCol.addCls(me.btnIconCls);
        }
    }

});
