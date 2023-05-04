Ext.define("Ext.locale.ko.grid.column.Groups", {
    override: "Ext.grid.column.Groups",

    config: {
        groupSummaryTpl: "요약 ({name})",
        summaryTpl: "요약 ({store.data.length})"
    },
    text: "그룹화에 추가하십시오"
});
