/**
 * This is an Operator trigger used by {@link Ext.grid.plugin.Operator}
 */
Ext.define('Ext.field.trigger.Operator', {
    extend: 'Ext.field.trigger.Trigger',
    xtype: 'operatortrigger',
    alias: 'trigger.operator',
    classCls: Ext.baseCSSPrefix + 'operatortrigger',
    weight: -1000,
    hidden: false,
    handler: 'onOperatorIconTap',
    scope: 'this',

    applyDisabled: function() {
        // it should never get disabled otherwise you can't
        // switch the operator anymore
        return false;
    }
});
