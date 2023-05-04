/**
 * The `lockedgrid` component manages one or more child `grid`s that independently scroll
 * in the horizontal axis but are vertically synchronized. The end-user can, using column
 * menus or drag-drop, control which of these {@link #cfg!regions regions} contain which
 * columns.
 *
 * ## Locked Regions
 *
 * The `lockedgrid` always has a `center` {@link Ext.grid.locked.Region region} and by
 * default a `left` and `right` region. These regions are derivatives of `Ext.panel.Panel`
 * (to allow them to be resized and collapsed) and contain normal `grid` with a subset of
 * the overall set of `columns`. All keys in the `regions` config object are valid values
 * for a {@link Ext.grid.column.Column column}'s `locked` config. The values of each of
 * the properties of the `regions` config are configurations for the locked region itself.
 *
 * The layout of the locked regions is a simple `hbox` with the `center` assigned `flex:1`
 * and the non-center regions assigned a width based on the columns contained in that
 * region. The order of items in the container is determined by the `weight` assigned to
 * each region. Regions to the left of center have negative `weight` values, while regions
 * to the right of center have positive `weight` values. This distinction is important
 * primarily to determine the side of the region on which to display the resizer as well
 * as setting the direction of collapse for the region.
 *
 * ## Config and Event Delegation
 *
 * The `lockedgrid` mimics the config properties and events fired by a normal `grid`. It
 * does this in some cases by delegating configs to each child grid. The `regions` config
 * should be used to listen to events or configure a child grid independently when this
 * isn't desired.
 */
Ext.define('Ext.grid.locked.Grid', {
    extend: 'Ext.Panel',
    xtype: 'lockedgrid',
    alternateClassName: 'Ext.grid.LockedGrid',
    isLockedGrid: true,

    requires: [
        'Ext.layout.Box',
        'Ext.layout.Fit',
        'Ext.grid.Grid'
    ],

    classCls: Ext.baseCSSPrefix + 'lockedgrid',

    config: {
        /**
         * @cfg {Object} columnMenu
         * This is a config object which is used by columns in this grid to create their
         * header menus.
         *
         * The following column menu contains the following items.
         *
         * - Default column menu items {@link Ext.grid.Grid grid}
         * - "Region" menu item to provide locking sub-menu options
         *
         * This can be configured as `null` to prevent columns from showing a column menu.
         */
        columnMenu: {
            items: {
                region: {
                    text: 'Locked',
                    iconCls: 'fi-lock',
                    menu: {}
                }
            }
        },

        /**
         * @cfg {Ext.grid.column.Column[]} columns (required)
         * An array of column definition objects which define all columns that appear in this grid.
         * Each column definition provides the header text for the column, and a definition of where
         * the data for that column comes from.
         * Column definition can also define the locked property
         *
         * This can also be a configuration object for a {Ext.grid.header.Container HeaderContainer}
         * which may override certain default configurations if necessary. For example, the special
         * layout may be overridden to use a simpler layout, or one can set default values shared
         * by all columns:
         *
         *      columns: {
         *          items: [
         *              {
         *                  text: "Column A"
         *                  dataIndex: "field_A",
         *                  locked: true,
         *                  width: 200
         *              },{
         *                  text: "Column B",
         *                  dataIndex: "field_B",
         *                  width: 150
         *              },
         *              ...
         *          ]
         *      }
         *
         */
        columns: null,

        /**
         * @cfg {String} defaultLockedRegion
         * This config determines which region corresponds to `locked: true` on a column.
         */
        defaultLockedRegion: 'left',

        /**
         * @cfg {Object} gridDefaults
         * This config is applied to the child `grid` in all regions.
         */
        gridDefaults: null,

        /**
         * @cfg {Boolean} hideHeaders
         * @inheritdoc Ext.grid.Grid#cfg!hideHeaders
         */
        hideHeaders: false,

        /**
         * @cfg {Object} itemConfig
         * @inheritdoc Ext.grid.Grid#cfg!itemConfig
         */
        itemConfig: {},

        /**
         * @cfg {Object} leftGridDefaults
         *  This config is applied to all left-side regions (those of negative 'weight').
         *  To set defaults for all grids within left-side regions configure the `grid` 
         *  property within this config.
         */
        leftRegionDefaults: {
            locked: true,

            menuItem: {
                iconCls: 'fi-chevron-left'
            }
        },

        /**
         * @cfg {Object} regions
         * This config determines the set of possible locked regions. Each key name in this
         * object denotes a named region (for example, "left", "right" and "center"). While
         * the set of names is not fixed, meaning a `lockedgrid` can have more than these
         * three regions, there must always be a "center" region. The center regions cannot
         * be hidden or collapsed or emptied of all columns.
         *
         * The values of each property in this object are configuration objects for the
         * {@link Ext.grid.locked.Region region}. The ordering of grids is determined by
         * the `weight` config. Negative values are "left" regions, while positive values
         * are "right" regions. The `menuLabel` is used in the column menu to allow the user
         * to place columns into the region.
         *
         * To add an additional left region:
         *
         *      xtype: 'lockedgrid',
         *      regions: {
         *          left2: {
         *              menuLabel: 'Locked (leftmost)',
         *              weight: -20   // to the left of the standard "left" region
         *          }
         *      }
         */
        regions: {
            left: {
                menuItem: {
                    text: 'Locked (Left)'
                },
                weight: -10
            },
            center: {
                flex: 1,
                menuItem: {
                    text: 'Unlocked',
                    iconCls: 'fi-unlock'
                },
                weight: 0
            },
            right: {
                menuItem: {
                    text: 'Locked (Right)'
                },
                weight: 10
            }
        },

        /**
         * @cfg {Object} rightGridDefaults
         *  This config is applied to all right-side regions (those of positive 'weight').
         *  To set defaults for all grids within right-side regions configure the `grid` 
         *  property within this config.
         */
        rightRegionDefaults: {
            locked: true,

            menuItem: {
                iconCls: 'fi-chevron-right'
            }
        },

        /**
         * @cfg {Ext.data.Store/Object/String} store
         * @inheritdoc Ext.grid.Grid#cfg!store
         */
        store: null,

        /**
         * @cfg {Boolean} variableHeights
         * @inheritdoc Ext.grid.Grid#cfg!variableHeights
         */
        variableHeights: false,

        /**
         * @cfg {Boolean} enableColumnMove
         * Set to `false` to disable header reorder within this grid.
         */
        enableColumnMove: true,

        /**
         * @cfg {Boolean} grouped
         * @inheritdoc Ext.dataview.List#cfg!grouped
         */
        grouped: true
    },

    weighted: true,

    layout: {
        type: 'hbox',
        align: 'stretch'
    },

    /**
     * @property {Number} columnStateEventDelay
     * A buffer to be applied if many state events are fired within a short period.
     */
    columnStateEventDelay: 100,

    /**
     * @event beforestaterestore
     * Fires before the state of the object is restored. 
     * Return false from an event handler to stop the restore.
     * @param {Ext.grid.locked.Grid} grid this Grid
     * @param {Object} state The hash of state values returned from the StateProvider. If this
     * event is not vetoed, then the state object is passed to *`applyColumnState`.
     * @since 7.6
     */
    /**
     * @event staterestore
     * Fires after the state of the object is restored.
     * @param {Ext.grid.locked.Grid} grid this Grid
     * @param {Object} state The hash of state values returned from the StateProvider.
     * @since 7.6
     */
    /**
     * @event beforestatesave
     * Fires before the state of the object is saved to the configured state provider.
     * Return false to stop the save.
     * @param {Ext.grid.locked.Grid} grid this Grid
     * @param {Object} state The hash of state values.
     * @since 7.6
     */
    /**
     * @event statesave
     * Fires after the state of the object is saved to the configured state provider.
     * @param {Ext.grid.locked.Grid} grid this Grid
     * @param {Object} state The hash of state values.
     * @since 7.6
     */

    onRender: function() {
        this.callParent();

        this.setupHeaderSync();

        this.reconfigure();
    },

    doDestroy: function() {
        Ext.undefer(this.partnerTimer);
        this.callParent();
    },

    addColumn: function(columns) {
        var me = this,
            map = me.processColumns(columns),
            isArray = Array.isArray(columns),
            ret = isArray ? [] : null,
            grids = me.gridItems,
            len = grids.length,
            v, i, grid, toAdd;

        // Instead of just iterating over the map, loop
        // over the grids in order so that we add items
        // in order
        for (i = 0; i < len; ++i) {
            grid = grids[i];
            toAdd = map[grid.regionKey];

            if (toAdd) {
                v = grid.addColumn(toAdd);

                if (isArray) {
                    Ext.Array.push(ret, v);
                }
                else {
                    // processColumns always returns an array
                    ret = v[0];
                }
            }
        }

        if (me.getVariableHeights()) {
            me.doRefresh();
        }

        return ret;
    },

    getHorizontalOverflow: function() {
        var grids = this.visibleGrids,
            n = grids && grids.length,
            i;

        for (i = 0; i < n; ++i) {
            if (grids[i].getHorizontalOverflow()) {
                return true;
            }
        }

        return false;
    },

    getRegion: function(key) {
        return this.regionMap[key] || null;
    },

    getVerticalOverflow: function() {
        var grids = this.visibleGrids,
            n = grids && grids.length;

        // Vertical overflow is always on the right-most grid (TODO RTL)
        return n && grids[n - 1].getVerticalOverflow();
    },

    insertColumnBefore: function(column, before) {
        var ret;

        if (before === null) {
            ret = this.gridMap.center.addColumn(column);
        }
        else {
            ret = before.getParent().insertBefore(column, before);
        }

        if (this.getVariableHeights()) {
            this.doRefresh();
        }

        return ret;
    },

    removeColumn: function(column) {
        var ret = column.getGrid().removeColumn(column);

        if (this.getVariableHeights()) {
            this.doRefresh();
        }

        return ret;
    },

    createLocation: function(location) {
        var grid;

        if (location.isGridLocation && location.column) {
            grid = location.column.getGrid();

            if (grid.getHidden()) {
                grid = null;
                location = location.record;
            }
        }

        if (!grid) {
            grid = this.regionMap.center.getGrid();
        }

        return grid.createLocation(location);
    },

    setLocation: function(location, options) {
        var grid;

        if (location.isGridLocation && location.column) {
            grid = location.column.getGrid();

            if (grid.getHidden()) {
                grid = null;
                location = location.record;
            }
        }

        if (!grid) {
            grid = this.regionMap.center.getGrid();
        }

        grid.setLocation(location, options);
    },

    updateColumns: function(columns) {
        var me = this,
            grids = me.gridItems,
            map, len, i, grid;

        if (me.isConfiguring) {
            return;
        }

        map = me.processColumns(columns);

        ++me.bulkColumnChange;

        for (i = 0, len = grids.length; i < len; ++i) {
            grid = grids[i];
            grid.setColumns(map[grid.regionKey] || []);
        }

        me.doRefresh();

        --me.bulkColumnChange;
    },

    updateGrouped: function(value) {
        this.relayConfig('grouped', value);
    },

    updateHideHeaders: function(hideHeaders) {
        var me = this;

        // destroy first since relay will trigger bogus height change...
        me.headerSync = Ext.destroy(me.headerSync);

        me.relayConfig('hideHeaders', hideHeaders);

        me.setupHeaderSync();
    },

    updateEnableColumnMove: function(enabled) {
        var me = this,
            gridItems, b;

        if (me.isConfiguring) {
            return;
        }

        gridItems = me.gridItems;

        // update grid header reorder 
        for (b = 0; b < gridItems.length; b++) {
            gridItems[b].setEnableColumnMove(enabled);
        }
    },

    updateItemConfig: function(itemConfig) {
        this.relayConfig('itemConfig', itemConfig);
    },

    updateMaxHeight: function(maxHeight) {
        this.relayConfig('maxHeight', maxHeight);
    },

    updateRegions: function(regions) {
        var me = this,
            regionMap = me.regionMap,
            gridDefaults = me.getGridDefaults(),
            variableHeights = me.getVariableHeights(),
            enableColumnMove = me.getEnableColumnMove(),
            key, region, colMap, grid, gridMap,
            prev, scroller, len, i,
            defaultPartner, regionItems, gridItems;

        if (regionMap) {
            for (key in regionMap) {
                me.remove(regionMap[key]);
            }
        }

        me.regionMap = regionMap = {};
        me.gridMap = gridMap = {};

        colMap = me.processColumns(me.getColumns());

        for (key in regions) {
            region = regions[key];

            if (region) {
                region = me.createRegion(key, regions[key], colMap[key], gridDefaults);
                region = me.add(region);

                grid = region.getGrid();
                grid.isDefaultPartner = key === me.unlockedKey;
                grid.setEnableColumnMove(enableColumnMove);

                if (variableHeights) {
                    grid.partnerManager = me;

                    if (grid.isDefaultPartner) {
                        me.defaultPartner = defaultPartner = grid;
                    }
                }

                region.on({
                    scope: me,
                    collapse: 'onRegionCollapse',
                    expand: 'onRegionExpand',
                    hide: 'onRegionHide',
                    show: 'onRegionShow'
                });

                regionMap[key] = region;
                gridMap[key] = grid;

                scroller = grid.getScrollable();

                if (scroller) {
                    if (prev) {
                        prev.addPartner(scroller, 'y');
                    }

                    prev = scroller;
                }

                me.setupGrid(grid);
            }
        }

        // We don't add to this in the loop above because we want
        // the items in weighted order, so wait til everything is
        // added and in order
        me.regionItems = regionItems = me.query('>[isLockedGridRegion]');
        me.gridItems = gridItems = [];

        for (i = 0, len = regionItems.length; i < len; ++i) {
            grid = regionItems[i].getGrid();
            gridItems.push(grid);

            if (defaultPartner && grid !== defaultPartner) {
                grid.renderInfo = defaultPartner.renderInfo;
            }
        }

        me.setupHeaderSync();

        // restore grid column state
        me.onGridBeforeStateRestore();
    },

    applyStore: function(store) {
        return store ? Ext.data.StoreManager.lookup(store) : null;
    },

    updateStore: function(store) {
        this.store = store;

        this.relayConfig('store', store);
    },

    updateVariableHeights: function(variableHeights) {
        this.relayConfig('variableHeights', variableHeights);
    },

    registerActionable: function(actionable) {
        var me = this,
            actionables = me.actionables || (me.actionables = []),
            gridItems = me.gridItems,
            i;

        if (!Ext.Array.contains(actionables, actionable)) {
            actionables.push(actionable);

            if (gridItems) {
                for (i = gridItems.length; i-- > 0; /* empty */) {
                    gridItems[i].registerActionable(actionable);
                }
            }
        }
    },

    unregisterActionable: function(actionable) {
        var actionables = this.actionables,
            gridItems = this.gridItems,
            i;

        if (actionables) {
            Ext.Array.remove(actionables, actionable);

            if (gridItems) {
                for (i = gridItems.length; i-- > 0; /* empty */) {
                    gridItems[i].registerActionable(actionable);
                }
            }
        }
    },

    statics: {
        relayGridMethod: function(name, collection, key, defaultResult) {
            collection = collection || 'visibleGrids';
            key = key || 0;

            if (defaultResult == null) {
                defaultResult = null;
            }

            this.prototype[name] = function() {
                var grid = this[collection],
                    ret = defaultResult;

                grid = grid && grid[key];

                if (grid) {
                    if (grid.isLockedGridRegion) {
                        grid = grid.getGrid();
                    }

                    ret = grid[name].apply(grid, arguments);
                }

                return ret;
            };
        },

        relayGridMethods: function(descr) {
            var simple = [],
                name, options;

            for (name in descr) {
                options = descr[name];

                if (options === true) {
                    options = simple;
                    simple[0] = name;
                }
                else {
                    options = options.slice();
                    options.unshift(name);
                }

                this.relayGridMethod.apply(this, options);
            }
        }
    },

    privates: {
        bulkColumnChange: 0,
        partnerOffset: 200,
        itemConfiguring: false,
        lastPartnerRequest: 0,
        unlockedKey: 'center',

        claimActivePartner: function(partner) {
            var me = this,
                now = Date.now(),
                active = me.activePartner;

            me.partnerTimer = Ext.undefer(me.partnerTimer);

            if (!active || (now - me.lastPartnerRequest > me.partnerOffset)) {
                me.activePartner = partner;
                me.lastPartnerRequest = now;

                me.setActivePartner(partner);
            }
        },

        configureHeaderHeights: function() {
            var headerSync = this.headerSync;

            if (headerSync) {
                headerSync.sync();
            }
        },

        configureItems: function() {
            var me = this,
                gridItems = me.gridItems,
                regionItems = me.regionItems,
                i, found, grid, hide, region;

            me.itemConfiguring = true;

            for (i = gridItems.length - 1; i >= 0; --i) {
                grid = gridItems[i];
                region = regionItems[i];
                me.setRegionVisibility(region);
                hide = true;

                if (!found || !grid.getVerticalOverflow()) {
                    // Don't hide the scrollbars on hidden items, the current
                    // logic assumes that anything after the current item has
                    // scrollers visible.
                    hide = false;
                    found = me.isRegionVisible(region);
                }

                grid.setHideScrollbar(hide);
            }

            me.itemConfiguring = false;
        },

        configurePartners: function() {
            var me = this,
                gridItems = this.gridItems,
                len = gridItems.length,
                visibleGrids, i, grid;

            visibleGrids = gridItems.filter(function(item) {
                return me.isRegionVisible(item.region);
            });

            me.visibleGrids = visibleGrids;

            for (i = 0; i < len; ++i) {
                grid = gridItems[i];
                grid.allPartners = visibleGrids;
                grid.partners = visibleGrids.filter(function(item) {
                    return item !== grid;
                });
            }
        },

        createRegion: function(key, cfg, columns, gridDefaults) {
            var me = this,
                weight = cfg.weight,
                defaults;

            me.fireEvent('createregion', me, columns);

            if (weight !== 0) {
                defaults = weight < 0 ? me.getLeftRegionDefaults() : me.getRightRegionDefaults();
            }

            // assign regionKey to columns
            if (!Ext.isEmpty(columns) && me.isColumnsStateful()) {
                me.updateColumnRegion(columns, key);
            }

            return Ext.merge({
                xtype: 'lockedgridregion',
                regionKey: key,
                lockedGrid: me,
                grid: Ext.apply({
                    regionKey: key,
                    columnMenu: me.getColumnMenu(),
                    columns: columns,
                    hideHeaders: me.getHideHeaders(),
                    grouped: me.getGrouped(),
                    itemConfig: me.getItemConfig(),
                    store: me.getStore(),
                    variableHeights: me.getVariableHeights(),
                    stateId: key,
                    stateful: me.config.stateful,
                    columnStateEventDelay: me.columnStateEventDelay
                }, gridDefaults)
            }, defaults, cfg);
        },

        doHorizontalScrollCheck: function() {
            var grids = this.gridItems,
                len = grids.length,
                grid,
                scroller,
                i;

            for (i = 0; i < len; ++i) {
                grid = grids[i];
                scroller = grid.getScrollable();

                if (this.isRegionVisible(grid.region) && scroller) {
                    scroller.setX(grid.getHorizontalOverflow() ? 'scroll' : true);
                }
            }
        },

        doRefresh: function() {
            this.reconfigure();
            this.refreshGrids();
            this.doHorizontalScrollCheck();
            this.doVerticalScrollCheck();
        },

        doReleaseActivePartner: function() {
            var me = this;

            if (!me.destroyed) {
                me.lastPartnerRequest = 0;
                me.activePartner = null;

                me.setActivePartner(me.defaultPartner);
            }
        },

        doVerticalScrollCheck: function() {
            var grids = this.gridItems,
                len = grids.length,
                grid,
                scroller,
                region,
                i;

            for (i = 0; i < len; ++i) {
                grid = grids[i];
                scroller = grid.getScrollable();
                region = grid.region;

                if (region && this.isRegionVisible(region) && scroller) {
                    if (grid.getVerticalOverflow()) {
                        this.setGridScrollers(region, region.isHidden());
                    }
                    else {
                        this.setGridScrollers(false);
                    }
                }
            }
        },

        /**
         * Remove the parent header if all its child headers are removed
         * and is not root header container
         */
        trackHeaderMove: function(header) {
            var parentCt;

            if (!header || !header.isHeaderGroup || header.innerItems.length) {
                return;
            }

            parentCt = header.getParent();

            header.getRootHeaderCt().fireEvent('columngroupremove', parentCt, header);
            parentCt.remove(header);
            this.trackHeaderMove(parentCt);
        },

        handleChangeRegion: function(region, column) {
            var me = this,
                grid = region.getGrid(),
                gridItems = me.gridItems,
                newIdx = gridItems.indexOf(grid),
                oldIdx = gridItems.indexOf(column.getGrid()),
                columnParent = column.getParent();

            // The idea here is to retain the closest position possible.
            // If moving backwards, add it to the end. If moving forwards,
            // add it to the front.
            ++me.bulkColumnChange;

            if (newIdx < oldIdx) {
                grid.addColumn(column);
            }
            else {
                grid.insertColumn(0, column);
            }

            me.trackHeaderMove(columnParent);

            // If column is moved to new region update
            // new region information to column
            if (me.isColumnsStateful()) {
                column.region = (grid.regionKey !== column.regionKey)
                    ? grid.regionKey
                    : null;
            }

            // Refreshing grid on column add or insert.
            grid.syncRowsToHeight(true);

            --me.bulkColumnChange;

            me.doHorizontalScrollCheck();
            me.doVerticalScrollCheck();

            // Update columns state 
            if (column.region) {
                me.onAfterRegionChange(column);
            }

            me.onBeforeStateSave();
        },

        handleRegionVisibilityChange: function(region, hiding) {
            var me = this;

            if (!me.itemConfiguring) {
                me.configurePartners();
                me.refreshGrids();
                me.setGridScrollers(region, hiding);
                me.configureHeaderHeights();
            }
        },

        isActivePartner: function(grid) {
            var active = this.activePartner;

            return active ? grid === active : grid.isDefaultPartner;
        },

        isHeaderVisible: function(header) {
            return this.isRegionVisible(header.getGrid().region);
        },

        isRegionVisible: function(region) {
            return !region.hasHiddenContent();
        },

        isLastVisibleRegion: function(region) {
            var regions = this.regionItems,
                index = regions.indexOf(region),
                other, i;

            for (i = regions.length - 1; i > index; --i) {
                other = regions[i];

                if (!other.hasHiddenContent()) {
                    return false;
                }
            }

            return true;
        },

        onBeforeShowColumnMenu: function(grid, column, menu) {
            var regions = this.regionItems,
                len = regions.length,
                current = grid.region,
                disabled = false,
                items, region, i;

            menu = menu.getComponent('region');

            if (menu) {
                menu = menu.getMenu();
                menu.removeAll();

                items = [];

                disabled = !!(grid.isDefaultPartner && grid.getVisibleColumns().length === 1);

                for (i = 0; i < len; ++i) {
                    region = regions[i];
                    items.push(Ext.applyIf({
                        disabled: disabled || region === current,
                        handler: this.handleChangeRegion.bind(this, region, column)
                    }, region.getMenuItem()));
                }

                menu.add(items);
            }
        },

        onColumnAdd: function(grid, column) {
            var me = this;

            if (!me.setRegionVisibility(grid.region)) {
                me.refreshGrids();
            }

            me.configureHeaderHeights();

            // If column is moved to new region update
            // new region information to column
            if (me.isColumnsStateful()) {
                column.region = grid.regionKey;
            }
        },

        onColumnHide: function(grid) {
            if (!this.setRegionVisibility(grid.region)) {
                this.refreshGrids();
            }

            this.configureHeaderHeights();
        },

        onColumnRemove: function(grid, column) {
            var me = this;

            me.fireEvent('columnremove', grid, column);

            if (!me.setRegionVisibility(grid.region)) {
                me.refreshGrids();
            }

            me.configureHeaderHeights();
        },

        onColumnShow: function(grid) {
            if (!this.setRegionVisibility(grid.region)) {
                this.refreshGrids();
            }

            this.configureHeaderHeights();
        },

        onGridHorizontalOverflowChange: function() {
            if (!this.bulkColumnChange) {
                this.doHorizontalScrollCheck();
            }
        },

        onGridResize: function(grid) {
            grid.syncRowsToHeight(true);
        },

        onGridVerticalOverflowChange: function(grid, value) {
            // We could call doVerticalScrollCheck here but that would cause
            // all grids to update every time this is called
            // seeing that we already know the grid that has changed we can target
            // just one grid per event
            var region = grid.region;

            if (value) {
                this.setGridScrollers(region, region.isHidden());
            }
            else {
                grid.setHideScrollbar(false);
            }
        },

        onRegionCollapse: function(region) {
            this.handleRegionVisibilityChange(region, true);
        },

        onRegionExpand: function(region) {
            this.handleRegionVisibilityChange(region, false);
        },

        onRegionHide: function(region) {
            this.handleRegionVisibilityChange(region, true);
        },

        onRegionShow: function(region) {
            this.handleRegionVisibilityChange(region, false);
        },

        getRegionKey: function(lockedValue) {
            var defaultLocked = this.getDefaultLockedRegion(),
                key;

            if (lockedValue) {
                key = lockedValue === true ? defaultLocked : lockedValue;
            }
            else {
                key = this.unlockedKey;
            }

            return key;
        },

        processColumns: function(columns) {
            var me = this,
                map = {},
                len, i, col, locked, key, arr;

            if (columns) {
                if (!Array.isArray(columns)) {
                    columns = [columns];
                }

                for (i = 0, len = columns.length; i < len; ++i) {
                    col = columns[i];
                    locked = col.locked || (col.getLocked && col.getLocked());
                    key = me.getRegionKey(locked);
                    arr = map[key];

                    if (!arr) {
                        map[key] = arr = [];
                    }

                    arr.push(col);
                }
            }

            return map;
        },

        reconfigure: function() {
            this.configureItems();
            this.configurePartners();
            this.configureHeaderHeights();
        },

        refreshGrids: function() {
            var visibleGrids = this.visibleGrids,
                len = visibleGrids.length,
                i;

            if (!this.rendered) {
                return;
            }

            for (i = 0; i < len; ++i) {
                visibleGrids[i].syncRowsToHeight(true);
            }
        },

        relayConfig: function(name, value) {
            var grids = this.gridItems,
                i, len, setter;

            if (grids && !this.isConfiguring) {
                setter = Ext.Config.get(name).names.set;

                for (i = 0, len = grids.length; i < len; ++i) {
                    grids[i][setter](value);
                }
            }
        },

        releaseActivePartner: function(partner) {
            var me = this;

            if (me.activePartner === partner) {
                Ext.undefer(me.partnerTimer);
                me.partnerTimer = Ext.defer(me.doReleaseActivePartner, me.partnerOffset, me);
            }
        },

        setActivePartner: function(partner) {
            var visibleGrids = this.visibleGrids;

            Ext.Array.remove(visibleGrids, partner);

            visibleGrids.unshift(partner);
        },

        setGridScrollers: function(region, isHiding) {
            var gridItems = this.gridItems,
                len = gridItems.length,
                index, i, grid;

            if (this.isLastVisibleRegion(region)) {
                grid = region.getGrid();
                // If this is the last visible grid and we're hiding it, the
                // previous grid needs to show the scroller. Otherwise, this
                // grid does
                index = gridItems.indexOf(grid) - (isHiding ? 1 : 0);

                for (i = 0; i < len; ++i) {
                    gridItems[i].setHideScrollbar(grid.getVerticalOverflow() ? i < index : false);
                }
            }
        },

        setRegionVisibility: function(region) {
            var grid = region.getGrid(),
                hidden = !!region.getHidden();

            region.setHidden(grid.getVisibleColumns().length === 0);

            return hidden !== region.getHidden();
        },

        setupGrid: function(grid) {
            var actionables = this.actionables,
                i;

            if (actionables) {
                for (i = 0; i < actionables.length; ++i) {
                    grid.registerActionable(actionables[i]);
                }
            }

            grid.on({
                scope: this,
                beforeshowcolumnmenu: 'onBeforeShowColumnMenu',
                columnadd: 'onColumnAdd',
                columnhide: 'onColumnHide',
                columnremove: 'onColumnRemove',
                columnshow: 'onColumnShow',
                columnmove: 'onColumnMove',
                horizontaloverflowchange: 'onGridHorizontalOverflowChange',
                resize: 'onGridResize',
                verticaloverflowchange: 'onGridVerticalOverflowChange',
                beforestaterestore: 'onGridBeforeStateRestore',
                beforestatesave: 'onBeforeStateSave',
                regioncolumngroupremove: 'onRegionColumnGroupRemove'
            });
        },

        setupHeaderSync: function() {
            var me = this,
                grids = me.gridItems,
                headers, i;

            if (!me.getHideHeaders() && !me.isConfiguring) {
                headers = [];

                for (i = 0; i < grids.length; ++i) {
                    headers.push(grids[i].getHeaderContainer());
                }

                Ext.destroy(me.headerSync);

                me.headerSync = new Ext.util.HeightSynchronizer(
                    headers, me.isHeaderVisible.bind(me));
            }
        },

        onColumnMove: function(grid, column) {
            var group = column.parent;

            // Avoid state save call if moving in same region
            if (!this.isColumnsStateful() || !column.region) {
                return;
            }

            // assign region key column
            if (group.isHeaderGroup && group.indexOf(column) !== -1) {
                group.region = column.region;
            }

            // re-calculate columns state on region change
            this.onBeforeStateSave();
        },

        /**
         * @private
         * Prepare state data from all the region grid and assign moved column 
         * to its original region state.
         * 
         * `Ex-` Moving column1 from left region to right Region, grid state returns
         * state data as 
         *      {
         *           left:{h1: {}},
         *           center:{h1:{}},
         *           right:{
         *               left-h0:{
         *                          width: 100,
         *                          region: 'right'
         *                        } // `left-h0` property indicates it belongs to left region
         *                          // Grid and 0 column state data
         *           }
         *       } 
         *  
         *   After re-arranging the position
         *      {
         *           left:{
         *               h0: {}
         *               h1: {}
         *           },
         *           center:{h1:{}},
         *           right:{}
         *       }     
         *      
         * @returns {Object} Grid column object
         */
        reCalculateColumnState: function(stateData) {
            var gridItems = this.gridItems,
                state = stateData || {},
                i, grid, header, key, regionState,
                regKey, data, ids, colRegion;

            for (i = 0; i < gridItems.length; i++) {
                grid = gridItems[i];
                header = grid.getHeaderContainer();
                regionState = state[grid.regionKey] || {};

                state[grid.regionKey] = grid.calculateColumnState(header.items, regionState);
            }

            for (key in state) {
                regionState = state[key] || {};

                for (regKey in regionState) {
                    data = regionState[regKey];

                    // Keep column state with in region state
                    if (!Ext.isEmpty(data.region) && (regKey.indexOf(':') !== -1)) {
                        ids = regKey.split(':');
                        colRegion = ids[0];
                        state[colRegion] = state[colRegion] || {};

                        state[colRegion][ids[1]] = data;

                        delete regionState[regKey];
                    }
                }
            }

            return state;
        },

        /**
         * Restore Grid  column state
         * @returns false Cancel Grid `beforestaterestore` event
         * @private
         */
        onGridBeforeStateRestore: function() {
            var me = this,
                state;

            if (!me.isColumnsStateful()) {
                return false;
            }

            state = this.getColumnState() || {};

            if (Ext.Object.isEmpty(state)) {
                return false;
            }

            if (me.hasListeners.beforestaterestore &&
                me.fireEvent('beforestaterestore', me, state) === false) {
                return;
            }

            this.applyColumnState(state);

            if (me.hasListeners.staterestore) {
                me.fireEvent('staterestore', me, state);
            }

            return false;
        },

        /**
         * Calculate Grid column state
         * @returns false Cancel Grid `beforestaterestore` event
         * @private
         */
        onBeforeStateSave: function() {
            var me = this;

            if (!me.isColumnsStateful() || me.isConfiguring || me.applyingState) {
                return false;
            }

            me.columnStateData = me.reCalculateColumnState(me.columnStateData);

            me.persistColumnState(me.columnStateData);

            return false;
        },

        /**
         * Return {Object} saved column state.
         * @private
         */
        getColumnState: function() {
            var me = this,
                state, provider, id;

            if (!me.isColumnsStateful()) {
                return;
            }

            if (me.columnStateData) {
                return me.columnStateData;
            }

            state = me.getStateBuilder();

            if (state) {
                provider = Ext.state.Provider.get();
                id = state.root.id + '-column-state';

                return provider.get(id);
            }
        },

        /**
         * Save column state to state provider
         * @param {Object} columnsState Column State data
         * @private
         */
        persistColumnState: function(columnsState) {
            var me = this,
                state, provider, id;

            if (me.hasListeners.beforestatesave &&
                me.fireEvent('beforestatesave', me, columnsState) === false) {
                return;
            }

            state = me.getStateBuilder();

            if (state) {
                provider = Ext.state.Provider.get();
                id = state.root.id + '-column-state';

                provider.set(id, columnsState);

                if (me.hasListeners.statesave) {
                    me.fireEvent('statesave', me, columnsState);
                }
            }
        },

        /**
         * @returns {Boolean} `true` if grid is stateful
         */
        isColumnsStateful: function() {
            return !(!this.getStateId() || !this.config.stateful);
        },

        /**
         * Assign column region key to calculate the moved state
         * @param {Ext.grid.locked.Grid} grid 
         * @param {Object[]} column Region grid column
         * @param {String} regionKey 
         * @private 
         */
        updateColumnRegion: function(columns, regionKey) {
            var column, i;

            for (i = 0; i < columns.length; i++) {
                column = columns[i];

                // assign region property to the column definition
                column.regionKey = regionKey;

                if (column.columns) {
                    this.updateColumnRegion(column.columns, regionKey);
                }
            }
        },

        /**
         * Set column config from the saved state
         * @param {Ext.grid.locked.Grid} grid 
         * @param {Ext.grid.column.Column} column 
         * @param {Object} data Column state data
         * @private 
         */
        updateColumnFromState: function(grid, column, stateData) {
            var eventsMap = grid.columnStateEventMap,
                key, prop, cfg, data;

            if (Ext.isEmpty(eventsMap)) {
                return;
            }

            data = stateData[column.headerId] || {};

            for (key in eventsMap) {
                prop = eventsMap[key];

                if (!Ext.isEmpty(data[prop])) {
                    cfg = column.self.$config.configs[prop];

                    if (cfg) {
                        column[cfg.names.set](data[prop]);
                    }
                }
            }

            // re-iterate for nested column
            if (column.isHeaderGroup) {
                column.items.each(function(item) {
                    this.updateColumnFromState(grid, item, stateData);
                }, this);
            }
        },

        adjustNestedColumnState: function(column, regionData) {
            var me = this,
                data, grid, pId, group, region;

            column.items.each(function(item) {
                data = regionData[item.headerId];

                if (Ext.Object.isEmpty(data) && item.isHeaderGroup) {
                    me.adjustNestedColumnState(item, regionData);
                }

                pId = data.parentHeaderId;

                // if dragged into group header and group is also moved but not arranged
                if (pId) {
                    group = me.down('[isGridColumn][headerId = ' + pId + ']');

                    if (group && group.indexOf(item) === -1) {
                        group.insert(data.weight, item);
                    }
                }
                else {
                    region = me.getRegion((data.region || 'center'));
                    grid = region.getGrid();

                    grid.insertColumn(data.weight, item);
                }

                if (item.isHeaderGroup) {
                    me.adjustNestedColumnState(item, regionData);
                }
            });
        },

        /**
         * Apply saved state to the grid
         * @param {Object} stateData Grid column state data
         * @private 
         */
        applyColumnState: function(stateData) {
            var me = this,
                states, regionKey, grid, regionData,
                data, column, key, region, regionGrid,
                pId, group;

            if (!me.isColumnsStateful()) {
                return;
            }

            states = stateData || me.getColumnState();

            if (Ext.Object.isEmpty(states)) {
                return;
            }

            me.applyingState = true;

            for (regionKey in states) {
                regionData = states[regionKey];

                for (key in regionData) {
                    data = regionData[key];
                    column = me.down(
                        '[isGridColumn][headerId = ' + key + '][regionKey=' + regionKey + ']');

                    if (column) {
                        grid = column.getGrid();

                        if (data.region) {
                            region = me.getRegion(data.region);

                            regionGrid = region.getGrid();

                            pId = data.parentHeaderId;

                            // if dragged into group header and group is also moved but not arranged
                            if (pId) {
                                group = me.down('[isGridColumn][headerId = ' + pId + ']');

                                if (group) {
                                    group.insert(data.weight, column);
                                }
                            }
                            else {
                                regionGrid.insertColumn(data.weight, column);
                            }
                        }

                        if (column.isHeaderGroup) {
                            me.adjustNestedColumnState(column, regionData);
                        }

                        // Update column config from the saved state
                        me.updateColumnFromState(grid, column, regionData);
                    }
                }
            }

            me.applyingState = false;
        },

        // Update nested column state region property with header group
        onAfterRegionChange: function(column, regionKey) {
            if (!this.isColumnsStateful() || !column.isHeaderGroup) {
                return;
            }

            regionKey = regionKey || column.region;

            column.items.each(function(item) {
                item.region = (item.regionKey !== regionKey) ? regionKey : null;

                if (item.isHeaderGroup) {
                    this.onAfterRegionChange(item, regionKey);
                }
            }, this);
        },

        /**
         * Update header group hidden state 
         * @param {Ext.grid.column.Column} column 
         * @param {String} id Column State ID
         */
        onRegionColumnGroupRemove: function(column, id) {
            if (!this.isColumnsStateful()) {
                return;
            }

            column.setHidden(true);

            this.onBeforeStateSave();
        }
    }
}, function(LockedGrid) {
    LockedGrid.relayGridMethods({
        ensureVisible: true,
        gatherData: true,
        getSelections: true,
        mapToItem: true,
        mapToRecord: true,
        mapToRecordIndex: true
    });
});
