Ext.define("Ext.locale.es.grid.column.Groups", {
    override: "Ext.grid.column.Groups",

    config: {
        groupSummaryTpl: "Resumen ({name})",
        summaryTpl: "Resumen ({store.data.length})"
    },
    text: "Grupos"
});
