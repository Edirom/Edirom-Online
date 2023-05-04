Ext.define("Ext.locale.vn.grid.plugin.filterbar.Operator", {
    override: "Ext.grid.plugin.filterbar.Operator",

    operatorsTextMap: {
        eq: "Bằng nhau",
        ne: "Không công bằng",
        gt: "Lớn hơn",
        ge: "Lớn hơn hoặc bằng",
        lt: "Ít hơn",
        le: "Ít hơn hoặc bằng",
        like: "Như",
        nlike: "Không thích",
        empty: "Trống",
        nempty: "Không trống rỗng",
        identical: "Giống hệt nhau",
        nidentical: "Không định nghĩa",
        regex: "Biểu hiện thông thường",
        "in": "Trong",
        notin: "Không có trong"
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
