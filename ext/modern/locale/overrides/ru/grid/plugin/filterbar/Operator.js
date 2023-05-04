Ext.define("Ext.locale.ru.grid.plugin.filterbar.Operator", {
    override: "Ext.grid.plugin.filterbar.Operator",
    operatorsTextMap: {
        eq: "Равно",
        ne: "Не равный",
        gt: "Больше чем",
        ge: "Больше или равно",
        lt: "Меньше, чем",
        le: "Меньше или равно",
        like: "Нравиться",
        nlike: "Не как",
        empty: "Пустой",
        nempty: "Не пустой",
        identical: "Идентичный",
        nidentical: "Не идентично",
        regex: "Регулярное выражение",
        in: "В",
        notin: "Не включен"
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
