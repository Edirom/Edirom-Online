Ext.define("Ext.locale.sk.grid.plugin.filterbar.Operator", {
    override: "Ext.grid.plugin.filterbar.Operator",

    operatorsTextMap: {
        eq: "Je rovnaký",
        ne: "Nerovná sa",
        gt: "Väčší než",
        ge: "Viac ako alebo rovné",
        lt: "Menej ako",
        le: "Menej alebo rovné",
        like: "Páči sa mi to",
        nlike: "Nie ako",
        empty: "Prázdny",
        nempty: "Nie prázdny",
        identical: "Identický",
        nidentical: "Nie je identický",
        regex: "Regulárny výraz",
        "in": "Je v",
        notin: "Nie je v"
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
