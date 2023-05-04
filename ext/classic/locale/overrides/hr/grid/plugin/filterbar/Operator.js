Ext.define("Ext.locale.hr.grid.plugin.filterbar.Operator", {
    override: "Ext.grid.plugin.filterbar.Operator",

    operatorsTextMap: {
        eq: "Je jednako",
        ne: "Nejednak",
        gt: "Veće od",
        ge: "Veći ili jednak",
        lt: "Manje od",
        le: "Manje ili jednako",
        like: "Kao",
        nlike: "Ne kao",
        empty: "Prazan",
        nempty: "Nije prazno",
        identical: "Identičan",
        nidentical: "Nije identičan",
        regex: "Regularni izraz",
        "in": "Unutra je",
        notin: "Nije u"
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
