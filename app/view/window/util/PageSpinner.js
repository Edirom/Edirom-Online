Ext.define('EdiromOnline.view.window.util.PageSpinner', {
    extend: 'Ext.container.Container',

    alias : 'widget.pageSpinner',

    layout: 'hbox',

    initComponent: function () {
        var me = this;
        me.items = [
        ];
        me.callParent();
    },

    next: function() {
        var me = this;
        me.store.clearFilter(false);

        var oldIndex = me.store.findExact('id', me.combo.getValue());
        if(oldIndex + 1 < me.store.getCount())
            me.setPage(me.store.getAt(oldIndex + 1).get('id'));
    },

    prev: function() {
        var me = this;
        me.store.clearFilter(false);

        var oldIndex = me.store.findExact('id', me.combo.getValue());
        if(oldIndex > 0)
            me.setPage(me.store.getAt(oldIndex - 1).get('id'));
    },

    setPage: function(id) {
        var me = this;
        me.combo.setValue(id);
        me.owner.setPage(me.combo, me.combo.store);
    },

    setStore: function(store) {
        var me = this;
        me.removeAll();

        me.store = store;

        me.combo = Ext.create('Ext.form.ComboBox', {
            width: 45,
            hideTrigger: true,
            queryMode: 'local',
            store: store,
            displayField: 'name',
            valueField: 'id',
            cls: 'pageInputBox',
            autoSelect: true
        });

        me.add([
            {
                xtype: 'button',
                cls : 'prev toolButton',
                tooltip: { text: getLangString('view.window.source.SourceView_PageBasedView_previousPage'), align: 'bl-tl' },
                listeners:{
                     scope: me,
                     click: me.prev
                }
            },
            me.combo,
            {
                xtype: 'button',
                cls : 'next toolButton',
                tooltip: { text: getLangString('view.window.source.SourceView_PageBasedView_nextPage'), align: 'bl-tl' },
                listeners:{
                     scope: me,
                     click: me.next
                }
            }
        ]);

        me.combo.on('select', me.owner.setPage, me.owner);
    }
});