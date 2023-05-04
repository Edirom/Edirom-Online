Ext.define("Ext.locale.fr.grid.plugin.filterbar.Operator", {
    override: "Ext.grid.plugin.filterbar.Operator",

    operatorsTextMap: {
        eq: "Est égal",
        ne: "Inégal",
        gt: "Plus grand que",
        ge: "Plus grand ou égal à",
        lt: "Moins que",
        le: "Inférieur ou égal à",
        like: "Comme",
        nlike: "Pas comme",
        empty: "Vide",
        nempty: "Pas vide",
        identical: "Identique",
        nidentical: "Pas identique",
        regex: "Expression régulière",
        "in": "Est dans",
        notin: "N'est pas dans"
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
