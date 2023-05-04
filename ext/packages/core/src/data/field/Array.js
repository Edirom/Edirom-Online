/**
 * A data field that deals with array values. See the {@link #itemType} config for controlling
 * the array elements.
 *
 *     @example
 *     Ext.define('Task', {
 *         extend: 'Ext.data.Model',
 *         fields: [{
 *             name: 'milestoneDates',
 *             type: 'array',
 *             itemType: {
 *                 type: 'date',
 *                 dateFormat: 'Y-m-d'
 *             }
 *         }]
 *     });
 *
 *     var record = Ext.create('Task', { milestoneDates: [
 *         '2010-01-01',
 *         '2010-02-01',
 *         '2010-03-01'
 *     ]}), value = record.get('milestoneDates');
 *
 *     Ext.toast(value.join(', '));
 *
 */
Ext.define('Ext.data.field.Array', {
    extend: 'Ext.data.field.Field',

    alias: 'data.field.array',

    isArrayField: true,

    /**
     * @cfg {String/Object/Ext.data.field.Field} itemType
     *
     * Controls the individual elements of the array. This is a field type or configuration
     * that is used to {@link #collate}, {@link #compare}, {@link #isEqual compare equality},
     * {@link #convert} and {@link #deserialize} each element.
     */
    itemType: {
        type: 'auto'
    },

    getType: function() {
        return 'array';
    },

    collate: function(v1, v2) {
        return this.collateOrCompare(v1, v2, 'collate');
    },

    compare: function(v1, v2) {
        return this.collateOrCompare(v1, v2, 'compare');
    },

    convert: function(v) {
        return this.doForEach((v || v === 0) && !Ext.isArray(v) ? [v] : v, 'convert');
    },

    serialize: function(value) {
        return this.doForEach(value, 'serialize');
    },

    /**
     * @private
     */
    getItemField: function() {
        var me = this,
            t = me.itemType;

        if (!me.itemField) {
            if (typeof t === 'string') {
                t = {
                    type: t
                };
            }
            else if (!(t && t.isDataField)) {
                t = Ext.apply({
                    type: 'auto'
                }, t);
            }

            me.itemField = Ext.data.field.Field.create(t);
        }

        return me.itemField;
    },

    /**
     * @private
     */
    doForEach: function(v, fn) {
        if (!v) {
            return this.allowNull ? null : [];
        }

        // eslint-disable-next-line vars-on-top
        var len = v.length,
            ret = Array(len),
            field = this.getItemField(),
            i;

        for (i = 0; i < len; ++i) {
            ret[i] = field[fn] ? field[fn](v[i]) : v[i];
        }

        return ret;
    },

    /**
     * @private
     */
    collateOrCompare: function(v1, v2, fn) {
        var field = this.getItemField(),
            i, len1, len2, len, result;

        if ((!v1 && !v2) || (v1 === v2)) {
            return 0;
        }

        if (!v1 || !v2) {
            return v1 ? 1 : -1;
        }

        len1 = v1.length;
        len2 = v2.length;

        len = Math.min(len1, len2);

        for (i = 0; i < len; ++i) {
            result = field[fn](v1[i], v2[i]);

            if (result !== 0) {
                return result;
            }
        }

        return len1 === len2 ? 0 : (len1 < len2 ? -1 : 1);
    }
});
