topSuite("Ext.grid.plugin.Summaries", [
    'Ext.grid.Panel', 'Ext.grid.plugin.Summaries',
    'Ext.grid.feature.AdvancedGroupingSummary',
    'Ext.grid.column.Date', 'Ext.grid.column.Number',
    'Ext.data.ArrayStore', 'Ext.data.summary.Count'
], function() {
    function isBlank(s) {
        return !s || s === '\xA0' || s === '&nbsp;';
    }

    function expectBlank(s) {
        if (!isBlank(s)) {
            expect(s).toBe('');
        }
    }

    var store, grid, spy, plugin,
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

    function checkDockedCells(values) {
        var cells = feature.summaryBar.el.query('.x-grid-cell'),
            len = values.length,
            html, i, cell;

        for (i = 0; i < len; i++) {
            cell = cells[i];

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

    function changeSummaryFn(row, column, summaryText) {
        var cell = view.getCell(row, column);

        if (cell) {
            jasmine.fireMouseEvent(cell, 'contextmenu');
            jasmine.fireMouseEvent(plugin.getContextMenu().down('[text="' + summaryText + '"]'), 'click');
        }
    }

    function changeDockedSummaryFn(column, summaryText) {
        var cells = feature.summaryBar.el.query('.x-grid-cell'),
            cell;

        cell = cells[column];

        if (cell) {
            jasmine.fireMouseEvent(cell, 'contextmenu');
            jasmine.fireMouseEvent(plugin.getContextMenu().down('[text="' + summaryText + '"]'), 'click');
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

            viewConfig: {
                listeners: {
                    refresh: getEventHandler('done')
                }
            },

            listeners: {
                showsummarycontextmenu: spy
            },

            store: store,

            features: [
                Ext.merge({
                    id: 'grouping',
                    ftype: 'advancedgroupingsummary',
                    startCollapsed: true
                }, featureConfig)
            ],

            plugins: {
                gridsummaries: true
            },

            columns: [
                { text: 'Company', dataIndex: 'company', itemId: 'c1' },
                { text: 'Person', dataIndex: 'person', itemId: 'c2' },
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

        plugin = grid.getPlugin('gridsummaries');
        view = grid.view;
        feature = view.getFeature('grouping');
        setColMap();
    }

    function setColMap() {
        colMap = {};

        grid.query('column').forEach(function(col) {
            colMap[col.getItemId()] = col;
        });
    }

    function destroyGrid() {
        Ext.destroy(grid, store);
        store = grid = colMap = spy = plugin = feature = null;
        gridEvents = {};
    }

    beforeEach(function() {
        spy = jasmine.createSpy();
    });

    afterEach(destroyGrid);

    describe('grand summaries', function() {
        it('should change summary fn when summary is on top', function() {
            makeGrid({
                summaryPosition: 'top'
            }, {
                groupers: 'company'
            });

            changeSummaryFn(0, 4, 'Average');
            gridEvents = null;

            waitsFor(function() {
                return gridEvents && gridEvents.done;
            }, 'grid to be ready');

            runs(function() {
                checkRowCells(0, ['Summary (3)', '', '3', '', '2.00', '']);
                checkRowCells(1, ['Adobe', '', '1', '', '2.00', '']);
                checkRowCells(2, ['Microsoft', '', '2', '', '2.00', '']);
            });
        });

        it('should change summary fn when summary is on bottom', function() {
            makeGrid({
                summaryPosition: 'bottom'
            }, {
                groupers: 'company'
            });

            waitsFor(function() {
                return gridEvents && gridEvents.done;
            }, 'grid to be ready');

            runs(function() {
                gridEvents = null;
                changeSummaryFn(2, 4, 'Average');
            });

            waitsFor(function() {
                return gridEvents && gridEvents.done;
            }, 'grid to be ready');

            runs(function() {
                checkRowCells(0, ['Adobe', '', '1', '', '2.00', '']);
                checkRowCells(1, ['Microsoft', '', '2', '', '2.00', '']);
                checkRowCells(2, ['Summary (3)', '', '3', '', '2.00', '']);
            });
        });

        it('should change summary fn when summary is docked', function() {
            makeGrid({
                summaryPosition: 'docked'
            }, {
                groupers: 'company'
            });

            waitsFor(function() {
                return gridEvents && gridEvents.done;
            }, 'grid to be ready');

            runs(function() {
                gridEvents = null;
                changeDockedSummaryFn(4, 'Average');
            });

            waitsFor(function() {
                return gridEvents && gridEvents.done;
            }, 'grid to be ready');

            runs(function() {
                checkRowCells(0, ['Adobe', '', '1', '', '2.00', '']);
                checkRowCells(1, ['Microsoft', '', '2', '', '2.00', '']);
                checkDockedCells(['Summary (3)', '', '3', '', '2.00', '']);
            });
        });

    });

    describe('group summaries', function() {
        it('should change summary fn when group summary is on top', function() {
            makeGrid({
                groupSummaryPosition: 'top',
                summaryPosition: 'docked',
                listeners: {
                    showsummarycontextmenu: spy
                }
            }, {
                groupers: 'company'
            });

            waitsFor(function() {
                return gridEvents && gridEvents.done;
            }, 'grid to be ready');

            runs(function() {
                gridEvents = null;
                changeSummaryFn(0, 4, 'Average');
            });

            waitsFor(function() {
                return gridEvents && gridEvents.done;
            }, 'grid to be ready');

            runs(function() {
                checkRowCells(0, ['Adobe', '', '1', '', '2.00', '']);
                checkRowCells(1, ['Microsoft', '', '2', '', '2.00', '']);
                checkDockedCells(['Summary (3)', '', '3', '', '2.00', '']);
            });
        });

        it('should change summary fn when group summary is on bottom', function() {
            makeGrid({
                groupSummaryPosition: 'bottom',
                summaryPosition: 'docked',
                listeners: {
                    showsummarycontextmenu: spy
                }
            }, {
                groupers: 'company'
            });
            gridEvents = null;
            grid.expandAll();

            waitsFor(function() {
                return gridEvents && gridEvents.done;
            }, 'grid to be ready');

            runs(function() {
                gridEvents = null;
                changeSummaryFn(2, 4, 'Average');
            });

            waitsFor(function() {
                return gridEvents && gridEvents.done;
            }, 'grid to be ready');

            runs(function() {
                checkDockedCells(['Summary (3)', '', '3', '', '2.00', '']);
            });
        });

    });

});
