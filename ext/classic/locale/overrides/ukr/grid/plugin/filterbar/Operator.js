Ext.define("Ext.locale.ukr.grid.plugin.filterbar.Operator", {
    override: "Ext.grid.plugin.filterbar.Operator",

    operatorsTextMap: {
        eq: "Дорівнює",
        ne: "Не рівний",
        gt: "Більше ніж",
        ge: "Більше або дорівнює",
        lt: "Менш ніж",
        le: "Менше або дорівнює",
        like: "Подобається",
        nlike: "Не люблять",
        empty: "Порожній",
        nempty: "Не порожній",
        identical: "Ідентичний",
        nidentical: "Не ідентичні",
        regex: "Регулярне вираження",
        "in": "Є в",
        notin: "Не в"
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
