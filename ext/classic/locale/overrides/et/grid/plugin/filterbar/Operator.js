Ext.define("Ext.locale.et.grid.plugin.filterbar.Operator", {
    override: "Ext.grid.plugin.filterbar.Operator",

    operatorsTextMap: {
        eq: "On võrdne",
        ne: "Pole võrdne",
        gt: "Suurem kui",
        ge: "Suurem või võrdne",
        lt: "Vähem kui",
        le: "Vähem või võrdne",
        like: "Niisutama",
        nlike: "Mitte nagu",
        empty: "Tühi",
        nempty: "Ei ole tühi",
        identical: "Identne",
        nidentical: "Ei ole identne",
        regex: "Regulaarne väljend",
        "in": "On",
        notin: "Ei ole"
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
