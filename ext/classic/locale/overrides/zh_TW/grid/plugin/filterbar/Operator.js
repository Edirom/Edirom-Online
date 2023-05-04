Ext.define("Ext.locale.zh_TW.grid.plugin.filterbar.Operator", {
    override: "Ext.grid.plugin.filterbar.Operator",

    operatorsTextMap: {
        eq: "是平等的",
        ne: "不平等",
        gt: "比...更棒",
        ge: "大於或等於",
        lt: "少於",
        le: "小於或等於",
        like: "喜歡",
        nlike: "不喜歡",
        empty: "空的",
        nempty: "不是空的",
        identical: "完全相同的",
        nidentical: "沒有相同",
        regex: "正則表達式",
        "in": "是",
        notin: "不是在"
    }
}, function() {
    var prototype = this.prototype,
        texts = prototype.operatorsTextMap;

    texts['='] = texts.eq;
    texts['=='] = texts.eq;
    texts['!='] = texts.ne;
    texts['==='] = texts.identical;
    texts['!=='] = texts.nidentical;
    texts['>'] = texts.gt;
    texts['>='] = texts.ge;
    texts['<'] = texts.lt;
    texts['<='] = texts.le;
    texts['/='] = texts.regex;
});
