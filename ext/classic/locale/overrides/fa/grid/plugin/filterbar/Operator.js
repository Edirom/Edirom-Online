Ext.define("Ext.locale.fa.grid.plugin.filterbar.Operator", {
    override: "Ext.grid.plugin.filterbar.Operator",

    operatorsTextMap: {
        eq: "برابر است",
        ne: "نا برابر",
        gt: "بزرگتر از",
        ge: "بزرگتر یا مساوی با",
        lt: "کمتر از",
        le: "کمتر یا برابر است",
        like: "پسندیدن",
        nlike: "مثل",
        empty: "خالی",
        nempty: "خالی نیست",
        identical: "همسان",
        nidentical: "نه یکسان",
        regex: "عبارت منظم",
        "in": "هست در",
        notin: "در حال حاضر نیست"
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
