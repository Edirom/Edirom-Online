Ext.define("Ext.locale.en_GB.grid.plugin.filterbar.Operator", {
    override: "Ext.grid.plugin.filterbar.Operator",

    operatorsTextMap: {
        eq: "Is equal",
        ne: "Not equal",
        gt: "Greater than",
        ge: "Greater than or equal to",
        lt: "Less than",
        le: "Less than or equal to",
        like: "Like",
        nlike: "Not like",
        empty: "Empty",
        nempty: "Not empty",
        identical: "Identical",
        nidentical: "Not identical",
        regex: "Regular expression",
        "in": "Is in",
        notin: "Is not in"
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
