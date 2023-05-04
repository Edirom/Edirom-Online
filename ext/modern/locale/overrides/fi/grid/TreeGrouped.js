Ext.define("Ext.locale.fi.grid.TreeGrouped", {
    override: "Ext.grid.TreeGrouped",

    config: {
        groupSummaryTpl: "Yhteenveto ({name})",
        summaryTpl: "Yhteenveto ({store.data.length})"
    }
});
