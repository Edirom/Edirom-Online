Ext.define("Ext.locale.pl.grid.plugin.filterbar.Operator", {
    override: "Ext.grid.plugin.filterbar.Operator",

    operatorsTextMap: {
        eq: "Jest równy",
        ne: "Nie równe",
        gt: "Lepszy niż",
        ge: "Większy lub równy",
        lt: "Mniej niż",
        le: "Mniejszy lub równy",
        like: "Lubić",
        nlike: "Nie jak",
        empty: "Pusty",
        nempty: "Nie pusty",
        identical: "Identyczny",
        nidentical: "Nieidentyczny",
        regex: "Wyrażenie regularne",
        "in": "Jest w",
        notin: "Nie jest"
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
