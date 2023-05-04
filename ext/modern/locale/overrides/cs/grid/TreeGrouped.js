Ext.define("Ext.locale.cs.grid.TreeGrouped", {
    override: "Ext.grid.TreeGrouped",

    config: {
        groupSummaryTpl: "souhrn ({name})",
        summaryTpl: "souhrn ({store.data.length})"
    }
});
