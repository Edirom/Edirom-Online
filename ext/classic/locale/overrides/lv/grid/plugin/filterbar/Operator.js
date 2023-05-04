Ext.define("Ext.locale.lv.grid.plugin.filterbar.Operator", {
    override: "Ext.grid.plugin.filterbar.Operator",

    operatorsTextMap: {
        eq: "Ir vienāds",
        ne: "Nav vienāds",
        gt: "Lielāks nekā",
        ge: "Lielāks vai vienāds ar",
        lt: "Mazāk nekā",
        le: "Mazāk vai vienāds ar",
        like: "Kā",
        nlike: "Nepatīk",
        empty: "Tukšs",
        nempty: "Nav tukšs",
        identical: "Identisks",
        nidentical: "Nav identisks",
        regex: "Regulāra izteiksme",
        "in": "Ir iekšā",
        notin: "Nav"
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
