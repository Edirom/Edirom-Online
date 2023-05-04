Ext.define("Ext.locale.ru.grid.column.Groups", {
    override: "Ext.grid.column.Groups",

    config: {
        groupSummaryTpl: "Резюме ({name})",
        summaryTpl: "Резюме ({store.data.length})"
    },
    text: "Группы"
});
