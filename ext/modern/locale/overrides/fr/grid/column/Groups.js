Ext.define("Ext.locale.fr.grid.column.Groups", {
    override: "Ext.grid.column.Groups",

    config: {
        groupSummaryTpl: "Sommaire ({name})",
        summaryTpl: "Sommaire ({store.data.length})"
    },
    text: "Groupes"
});
