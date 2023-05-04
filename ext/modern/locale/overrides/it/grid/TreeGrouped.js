Ext.define("Ext.locale.it.grid.TreeGrouped", {
    override: "Ext.grid.TreeGrouped",

    config: {
        groupSummaryTpl: "Riepilogo ({name})",
        summaryTpl: "Riepilogo ({store.data.length})"
    }
});
