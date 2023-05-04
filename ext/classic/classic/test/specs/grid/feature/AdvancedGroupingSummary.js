topSuite("Ext.grid.feature.AdvancedGroupingSummary", [
    'Ext.grid.Panel', 'Ext.grid.feature.AdvancedGroupingSummary',
    'Ext.grid.column.Date', 'Ext.grid.column.Number',
    'Ext.data.summary.Count', 'Ext.data.summary.Sum',
    'Ext.data.ArrayStore'
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
        colMap, view, feature,
        Sale = Ext.define(null, {
            extend: 'Ext.data.Model',

            fields: [
                { name: 'id', type: 'int' },
                { name: 'company', type: 'string' },
                { name: 'person', type: 'string', summary: 'count' },
                { name: 'date', type: 'date', defaultValue: new Date(2012, 0, 1) },
                { name: 'value', type: 'float', defaultValue: null, summary: 'sum' },
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
        var len = values.length,
            html, i, cell;

        for (i = 0; i < len; i++) {
            cell = view.getCell(index, i);
            cell = cell.querySelector(feature.groupTitleSelector) ||
                cell.querySelector(view.innerSelector);

            html = cell.innerHTML;

            if (isBlank(values[i])) {
                expectBlank(html);
            }
            else {
                expect(html).toBe(values[i]);
            }
        }
    }

    function makeGrid(featureConfig, storeConfig, storeData) {
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

        grid = new Ext.grid.Panel({
            title: 'Test tree grouping',
            collapsible: true,
            multiSelect: true,
            height: 400,
            width: 750,

            store: store,

            viewConfig: {
                listeners: {
                    refresh: getEventHandler('done')
                }
            },

            features: [
                Ext.merge({
                    id: 'grouping',
                    ftype: 'advancedgroupingsummary',
                    startCollapsed: true
                }, featureConfig)
            ],

            columns: [
                { text: 'Company', dataIndex: 'company', itemId: 'c1', groupable: true },
                { text: 'Person', dataIndex: 'person', itemId: 'c2', groupable: true },
                { text: 'Date', dataIndex: 'date', xtype: 'datecolumn', itemId: 'c3' },
                {
                    text: 'Value',
                    dataIndex: 'value',
                    xtype: 'numbercolumn',
                    itemId: 'c4',
                    summaryFormatter: 'number("0.00")'
                },
                { text: 'Year', dataIndex: 'year', itemId: 'c5' }
            ],

            renderTo: document.body
        });

        setColMap();
        view = grid.view;
        feature = view.getFeature('grouping');
    }

    function setColMap() {
        colMap = {};

        grid.query('gridcolumn').forEach(function(col) {
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

                checkRowCells(0, ['Adobe', '', '1', '', '2.00', '']);
                checkRowCells(1, ['Microsoft', '', '2', '', '4.00', '']);
            });

            it('should render cells correctly with summary on top', function() {
                makeGrid({
                    summaryPosition: 'top'
                }, {
                    groupers: 'company'
                });

                checkRowCells(0, ['Summary (3)', '', '3', '', '6.00', '']);
                checkRowCells(1, ['Adobe', '', '1', '', '2.00', '']);
                checkRowCells(2, ['Microsoft', '', '2', '', '4.00', '']);
            });

            it('should render cells correctly with summary on bottom', function() {
                makeGrid({
                    summaryPosition: 'bottom'
                }, {
                    groupers: 'company'
                });

                checkRowCells(0, ['Adobe', '', '1', '', '2.00', '']);
                checkRowCells(1, ['Microsoft', '', '2', '', '4.00', '']);
                checkRowCells(2, ['Summary (3)', '', '3', '', '6.00', '']);
            });

            it('should render cells correctly when expanded', function() {
                makeGrid({
                    summaryPosition: 'bottom'
                }, {
                    groupers: 'company'
                });
                gridEvents = null;
                grid.expandAll();

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
                gridEvents = null;
                grid.expandAll();

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
                gridEvents = null;
                grid.expandAll();

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

            Ext.testHelper.showHeaderMenu(colMap.c2);

            runs(function() {
                var menu = colMap.c2.activeMenu;

                jasmine.fireMouseEvent(menu.items.getByKey('groupByMenuItem').el, 'click');
                expect(store.getGroupers().length).toBe(1);
                grid.collapseAll();
                gridEvents = null;
            });

            waitsFor(function() {
                return gridEvents && gridEvents.done;
            }, 'grid to be grouped');

            runs(function() {
                checkRowCells(0, ['Helen', '', '', '3.00', '']);
                checkRowCells(1, ['John', '', '', '3.00', '']);
                checkRowCells(2, ['Summary (3)', '', '', '6.00', '']);

                // show menu
                Ext.testHelper.showHeaderMenu(colMap.c1);
                grid.collapseAll();
                gridEvents = null;
            });

            runs(function() {
                var menu = colMap.c1.activeMenu;

                jasmine.fireMouseEvent(menu.items.getByKey('addGroupMenuItem').el, 'click');
                grid.collapseAll();
                gridEvents = null;

                expect(store.getGroupers().length).toBe(2);
                checkRowCells(0, ['Helen', '', '3.00', '']);
                checkRowCells(1, ['John', '', '3.00', '']);
                checkRowCells(2, ['Summary (3)', '', '6.00', '']);

                // show company column
                colMap.c1.show();

                Ext.testHelper.showHeaderMenu(colMap.c1);
                gridEvents = null;
            });

            runs(function() {
                var menu = colMap.c1.activeMenu;

                // trigger removeGroup
                jasmine.fireMouseEvent(menu.items.getByKey('removeGroupMenuItem').el, 'click');

                expect(store.getGroupers().length).toBe(1);
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
                Ext.testHelper.showHeaderMenu(colMap.c1);
            });

            runs(function() {
                var menu = colMap.c1.activeMenu,
                    groupsItem = menu.items.getByKey('groupsMenuItem'),
                    groupsMenu = groupsItem.getMenu();

                groupsMenu.show();
                jasmine.fireMouseEvent(groupsMenu.items.getByKey('expandAll').el, 'click');

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

            waitsFor(function() {
                return gridEvents && gridEvents.done;
            }, 'grid to be ready');

            runs(function() {
                Ext.testHelper.showHeaderMenu(colMap.c1);
            });

            runs(function() {
                var menu = colMap.c1.activeMenu,
                    groupsItem = menu.items.getByKey('groupsMenuItem'),
                    groupsMenu = groupsItem.getMenu();

                groupsMenu.show();
                jasmine.fireMouseEvent(groupsMenu.items.getByKey('collapseAll').el, 'click');

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
