Ext.define("Ext.locale.nl.grid.plugin.filterbar.Operator", {
    override: "Ext.grid.plugin.filterbar.Operator",
    operatorsTextMap: {
        eq: "Is gelijk",
        ne: "Niet gelijk",
        gt: "Groter dan",
        ge: "Groter dan of gelijk aan",
        lt: "Minder dan",
        le: "Minder dan of gelijk aan",
        like: "Leuk vinden",
        nlike: "Niet zoals",
        empty: "Leeg",
        nempty: "Niet leeg",
        identical: "Identiek",
        nidentical: "Niet hetzelfde",
        regex: "Reguliere expressie",
        in: "Is in",
        notin: "Is niet in"
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
