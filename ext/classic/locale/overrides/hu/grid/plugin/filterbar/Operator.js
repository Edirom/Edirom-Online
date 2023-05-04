Ext.define("Ext.locale.hu.grid.plugin.filterbar.Operator", {
    override: "Ext.grid.plugin.filterbar.Operator",

    operatorsTextMap: {
        eq: "Egyenlő",
        ne: "Nem egyenlő",
        gt: "Nagyobb, mint",
        ge: "Nagyobb vagy egyenlő",
        lt: "Kevesebb, mint",
        le: "Kevesebb vagy egyenlő",
        like: "Mint",
        nlike: "Nem mint",
        empty: "Üres",
        nempty: "Nem üres",
        identical: "Azonos",
        nidentical: "Nem azonos",
        regex: "Reguláris kifejezés",
        "in": "Van",
        notin: "Nincs be"
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
