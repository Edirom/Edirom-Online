Ext.define("Ext.locale.cs.grid.column.Groups", {
    override: "Ext.grid.column.Groups",

    config: {
        groupSummaryTpl: "souhrn ({name})",
        summaryTpl: "souhrn ({store.data.length})"
    },
    text: "Skupiny"
});
