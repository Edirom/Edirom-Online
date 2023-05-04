/**
 * A special column used by {@link Ext.grid.TreeGrouped}.
 * @private
 */
Ext.define('Ext.grid.column.Groups', {
    extend: 'Ext.grid.column.Column',
    xtype: 'groupscolumn',

    requires: [
        'Ext.grid.cell.Group'
    ],

    /**
     * @property {Boolean} isGroupsColumn
     * `true` in this class to identify an object as an instantiated Grouping, or subclass thereof.
     */
    isGroupsColumn: true,

    config: {
        /**
         * @cfg {String/Array/Ext.Template} groupHeaderTpl
         * A string Template snippet, an array of strings (optionally followed by an object
         * containing Template methods) to be used to construct a Template, or a Template instance.
         *
         * - Example 1 (Template snippet):
         *
         *       groupHeaderTpl: 'Group: {name} ({group.items.length})'
         *
         * - Example 2 (Array):
         *
         *       groupHeaderTpl: [
         *           'Group: ',
         *           '<div>{name:this.formatName}</div>',
         *           {
         *               formatName: function(name) {
         *                   return Ext.String.trim(name);
         *               }
         *           }
         *       ]
         *
         * - Example 3 (Template Instance):
         *
         *       groupHeaderTpl: Ext.create('Ext.XTemplate',
         *           'Group: ',
         *           '<div>{name:this.formatName}</div>',
         *           {
         *               formatName: function(name) {
         *                   return Ext.String.trim(name);
         *               }
         *           }
         *       )
         *
         * @cfg {String}           groupHeaderTpl.groupField The field name being grouped by.
         * @cfg {String}           groupHeaderTpl.columnName The column header associated with
         * the field being grouped by *if there is a column for the field*, falls back to the
         * groupField name.
         * @cfg {String}           groupHeaderTpl.name The name of the group.
         * @cfg {Ext.util.Group}   groupHeaderTpl.group The group object.
         */
        groupHeaderTpl: '{name}',

        /**
         * @cfg {String/Array/Ext.Template} groupSummaryTpl
         * A string Template snippet, an array of strings (optionally followed by an object
         * containing Template methods) to be used to construct a Template, or a Template instance.
         *
         * - Example 1 (Template snippet):
         *
         *       groupSummaryTpl: 'Group: {name}'
         *
         * - Example 2 (Array):
         *
         *       groupSummaryTpl: [
         *           'Group: ',
         *           '<div>{name:this.formatName}</div>',
         *           {
         *               formatName: function(name) {
         *                   return Ext.String.trim(name);
         *               }
         *           }
         *       ]
         *
         * - Example 3 (Template Instance):
         *
         *       groupSummaryTpl: Ext.create('Ext.XTemplate',
         *           'Group: ',
         *           '<div>{name:this.formatName}</div>',
         *           {
         *               formatName: function(name) {
         *                   return Ext.String.trim(name);
         *               }
         *           }
         *       )
         *
         * @cfg {String}           groupSummaryTpl.groupField The field name being grouped by.
         * @cfg {String}           groupSummaryTpl.columnName The column header associated with
         * the field being grouped by *if there is a column for the field*, falls back to
         * the groupField name.
         * @cfg {String}           groupSummaryTpl.name The name of the group.
         * @cfg {Ext.util.Group}   groupSummaryTpl.group The group object.
         */
        groupSummaryTpl: 'Summary ({name})',

        /**
         * @cfg {String/Array/Ext.Template} summaryTpl
         * A string Template snippet, an array of strings (optionally followed by an object
         * containing Template methods) to be used to construct a Template, or a Template instance.
         *
         * - Example (Template snippet):
         *
         *       groupSummaryTpl: 'Summary: {store.data.length}'
         *
         * @cfg {Ext.data.Store}   summaryTpl.store The store object.
         */
        summaryTpl: 'Summary ({store.data.length})'
    },

    /**
     * @cfg {String} text
     * Any valid text or HTML fragment to display in the header cell for the grouping column.
     */
    text: "Groups",

    /**
     * @cfg {Boolean} draggable
     * False to disable drag-drop reordering of this column.
     */
    draggable: false,

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

    sortable: false,
    groupable: false,
    defaultEditor: null,
    editable: false,
    weight: -1000,
    width: 200,

    cell: {
        xtype: 'groupcell'
    },

    groupHeaderTpl: '{columnName}: {name}',
    groupSummaryTpl: 'Summary ({name})',
    summaryTpl: 'Summary',

    applyGroupHeaderTpl: function(tpl) {
        return Ext.XTemplate.get(tpl);
    },

    applyGroupSummaryTpl: function(tpl) {
        return Ext.XTemplate.get(tpl);
    },

    applySummaryTpl: function(tpl) {
        return Ext.XTemplate.get(tpl);
    }

});
