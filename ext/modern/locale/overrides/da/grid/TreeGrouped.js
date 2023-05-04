Ext.define("Ext.locale.da.grid.TreeGrouped", {
    override: "Ext.grid.TreeGrouped",

    config: {
        groupSummaryTpl: "Resumé ({name})",
        summaryTpl: "Resumé ({store.data.length})"
    }
});
