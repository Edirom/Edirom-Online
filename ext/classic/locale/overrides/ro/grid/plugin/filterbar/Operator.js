Ext.define("Ext.locale.ro.grid.plugin.filterbar.Operator", {
    override: "Ext.grid.plugin.filterbar.Operator",

    operatorsTextMap: {
        eq: "Este egal",
        ne: "Nu este egal",
        gt: "Mai mare ca",
        ge: "Mai mare sau egal cu",
        lt: "Mai puțin decât",
        le: "Mai mic sau egal cu",
        like: "Ca",
        nlike: "Nu ca",
        empty: "Gol",
        nempty: "Nu goală",
        identical: "Identic",
        nidentical: "Nu este identic",
        regex: "Expresie uzuala",
        "in": "Este in",
        notin: "Nu este in."
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
