Ext.define("Ext.locale.cs.grid.plugin.filterbar.Operator", {
    override: "Ext.grid.plugin.filterbar.Operator",

    operatorsTextMap: {
        eq: "Je roven",
        ne: "Není roven",
        gt: "Větší než",
        ge: "Větší nebo rovný",
        lt: "Méně než",
        le: "Menší nebo rovna",
        like: "Jako",
        nlike: "Ne jako",
        empty: "Prázdný",
        nempty: "Není prázdný",
        identical: "Identický",
        nidentical: "Není identický",
        regex: "Regulární výraz",
        "in": "Je in.",
        notin: "Není"
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
