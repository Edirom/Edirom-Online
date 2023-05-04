Ext.define('Ext.theme.material.form.field.Text', {
    override: 'Ext.form.field.Text',

    labelSeparator: '',

    initComponent: function() {
        this.callParent();

        this.on({
            change: function(field, value) {
                if (field.el) {
                    field.el.toggleCls('not-empty', !Ext.isEmpty(value) || field.emptyText);
                }
            },

            render: function(ths, width, height, eOpts) {
                if ((!Ext.isEmpty(ths.getValue()) || ths.emptyText) && ths.el) {
                    ths.el.addCls('not-empty');
                }
            }
        });
    }
});
