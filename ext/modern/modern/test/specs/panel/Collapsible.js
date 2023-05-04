topSuite("Ext.panel.Collapsible", [
    'Ext.app.ViewModel',
    'Ext.Button',
    'Ext.panel.Collapser'
], function() {
    var panel;

    Ext.panel.Collapser.override({
        config: {
            animation: {
                duration: 20
            }
        }
    });

    function makePanel(config) {
        config = config || {};

        // Render unless floated.
        // Floateds insert themselves into the DOM
        if (!config.floated && !config.hasOwnProperty('renderTo')) {
            config.renderTo = Ext.getBody();
        }

        panel = new Ext.panel.Panel(Ext.apply({
            width: 400,
            height: 400,
            title: 'Test Panel'
        }, config));
    }

    afterEach(function() {
        panel = Ext.destroy(panel);
    });

    // TODO: These tests need to be expanded on by a lot.

    describe("configuring", function() {
        it("should not be collapsible by default", function() {
            makePanel();
            expect(panel.getCollapsed()).toBe(false);
            expect(panel.getCollapsible()).toBeNull();
        });

        it("should have a collapser if true", function() {
            makePanel({
                collapsible: true
            });
            expect(panel.getCollapsed()).toBe(false);
            expect(panel.getCollapsible() instanceof Ext.panel.Collapser).toBe(true);
        });

        it("should be able to pass a direction", function() {
            makePanel({
                collapsible: 'left'
            });
            expect(panel.getCollapsed()).toBe(false);
            expect(panel.getCollapsible().getDirection()).toBe('left');
        });

        it("should be able to pass a config", function() {
            makePanel({
                collapsible: {
                    dynamic: true
                }
            });
            expect(panel.getCollapsed()).toBe(false);
            expect(panel.getCollapsible().getDynamic()).toBe(true);
        });

        it("should be able to start collapsed", function() {
            makePanel({
                collapsible: true,
                collapsed: true
            });
            expect(panel.element.getHeight()).toBeLessThan(400);
        });
    });

    describe('events', function() {
        function expandCollapse(collapse) {
            var action = collapse ? 'collapse' : 'expand',
                event = 'before' + action,
                calls;

            it('should prevent ' + action + ' if returning false', function(done) {
                makePanel({
                    collapsible: true,
                    collapsed: !collapse
                });

                calls = 0;
                panel.on(event, function() {
                    ++calls;

                    return false;
                });

                panel.toggleCollapsed(collapse).then(function() {
                    expect(calls).toBe(1);
                    expect(panel.getCollapsed()).toBe(!collapse);
                }).then(done).done();
            });

            it('should not prevent ' + action + ' if nothing is returned', function(done) {
                makePanel({
                    collapsible: true,
                    collapsed: !collapse
                });

                calls = 0;
                panel.on(event, function() {
                    ++calls;
                });

                panel.toggleCollapsed(collapse).then(function() {
                    expect(calls).toBe(1);
                    expect(panel.getCollapsed()).toBe(collapse);
                }).then(done).done();
            });
        }

        describe('beforecollapse', function() {
            expandCollapse(true);
        });

        describe('beforeexpand', function() {
            expandCollapse(false);
        });

        describe('initial events', function() {
            describe('when collapsed', function() {
                it('should not fire beforecollapse or collapse', function() {
                    var spy = jasmine.createSpy();

                    makePanel({
                        collapsed: true,
                        collapsible: true,
                        listeners: {
                            beforecollapse: spy,
                            collapse: spy
                        }
                    });
                    expect(spy).not.toHaveBeenCalled();
                });

                it('should fire subsequent events', function() {
                    var spy = jasmine.createSpy(),
                        beforeExpandSpy = jasmine.createSpy(),
                        expandSpy = jasmine.createSpy();

                    makePanel({
                        collapsed: true,
                        collapsible: true,
                        listeners: {
                            beforecollapse: spy,
                            collapse: spy,
                            beforeexpand: beforeExpandSpy,
                            expand: expandSpy
                        }
                    });
                    expect(spy).not.toHaveBeenCalled();
                    panel.toggleCollapsed(false, false);
                    expect(beforeExpandSpy.callCount).toBe(1);
                    expect(expandSpy.callCount).toBe(1);
                });
            });

            describe('when expanded', function() {
                it('should not fire beforeexpand or expand', function() {
                    var spy = jasmine.createSpy();

                    makePanel({
                        collapsible: true,
                        listeners: {
                            beforeexpand: spy,
                            expand: spy
                        }
                    });
                    expect(spy).not.toHaveBeenCalled();
                });

                it('should fire subsequent events', function() {
                    var spy = jasmine.createSpy(),
                        beforeCollapseSpy = jasmine.createSpy(),
                        collapseSpy = jasmine.createSpy();

                    makePanel({
                        collapsible: true,
                        listeners: {
                            beforeexpand: spy,
                            expand: spy,
                            beforecollapse: beforeCollapseSpy,
                            collapse: collapseSpy
                        }
                    });
                    expect(spy).not.toHaveBeenCalled();
                    panel.toggleCollapsed(true, false);
                    expect(beforeCollapseSpy.callCount).toBe(1);
                    expect(collapseSpy.callCount).toBe(1);
                });
            });
        });

        describe('global events', function() {
            it('should fire a global expand event', function() {
                var spy = jasmine.createSpy();

                makePanel({
                    collapsible: true,
                    collapsed: true
                });

                Ext.on('expand', spy);
                panel.expand(false);

                expect(spy.callCount).toBe(1);
                Ext.un('expand', spy);
            });

            it('should fire a global collapse event', function() {
                var spy = jasmine.createSpy();

                makePanel({
                    collapsible: true
                });

                Ext.on('collapse', spy);
                panel.collapse(false);

                expect(spy.callCount).toBe(1);
                Ext.un('collapse', spy);
            });
        });
    });

    describe("titleCollapse", function() {
        it("should be collapsible on click of panel header", function() {
            makePanel({
                titleCollapse: true,
                collapsible: true,
                collapsed: false,
                items: [{
                    html: 'testing'
                }]
            });

            expect(panel.getCollapsed()).toBe(false);

            jasmine.fireMouseEvent(panel.header.el.dom, 'mousedown');
            jasmine.fireMouseEvent(panel.header.el.dom, 'mouseup');
            jasmine.fireMouseEvent(panel.header.el.dom, 'click');
            expect(panel.getCollapsed()).toBe(true);

            waits(500);
            jasmine.fireMouseEvent(panel.header.el.dom, 'click');
            runs(function() {
                expect(panel.getCollapsed()).toBe(false);
            });
        });

        it("setTitleCollapse", function() {
            makePanel({
                collapsible: true,
                collapsed: false,
                items: [{
                    html: 'testing'
                }]
            });

            panel.setTitleCollapse(true);
            expect(panel.getCollapsed()).toBe(false);

            jasmine.fireMouseEvent(panel.header.el.dom, 'mousedown');
            jasmine.fireMouseEvent(panel.header.el.dom, 'mouseup');
            jasmine.fireMouseEvent(panel.header.el.dom, 'click');
            expect(panel.getCollapsed()).toBe(true);

            panel.setTitleCollapse(false);
            jasmine.fireMouseEvent(panel.header.el.dom, 'click');
            expect(panel.getCollapsed()).toBe(true);
        });
    });
});
