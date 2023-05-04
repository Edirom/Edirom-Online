Ext.define("Ext.locale.ja.grid.TreeGrouped", {
    override: "Ext.grid.TreeGrouped",

    config: {
        groupSummaryTpl: "概要 ({name})",
        summaryTpl: "概要 ({store.data.length})"
    }
});
