Ext.define("Ext.locale.ko.grid.plugin.filterbar.Operator", {
    override: "Ext.grid.plugin.filterbar.Operator",
    operatorsTextMap: {
        eq: "는 같다",
        ne: "동등하지 않다",
        gt: "보다 큰",
        ge: "보다 크거나 같음",
        lt: "미만",
        le: "보다 작거나 같은 것",
        like: "좋다",
        nlike: "같지 않은",
        empty: "비어있는",
        nempty: "비어 있지 않다",
        identical: "동일한",
        nidentical: "동일하지 않습니다",
        regex: "정규식",
        in: "in.",
        notin: "아니다"
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
