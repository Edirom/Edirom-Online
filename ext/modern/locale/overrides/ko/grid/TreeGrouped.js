Ext.define("Ext.locale.ko.grid.TreeGrouped", {
    override: "Ext.grid.TreeGrouped",

    config: {
        groupSummaryTpl: "요약 ({name})",
        summaryTpl: "요약 ({store.data.length})"
    }
});
