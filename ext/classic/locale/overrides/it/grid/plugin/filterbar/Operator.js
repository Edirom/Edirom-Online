Ext.define("Ext.locale.it.grid.plugin.filterbar.Operator", {
    override: "Ext.grid.plugin.filterbar.Operator",

    operatorsTextMap: {
        eq: "È uguale",
        ne: "Non uguale",
        gt: "Più grande di",
        ge: "Maggiore o uguale a",
        lt: "Meno di",
        le: "Minore o uguale a",
        like: "Piace",
        nlike: "Non come",
        empty: "Vuoto",
        nempty: "Non vuoto",
        identical: "Identico",
        nidentical: "Non identico",
        regex: "Espressione regolare",
        "in": "È in",
        notin: "Non è in"
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
