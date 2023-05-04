topSuite("Ext.panel.Table",
    ['Ext.grid.Panel',
     'Ext.layout.container.Card',
     'Ext.grid.plugin.RowWidget',
     'Ext.button.Button',
     'Ext.tree.Panel'],
function() {
    var createGrid = function(storeCfg, gridCfg) {
            store = Ext.create('Ext.data.Store', Ext.apply({
                storeId: 'simpsonsStore',
                fields: ['name', 'email', 'phone'],
                data: { 'items': [
                    { 'name': 'Lisa',  "email": "lisa@simpsons.com",  "phone": "555-111-1224"  },
                    { 'name': 'Bart',  "email": "bart@simpsons.com",  "phone": "555-222-1234"  },
                    { 'name': 'Homer', "email": "homer@simpsons.com", "phone": "555-222-1244"  },
                    { 'name': 'Marge', "email": "marge@simpsons.com", "phone": "555-222-1254"  }
                ] },
                proxy: {
                    type: 'memory',
                    reader: {
                        type: 'json',
                        rootProperty: 'items'
                    }
                }
            }, storeCfg));

            grid = Ext.create('Ext.grid.Panel', Ext.apply({
                title: 'Simpsons',
                store: store,
                columns: [
                    { header: 'Name',  dataIndex: 'name', width: 100 },
                    { header: 'Email', dataIndex: 'email', flex: 1 },
                    { header: 'Phone', dataIndex: 'phone', flex: 1, hidden: true }
                ],
                height: 200,
                width: 400
            }, gridCfg));
        },
        store, grid;

    afterEach(function() {
        grid = store = Ext.destroy(store, grid);
    });

    describe('forceFit', function() {
        it('should let the headerCt know it is part of a forceFit grid when header is a grid config', function() {
            createGrid({}, {
                forceFit: true
            });

            expect(grid.forceFit).toBe(true);
            expect(grid.headerCt.forceFit).toBe(true);
        });

        it('should let the headerCt know it is part of a forceFit grid when header is an instance', function() {
            createGrid({}, {
                forceFit: true,
                columns: new Ext.grid.header.Container({
                    items: [
                        { header: 'Name',  dataIndex: 'name', width: 100 },
                        { header: 'Email', dataIndex: 'email', flex: 1 },
                        { header: 'Phone', dataIndex: 'phone', flex: 1, hidden: true }
                    ]
                })
            });

            expect(grid.forceFit).toBe(true);
            expect(grid.headerCt.forceFit).toBe(true);
        });
    });

    describe("scrollable", function() {
        // https://sencha.jira.com/browse/EXTJS-15736
        it("should not throw exception on autoScroll config when locking", function() {
            expect(function() {
                createGrid(null, {
                    height: 400,
                    width: 600,
                    autoScroll: true,
                    store: store,
                    columns: [
                        { text: 'Name',  dataIndex: 'name', hideable: false, width: 35, locked: true },
                        { text: 'Email', dataIndex: 'email', flex: 1 },
                        { text: 'Phone', dataIndex: 'phone' },
                        { text: 'Phone', dataIndex: 'phone' },
                        { text: 'Phone', dataIndex: 'phone' },
                        { text: 'Phone', dataIndex: 'phone' },
                        { text: 'Phone', dataIndex: 'phone' },
                        { text: 'Phone', dataIndex: 'phone' },
                        { text: 'Phone', dataIndex: 'phone' },
                        { text: 'Phone', dataIndex: 'phone' },
                        { text: 'Phone', dataIndex: 'phone' },
                        { text: 'Phone', dataIndex: 'phone' },
                        { text: 'Phone', dataIndex: 'phone' },
                        { text: 'Phone', dataIndex: 'phone' }
                    ],
                    renderTo: document.body
                });
            }).not.toThrow();
        });
    });

    describe('tablepanel focus', function() {
        var card;

        afterEach(function() {
            card = Ext.destroy(card);
        });

        // https://sencha.jira.com/browse/EXTJS-24162
        it('should not focus if the table view is not visible', function() {
            card = Ext.create({
                xtype: 'container',
                layout: 'card',
                itemId: 'cards',
                items: [{
                    xtype: 'grid',
                    store: [1, 2, 3],
                    columns: [{
                        dataIndex: 'field1',
                        flex: 1
                    }],
                    plugins: {
                        ptype: 'rowwidget',
                        selectRowOnExpand: true,
                        widget: {
                            xtype: 'grid',
                            store: ['X'],
                            columns: [{
                                dataIndex: 'field1',
                                flex: 1
                            }],
                            listeners: {
                                cellclick: function() {

                                    this.up('#cards').setActiveItem(1);
                                }
                            }
                        }
                    }
                }, {
                    xtype: 'container',
                    items: [{
                        xtype: 'button',
                        text: 'back',
                        handler: function() {
                            this.up('#cards').setActiveItem(0);
                        }
                    }]
                }],
                renderTo: Ext.getBody()
            });

            expect(function() {
                jasmine.fireMouseEvent(card.down('grid').el.dom.querySelector('.x-grid-row-expander'), 'click', null, null, true);
                card.down('grid').el.dom.querySelectorAll('tr .x-grid-cell')[3].click();
                card.down('button').el.dom.click();
            }).not.toThrow();
        });
    });

    describe('Table focus', function() {
        var treegrid, cell;

        afterEach(function() {
            cell = Ext.destroy(cell);
            treegrid = treegrid.destroy();
        });

        it('Should focus directly on the cell on tab if headers are hidden', function() {
            treegrid = Ext.create('Ext.tree.Panel', {
                renderTo: Ext.getBody(),
                title: 'TreeGrid',
                hideHeaders: true,
                fields: ['name', 'description'],
                columns: {
                    items: [{
                        xtype: 'treecolumn',
                        text: 'Name',
                        dataIndex: 'name',
                        flex: 1,
                        sortable: true
                    }, {
                        text: 'Description',
                        dataIndex: 'description',
                        flex: 1,
                        sortable: true
                    }]
                },
                root: {
                    name: 'Root',
                    description: 'Root description',
                    expanded: true,
                    children: [{
                        name: 'Child 1',
                        description: 'Description 1',
                        leaf: false,
                        expanded: true,
                        children: [{
                            name: 'Child 1.1',
                            description: 'Description 1.1',
                            expanded: true,
                            leaf: true
                        }]
                    }, {
                        name: 'Child 2',
                        description: 'Description 2',
                        leaf: true
                    }]
                }
            });

            Ext.getBody().focus();

            waitsFor(function() {
                return  expect(Ext.getBody().dom).toEqual(Ext.Element.getActiveElement());
            }, 'Body to focus');

            runs(function() {
                cell = treegrid.getView().getCellByPosition({
                    row: 0,
                    column: 0
                    });

                jasmine.simulateTabKey(treegrid.header.el, true);
                expect(cell.el.dom).toEqual(Ext.Element.getActiveElement());
            });
        });
    });
});
