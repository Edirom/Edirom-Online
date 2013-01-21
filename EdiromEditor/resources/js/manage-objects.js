Ext.create('Ext.data.Store', {
    storeId:'manageObjectsStore',
    autoLoad: true,
    fields: [
        'uri', 'filename', 'creation'
    ],
    proxy: {
        type: 'ajax',
        url: 'data/getObjects.xql',
        reader: {
            type: 'xml',
            record: 'object',
            root: 'objects',
            totalProperty  : 'total',
            successProperty: 'success'
        }
    }
});

var panel = Ext.create('Ext.grid.Panel', {
    store: Ext.data.StoreManager.lookup('manageObjectsStore'),
    columns: [
    {
        xtype:'actioncolumn',
        width:50,
        items: [
        {
            icon: 'resources/img/go-next.png',
            tooltip: 'Edit',
            handler: function(grid, rowIndex, colIndex) {
                var rec = grid.getStore().getAt(rowIndex);
                window.location.href = 'editor.html?uri=' + rec.get('uri');
            }
        },
        {
            icon: 'resources/img/go-next.png',
            tooltip: 'Delete',
            handler: function(grid, rowIndex, colIndex) {
                var rec = grid.getStore().getAt(rowIndex);
                alert("Delete " + rec.get('filename'));
            }
        }
        ]
    },
    {
        header: 'Filename',
        dataIndex: 'filename',
        flex: 1
    },
    {
        header: 'Creation', 
        dataIndex: 'creation',
        width: 140,
        type: 'date',
        renderer: function(value) {
            var date = Ext.Date.parse(value, 'c');
            return Ext.Date.format(date, 'Y-m-d H:iP');
        }
    }
    ],
    preventHeader: true,
    height: '100%',
    width: '100%',
    renderTo: Ext.fly('manageObjectTable')
});

Ext.EventManager.onWindowResize(function(event) {
    var size = Ext.fly('manageObjectTable').getViewSize();
    this.setSize(size.width, size.height);
}, panel);
