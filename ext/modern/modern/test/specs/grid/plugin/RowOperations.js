topSuite("Ext.grid.plugin.RowOperations", [
    'Ext.grid.Grid',
    'Ext.data.Store',
    'Ext.grid.plugin.RowOperations',
    'Ext.grid.plugin.PagingToolbar'], function() {
    var grid, store, colRef,
        synchronousLoad = true,
        proxyStoreLoad = Ext.data.ProxyStore.prototype.load,
        loadStore = function() {
            proxyStoreLoad.apply(this, arguments);

            if (synchronousLoad) {
                this.flushLoad.apply(this, arguments);
            }

            return this;
        };

    function makeData(total, start, limit) {
        var data = [],
            i;

        if (limit === undefined) {
            limit = start + store.pageSize;
        }

        for (i = start; i < limit; ++i) {
            data.push({
                name: 'Item ' + (i + 1)
            });
        }

        return Ext.encode({
            data: data,
            total: total
        });
    }

    function mockComplete(responseText, status) {
        Ext.Ajax.mockComplete({
            status: status || 200,
            responseText: responseText
        });
    }

    function createGrid(config) {
        store = new Ext.data.Store({
            fields: ['UserId', 'FirstName', 'LastName'],
            autoLoad: true,
            pageSize: 10,
            proxy: {
                type: 'ajax',
                url: 'fakeUrl',
                reader: {
                    type: 'json',
                    rootProperty: 'data',
                    totalProperty: 'total'
                }
            }
        });

        grid = new Ext.grid.Grid(Ext.apply({
            store: store,
            columns: [
                { header: 'First Name', dataIndex: 'FirstName', flex: 1 },
                { header: 'Last Name', dataIndex: 'LastName' }
            ],
            plugins: ['pagingtoolbar', 'multiselection'],
            height: 400,
            width: 600
        }, config));

        colRef = grid.getVisibleColumns();
        mockComplete(makeData(200, 1));
    }

    beforeEach(function() {
        // Override so that we can control asynchronous loading
        Ext.data.ProxyStore.prototype.load = loadStore;
        MockAjaxManager.addMethods();
    });

    afterEach(function() {
        // Undo the overrides.
        Ext.data.ProxyStore.prototype.load = proxyStoreLoad;
        MockAjaxManager.removeMethods();

        Ext.destroy(grid);
        grid = store = colRef = null;
    });

    describe('Selection through header checkbox should work', function() {
        it('should select/deselect all rows when header checkbox is checked/unchecked', function() {
            var checkbox;

            createGrid({
                renderTo: Ext.getBody()
            });

            checkbox = colRef[0].el.down('.' + Ext.baseCSSPrefix + 'checkbox-el');

            Ext.testHelper.tap(checkbox);
            expect(grid.getSelectable().getSelection().getCount()).toBe(grid.getStore().getCount());

            Ext.testHelper.tap(checkbox);
            expect(grid.getSelectable().getSelection().getCount()).toBe(0);

            // rechecking selection
            Ext.testHelper.tap(checkbox);
            expect(grid.getSelectable().getSelection().getCount()).toBe(grid.getStore().getCount());

            Ext.testHelper.tap(checkbox);
            expect(grid.getSelectable().getSelection().getCount()).toBe(0);
        });

        it('should uncheck header when any row is deselected', function() {
            var checkbox, headerCheckbox;

            createGrid({
                renderTo: Ext.getBody()
            });

            headerCheckbox = colRef[0].el.down('.' + Ext.baseCSSPrefix + 'checkbox-el');
            checkbox = grid.dataItems[0].el.down('.' + Ext.baseCSSPrefix + 'checkbox-el');

            Ext.testHelper.tap(headerCheckbox);
            expect(grid.getHeaderContainer().getInnerAt(0).areAllChecked()).toBe(true);

            Ext.testHelper.tap(checkbox);
            expect(grid.getHeaderContainer().getInnerAt(0).areAllChecked()).toBe(false);
        });

        it('should check header when all rows are selected', function() {
            var checkbox, index, limit;

            createGrid({
                renderTo: Ext.getBody()
            });

            expect(grid.getHeaderContainer().getInnerAt(0).areAllChecked()).toBe(false);

            limit = grid.getStore().getCount();

            for (index = 0; index < limit; ++index) {
                checkbox = grid.dataItems[index].el.down('.' + Ext.baseCSSPrefix + 'checkbox-el');
                Ext.testHelper.tap(checkbox);
            }

            expect(grid.getHeaderContainer().getInnerAt(0).areAllChecked()).toBe(true);
        });
    });
});
