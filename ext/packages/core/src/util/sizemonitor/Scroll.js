/**
 * @private
 */
Ext.define('Ext.util.sizemonitor.Scroll', {

    extend: 'Ext.util.sizemonitor.Abstract',

    getElementConfig: function() {
        return {
            reference: 'detectorsContainer',
            classList: [Ext.baseCSSPrefix + 'size-monitors', 'scroll'],
            children: [
                {
                    reference: 'expandMonitor',
                    className: 'expand'
                },
                {
                    reference: 'shrinkMonitor',
                    className: 'shrink'
                }
            ]
        };
    },

    constructor: function(config) {
        this.onScroll = this.onScroll.bind(this);

        this.callParent(arguments);
    },

    bindListeners: function(bind) {
        var method = bind ? 'addEventListener' : 'removeEventListener';

        this.expandMonitor[method]('scroll', this.onScroll, true);
        this.shrinkMonitor[method]('scroll', this.onScroll, true);
    },

    onScroll: function(e) {
        if (!this.destroyed) {
            // if the scroll value has been changed in refreshMonitor has been changed
            // then scroll event will be called for both expand and shrink monitors
            // but again calling the refresh will be unnecessary
            if (this.hasExpandMonitorScrollChanged && e.target === this.expandMonitor) {
                delete this.hasExpandMonitorScrollChanged;
            }
            else if (this.hasShrinkMonitorScrollChanged && e.target === this.shrinkMonitor) {
                delete this.hasShrinkMonitorScrollChanged;
            }
            else {
                Ext.TaskQueue.requestRead('refresh', this);
            }
        }
    },

    refreshMonitors: function() {
        var expandMonitor = this.expandMonitor,
            shrinkMonitor = this.shrinkMonitor,
            end = 1000000;

        if (expandMonitor && !expandMonitor.destroyed) {
            // the performance improvement will only be appliable for IOS device
            if (Ext.isiOS) {
                this.hasExpandMonitorScrollChanged = true;
            }

            expandMonitor.scrollLeft = end;
            expandMonitor.scrollTop = end;
        }

        if (shrinkMonitor && !shrinkMonitor.destroyed) {
            if (Ext.isiOS) {
                this.hasShrinkMonitorScrollChanged = true;
            }

            shrinkMonitor.scrollLeft = end;
            shrinkMonitor.scrollTop = end;
        }
    },

    destroy: function() {
        // This is a closure so Base destructor won't null it
        this.onScroll = null;

        this.callParent();
    }
});
