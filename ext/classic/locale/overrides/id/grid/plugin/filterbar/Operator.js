Ext.define("Ext.locale.id.grid.plugin.filterbar.Operator", {
    override: "Ext.grid.plugin.filterbar.Operator",

    operatorsTextMap: {
        eq: "Sama.",
        ne: "Tidak sama",
        gt: "Lebih besar dari",
        ge: "Lebih dari atau sama dengan",
        lt: "Kurang dari",
        le: "Kurang dari atau sama dengan",
        like: "Suka",
        nlike: "Tidak suka",
        empty: "Kosong",
        nempty: "Tidak kosong",
        identical: "Identik",
        nidentical: "Tidak identik",
        regex: "Ekspresi reguler",
        "in": "Ada di",
        notin: "Tidak ada dalam."
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
