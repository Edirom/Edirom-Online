Ext.define("Ext.locale.ca.grid.plugin.filterbar.Operator", {
    override: "Ext.grid.plugin.filterbar.Operator",

    operatorsTextMap: {
        eq: "És igual",
        ne: "No és igual",
        gt: "Més gran que",
        ge: "Superior o igual a",
        lt: "Menys que",
        le: "Inferior o igual a",
        like: "M'agrada",
        nlike: "No m'agrada",
        empty: "Buit",
        nempty: "No està buit",
        identical: "Idèntic",
        nidentical: "No idèntic",
        regex: "Expressió normal",
        "in": "Està dins",
        notin: "No està a"
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
