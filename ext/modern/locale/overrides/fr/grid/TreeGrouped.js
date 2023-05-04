Ext.define("Ext.locale.fr.grid.TreeGrouped", {
    override: "Ext.grid.TreeGrouped",

    config: {
        groupSummaryTpl: "Sommaire ({name})",
        summaryTpl: "Sommaire ({store.data.length})"
    }
});
