topSuite("Ext.layout.container.Table", ['Ext.Panel', 'Ext.app.ViewModel'], function() {

    describe("fixed/auto sizing", function() {

        // See EXTJSIV-7667
        it("should be able to auto-size tables correctly", function() {
            var ct = new Ext.container.Container({
                width: 400,
                height: 200,
                renderTo: Ext.getBody(),
                items: {
                    xtype: 'panel',
                    layout: {
                        type: 'table',
                        columns: 1
                    },
                    items: [{
                        border: false,
                        itemId: 'item',
                        xtype: 'panel',
                        title: 'Lots of Spanning',
                        html: '<div style="width: 100px;"></div>'
                    }]
                }
            });

            // Tolerate 100-104 range due to browser diffs
            expect(ct.down('#item').getWidth()).toBeGreaterThan(99);
            expect(ct.down('#item').getWidth()).toBeLessThan(105);
            ct.destroy();
       });
    });

    describe('binding', function() {
        var panel;

        afterEach(function() {
            panel.destroy();
        });

        it('should display a component when binding indicates it should be visible and config has hidden:true', function() {
            panel = new Ext.panel.Panel({
                renderTo: Ext.getBody(),
                width: 300,
                height: 150,
                layout: {
                    type: 'table'
                },
                viewModel: {
                    data: {
                        field1: false
                    }
                },
                items: [{
                    html: 'Cell A content',
                    itemId: 'cell',
                    hidden: true,
                    bind: {
                        hidden: '{field1}'
                    }
                }]
            });

            waitAWhile();
            runs(function() {
                expect(panel.down('#cell').isVisible()).toBe(true);
            });
        });

        it('should hide a component when binding indicates it should be hidden and config has hidden:false', function() {
            panel = new Ext.panel.Panel({
                renderTo: Ext.getBody(),
                width: 300,
                height: 150,
                layout: {
                    type: 'table'
                },
                viewModel: {
                    data: {
                        field1: true
                    }
                },
                items: [{
                    html: 'Cell A content',
                    itemId: 'cell',
                    hidden: false,
                    bind: {
                        hidden: '{field1}'
                    }
                }]
            });

            waitAWhile();
            runs(function() {
                expect(panel.down('#cell').isVisible()).toBe(false);
            });
        });
    });
});
