topSuite("Ext.grid.plugin.GroupingPanel", [
    'Ext.grid.TreeGrouped', 'Ext.grid.plugin.GroupingPanel',
    'Ext.grid.plugin.Summaries',
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
        dragThresh = 9,
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

            listeners: {
                refresh: getEventHandler('done')
            },

            store: store,

            plugins: {
                groupingpanel: true
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

        plugin = grid.getPlugin('groupingpanel');
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

    function dragStart(fromEl, fromX, fromY) {
        jasmine.fireMouseEvent(fromEl, 'mouseover');
        jasmine.fireMouseEvent(fromEl, 'mousedown');

        // starts drag
        if (jasmine.supportsTouch) {
            waits(1000);
        }
    }

    function dragMove(fromEl, fromX, fromY, toEl, toX, toY) {
        runs(function() {
            jasmine.fireMouseEvent(fromEl, 'mousemove', fromX + dragThresh, fromY);

            jasmine.fireMouseEvent(fromEl, 'mouseout', toX, toY);
            jasmine.fireMouseEvent(fromEl, 'mouseleave', toX, toY);
            jasmine.fireMouseEvent(toEl, 'mouseenter', toX, toY);

            jasmine.fireMouseEvent(toEl, 'mouseover', toX, toY);
            jasmine.fireMouseEvent(toEl, 'mousemove', toX - dragThresh, toY);
            jasmine.fireMouseEvent(toEl, 'mousemove', toX, toY);
        });
    }

    function dragEnd(fromEl, fromX, fromY, toEl, toX, toY) {
        runs(function() {
            jasmine.fireMouseEvent(toEl, 'mouseup', toX, toY);
            jasmine.fireMouseEvent(toEl, 'mouseout', fromX, fromY);

            // Mousemove outside triggers removal of overCls.
            // Touchmoves with no touchstart throw errors.
            if (!jasmine.supportsTouch) {
                jasmine.fireMouseEvent(fromEl, 'mousemove', fromX, fromY);
            }
        });
    }

    function dragAndDrop(fromEl, fromX, fromY, toEl, toX, toY) {
        dragStart(fromEl, fromX, fromY);
        dragMove(fromEl, fromX, fromY, toEl, toX, toY);
        dragEnd(fromEl, fromX, fromY, toEl, toX, toY);
    }

    beforeEach(function() {
        spy = jasmine.createSpy();
    });

    afterEach(destroyGrid);

    describe('grouping panel', function() {
        it('should drag columns from grid to grouping panel', function() {
            makeGrid({
                summaryPosition: 'hidden',
                listeners: {
                    showsummarycontextmenu: spy
                }
            });

            waitsFor(function() {
                return gridEvents && gridEvents.done;
            }, 'grid to be ready');

            runs(function() {
                var dragEl, dropEl, box,
                    startX, startY, endX, endY;

                gridEvents = null;

                expect(grid.groupingColumn.isVisible()).toBe(false);

                dragEl = colMap.c1.element;
                box = Ext.fly(dragEl).getBox();
                startX = box.left + 1;
                startY = box.top + 1;

                dropEl = plugin.getBar().element;
                box = Ext.fly(dropEl).getBox();
                endX = box.left + 20;
                endY = box.top + 20;

                dragAndDrop(dragEl, startX, startY, dropEl, endX, endY);

            });

            waitsFor(function() {
                return gridEvents && gridEvents.done;
            }, 'grid to be ready');

            runs(function() {
                expect(grid.groupingColumn.isVisible()).toBe(true);
                expect(colMap.c1.isVisible()).toBe(false);

                checkRowCells(0, ['Adobe', '1', '', '2.00', '']);
                checkRowCells(1, ['Microsoft', '2', '', '4.00', '']);

                expect(store.getGroupers().length).toBe(1);
            });

        });

        it('should have groupers inside', function() {
            makeGrid({
                summaryPosition: 'hidden',
                listeners: {
                    showsummarycontextmenu: spy
                }
            }, {
                groupers: ['company', 'person']
            });

            waitsFor(function() {
                return gridEvents && gridEvents.done;
            }, 'grid to be ready');

            runs(function() {
                var bar = plugin.getBar();

                expect(bar.isVisible()).toBe(true);
                expect(bar.getItems().length).toBe(2);
                expect(store.getGroupers().length).toBe(2);
            });
        });

        it('should show/hide the grouping panel', function() {
            makeGrid({
                summaryPosition: 'hidden',
                listeners: {
                    showsummarycontextmenu: spy
                }
            }, {
                groupers: ['company', 'person']
            });

            waitsFor(function() {
                return gridEvents && gridEvents.done;
            }, 'grid to be ready');

            runs(function() {
                var bar = plugin.getBar();

                expect(bar.isVisible()).toBe(true);

                grid.hideGroupingPanel();
                expect(bar.isVisible()).toBe(false);

                grid.showGroupingPanel();
                expect(bar.isVisible()).toBe(true);
            });
        });
    });

});
