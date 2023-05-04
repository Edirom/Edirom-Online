Ext.define("Ext.locale.sr.grid.plugin.filterbar.Operator", {
    override: "Ext.grid.plugin.filterbar.Operator",

    operatorsTextMap: {
        eq: "Једнак",
        ne: "Није једнако",
        gt: "Веће од",
        ge: "Већи или једнак",
        lt: "Мање од",
        le: "Мање од или једнако",
        like: "Као",
        nlike: "Не волим",
        empty: "Празан",
        nempty: "Није празна",
        identical: "Идентичан",
        nidentical: "Није идентичан",
        regex: "Регуларни израз",
        "in": "Је у",
        notin: "Није унутра"
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
