Ext.define("Ext.locale.mk.grid.plugin.filterbar.Operator", {
    override: "Ext.grid.plugin.filterbar.Operator",

    operatorsTextMap: {
        eq: "Е еднакво",
        ne: "Не е еднакво",
        gt: "Поголем од",
        ge: "Поголема или еднаква на",
        lt: "Помалку од",
        le: "Помалку или еднаква на",
        like: "Допаѓа",
        nlike: "Не како",
        empty: "Празен",
        nempty: "Не е празен",
        identical: "Идентична",
        nidentical: "Не е идентичен",
        regex: "Редовен израз",
        "in": "Е во",
        notin: "Не е внатре"
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
