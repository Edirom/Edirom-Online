Ext.define("Ext.locale.bg.grid.plugin.filterbar.Operator", {
    override: "Ext.grid.plugin.filterbar.Operator",

    operatorsTextMap: {
        eq: "Е равно",
        ne: "Не е равно",
        gt: "По-голяма от",
        ge: "По-голяма или равна на",
        lt: "По-малко от",
        le: "По-малко или равно на",
        like: "като",
        nlike: "Не като",
        empty: "Празен",
        nempty: "Не е празно",
        identical: "Идентичен",
        nidentical: "Не идентични",
        regex: "Редовен израз",
        "in": "Е в",
        notin: "Не е в"
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
