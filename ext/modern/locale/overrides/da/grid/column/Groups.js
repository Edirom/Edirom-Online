Ext.define("Ext.locale.da.grid.column.Groups", {
    override: "Ext.grid.column.Groups",

    config: {
        groupSummaryTpl: "Resumé ({name})",
        summaryTpl: "Resumé ({store.data.length})"
    },
    text: "Grupper."
});
