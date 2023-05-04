topSuite("Ext.grid.TreeGrouped", [
    'Ext.data.ArrayStore', 'Ext.layout.Fit', 'Ext.util.Format',
    'Ext.grid.plugin.GroupingPanel', 'Ext.grid.plugin.Summaries',
    'Ext.MessageBox', 'Ext.grid.SummaryRow', 'Ext.app.ViewModel'
], function() {
    function isBlank(s) {
        return !s || s === '\xA0' || s === '&nbsp;';
    }

    function expectBlank(s) {
        if (!isBlank(s)) {
            expect(s).toBe('');
        }
    }

    var store, grid,
        gridEvents = {},
        colMap,
        Sale = Ext.define(null, {
            extend: 'Ext.data.Model',

            fields: [
                { name: 'id',        type: 'int' },
                { name: 'company',   type: 'string' },
                { name: 'person',    type: 'string', summary: 'count' },
                { name: 'date',      type: 'date', defaultValue: new Date(2012, 0, 1) },
                { name: 'value',     type: 'float', defaultValue: null, summary: 'sum' },
                {
                    name: 'year',
                    convert: function(v, record) {
                        var d = record.get('date');

                        return d ? d.getFullYear() : null;
                    }
                }, {
                    name: 'month',
                    convert: function(v, record) {
                        var d = record.get('date');

                        return d ? d.getMonth() : null;
                    }
                }]
        });

    function getEventHandler(type) {
        return function() {
            gridEvents = {};
            gridEvents[type] = true;
        };
    }

    function checkRowCells(index, values) {
        var rowCells = grid.getItemAt(index).cells,
            len = values.length,
            cells = [],
            html, i, cell;

        for (i = 0; i < rowCells.length; i++) {
            if (rowCells[i].isVisible()) {
                cells[cells.length] = rowCells[i];
            }
        }

        for (i = 0; i < len; i++) {
            cell = cells[i];

            cell = cell.element.down('.x-grid-group-title', true) ||
                cell.element.down('.x-body-el', true);

            html = cell.innerHTML;

            if (isBlank(values[i])) {
                expectBlank(html);
            }
            else {
                expect(html).toBe(values[i]);
            }
        }
    }

    function makeGrid(gridConfig, storeConfig, storeData) {
        store = new Ext.data.Store(Ext.merge({
            model: Sale,
            proxy: {
                type: 'memory',
                limitParam: null,
                data: storeData || [
                    { company: 'Microsoft', person: 'John', date: new Date(), value: 1 },
                    { company: 'Adobe', person: 'John', date: new Date(), value: 2 },
                    { company: 'Microsoft', person: 'Helen', date: new Date(), value: 3 }
                ],
                reader: {
                    type: 'json'
                }
            },
            autoLoad: true
        }, storeConfig));

        // Reset flag that is set when the pivot grid has processed the data and rendered
        gridEvents = {};

        grid = new Ext.grid.TreeGrouped(Ext.merge({
            title: 'Test tree grouping',
            collapsible: true,
            multiSelect: true,
            height: 400,
            width: 750,

            store: store,

            columns: [
                { text: 'Company', dataIndex: 'company', itemId: 'c1' },
                { text: 'Person', dataIndex: 'person', itemId: 'c2' },
                { text: 'Date', dataIndex: 'date', xtype: 'datecolumn', itemId: 'c3' },
                { text: 'Value', dataIndex: 'value', xtype: 'numbercolumn', itemId: 'c4' },
                { text: 'Year', dataIndex: 'year', itemId: 'c5' }
            ],

            renderTo: document.body
        }, gridConfig));

        // the store is refreshed when multi grouping is done
        grid.getStore().on({
            refresh: getEventHandler('done')
        });

        setColMap();
    }

    function flushGridEvents() {
        gridEvents = null;
        grid.getStore().flushFireRefresh();
    }

    function setColMap() {
        colMap = {};

        grid.query('column').forEach(function(col) {
            colMap[col.getItemId()] = col;
        });
    }

    function destroyGrid() {
        Ext.destroy(grid, store);
        store = grid = colMap = null;
        gridEvents = {};
    }

    afterEach(destroyGrid);

    describe('cells rendering', function() {
        describe('grand summaries', function() {
            it('should render cells correctly with no summary', function() {
                makeGrid({
                    summaryPosition: 'hidden'
                }, {
                    groupers: 'company'
                });

                waitsFor(function() {
                    return gridEvents && gridEvents.done;
                }, 'grid to be ready');

                runs(function() {
                    checkRowCells(0, ['Adobe', '', '1', '', '2.00', '']);
                    checkRowCells(1, ['Microsoft', '', '2', '', '4.00', '']);
                });
            });

            it('should render cells correctly with summary on top', function() {
                makeGrid({
                    summaryPosition: 'top'
                }, {
                    groupers: 'company'
                });

                waitsFor(function() {
                    return gridEvents && gridEvents.done;
                }, 'grid to be ready');

                runs(function() {
                    checkRowCells(0, ['Summary (3)', '', '3', '', '6.00', '']);
                    checkRowCells(1, ['Adobe', '', '1', '', '2.00', '']);
                    checkRowCells(2, ['Microsoft', '', '2', '', '4.00', '']);
                });
            });

            it('should render cells correctly with summary on bottom', function() {
                makeGrid({
                    summaryPosition: 'bottom'
                }, {
                    groupers: 'company'
                });

                waitsFor(function() {
                    return gridEvents && gridEvents.done;
                }, 'grid to be ready');

                runs(function() {
                    checkRowCells(0, ['Adobe', '', '1', '', '2.00', '']);
                    checkRowCells(1, ['Microsoft', '', '2', '', '4.00', '']);
                    checkRowCells(2, ['Summary (3)', '', '3', '', '6.00', '']);
                });
            });

            it('should render cells correctly when expanded', function() {
                makeGrid({
                    summaryPosition: 'bottom'
                }, {
                    groupers: 'company'
                });

                grid.expandAll();
                flushGridEvents();

                waitsFor(function() {
                    return gridEvents && gridEvents.done;
                }, 'grid to be ready');

                runs(function() {
                    var year = new Date().getFullYear() + '',
                        d = Ext.util.Format.date(new Date(), 'm/d/Y');

                    checkRowCells(0, ['Adobe', '', '', '', '', '']);
                    checkRowCells(1, ['', 'Adobe', 'John', d, '2.00', year]);
                    checkRowCells(2, ['Summary (Adobe)', '', '1', '', '2.00', '']);
                    checkRowCells(3, ['Microsoft', '', '', '', '', '']);
                    checkRowCells(4, ['', 'Microsoft', 'John', d, '1.00', year]);
                    checkRowCells(5, ['', 'Microsoft', 'Helen', d, '3.00', year]);
                    checkRowCells(6, ['Summary (Microsoft)', '', '2', '', '4.00', '']);
                    checkRowCells(7, ['Summary (3)', '', '3', '', '6.00', '']);
                });
            });

        });

        describe('group summaries', function() {
            it('should show group summaries on header', function() {
                makeGrid({
                    groupSummaryPosition: 'top',
                    summaryPosition: 'hidden'
                }, {
                    groupers: ['company', 'person']
                });

                grid.expandAll();
                flushGridEvents();

                waitsFor(function() {
                    return gridEvents && gridEvents.done;
                }, 'grid to be ready');

                runs(function() {
                    var year = new Date().getFullYear() + '',
                        d = Ext.util.Format.date(new Date(), 'm/d/Y');

                    checkRowCells(0, ['Adobe', '', '1', '', '2.00', '']);
                    checkRowCells(1, ['John', '', '1', '', '2.00', '']);
                    checkRowCells(2, ['', 'Adobe', 'John', d, '2.00', year]);
                    checkRowCells(3, ['Microsoft', '', '2', '', '4.00', '']);
                    checkRowCells(4, ['Helen', '', '1', '', '3.00', '']);
                    checkRowCells(5, ['', 'Microsoft', 'Helen', d, '3.00', year]);
                    checkRowCells(6, ['John', '', '1', '', '1.00', '']);
                    checkRowCells(7, ['', 'Microsoft', 'John', d, '1.00', year]);
                });
            });
            it('should show group summaries on footer', function() {
                makeGrid({
                    groupSummaryPosition: 'bottom',
                    summaryPosition: 'hidden'
                }, {
                    groupers: ['company', 'person']
                });

                grid.expandAll();
                flushGridEvents();

                waitsFor(function() {
                    return gridEvents && gridEvents.done;
                }, 'grid to be ready');

                runs(function() {
                    var year = new Date().getFullYear() + '',
                        d = Ext.util.Format.date(new Date(), 'm/d/Y');

                    checkRowCells(0, ['Adobe', '', '', '', '', '']);
                    checkRowCells(1, ['John', '', '', '', '', '']);
                    checkRowCells(2, ['', 'Adobe', 'John', d, '2.00', year]);
                    checkRowCells(3, ['Summary (John)', '', '1', '', '2.00', '']);
                    checkRowCells(4, ['Summary (Adobe)', '', '1', '', '2.00', '']);
                    checkRowCells(5, ['Microsoft', '', '', '', '', '']);
                    checkRowCells(6, ['Helen', '', '', '', '', '']);
                    checkRowCells(7, ['', 'Microsoft', 'Helen', d, '3.00', year]);
                    checkRowCells(8, ['Summary (Helen)', '', '1', '', '3.00', '']);
                    checkRowCells(9, ['John', '', '', '', '', '']);
                    checkRowCells(10, ['', 'Microsoft', 'John', d, '1.00', year]);
                    checkRowCells(11, ['Summary (John)', '', '1', '', '1.00', '']);
                    checkRowCells(12, ['Summary (Microsoft)', '', '2', '', '4.00', '']);
                });
            });
        });
    });

    describe('header menus', function() {
        it('should be able to group/ungroup from header menu', function() {
            makeGrid({
                summaryPosition: 'bottom'
            }, {
                groupers: 'company'
            });

            waitsFor(function() {
                return gridEvents && gridEvents.done;
            }, 'grid to be ready');

            runs(function() {
                var menu = colMap.c2.getMenu();

                // show menu
                Ext.testHelper.tap(colMap.c2.triggerElement);
                // trigger groupByThis
                Ext.testHelper.tap(menu.getComponent('groupByThis').bodyElement);
                gridEvents = null;

                expect(store.getGroupers().length).toBe(1);
                grid.collapseAll();
            });

            waitsFor(function() {
                return gridEvents && gridEvents.done;
            }, 'grid to be grouped');

            runs(function() {
                var menu = colMap.c1.getMenu();

                checkRowCells(0, ['Helen', '', '', '3.00', '']);
                checkRowCells(1, ['John', '', '', '3.00', '']);
                checkRowCells(2, ['Summary (3)', '', '', '6.00', '']);

                // show menu
                Ext.testHelper.tap(colMap.c1.triggerElement);
                // trigger addGroup
                Ext.testHelper.tap(menu.getComponent('addGroup').bodyElement);
                gridEvents = null;

                expect(store.getGroupers().length).toBe(2);
                grid.collapseAll();
            });

            runs(function() {
                var menu = colMap.c1.getMenu();

                checkRowCells(0, ['Helen', '', '3.00', '']);
                checkRowCells(1, ['John', '', '3.00', '']);
                checkRowCells(2, ['Summary (3)', '', '6.00', '']);

                // show company column
                colMap.c1.show();

                // show menu
                Ext.testHelper.tap(colMap.c1.triggerElement);
                // trigger removeGroup
                Ext.testHelper.tap(menu.getComponent('removeGroup').bodyElement);

                expect(store.getGroupers().length).toBe(1);
            });
        });

        it('should be able to ungroup from header menu if it was grouped', function() {
            makeGrid({
                summaryPosition: 'bottom'
            });

            gridEvents = null;
            var grouper = new Ext.util.Grouper({
                property: 'person'
            });

            store.setGroupers(grouper);
            colMap.c2.setGrouper(grouper);

            waitsFor(function() {
                return gridEvents && gridEvents.done;
            }, 'grid to be grouped');

            runs(function() {
                var menu = colMap.c2.getMenu();

                checkRowCells(0, ['Helen', '', '1', '', '3.00', '']);
                checkRowCells(1, ['John', '', '2', '', '3.00', '']);
                checkRowCells(2, ['Summary (3)', '', '3', '', '6.00', '']);

                // show menu
                Ext.testHelper.tap(colMap.c2.triggerElement);
                // trigger removeGroup
                Ext.testHelper.tap(menu.getComponent('removeGroup').bodyElement);

                expect(store.getGroupers().length).toBe(0);
            });
        });

        it('should be able to expand all from menu', function() {
            var checkExpanded = function(groups) {
                var len = groups && groups.length,
                    i;

                for (i = 0; i < len; i++) {
                    expect(groups.items[i].isCollapsed).toBe(false);
                }
            };

            makeGrid({
                startCollapsed: true,
                summaryPosition: 'bottom'
            }, {
                groupers: ['company', 'person']
            });

            waitsFor(function() {
                return gridEvents && gridEvents.done;
            }, 'grid to be ready');

            runs(function() {
                var menu = colMap.c1.getMenu().getComponent('groups').getMenu();

                // show menu
                Ext.testHelper.tap(colMap.c1.triggerElement);
                // trigger groupByThis
                menu.show();
                Ext.testHelper.tap(menu.getAt(0).bodyElement);
                gridEvents = null;
            });

            waitsFor(function() {
                return gridEvents && gridEvents.done;
            }, 'grid to be expanded');

            runs(function() {
                checkExpanded();
            });

        });

        it('should be able to collapse all from menu', function() {
            var checkCollapsed = function(groups) {
                var len = groups && groups.length,
                    i;

                for (i = 0; i < len; i++) {
                    expect(groups.items[i].isCollapsed).toBe(true);
                }
            };

            makeGrid({
                startCollapsed: false,
                summaryPosition: 'bottom'
            }, {
                groupers: ['company', 'person']
            });
            gridEvents = null;

            waitsFor(function() {
                return gridEvents && gridEvents.done;
            }, 'grid to be ready');

            runs(function() {
                var menu = colMap.c1.getMenu().getComponent('groups').getMenu();

                // show menu
                Ext.testHelper.tap(colMap.c1.triggerElement);
                // trigger groupByThis
                menu.show();
                Ext.testHelper.tap(menu.getAt(1).bodyElement);
                gridEvents = null;
            });

            waitsFor(function() {
                return gridEvents && gridEvents.done;
            }, 'grid to be expanded');

            runs(function() {
                checkCollapsed();
            });

        });
    });

});
