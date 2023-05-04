/**
 * This {@link Ext.grid.Grid grid} plugin manages a bottom-docked summary {@link #row row}.
 *
 * By default, the column's {@link Ext.grid.column.Column#cfg!dataIndex dataIndex} is used
 * to read from the {@link Ext.data.Store#getSummaryRecord summary record} as controlled by
 * the model's {@link Ext.data.Model#cfg!summary summary} definition. To use a different
 * field, the {@link Ext.grid.column.Column#cfg!summaryDataIndex summaryDataIndex} can be
 * specified.
 *
 * The {@link Ext.grid.column.Column#cfg!summary summary} config can be used to perform
 * column-specific summarization. The `summary` config uses one of the registered summary
 * types (see below). Custom summary types can be defined, or a column-specific algorithm
 * can be provided with a {@link Ext.grid.column.Column#cfg!summaryRenderer summaryRenderer}.
 *
 * ## Summary Types
 *
 * The `summary` type can be one of the predefined summary types:
 *
 * + {@link Ext.data.summary.Average average}
 * + {@link Ext.data.summary.Count count}
 * + {@link Ext.data.summary.Max max}
 * + {@link Ext.data.summary.Min min}
 * + {@link Ext.data.summary.Sum sum}
 *
 *
 * ```javascript
 * @example({ framework: 'extjs' })
 * var store = Ext.create('Ext.data.Store', {
 *     fields: ['fname', 'lname', 'talent', 'wins'],
 *     data: [
 *         { 'fname': 'Barry',  'lname': 'Allen', 'talent': 'Speedster', 'wins': 150  },
 *         { 'fname': 'Oliver', 'lname': 'Queen', 'talent': 'Archery', 'wins': 27  },
 *         { 'fname': 'Kara',   'lname': 'Zor-El', 'talent': 'All', 'wins': 75  },
 *         { 'fname': 'Helena', 'lname': 'Bertinelli', 'talent': 'Weapons Expert', 'wins': 7  },
 *         { 'fname': 'Hal',    'lname': 'Jordan', 'talent': 'Willpower', 'wins': 198  },
 *     ]
 * });
 *
 * Ext.create('Ext.grid.Grid', {
 *     title: 'DC Personnel',
 *
 *     store: store,
 *     plugins: {
 *         gridsummaryrow: true
 *     },
 *     columns: [
 *         { text: 'First Name', dataIndex: 'fname',  flex: 1 },
 *         { text: 'Last Name',  dataIndex: 'lname',  flex: 1 },
 *         { text: 'Talent',     dataIndex: 'talent', flex: 1 },
 *         { text: 'Wins',       dataIndex: 'wins',   flex: 1,  summary: 'sum' }
 *     ],
 *     fullscreen: true,
 *     height:275
 * });
 * ```
 * ```html
 * @example({framework: 'ext-web-components', packages:['ext-web-components'], tab: 1 })
 * <ext-container width="100%" height="100%">
 *     <ext-grid
 *       shadow="true"
 *       height="275"
 *       plugins='["gridsummaryrow"]'
 *       onready="summaryGrid.onGridReady"
 *       fullscreen="true"
 *       variableHeights="true"
 *     >
 *         <ext-column text="First Name" dataIndex="fname" flex="1"></ext-column>
 *         <ext-column text="Last Name" dataIndex="lname" flex="1"></ext-column>
 *         <ext-column text="Talent" dataIndex="talent" flex="1"></ext-column>
 *         <ext-column text="Wins" dataIndex="wins" flex="1" summary="sum"></ext-column>
 *     </ext-grid>
 * </ext-container>
 * ```
 * ```javascript
 * @example({framework: 'ext-web-components', tab: 2, packages: ['ext-web-components']})
 * import '@sencha/ext-web-components/dist/ext-container.component';
 * import '@sencha/ext-web-components/dist/ext-grid.component';
 * import '@sencha/ext-web-components/dist/ext-column.component';
 * 
 * Ext.require('Ext.grid.plugin.Summary');
 * 
 * export default class SummaryGridComponent {
 *     constructor() {
 *        this.store = new Ext.data.Store({
 *           data: [
 *               {
 *                   'fname': 'Barry',
 *                   'lname': 'Allen',
 *                   'talent': 'Speedster',
 *                   'wins': 150
 *               },
 *               {
 *                   'fname': 'Oliver',
 *                   'lname': 'Queen',
 *                   'talent': 'Archery',
 *                   'wins': 120
 *               },
 *               {
 *                    'fname': 'Kara',
 *                    'lname': 'Zor-El',
 *                    'talent': 'All',
 *                    'wins': 90
 *               },
 *               {
 *                   'fname': 'Helena',
 *                   'lname': 'Bertinelli',
 *                   'talent': 'Weapons Expert',
 *                   'wins': 70
 *               },
 *               {
 *                   'fname': 'Hal',
 *                   'lname': 'Jordan',
 *                   'talent': 'Willpower',
 *                   'wins': 60
 *               }
 *           ]
 *        });
 *     }
 * 
 *     onGridReady(event) {
 *         this.summaryGridCmp = event.detail.cmp;
 *         this.summaryGridCmp.setStore(this.store);
 *     }
 * }
 * 
 * window.summaryGrid = new SummaryGridComponent();
 * ```
 * ```javascript
 * @example({framework: 'ext-react', packages:['ext-react']})
 * import React, { Component } from 'react'
 * import { ExtGrid, ExtColumn } from '@sencha/ext-react';
 * 
 * Ext.require('Ext.grid.plugin.Summary');
 *
 * export default class MyExample extends Component {
 *
 *     store = new Ext.data.Store({
 *         data: [
 *             { 'fname': 'Barry', 'lname': 'Allen', 'talent': 'Speedster', 'wins': 150 },
 *             { 'fname': 'Oliver', 'lname': 'Queen', 'talent': 'Archery', 'wins': 27 },
 *             { 'fname': 'Kara', 'lname': 'Zor-El', 'talent': 'All', 'wins': 75 },
 *             { 'fname': 'Helena', 'lname': 'Bertinelli', 'talent': 'Weapons Expert', 'wins': 7 },
 *             { 'fname': 'Hal', 'lname': 'Jordan', 'talent': 'Willpower', 'wins': 198 }
 *         ]
 *     });
 *      
 *     render() {
 *         return (
 *             <ExtGrid
 *                 height="275"
 *                 store={this.store}
 *                 plugins={['gridsummaryrow']}
 *             >
 *                 <ExtColumn text="First Name" dataIndex="fname" flex={1} />
 *                 <ExtColumn text="Last Name" dataIndex="lname" flex={1} />
 *                 <ExtColumn text="Talent" dataIndex="talent" flex={1} />
 *                 <ExtColumn text="Wins" dataIndex="wins" flex={1} summary="sum" />
 *             </ExtGrid>
 *         )
 *     }
 * }
 * ```
 * ```javascript
 * @example({framework: 'ext-angular', packages:['ext-angular']})
 * import { Component } from '@angular/core'
 * declare var Ext: any;
 * 
 *  Ext.require('Ext.grid.plugin.Summary');
 *  @Component({
 *      selector: 'app-root-1',
 *      styles: [`
 *              `],
 *      template: `
 *      <ExtContainer layout="fit">
 *          <ExtGrid
 *               [height]="'280px'"
 *               [store]="this.store"
 *               [plugins]="['gridsummaryrow']"
 *           >
 *               <ExtColumn text="First Name" dataIndex="fname" flex="1"></ExtColumn>
 *               <ExtColumn text="Last Name" dataIndex="lname" flex="1"></ExtColumn>
 *               <ExtColumn text="Talent" dataIndex="talent" flex="1"></ExtColumn>
 *               <ExtColumn text="Wins" dataIndex="wins" flex="1" summary="sum"></ExtColumn>
 *           </ExtGrid>
 *       </ExtContainer>
 *      `
 *  })
 *  export class AppComponent {
 *      store = Ext.create('Ext.data.Store', {
 *          data: [
 *              { 'fname': 'Barry', 'lname': 'Allen', 'talent': 'Speedster', 'wins': 150 },
 *              { 'fname': 'Oliver', 'lname': 'Queen', 'talent': 'Archery', 'wins': 27 },
 *              { 'fname': 'Kara', 'lname': 'Zor-El', 'talent': 'All', 'wins': 75 },
 *              { 'fname': 'Helena', 'lname': 'Bertinelli', 'talent': 'Weapons Expert', 'wins': 7 },
 *              { 'fname': 'Hal', 'lname': 'Jordan', 'talent': 'Willpower', 'wins': 198 }
 *          ]
 *      });
 *  }
 * ```
 *
 */
Ext.define('Ext.grid.plugin.Summary', {
    extend: 'Ext.plugin.Abstract',
    alias: [
        'plugin.gridsummary',
        'plugin.summaryrow',
        'plugin.gridsummaryrow'
    ],
    alternateClassName: 'Ext.grid.plugin.SummaryRow',

    mixins: [
        'Ext.mixin.Bufferable',
        'Ext.mixin.StoreWatcher'
    ],

    requires: [
        'Ext.grid.SummaryRow'
    ],

    config: {
        /**
         * @cfg {Ext.grid.SummaryRow/Object} row
         * The configuration object for the docked summary row managed by this plugin.
         * @since 6.5.0
         */
        row: {
            lazy: true,
            $value: {
                xtype: 'gridsummaryrow',
                docked: 'bottom'
            }
        }
    },

    inheritUi: true,

    storeListeners: {
        add: 'syncSummary',
        clear: 'syncSummary',
        remove: 'syncSummary',
        refresh: 'syncSummary',
        update: 'syncSummary'
    },

    bufferableMethods: {
        // buffer updates to reduce re-summarization passes over the entire store.
        syncSummary: 5
    },

    init: function(grid) {
        var scrollable = grid.getScrollable(),
            row, rowScroller;

        this.setOwner(grid);
        row = this.getRow();
        grid.addCls(Ext.baseCSSPrefix + 'grid-has-summaryrow');

        if (scrollable) {
            rowScroller = row.getScrollable();

            if (!rowScroller) {
                row.setScrollable({
                    x: false,
                    y: false
                });
                rowScroller = row.getScrollable();
            }

            rowScroller.addPartner(scrollable, 'x');
        }
    },

    destroy: function() {
        this.setOwner(null);

        this.callParent();
    },

    createRow: function(config) {
        return Ext.apply({
            viewModel: this.getOwner().getItemConfig().viewModel
        }, config);
    },

    applyRow: function(row) {
        if (row) {
            row = this.createRow(row);
            row = this.cmp.add(row);
        }

        return row;
    },

    updateStore: function(store, oldStore) {
        this.mixins.storewatcher.updateStore.call(this, store, oldStore);

        if (store && store.isLoaded()) {
            // if the store is already loaded then we update summaries
            this.syncSummary();
        }
    },

    privates: {
        doSyncSummary: function() {
            var row = this.getRow();

            if (row) {
                row.syncSummary();
            }
        },

        onContainerScroll: function(scr, x) {
            var item = this.getRow(),
                scroller;

            if (!(scroller = item.getScrollable())) {
                item.setScrollable({
                    x: false,
                    y: false
                });

                scroller = item.getScrollable();
            }

            scroller.scrollTo(x, null);
        }
    }
});
