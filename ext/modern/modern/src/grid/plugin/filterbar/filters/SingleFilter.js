/**
 * @private
 */
Ext.define('Ext.grid.plugin.filterbar.filters.SingleFilter', {
    extend: 'Ext.grid.plugin.filterbar.filters.Base',

    initFilter: function(config) {
        var me = this,
            filter, value;

        value = me.value;
        filter = me.getStoreFilter();

        if (filter) {
            // This filter was restored from stateful filters on the store so enforce it as active.
            me.active = true;
            me.setOperator(filter.getOperator());
        }
        else {
            // Once we've reached this block, we know that this grid filter
            // doesn't have a stateful filter, so if our flag to begin saving
            // future filter mutations is set we know that any configured filter must be nullified
            // out or it will replace our stateful filter.
            if (me.grid.stateful && me.getGridStore().saveStatefulFilters) {
                value = undefined;
            }

            me.active = me.getActiveState(config, value);

            filter = me.createFilter({
                operator: me.operator,
                value: value
            });

            if (me.active) {
                me.addStoreFilter(filter);
            }
        }

        if (me.active) {
            me.setColumnActive(true);
        }

        me.filter = filter;
    },

    updateOperator: function(operator, oldOperator) {
        var me = this,
            field = me.getField(),
            emptyOp = (operator === 'empty' || operator === 'nempty');

        me.callParent([operator, oldOperator]);

        if (!me.isConfiguring && field) {
            field.setReadOnly(emptyOp);

            if (emptyOp) {
                field.suspendEvents();
                field.setValue(null);
                field.resumeEvents(true);
                me.setValue(null);
            }
            else if (oldOperator === 'empty' || oldOperator === 'nempty') {
                me.setActive(false);
            }
        }
    },

    setValue: function(value) {
        var me = this,
            operator = me.getOperator(),
            emptyOp = (operator === 'empty' || operator === 'nempty');

        me.filter.setValue(value);
        me.value = value;

        if (Ext.isEmpty(value) && !emptyOp) {
            me.setActive(false);
        }
        else if (me.active) {
            me.updateStoreFilter();
        }
        else {
            me.setActive(true);
        }
    },

    activate: function() {
        this.addStoreFilter(this.filter);
    },

    deactivate: function() {
        var me = this,
            operator = me.getOperator(),
            operators = me.getOperators();

        if (operator === 'empty' || operator === 'nempty') {
            me.setOperator(operators && operators.length ? operators[0] : 'like');
        }

        me.removeStoreFilter(me.filter);
    },

    resetFilter: function() {
        var me = this,
            filter, field, value;

        if (me.changingFilters) {
            return;
        }

        filter = me.getStoreFilter();
        field = me.getField();

        if (filter) {
            me.active = true;
            value = filter.getValue();
            me.setOperator(filter.getOperator());
        }
        else if (me.active) {
            me.setActive(false);
        }

        field.suspendEvents();
        field.setValue(value);
        field.resumeEvents(true);
    }

});
