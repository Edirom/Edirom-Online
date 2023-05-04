/**
 * This filter type uses a combobox with an array store to display
 * the boolean values
 */
Ext.define('Ext.grid.plugin.filterbar.filters.Boolean', {
    extend: 'Ext.grid.plugin.filterbar.filters.SingleFilter',
    alias: 'grid.filterbar.boolean',

    requires: [
        'Ext.field.ComboBox'
    ],

    type: 'boolean',

    operator: '==',
    operators: ['==', '!='],

    fieldDefaults: {
        xtype: 'combobox',
        queryMode: 'local',
        forceSelection: true,
        clearable: true,
        editable: true,
        valueField: 'value',
        displayField: 'text'
    },

    trueText: 'Yes',
    falseText: 'No',
    trueValue: 1,
    falseValue: 0,

    getFieldConfig: function() {
        var me = this,
            config = me.callParent();

        config.store = [
            { value: me.trueValue, text: me.trueText },
            { value: me.falseValue, text: me.falseText }
        ];

        return config;
    }
});
