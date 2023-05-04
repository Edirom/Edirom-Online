Ext.define("Ext.locale.de.grid.plugin.filterbar.Operator", {
    override: "Ext.grid.plugin.filterbar.Operator",
    operatorsTextMap: {
        eq: "Ist gleich",
        ne: "Nicht gleich",
        gt: "Größer als",
        ge: "Größer als oder gleich wie",
        lt: "Weniger als",
        le: "Weniger als oder gleich",
        like: "Mögen",
        nlike: "Nicht wie",
        empty: "Leer",
        nempty: "Nicht leer",
        identical: "Identisch",
        nidentical: "Nicht identisch",
        regex: "Regulären Ausdruck",
        in: "Ist in",
        notin: "Ist nicht in"
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
