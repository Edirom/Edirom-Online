Ext.define("Ext.locale.da.grid.plugin.filterbar.Operator", {
    override: "Ext.grid.plugin.filterbar.Operator",
    operatorsTextMap: {
        eq: "Er ligning",
        ne: "Ikke lige",
        gt: "Bedre end",
        ge: "Større end eller lig med",
        lt: "Mindre end",
        le: "Mindre end eller lig med",
        like: "Synes godt om",
        nlike: "Ikke som",
        empty: "Tom",
        nempty: "Ikke tomt",
        identical: "Identisk",
        nidentical: "Ikke identisk.",
        regex: "Almindelig udtryk",
        in: "Er i",
        notin: "Er ikke IN."
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
