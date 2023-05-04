/**
 * Represents a grouping of items. The grouper works in a similar fashion as the
 * `Ext.util.Sorter` except that groups must be able to extract a value by which all items
 * in the group can be collected. By default this is derived from the `property` config
 * but can be customized using the `groupFn` if necessary.
 *
 * All items with the same group value compare as equal. If the group values do not compare
 * equally, the sort can be controlled further by setting `sortProperty` or `sorterFn`.
 */
Ext.define('Ext.util.Grouper', {
    extend: 'Ext.util.Sorter',

    isGrouper: true,

    config: {
        /**
         * @cfg {Function} groupFn This function is called for each item in the collection
         * to determine the group to which it belongs. By default the `property` value is
         * used to group items.
         * @cfg {Object} groupFn.item The current item from the collection.
         * @cfg {String} groupFn.return The group identifier for the item.
         */
        groupFn: null,

        /**
         * @cfg {String} property The field by which records are grouped. Groups are
         * sorted alphabetically by group value as the default. To sort groups by a different
         * property, use the {@link #sortProperty} configuration.
         */

        /**
         * @cfg {String} sortProperty You can set this configuration if you want the groups
         * to be sorted on something other then the group string returned by the `groupFn`.
         * This serves the same role as `property` on a normal `Ext.util.Sorter`.
         */
        sortProperty: null,

        /**
         * @cfg {String} formatter
         * This config accepts a format specification as would be used in a `Ext.Template`
         * formatted token. For example `'round(2)'` to round numbers to 2 decimal places
         * or `'date("Y-m-d")'` to format a Date.
         *
         * It is used to format the group name. Can be used instead of the `groupFn` config.
         */
        formatter: false,
        /**
         * @cfg {String} blankValue
         *
         * A text that is used if the generated name for the group is empty
         */
        blankValue: ''
    },

    _eventToMethodMap: {
        propertychange: 'onGrouperPropertyChange',
        directionchange: 'onGrouperDirectionChange'
    },

    constructor: function(config) {
        //<debug>
        if (config) {
            if (config.getGroupString) {
                Ext.raise("Cannot set getGroupString - use groupFn instead");
            }
        }
        //</debug>

        this.callParent(arguments);
    },

    /**
     * Returns the string value for grouping, primarily used for grouper key.
     * @param {Ext.data.Model} item The Model instance
     * @return {String}
     */
    getGroupString: function(item) {
        return item.$collapsedGroupPlaceholder
            ? item.$groupKey
            : this.getGroupValue(item).toString();
    },

    /**
     * Returns the value for grouping to be used.
     * @param {Ext.data.Model} item The Model instance
     * @return {Mixed}
     */
    getGroupValue: function(item) {
        var groupValue = item.$collapsedGroupPlaceholder ? item.$groupValue : this._groupFn(item);

        return (groupValue != null && groupValue !== '') ? groupValue : this.getBlankValue();
    },

    sortFn: function(item1, item2) {
        var me = this,
            lhs = me.getGroupValue(item1),
            rhs = me.getGroupValue(item2),
            property = me._sortProperty, // Sorter's sortFn uses "_property"
            root = me._root,
            sorterFn = me._sorterFn,
            transform = me._transform;

        // Compare groupFn results for both sides and return if they are equal, ensuring
        // correct comparison in case values are dates.
        if (lhs === rhs || Ext.Date.isEqual(lhs, rhs)) {
            return 0;
        }

        if (property || sorterFn) {
            if (sorterFn) {
                return sorterFn.call(this, item1, item2);
            }

            if (root) {
                item1 = item1[root];
                item2 = item2[root];
            }

            lhs = item1[property];
            rhs = item2[property];

            if (transform) {
                lhs = transform(lhs);
                rhs = transform(rhs);
            }
        }

        return (lhs > rhs) ? 1 : (lhs < rhs ? -1 : 0);
    },

    standardGroupFn: function(item) {
        var me = this,
            root = me._root,
            formatter = me._formatter,
            value = (root ? item[root] : item)[me._property];

        if (formatter) {
            value = formatter(value, me);
        }

        return value;
    },

    updateSorterFn: function() {
        // don't callParent here - we don't want to smash sortFn w/sorterFn
    },

    updateProperty: function(data, oldData) {
        var me = this;

        // we don't callParent since that is related to sorterFn smashing sortFn
        if (!me.getGroupFn()) {
            me.setGroupFn(me.standardGroupFn);
        }

        me.notify('propertychange', [data, oldData]);
    },

    updateDirection: function(data, oldData) {
        this.callParent([data, oldData]);
        this.notify('directionchange', [data, oldData]);
    },

    applyFormatter: function(value) {
        var parser, format;

        if (!value) {
            return null;
        }

        parser = Ext.app.bind.Parser.fly(value);
        format = parser.compileFormat();
        parser.release();

        return function(v, scope) {
            return format(v, scope);
        };
    },

    addObserver: function(observer) {
        var me = this,
            observers = me.observers;

        if (!observers) {
            me.observers = observers = [];
        }

        if (!Ext.Array.contains(observers, observer)) {
            // if we're in the middle of notifying, we need to clone the observers
            if (me.notifying) {
                me.observers = observers = observers.slice(0);
            }

            observers[observers.length] = observer;
        }

        me.dirtyObservers = true;
    },

    prioritySortFn: function(o1, o2) {
        var a = +o1.observerPriority,
            b = +o2.observerPriority;

        if (isNaN(a)) {
            a = 0;
        }

        if (isNaN(b)) {
            b = 0;
        }

        return a - b;
    },

    removeObserver: function(observer) {
        var observers = this.observers;

        if (observers) {
            Ext.Array.remove(observers, observer);
            this.dirtyObservers = true;
        }
    },

    clearObservers: function() {
        this.observers = null;
    },

    notify: function(eventName, args) {
        var me = this,
            observers = me.observers,
            methodName = me._eventToMethodMap[eventName],
            added = 0,
            index, length, method, observer;

        args = args || [];

        if (observers && methodName) {
            me.notifying = true;

            if (me.dirtyObservers && observers.length > 1) {
                // Allow observers to be inserted with a priority.
                // For example GroupCollections must react to Collection mutation before views.
                // Before notifying our observers let's sort them by priority.
                Ext.Array.sort(observers, me.prioritySortFn);
                me.dirtyObservers = false;
            }

            for (index = 0, length = observers.length; index < length; ++index) {
                method = (observer = observers[index])[methodName];

                if (method) {
                    if (!added++) { // jshint ignore:line
                        args.unshift(me);
                    }

                    method.apply(observer, args);
                }
            }

            me.notifying = false;
        }
    }
});
