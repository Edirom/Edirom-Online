topSuite('Ext.grid.filters.menu.List', [
    'Ext.data.ArrayStore',
    'Ext.grid.Grid',
    'Ext.data.ArrayStore',
    'Ext.layout.Fit',
    'Ext.app.ViewModel',
    'Ext.grid.filters.*',
    'Ext.grid.filters.menu.Boolean',
    'Ext.grid.filters.menu.List'
],
    function() {

        var grid;

        function getColumnMap(grid) {
            return Ext.Array.toValueMap(grid.getColumns(), function(col) {
                return col.getDataIndex();
            });
        }

        function getGrid() {
            return Ext.create('Ext.grid.Grid', {
                renderTo: Ext.getBody(),
                height: 1000,
                width: 1000,
                title: 'Ext.grid.filters.menu.List',
                store: {
                    data: [{
                        "firstname": "Michael",
                        "middlename": "Phineas",
                        "lastname": "Scott",
                        "male": true,
                        "seniority": 7,
                        "department": "Management",
                        "hired": "2021-01-10T06:00:00.000Z",
                        "active": true
                    }, {
                        "firstname": "Dwight",
                        "middlename": "Thaddeus",
                        "lastname": "Schrute",
                        "male": true,
                        "seniority": 2,
                        "department": "Sales",
                        "hired": "2021-04-01T05:00:00.000Z",
                        "active": true
                    }, {
                        "firstname": "Jim",
                        "middlename": "Ezekiel",
                        "lastname": "Halpert",
                        "male": true,
                        "seniority": 3,
                        "department": "Sales",
                        "hired": "2021-02-22T06:00:00.000Z",
                        "active": false
                    }, {
                        "firstname": "Kevin",
                        "middlename": "Jethro",
                        "lastname": "Malone",
                        "male": true,
                        "seniority": 4,
                        "department": "Accounting",
                        "hired": "2007-06-10T05:00:00.000Z",
                        "active": true
                    }, {
                        "firstname": "Michael", // there are two "Michael"
                        "middlename": "Zebediah",
                        "lastname": "Jones",
                        "male": true,
                        "seniority": 7,
                        "department": "Accounting",
                        "hired": "2021-01-10T06:00:00.000Z",
                        "active": true
                    }, {
                        "firstname": "Angela",
                        "middlename": "Rebecca",
                        "lastname": "Martin",
                        "male": false,
                        "seniority": 5,
                        "department": "Accounting",
                        "hired": "2021-09-10T05:00:00.000Z",
                        "active": false
                    }]
                },
                plugins: {
                    'gridfilters': true
                },
                columns: [{
                    text: 'First Name',
                    dataIndex: 'firstname',
                    editable: true,
                    filter: 'list'
                }, {
                    text: 'Middle Name',
                    dataIndex: 'middlename',
                    filter: {
                        type: 'list',
                        sorted: true,
                        sortDirection: 'ASC', // ASC (default) or DESC
                        menu: {
                            items: {
                                list: {
                                    multiSelect: true
                                }
                            }
                        }
                    }
                }, {
                    text: 'Last Name',
                    dataIndex: 'lastname',
                    filter: {
                        type: 'list',
                        sorted: true,
                        sortDirection: 'ASC' // ASC (default) or DESC
                    }
                }, {
                    text: 'Department',
                    dataIndex: 'department',
                    filter: {
                        type: 'list',
                        menu: {
                            items: {
                                list: {
                                    valueField: 'dept',
                                    displayField: 'dept',
                                    placeholder: 'Choose a dept.',
                                    store: {
                                        sorters: ['dept'],
                                        data: [{
                                            dept: 'Receiving' // This won't match anything
                                        }, {
                                            dept: 'Accounting'
                                        }]
                                    }
                                }
                            }
                        }
                    }
                }, {
                    text: 'Male',
                    dataIndex: 'male',
                    filter: 'boolean'
                }, {
                    text: 'Seniority',
                    dataIndex: 'seniority'
                }, {
                    text: 'Hired Month',
                    dataIndex: 'hired',
                    filter: {
                        type: 'date',
                        menu: {
                            items: {
                                lt: {
                                    label: 'Custom Less than',
                                    placeholder: 'Custom Less than...',
                                    dateFormat: 'd-m-y'
                                },
                                gt: {
                                    label: 'Custom Greater than',
                                    placeholder: 'Custom Greater than...',
                                    dateFormat: 'd-m-y'
                                },
                                eq: {
                                    label: 'Custom On',
                                    placeholder: 'Custom On...',
                                    dateFormat: 'd-m-y'
                                },
                                neq: {
                                    label: 'Custom On',
                                    placeholder: 'Custom On...',
                                    dateFormat: 'd-m-y'
                                }
                            }
                        }
                    }
                }]
            });

        }

        describe("List Filter", function() {

            beforeEach(function() { });
            afterEach(function() {
                grid = Ext.destroy(grid);
            });

            it('each combobox should reflect unique items', function() {
                var columnMap, column, filter, range, submenu;

                grid = getGrid();
                columnMap = getColumnMap(grid);

                ['firstname', 'middlename', 'lastname', 'department'].forEach(function(dataIndex) {
                    column = columnMap[dataIndex];
                    column.showMenu();
                    filter = column.getMenu().down('[type=list]');
                    submenu = filter.getMenu();
                    submenu.show();
                });

                waits(200);

                runs(function() {
                    range = columnMap['firstname'].getMenu().down('[type=list]').getMenu().down('combobox').getStore().collect('text');
                    expect(range).toEqual(["Michael", "Dwight", "Jim", "Kevin", "Angela"]);

                    range = columnMap['middlename'].getMenu().down('[type=list]').getMenu().down('combobox').getStore().collect('text');
                    expect(range).toEqual(["Ezekiel", "Jethro", "Phineas", "Rebecca", "Thaddeus", "Zebediah"]);

                    range = columnMap['lastname'].getMenu().down('[type=list]').getMenu().down('combobox').getStore().collect('text');
                    expect(range).toEqual(["Halpert", "Jones", "Malone", "Martin", "Schrute", "Scott"]);

                    // grid.destroy()
                });

            });

            it('choosing a filter value should be reflected in the store', function() {
                var columnMap, column, filter, combo, store, range, submenu;

                grid = getGrid();
                store = grid.getStore();

                columnMap = getColumnMap(grid);

                ['firstname'].forEach(function(dataIndex) {
                    column = columnMap[dataIndex];
                    column.showMenu();
                    filter = column.getMenu().down('[type=list]');
                    submenu = filter.getMenu();
                    submenu.show();
                });

                waits(200);

                runs(function() {
                    columnMap['firstname'].getMenu().down('[type=list]').getMenu().down('combobox').setValue('Michael');
                });

                waits(600); // THe change event is buffered to 300, so wait a little longer than that.

                runs(function() {
                    expect(store.getCount()).toEqual(2);
                    expect(store.getAt(0).data.firstname).toEqual('Michael');
                    expect(store.getAt(0).data.lastname).toEqual('Scott');
                    expect(store.getAt(1).data.firstname).toEqual('Michael');
                    expect(store.getAt(1).data.lastname).toEqual('Jones');
                });

            });

            it('choosing a multiSelect filter value should be reflected in the store', function() {
                var columnMap, column, filter, combo, store, range, submenu;

                grid = getGrid();
                store = grid.getStore();
                columnMap = getColumnMap(grid);

                ['middlename'].forEach(function(dataIndex) {
                    column = columnMap[dataIndex];
                    column.showMenu();
                    filter = column.getMenu().down('[type=list]');
                    submenu = filter.getMenu();
                    submenu.show();
                });

                waits(200);

                runs(function() {
                    columnMap['middlename'].getMenu().down('[type=list]').getMenu().down('combobox').setValue(["Rebecca", "Thaddeus", "Zebediah"]);
                });

                waits(600); // THe change event is buffered to 300, so wait a little longer than that.

                runs(function() {
                    expect(store.getCount()).toEqual(3);
                    expect(store.getAt(0).data.firstname).toEqual('Dwight');
                    expect(store.getAt(1).data.firstname).toEqual('Michael');
                    expect(store.getAt(2).data.firstname).toEqual('Angela');
                });

            });

            it('choosing a filter, then deselecting the filter, should be reflected in the store', function() {
                var columnMap, column, filter, store, submenu;

                grid = getGrid();
                store = grid.getStore();
                columnMap = getColumnMap(grid);

                ['firstname'].forEach(function(dataIndex) {
                    column = columnMap[dataIndex];
                    column.showMenu();
                    filter = column.getMenu().down('[type=list]');
                    submenu = filter.getMenu();
                    submenu.show();
                });

                waits(200);

                runs(function() {
                    columnMap['firstname'].getMenu().down('[type=list]').getMenu().down('combobox').setValue('Michael');
                });

                waits(600); // THe change event is buffered to 300, so wait a little longer than that.

                runs(function() {
                    expect(store.getCount()).toEqual(2);
                    expect(store.getAt(0).data.firstname).toEqual('Michael');
                    expect(store.getAt(0).data.lastname).toEqual('Scott');
                    expect(store.getAt(1).data.firstname).toEqual('Michael');
                    expect(store.getAt(1).data.lastname).toEqual('Jones');

                    columnMap['firstname'].getMenu().down('[type=list]').setChecked(false);

                });

                waits(400);

                runs(function() {
                    expect(store.getCount()).toEqual(6);
                });

            });

        });
    });
