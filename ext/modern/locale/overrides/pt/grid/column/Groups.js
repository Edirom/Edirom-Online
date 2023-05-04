Ext.define("Ext.locale.pt.grid.column.Groups", {
    override: "Ext.grid.column.Groups",

    config: {
        groupSummaryTpl: "Resumo ({name})",
        summaryTpl: "Resumo ({store.data.length})"
    },
    text: "Grupos"
});
