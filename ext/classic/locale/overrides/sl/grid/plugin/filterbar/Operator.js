Ext.define("Ext.locale.sl.grid.plugin.filterbar.Operator", {
    override: "Ext.grid.plugin.filterbar.Operator",

    operatorsTextMap: {
        eq: "Je enak",
        ne: "Ni enak",
        gt: "Večji kot",
        ge: "Večja ali enaka",
        lt: "Manj kot",
        le: "Manj kot ali enako",
        like: "Kot.",
        nlike: "Ne",
        empty: "Prazno",
        nempty: "Ne praznega",
        identical: "Enaka",
        nidentical: "Ni identičen",
        regex: "Vsakdanje izražanje",
        "in": "Je v",
        notin: "Ni v"
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
