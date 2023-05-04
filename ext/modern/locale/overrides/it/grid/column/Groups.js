Ext.define("Ext.locale.it.grid.column.Groups", {
    override: "Ext.grid.column.Groups",

    config: {
        groupSummaryTpl: "Riepilogo ({name})",
        summaryTpl: "Riepilogo ({store.data.length})"
    },
    text: "Gruppi"
});
