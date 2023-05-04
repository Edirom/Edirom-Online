Ext.define("Ext.locale.fr.grid.plugin.filterbar.Operator", {
    override: "Ext.grid.plugin.filterbar.Operator",
    operatorsTextMap: {
        eq: "rovnat se",
        ne: "Není rovno",
        gt: "Větší než",
        ge: "Greater than or equal to",
        lt: "Méně než",
        le: "Menší nebo rovna",
        like: "Jako",
        nlike: "Ne jako",
        empty: "Prázdný",
        nempty: "Není prázdný",
        identical: "Identický",
        nidentical: "Není identický",
        regex: "Regulární výraz",
        "in": "Je in",
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
