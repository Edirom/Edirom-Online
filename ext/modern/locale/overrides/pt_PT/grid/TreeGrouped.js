Ext.define("Ext.locale.pt_PT.grid.TreeGrouped", {
    override: "Ext.grid.TreeGrouped",

    config: {
        groupSummaryTpl: "Resumo ({name})",
        summaryTpl: "Resumo ({store.data.length})"
    }
});
