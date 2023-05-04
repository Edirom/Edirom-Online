/**
 * A special column used by MultiGrouping feature
 */
Ext.define('Ext.grid.column.Groups', {
    extend: 'Ext.grid.column.Column',
    alias: 'widget.groupscolumn',

    /**
     * @property {Boolean} isGroupsColumn
     * `true` in this class to identify an object as an instantiated Grouping, or subclass thereof.
     */
    isGroupsColumn: true,

    /**
     * @cfg {String} text
     * Any valid text or HTML fragment to display in the header cell for the grouping column.
     */
    text: "Groups",

    /**
     * @cfg {Number} width
     * The default width in pixels of the grouping column.
     */
    width: 200,

    /**
     * @cfg {Boolean} draggable
     * False to disable drag-drop reordering of this column.
     */
    draggable: false,

    // Flag to Lockable to move instances of this column to the locked side.
    autoLock: true,

    // May not be moved from its preferred locked side when grid is enableLocking:true
    lockable: false,

    /**
     * @cfg producesHTML
     * @inheritdoc
     */
    producesHTML: false,

    /**
     * @cfg ignoreExport
     * @inheritdoc
     */
    ignoreExport: true,

    /**
     * @cfg hideable
     * @inheritdoc
     */
    hideable: false,

    /**
     * @cfg dataIndex
     * @inheritdoc
     */
    dataIndex: '',

    groupable: false,

    groupHeaderTpl: '{columnName}: {name}',
    groupSummaryTpl: 'Summary ({name})',
    summaryTpl: 'Summary',

    collapsibleCls: Ext.baseCSSPrefix + 'grid-advanced-group-hd-collapsible',
    hdNotCollapsibleCls: Ext.baseCSSPrefix + 'grid-advanced-group-hd-not-collapsible',
    collapsedCls: Ext.baseCSSPrefix + 'grid-advanced-group-hd-collapsed',
    groupCls: Ext.baseCSSPrefix + 'grid-advanced-group-hd',
    recordCls: Ext.baseCSSPrefix + 'grid-advanced-group-record',
    groupTitleCls: Ext.baseCSSPrefix + 'grid-advanced-group-title',

    depthToIndent: 25,

    constructor: function(config) {
        var me = this;

        // Copy the prototype's default width setting into an instance property to provide
        // a default width which will not be overridden by Container.applyDefaults
        // use of Ext.applyIf
        // eslint-disable-next-line no-self-assign
        me.width = me.width;

        me.callParent([config]);

        // Override any setting from the HeaderContainer's defaults
        me.sortable = false;
        me.groupable = false;

        me.scope = me;
    },

    defaultRenderer: function(value, metaData, record, rowIdx, colIdx, dataSource, view) {
        var me = this,
            ret = '&#160;',
            level = 0,
            attribute = '',
            data, tpl;

        if (dataSource.isMultigroupStore) {
            data = dataSource.renderData[record.getId()];

            if (data) {
                if (data.group) {
                    level = data.group.getLevel();
                }

                if (data.isGroup) {
                    level--;
                    tpl = this.lookupTpl('groupHeaderTpl');
                    // eslint-disable-next-line max-len
                    attribute = ' data-groupName = "' + Ext.htmlEncode(data.group.getLabel()) + '" ';

                    metaData.tdCls = me.collapsibleCls;

                    if (data.group.isCollapsed) {
                        metaData.tdCls += ' ' + me.collapsedCls;
                    }
                }
                else if (data.isGroupSummary) {
                    tpl = this.lookupTpl('groupSummaryTpl');
                }
                else if (data.isSummary) {
                    tpl = this.lookupTpl('summaryTpl');
                }

                if (tpl) {
                    value = tpl.apply(data);
                }

                value = value || '&#160;';
                ret = '<div ' + attribute + 'class="' + me.groupTitleCls + '">' + value + '</div>';

                if (!data.isSummary) {
                    metaData.innerCls = data.isGroup ? me.groupCls : me.recordCls;
                    // eslint-disable-next-line max-len
                    metaData.style = (dataSource.isRTL ? 'margin-right: ' : 'margin-left: ') + me.depthToIndent * level + 'px';
                }
            }
        }

        return ret;
    },

    updater: function(cell, value, record, view, dataSource) {
        var cellInner = cell && cell.querySelector(this.getView().innerSelector);

        if (cellInner) {
            // eslint-disable-next-line max-len
            cellInner.innerHTML = this.defaultRenderer(value, null, record, null, null, dataSource, view);
        }
    }

});
