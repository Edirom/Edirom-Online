Ext.define("Ext.locale.sv_SE.grid.plugin.filterbar.Operator", {
    override: "Ext.grid.plugin.filterbar.Operator",

    operatorsTextMap: {
        eq: "Är jämställd",
        ne: "Inte jämnlikt",
        gt: "Större än",
        ge: "Större än eller lika med",
        lt: "Mindre än",
        le: "Mindre än eller lika med",
        like: "Tycka om",
        nlike: "Inte som",
        empty: "Tömma",
        nempty: "Inte tom",
        identical: "Identisk",
        nidentical: "Inte identisk",
        regex: "Vanligt uttryck",
        "in": "Är i",
        notin: "Är inte i"
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
