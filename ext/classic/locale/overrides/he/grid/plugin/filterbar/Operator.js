Ext.define("Ext.locale.he.grid.plugin.filterbar.Operator", {
    override: "Ext.grid.plugin.filterbar.Operator",

    operatorsTextMap: {
        eq: "שווה",
        ne: "לא שווה",
        gt: "גדול מ",
        ge: "גדול מ או שווה ל",
        lt: "פחות מ",
        le: "פחות מ או שווה ל",
        like: "כמו",
        nlike: "לא כמו",
        empty: "ריק",
        nempty: "לא ריק",
        identical: "זֵהֶה",
        nidentical: "לא מזוהה",
        regex: "הבעה רגילה",
        "in": "הוא ב",
        notin: "אינו ב"
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
