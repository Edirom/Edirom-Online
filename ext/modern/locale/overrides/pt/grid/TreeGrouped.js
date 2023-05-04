Ext.define("Ext.locale.pt.grid.TreeGrouped", {
    override: "Ext.grid.TreeGrouped",

    config: {
        groupSummaryTpl: "Resumo ({name})",
        summaryTpl: "Resumo ({store.data.length})"
    }
});
