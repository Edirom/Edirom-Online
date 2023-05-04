Ext.define("Ext.locale.de.grid.TreeGrouped", {
    override: "Ext.grid.TreeGrouped",

    config: {
        groupSummaryTpl: "Zusammenfassung ({name})",
        summaryTpl: "Zusammenfassung ({store.data.length})"
    }
});
