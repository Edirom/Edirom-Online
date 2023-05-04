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

    isGroupingPanelColumn: true,

    config: {
        text: '&#160;',
        grouper: null,
        idColumn: '',
        column: null,
        menu: {
            lazy: true,
            $value: {}
        }
    },
    layout: {
        type: 'hbox'
    },

    /**
     * @property element
     * @inheritdoc
     */
    element: {
        reference: 'element',
        cls: Ext.baseCSSPrefix + 'unselectable',
        listeners: {
            tap: 'onColumnTap'
        }
    },

    /**
     * @property template
     * @inheritdoc
     */
    template: [{
        reference: 'bodyElement',
        cls: Ext.baseCSSPrefix + 'body-el',

        children: [{
            reference: 'iconElement',
            cls: Ext.baseCSSPrefix + 'icon-el ' +
                Ext.baseCSSPrefix + 'font-icon'
        }, {
            reference: 'textElement',
            cls: Ext.baseCSSPrefix + 'text-el'
        }, {
            reference: 'triggerElement',
            cls: Ext.baseCSSPrefix + 'trigger-el ' +
                Ext.baseCSSPrefix + 'font-icon ' +
                Ext.baseCSSPrefix + 'item-no-tap'
        }]
    }],

    classCls: Ext.baseCSSPrefix + 'grid-group-column',

    updateText: function(text) {
        var el = this.textElement.dom;

        el.innerHTML = text || '&#160;';
        el.setAttribute('data-title', text);
    },

    overCls: Ext.baseCSSPrefix + 'grid-group-column-over',
    cls: Ext.baseCSSPrefix + 'unselectable',

    btnIconCls: Ext.baseCSSPrefix + 'grid-group-column-btn-image',
    btnAscSortIconCls: Ext.baseCSSPrefix + 'grid-group-column-btn-sort-asc',
    btnDescSortIconCls: Ext.baseCSSPrefix + 'grid-group-column-btn-sort-desc',

    onColumnTap: function() {
        var grouper = this.getGrouper();

        if (!grouper) {
            return;
        }

        grouper.toggle();
        this.changeSortCls();
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

    updateGrouper: function(grouper) {
        this.changeSortCls();
    },

    changeSortCls: function() {
        var me = this,
            grouper = me.getGrouper(),
            sortCol = me.iconElement,
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
