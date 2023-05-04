Ext.define("Ext.locale.ja.grid.plugin.filterbar.Operator", {
    override: "Ext.grid.plugin.filterbar.Operator",
    operatorsTextMap: {
        eq: "等しい",
        ne: "等しくない",
        gt: "より大きい",
        ge: "以上",
        lt: "未満",
        le: "それ以上",
        like: "お気に入り",
        nlike: "好きじゃない",
        empty: "空の",
        nempty: "空ではない",
        identical: "同一",
        nidentical: "同一ではない",
        regex: "正規表現",
        in: "イン",
        notin: "インテではありません"
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
