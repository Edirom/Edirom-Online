/**
 * @class Ext.chart.overrides.AbstractChart
 */
Ext.define('Ext.chart.overrides.AbstractChart', {
    override: 'Ext.chart.AbstractChart',

    updateLegend: function(legend, oldLegend) {
        this.callParent([legend, oldLegend]);

        if (legend && legend.isDomLegend) {
            this.addDocked(legend);
        }
    },

    performLayout: function() {
        if (this.isVisible(true)) {
            return this.callParent();
        }

        this.cancelChartLayout();

        return false;
    },

    afterComponentLayout: function(width, height, oldWidth, oldHeight) {
        this.callParent([width, height, oldWidth, oldHeight]);

        if (!this.hasFirstLayout) {
            this.scheduleLayout();
        }
        else {
            this.scheduleRedraw();
        }
    },

    allowSchedule: function() {
        return this.rendered;
    },

    scheduleRedraw: function() {
        var me = this,
            task = me.scheduleRedrawTask;

        if (!task) {
            me.scheduleRedrawTask = task = new Ext.util.DelayedTask(me.redraw, me);
        }

        task.delay(100);
    },

    doDestroy: function() {
        var re = this.scheduleRedrawTask;

        if (re) {
            re.cancel();
        }

        this.destroyChart();
        this.callParent();
    }

});
