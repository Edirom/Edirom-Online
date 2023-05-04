Ext.define("Ext.locale.fi.grid.plugin.filterbar.Operator", {
    override: "Ext.grid.plugin.filterbar.Operator",
    operatorsTextMap: {
        eq: "On yhtä kuin",
        ne: "Ei ole yhtä suuri",
        gt: "Suurempi kuin",
        ge: "Suurempi tai yhtä suuri kuin",
        lt: "Vähemmän kuin",
        le: "Pienempi kuin tai yhtä suuri kuin",
        like: "Kuten",
        nlike: "Ei niin kuin",
        empty: "Tyhjä",
        nempty: "Ei tyhjä",
        identical: "Samanlainen",
        nidentical: "Ei identtinen",
        regex: "Tavallinen ilme",
        in: "On",
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
