Ext.define("Ext.locale.th.grid.plugin.filterbar.Operator", {
    override: "Ext.grid.plugin.filterbar.Operator",

    operatorsTextMap: {
        eq: "เท่ากัน",
        ne: "ไม่เท่ากับ",
        gt: "มากกว่า",
        ge: "มากกว่าหรือเท่ากับ",
        lt: "น้อยกว่า",
        le: "น้อยกว่าหรือเท่ากับ",
        like: "ชอบ",
        nlike: "ไม่ชอบ",
        empty: "ว่างเปล่า",
        nempty: "ไม่ว่างเปล่า",
        identical: "เหมือนกัน",
        nidentical: "ไม่เหมือนกัน",
        regex: "การแสดงออกปกติ",
        "in": "อยู่ใน",
        notin: "ไม่ได้อยู่ใน"
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
