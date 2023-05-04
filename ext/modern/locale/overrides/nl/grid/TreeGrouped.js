Ext.define("Ext.locale.nl.grid.TreeGrouped", {
    override: "Ext.grid.TreeGrouped",

    config: {
        groupSummaryTpl: "Samenvatting ({name})",
        summaryTpl: "Samenvatting ({store.data.length})"
    }
});
