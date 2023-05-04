Ext.define("Ext.locale.af.grid.plugin.filterbar.Operator", {
    override: "Ext.grid.plugin.filterbar.Operator",

    operatorsTextMap: {
        eq: "Is gelyk",
        ne: "Nie gelyk nie",
        gt: "Groter as",
        ge: "Groter as of gelyk aan",
        lt: "Minder as",
        le: "Minder as of gelyk aan",
        like: "Soos",
        nlike: "Nie soos",
        empty: "Leegmaak",
        nempty: "Nie leeg nie",
        identical: "Identies",
        nidentical: "Nie identies nie",
        regex: "Gewone uitdrukking",
        "in": "Is in",
        notin: "Is nie in nie"
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
