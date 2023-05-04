Ext.define("Ext.locale.fi.grid.column.Groups", {
    override: "Ext.grid.column.Groups",

    config: {
        groupSummaryTpl: "Yhteenveto ({name})",
        summaryTpl: "Yhteenveto ({store.data.length})"
    },
    text: "Ryhmät"
});
