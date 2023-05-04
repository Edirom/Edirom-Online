Ext.define("Ext.locale.ru.grid.TreeGrouped", {
    override: "Ext.grid.TreeGrouped",

    config: {
        groupSummaryTpl: "Резюме ({name})",
        summaryTpl: "Резюме ({store.data.length})"
    }
});
