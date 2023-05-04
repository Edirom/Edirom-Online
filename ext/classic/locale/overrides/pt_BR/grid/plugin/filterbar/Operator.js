Ext.define("Ext.locale.pt_BR.grid.plugin.filterbar.Operator", {
    override: "Ext.grid.plugin.filterbar.Operator",

    operatorsTextMap: {
        eq: "É igual",
        ne: "Não igual",
        gt: "Maior que",
        ge: "Melhor que ou igual a",
        lt: "Menor que",
        le: "Menos que ou igual a",
        like: "Parece",
        nlike: "Não parece",
        empty: "Vazio",
        nempty: "Não está vazio",
        identical: "Idêntico",
        nidentical: "Não idênticos",
        regex: "Expressão regular",
        "in": "Está dentro",
        notin: "Não está dentro"
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
