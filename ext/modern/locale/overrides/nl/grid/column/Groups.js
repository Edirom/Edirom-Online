Ext.define("Ext.locale.nl.grid.column.Groups", {
    override: "Ext.grid.column.Groups",

    config: {
        groupSummaryTpl: "Samenvatting ({name})",
        summaryTpl: "Samenvatting ({store.data.length})"
    },
    text: "Groepen"
});
