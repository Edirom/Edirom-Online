topSuite("Ext.grid.plugin.GroupingPanel", [
    'Ext.grid.Panel', 'Ext.grid.plugin.GroupingPanel',
    'Ext.grid.feature.AdvancedGroupingSummary',
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

    var store, grid, spy,
        gridEvents = {},
        dragThresh = 9,
        colMap, view, feature, plugin,
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

            plugins: {
                groupingpanel: true
            },

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
        plugin = grid.getPlugin('groupingpanel');
    }

    function setColMap() {
        colMap = {};

        grid.query('gridcolumn').forEach(function(col) {
            colMap[col.getItemId()] = col;
        });
    }

    function destroyGrid() {
        Ext.destroy(grid, store);
        store = grid = colMap = spy = feature = plugin = null;
        gridEvents = {};
    }

    function dragStart(fromEl, fromX, fromY) {
        jasmine.fireMouseEvent(fromEl, 'mouseover', fromX, fromY);
        jasmine.fireMouseEvent(fromEl, 'mousedown', fromX, fromY);

        // Longpress starts drag
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
        xit('should drag columns from grid to grouping panel', function() {
            makeGrid({
                summaryPosition: 'hidden',
                listeners: {
                    showsummarycontextmenu: spy
                }
            }, null);

            waitsFor(function() {
                return gridEvents && gridEvents.done;
            }, 'grid to be ready');

            runs(function() {
                var dragEl, dropEl, box,
                    startX, startY, endX, endY;

                gridEvents = null;

                // expect(feature.getGroupingColumn().isVisible()).toBe(false);

                dragEl = colMap.c1.el;
                box = Ext.fly(dragEl).getBox();
                startX = box.left + 1;
                startY = box.top + 1;

                dropEl = plugin.getBar().body;
                box = Ext.fly(dropEl).getBox();
                endX = box.left + 20;
                endY = box.top + 20;

                dragAndDrop(dragEl, startX, startY, dropEl, endX, endY);

            });

            waitsFor(function() {
                return gridEvents && gridEvents.done;
            }, 'grid to be ready');

            runs(function() {
                expect(feature.getGroupingColumn().isVisible()).toBe(true);
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
                expect(bar.items.length).toBe(2);
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
