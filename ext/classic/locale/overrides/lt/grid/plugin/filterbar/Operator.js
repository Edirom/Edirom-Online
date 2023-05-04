Ext.define("Ext.locale.lt.grid.plugin.filterbar.Operator", {
    override: "Ext.grid.plugin.filterbar.Operator",

    operatorsTextMap: {
        eq: "Yra lygus",
        ne: "Nėra lygus",
        gt: "Geresnis negu",
        ge: "Didesnis arba lygus",
        lt: "Mažiau nei",
        le: "Mažesnis arba lygus",
        like: "Kaip",
        nlike: "Nepatinka",
        empty: "Tuščia",
        nempty: "Ne tuščias",
        identical: "Identiškas",
        nidentical: "Nėra identiški",
        regex: "Įprasta išraiška",
        "in": "Yra",
        notin: "Nėra"
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
