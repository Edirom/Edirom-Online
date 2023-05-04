Ext.define("Ext.locale.gr.grid.plugin.filterbar.Operator", {
    override: "Ext.grid.plugin.filterbar.Operator",

    operatorsTextMap: {
        eq: "Είναι ίσο",
        ne: "Όχι ίση",
        gt: "Μεγαλύτερος από",
        ge: "Μεγαλύτερο ή ίσο με",
        lt: "Λιγότερο από",
        le: "Λιγότερο από ή ίσο με",
        like: "Σαν",
        nlike: "Οχι σαν",
        empty: "Αδειάζω",
        nempty: "Οχι άδειο",
        identical: "Πανομοιότυπο",
        nidentical: "Δεν είναι πανομοιότυπος",
        regex: "Κοινή έκφραση",
        "in": "Είναι μέσα",
        notin: "Δεν είναι μέσα"
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
