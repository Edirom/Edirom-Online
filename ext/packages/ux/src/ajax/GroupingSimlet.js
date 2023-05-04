Ext.define('Ext.ux.ajax.GroupingSimlet', {
    extend: 'Ext.ux.ajax.JsonSimlet',
    alias: 'simlet.grouping',

    lastPost: null, // last Ajax params sent to this simlet
    lastResponse: null, // last JSON response produced by this simlet

    doGet: function(ctx) {
        var me = this,
            data = me.getData(ctx),
            page = me.getPage(ctx, data),
            reader = ctx.xhr.options.proxy && ctx.xhr.options.proxy.getReader(),
            root = reader && reader.getRootProperty(),
            ret = me.callParent(arguments), // pick up status/statusText
            response = {},
            summary = {},
            i, len, s;

        if (root && Ext.isArray(page)) {
            response[root] = page;
            response[reader.getTotalProperty()] = data.length;
        }
        else {
            response = page;
        }

        if (ctx.groupSpec && ctx.summarySpec) {
            response[reader.getGroupRootProperty()] = me.getGroupSummaries(ctx, data, page);
            len = ctx.summarySpec.length;

            for (i = 0; i < len; i++) {
                s = ctx.summarySpec[i];
                summary[s.name] = s.data.calculate(data, s.name, null, 0, data.length);
            }

            response[reader.getSummaryRootProperty()] = summary;
        }

        me.lastResponse = response;
        ret.responseText = Ext.encode(me.lastResponse);

        return ret;
    },

    doPost: function(ctx) {
        return this.doGet(ctx);
    },

    getData: function(ctx) {
        var me = this,
            params = ctx.params,
            order = (params.filter || '') + (params.group || '') + '-' +
                (params.sort || '') + '-' + (params.dir || ''),
            tree = me.tree,
            data, fields, sortFn, filters;

        if (tree) {
            me.fixTree(ctx, tree);
        }

        me.lastPost = params;
        data = me.data;

        if (typeof data === 'function') {
            data = data.call(this, ctx);
        }

        // If order is '--' then it means we had no order passed, due to the string concat above
        if (!data || order === '--') {
            return data || [];
        }

        ctx.filterSpec = params.filter && Ext.decode(params.filter);
        ctx.groupSpec = params.group && Ext.decode(params.group);
        ctx.summarySpec = params.summary && Ext.decode(params.summary);

        fields = params.sort;

        if (params.dir) {
            fields = [{ direction: params.dir, property: fields }];
        }
        else {
            fields = params.sort && Ext.decode(params.sort);
        }

        if (ctx.filterSpec) {
            filters = new Ext.util.FilterCollection();
            filters.add(this.processFilters(ctx.filterSpec));
            data = Ext.Array.filter(data, filters.getFilterFn());
        }

        sortFn = this.makeSortFns((ctx.sortSpec = fields));

        if (ctx.groupSpec) {
            sortFn = this.makeSortFns(ctx.groupSpec, sortFn);
        }

        // If a straight Ajax request, data may not be an array.
        // If an Array, preserve 'physical' order of raw data...
        data = Ext.isArray(data) ? data.slice(0) : data;

        if (sortFn) {
            Ext.Array.sort(data, sortFn);
        }

        me.sortedData = data;
        me.currentOrder = order;

        return data;
    },

    getGroupSummaries: function(ctx, data, page) {
        var groupers = ctx.groupSpec,
            summaries = ctx.summarySpec,
            out = [],
            i, j, k, len, length, len2, grouper, record, values, summary, keys;

        len = groupers.length;

        for (i = 0; i < len; i++) {
            grouper = groupers[i];
            values = Ext.Array.pluck(page, grouper.property);
            grouper.values = Ext.Array.unique(values);
        }

        for (i = 0; i < len; i++) {
            grouper = groupers[i];
            values = grouper.values;
            length = values.length;
            record = {};

            if (i > 0) {
                len2 = out.length;

                for (j = 0; j < len2; j++) {
                    for (k = 0; k < length; k++) {
                        record = Ext.clone(out[j]);
                        record[grouper.property] = values[k];
                        out.push(record);
                    }
                }
            }
            else {
                for (j = 0; j < length; j++) {
                    record = {};
                    record[grouper.property] = values[j];
                    out.push(record);
                }
            }
        }

        len = out.length;

        for (i = 0; i < len; i++) {
            record = out[i];
            keys = Ext.Object.getKeys(record);

            values = Ext.Array.filter(data, function(item) {
                var match = true,
                    i, len, key;

                len = keys.length;

                for (i = 0; i < len; i++) {
                    key = keys[i];
                    match = match && item[key] === record[key];
                }

                return match;
            });

            length = summaries.length;

            for (j = 0; j < length; j++) {
                summary = summaries[j];

                if (!summary.data) {
                    summary.data = Ext.Factory.dataSummary(summary.summary);
                }

                // eslint-disable-next-line max-len
                record[summary.name] = summary.data.calculate(values, summary.name, null, 0, values.length);
            }
        }

        return out;
    },

    makeSortFn: function(def, cmp) {
        var order = def.direction,
            sign = (order && order.toUpperCase() === 'DESC') ? -1 : 1;

        return function(leftRec, rightRec) {
            var lhs = leftRec[def.property],
                rhs = rightRec[def.property],
                c = (lhs < rhs) ? -1 : ((rhs < lhs) ? 1 : 0);

            if (c || !cmp) {
                return c * sign;
            }

            return cmp(leftRec, rightRec);
        };
    },

    makeSortFns: function(defs, cmp) {
        var sortFn, i;

        defs = Ext.Array.from(defs);

        for (sortFn = cmp, i = defs && defs.length; i;) {
            sortFn = this.makeSortFn(defs[--i], sortFn);
        }

        return sortFn;
    }
});
