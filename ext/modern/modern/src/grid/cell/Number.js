/**
 * This class displays a numeric value in a {@link Ext.grid.Grid grid} cell. This cell type
 * is typically used by specifying {@link Ext.grid.column.Number} column type.
 *
 * {@link Ext.grid.Row Rows} create cells based on the {@link Ext.grid.column.Column#cell}
 * config. Application code would rarely create cells directly.
 */
Ext.define('Ext.grid.cell.Number', {
    extend: 'Ext.grid.cell.Text',
    xtype: 'numbercell',

    isNumberCell: true,

    requires: [
        'Ext.util.Format'
    ],

    config: {
        /**
         * @cfg {String} format
         * A format string as used by {@link Ext.util.Format#number} to format values for
         * this column.
         */
        format: '0,000.00',

        /**
         * @cfg {Function/String} renderer
         * A renderer is a method which can be used to transform data (value, appearance, etc.)
         * before it is rendered.
         *
         * For example:
         *
         *      {
         *          text: 'Some column',
         *          dataIndex: 'fieldName',
         *
         *          renderer: function (value, record) {
         *              if (value === 1) {
         *                  return '1 person';
         *              }
         *              return value + ' people';
         *          }
         *      }
         *
         * If a string is supplied, it should be the name of a renderer method from the
         * appropriate {@link Ext.app.ViewController}.
         *
         * This config is only processed if the {@link #cell} type is the default of
         * {@link Ext.grid.cell.Cell gridcell}.
         *
         * **Note** See {@link Ext.grid.Grid} documentation for other, better alternatives
         * to rendering cell content.
         *
         * @cfg {Object} renderer.value The data value for the current cell.
         * @cfg {Ext.data.Model} renderer.record The record for the current row.
         * @cfg {Number} renderer.dataIndex The dataIndex of the current column.
         * @cfg {Ext.grid.cell.Base} renderer.cell The current cell.
         * @cfg {Ext.grid.column.Column} renderer.column The current column.
         * @cfg {String} renderer.return The HTML string to be rendered.
         */
        renderer: null,

        /**
         * @cfg {Object} scope
         * The scope to use when calling the {@link #renderer} function.
         */
        scope: null
    },

    classCls: Ext.baseCSSPrefix + 'numbercell',

    zeroValue: null,

    updateColumn: function(column, oldColumn) {
        var me = this,
            format, renderer;

        this.callParent([ column, oldColumn ]);

        if (column && column.isNumberColumn) {
            format = column.getFormat();
            renderer = column.getRenderer();

            if (renderer !== null) {
                me.setRenderer(renderer);
            }

            if (format !== null) {
                this.setFormat(format);
            }
        }
    },

    updateFormat: function(format) {
        if (!this.isConfiguring) {
            this.writeValue();
        }
    },

    formatValue: function(value) {
        var me = this,
            context = me.refreshContext,
            dataIndex = context ? context.column.getDataIndex() : me.dataIndex,
            column = context ? context.column : me.column,
            record = context ? context.record : me.record,
            zeroValue = me.getZeroValue(),
            hasValue = value || value === 0,
            renderer = me.getRenderer(),
            args, scope;

        if (value === 0 && zeroValue !== null) {
            value = zeroValue || '';
        }
        else if (renderer) {
            args = [value, record, dataIndex, me, column];
            scope = me.getScope() || context.scope;

            if (typeof renderer === 'function') {
                value = renderer.apply(scope || column, args);
            }
            else {
                value = Ext.callback(renderer, scope, args, 0, me);
            }
        }
        else {
            value = hasValue ? Ext.util.Format.number(value, this.getFormat()) : '';
        }

        return value;
    }
});
