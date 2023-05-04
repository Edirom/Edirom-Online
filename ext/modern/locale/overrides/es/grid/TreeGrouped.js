Ext.define("Ext.locale.es.grid.TreeGrouped", {
    override: "Ext.grid.TreeGrouped",

    config: {
        groupSummaryTpl: "Resumen ({name})",
        summaryTpl: "Resumen ({store.data.length})"
    }
});
