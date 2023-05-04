Ext.define("Ext.locale.zh_CN.grid.TreeGrouped", {
    override: "Ext.grid.TreeGrouped",

    config: {
        groupSummaryTpl: "概括 ({name})",
        summaryTpl: "概括 ({store.data.length})"
    }
});
