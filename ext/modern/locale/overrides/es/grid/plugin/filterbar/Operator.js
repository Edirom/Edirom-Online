Ext.define("Ext.locale.es.grid.plugin.filterbar.Operator", {
    override: "Ext.grid.plugin.filterbar.Operator",
    operatorsTextMap: {
        eq: "Es igual",
        ne: "No es igual",
        gt: "Mas grande que",
        ge: "Mayor qué o igual a",
        lt: "Menos que",
        le: "Menos que o igual a",
        like: "Igual que",
        nlike: "Diferente a",
        empty: "Vacío",
        nempty: "No vacío",
        identical: "Idéntico",
        nidentical: "No es identico",
        regex: "Expresión regular",
        in: "Es en",
        notin: "No está dentro"
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
