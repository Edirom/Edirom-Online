topSuite("Ext.grid.plugin.Summaries", [
    'Ext.grid.TreeGrouped', 'Ext.grid.plugin.Summaries',
    'Ext.data.ArrayStore', 'Ext.layout.Fit',
    'Ext.MessageBox', 'Ext.app.ViewModel'
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

    function checkDockedCells(values) {
        var rowCells = plugin.getRow().cells,
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

    function getCenter(el) {
        return Ext.fly(el).getXY();
    }

    function doTouch(method, el, cfg) {
        runs(function() {
            cfg = cfg || {};

            var center = getCenter(el),
                x = cfg.hasOwnProperty('x') ? cfg.x : center[0],
                y = cfg.hasOwnProperty('y') ? cfg.y : center[1],
                offsetX = cfg.hasOwnProperty('offsetX') ? cfg.offsetX : 0,
                offsetY = cfg.hasOwnProperty('offsetY') ? cfg.offsetY : 0;

            Ext.testHelper[method](el, {
                x: x + offsetX,
                y: y + offsetY
            });
            waitsForAnimation();
        });
    }

    function touchStart(el, cfg) {
        doTouch('touchStart', el, cfg);
    }

    function touchCancel(el, cfg) {
        doTouch('touchCancel', el, cfg);
    }

    function changeSummaryFn(row, column, summaryText) {
        var rowCells = grid.getItemAt(row).cells,
            cells = [],
            i, cell;

        for (i = 0; i < rowCells.length; i++) {
            if (rowCells[i].isVisible()) {
                cells[cells.length] = rowCells[i];
            }
        }

        cell = cells[column];

        if (cell) {
            touchStart(cell.element);

            waitsFor(function() {
                return spy.callCount === 1;
            });

            runs(function() {
                expect(spy.callCount).toBe(1);
                Ext.testHelper.tap(plugin.getContextMenu().down('[text="' + summaryText + '"]').bodyElement);
                touchCancel(cell.element);
            });
        }
    }

    function changeDockedSummaryFn(column, summaryText) {
        var rowCells = plugin.getRow().cells,
            cells = [],
            i, cell;

        for (i = 0; i < rowCells.length; i++) {
            if (rowCells[i].isVisible()) {
                cells[cells.length] = rowCells[i];
            }
        }

        cell = cells[column];

        if (cell) {
            touchStart(cell.element);

            waitsFor(function() {
                return spy.callCount === 1;
            });

            runs(function() {
                expect(spy.callCount).toBe(1);
                Ext.testHelper.tap(plugin.getContextMenu().down('[text="' + summaryText + '"]').bodyElement);
                touchCancel(cell.element);
            });
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

            listeners: {
                refresh: getEventHandler('done')
            },

            store: store,

            plugins: {
                gridsummaries: true
            },

            columns: [
                { text: 'Company', dataIndex: 'company', itemId: 'c1' },
                { text: 'Person', dataIndex: 'person', itemId: 'c2' },
                { text: 'Date', dataIndex: 'date', xtype: 'datecolumn', itemId: 'c3' },
                { text: 'Value', dataIndex: 'value', xtype: 'numbercolumn', itemId: 'c4' },
                { text: 'Year', dataIndex: 'year', itemId: 'c5' }
            ],

            renderTo: document.body
        }, gridConfig));

        plugin = grid.getPlugin('gridsummaries');
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
        store = grid = colMap = spy = null;
        gridEvents = {};
    }

    beforeEach(function() {
        spy = jasmine.createSpy();
    });

    afterEach(destroyGrid);

    describe('grand summaries', function() {
        it('should change summary fn when summary is on top', function() {
            makeGrid({
                summaryPosition: 'top',
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
                checkRowCells(0, ['Summary (3)', '', '3', '', '2.00', '']);
                checkRowCells(1, ['Adobe', '', '1', '', '2.00', '']);
                checkRowCells(2, ['Microsoft', '', '2', '', '2.00', '']);
            });
        });

        it('should change summary fn when summary is on bottom', function() {
            makeGrid({
                summaryPosition: 'bottom',
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
