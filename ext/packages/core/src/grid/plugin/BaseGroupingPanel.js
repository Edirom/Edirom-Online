/**
 * That's a base class for the {@link Ext.grid.plugin.GroupingPanel} plugin
 * and it's shared by both toolkits.
 * @private
 */
Ext.define('Ext.grid.plugin.BaseGroupingPanel', {
    extend: 'Ext.plugin.Abstract',

    config: {
        panel: {
            xtype: 'groupingpanel',
            columnConfig: {
                xtype: 'groupingpanelcolumn'
            }
        },
        grid: null,
        bar: null,
        gridListeners: null
    },

    init: function(grid) {
        this.setGrid(grid);
    },

    /**
     * @private
     * AbstractComponent calls destroy on all its plugins at destroy time.
     */
    destroy: function() {
        this.setConfig({
            grid: null,
            bar: null,
            panel: null
        });
        this.callParent();
    },

    enable: function() {
        this.disabled = false;
        this.showGroupingPanel();
    },

    disable: function() {
        this.disabled = true;
        this.hideGroupingPanel();
    },

    /**
     * Show the grouping panel
     */
    showGroupingPanel: function() {
        var bar;

        this.setup();

        bar = this.getBar();

        bar.show();
    },

    /**
     * Hide the grouping panel
     */
    hideGroupingPanel: function() {
        var bar;

        this.setup();

        bar = this.getBar();

        bar.hide();
    },

    toggleGroupingPanel: function() {
        var bar;

        this.setup();

        bar = this.getBar();

        bar.setHidden(!bar.getHidden());
    },

    updateGrid: function(grid, oldGrid) {
        var me = this;

        Ext.destroy(me.listenersGrid);

        if (oldGrid) {
            oldGrid.showGroupingPanel = oldGrid.hideGroupingPanel = null;
        }

        if (grid) {
            grid.showGroupingPanel = Ext.bind(me.showGroupingPanel, me);
            grid.hideGroupingPanel = Ext.bind(me.hideGroupingPanel, me);

            if (grid.rendered) {
                me.onAfterGridRendered();
            }
            else {
                me.listenersGrid = grid.on(Ext.apply({
                    scope: me,
                    destroyable: true
                }, me.getGridListeners()));
            }

        }
    },

    updateBar: function(bar, oldBar) {
        var panel;

        Ext.destroy(oldBar);

        if (bar) {
            panel = bar.isXType('groupingpanel') ? bar : bar.down('groupingpanel');

            if (panel) {
                panel.setConfig({
                    grid: this.getGrid()
                });
            }
            //<debug>
            else {
                Ext.raise('Wrong grouping panel configuration! ' +
                    'No "groupingpanel" component available');
            }
            //</debug>
        }
    },

    onAfterGridRendered: function() {
        var me = this;

        if (me.disabled === true) {
            me.disable();
        }
        else {
            me.enable();
        }
    },

    addGroupingPanel: Ext.emptyFn,

    privates: {
        setup: function() {
            var me = this;

            if (me.doneSetup) {
                return;
            }

            me.doneSetup = true;
            me.setBar(me.addGroupingPanel());
        }
    }

});
