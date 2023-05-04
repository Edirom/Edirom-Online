/**
 * The Row Expander plugin provides an "expander" column to give the user the ability to show
 * or hide the {@link Ext.grid.Row#cfg!body body} of each row.
 *
 * ```javascript
 * @example({ framework: 'extjs' })
 * var store = Ext.create('Ext.data.Store', {
 *     fields: ['fname', 'lname', 'talent', 'powers'],
 *     groupField: 'powers',
 *     data: [
 *         { 'fname': 'Barry',
 *           'lname': 'Allen', 
 *           'talent': 'Speedster',
 *           'powers': true
 *         },
 *         { 'fname': 'Oliver',
 *           'lname': 'Queen',
 *           'talent': 'Archery',
 *           'powers': false
 *         },
 *         { 'fname': 'Kara',
 *           'lname': 'Zor-El', 
 *           'talent': 'All',
 *           'powers': true
 *         },
 *         { 'fname': 'Helena',
 *           'lname': 'Bertinelli', 
 *           'talent': 'Weapons Expert',
 *           'powers': false
 *         },
 *         { 'fname': 'Hal',
 *           'lname': 'Jordan', 
 *           'talent': 'Willpower',
 *           'powers': true
 *         },
 *     ]
 * });
 *
 * Ext.create('Ext.grid.Grid', {
 *     title: 'DC Personnel',
 *     grouped: true,
 *     store: store,
 *     plugins: {
 *         rowexpander: true
 *     },
 *     itemConfig: {
 *         body: {
 *             tpl: '<img height="100" src="http://www.sencha.com/assets/images/sencha-avatar-64x64.png"/>'
 *         }
 *     },
 *     columns: [
 *         { text: 'First Name', dataIndex: 'fname',  flex: 1 },
 *         { text: 'Last Name',  dataIndex: 'lname',  flex: 1 },
 *         { text: 'Talent',     dataIndex: 'talent', flex: 1 },
 *         { text: 'Powers?',    dataIndex: 'powers', flex: 1 }
 *     ],
 *     height: 400,
 *     layout: 'fit',
 *     fullscreen: true
 * });
 * ```
 * ```html
 * @example({framework: 'ext-web-components', packages:['ext-web-components'], tab: 1 })
 * <ext-container width="100%" height="100%">
 *     <ext-grid
 *       shadow="true"
 *       height="275"
 *       plugins='["rowexpander"]'
 *       onready="rowExpanderGrid.onGridReady"
 *       fullscreen="true"
 *       variableHeights="true"
 *     >
 *         <ext-column text="First Name" dataIndex="fname" flex="1"></ext-column>
 *         <ext-column text="Last Name" dataIndex="lname" flex="1"></ext-column>
 *         <ext-column text="Talent" dataIndex="talent" flex="1"></ext-column>
 *     </ext-grid>
 * </ext-container>
 * ```
 * ```javascript
 * @example({framework: 'ext-web-components', tab: 2, packages: ['ext-web-components']})
 * import '@sencha/ext-web-components/dist/ext-container.component';
 * import '@sencha/ext-web-components/dist/ext-grid.component';
 * import '@sencha/ext-web-components/dist/ext-column.component';
 * 
 * Ext.require('Ext.grid.plugin.RowExpander');
 * 
 * export default class RowExpanderGridComponent {
 *     constructor() {
 *        this.store = new Ext.data.Store({
 *           sorters: [
 *             { property: 'lname' }
 *           ],
 *           data: [
 *               { 'fname': 'Barry',  'lname': 'Allen', 'talent': 'Speedster'},
 *               { 'fname': 'Oliver', 'lname': 'Queen', 'talent': 'Archery'},
 *               { 'fname': 'Kara',   'lname': 'Zor-El', 'talent': 'All'},
 *               { 'fname': 'Helena', 'lname': 'Bertinelli', 'talent': 'Weapons Expert'},
 *               { 'fname': 'Hal',    'lname': 'Jordan', 'talent': 'Willpower'  }
 *           ]
 *        });
 *     }
 * 
 *     onGridReady(event) {
 *         this.rowExpanderGridCmp = event.detail.cmp;
 *         this.rowExpanderGridCmp.setItemConfig({ body:
 *           {
 *             tpl: `
 *                 <div>
 *                   <img height="100" src="http://www.sencha.com/assets/images/sencha-avatar-64x64.png"/>
 *                   <div style="font-size: 16px; margin-bottom: 5px">{fname} {lname}</div>
 *                   <div style="font-weight: bold; font-size: 14px">{title}</div>
 *                   <div style="font-weight: bold">{department}</div>
 *                 </div>`
 *           }
 *         });
 *         this.rowExpanderGridCmp.setStore(this.store);
 *     }
 * }
 *  window.rowExpanderGrid = new RowExpanderGridComponent();
 * ```
 * ```javascript
 * @example({framework: 'ext-react', packages:['ext-react']})
 * import React, { Component } from 'react'
 * import { ExtGrid, ExtColumn } from '@sencha/ext-react';
 *
 * Ext.require('Ext.grid.plugin.RowExpander');
 * 
 * export default class MyExample extends Component {
 *
 *    store = Ext.create('Ext.data.Store', {
 *        data: [
 *            {
 *                'fname': 'Barry',
 *                'lname': 'Allen',
 *                'title': 'Director of Engineering',
 *                'department': 'Engineering'
 *            },
 *            {
 *                'fname': 'Oliver',
 *                'lname': 'Queen',
 *                'title': 'Senior Developer',
 *                'department': 'Engineering'
 *            },
 *            {
 *                'fname': 'Kara',
 *                'lname': 'Zor-El',
 *                'title': 'Senior Marketing Manager',
 *                'department': 'Marketing'
 *            },
 *            {
 *                'fname': 'Helena',
 *                'lname': 'Bertinelli',
 *                'title': 'Marketing Associate',
 *                'department': 'Marketing'
 *            },
 *            {
 *                'fname': 'Hal',
 *                'lname': 'Jordan',
 *                'title': 'Product Manager',
 *                'department': 'Marketing'
 *            }
 *        ],
 *        sorters: [
 *            { property: 'lname' }
 *        ]
 *    });
 *
 *    render() {
 *        return (
 *            <ExtGrid
 *                store={this.store}
 *                fullscreen
 *                plugins={['rowexpander']}
 *                itemConfig={{
 *                    body: {
 *                        tpl: (record) => (
 *                            <div>
 *                                <img height="100" src="http://www.sencha.com/assets/images/sencha-avatar-64x64.png"/>
 *                                <div style={styles.name}>{record.fname} {record.lname}</div>
 *                                <div style={styles.title}>{record.title}</div>
 *                                <div style={styles.department}>{record.department}</div>
 *                            </div>
 *                        )
 *                    }
 *                }}
 *                variableHeights
 *            >
 *                <ExtColumn 
 *                    text="First Name"
 *                    dataIndex="fname"
 *                    flex={1}
 *                />
 *                <ExtColumn 
 *                    text="Last Name"
 *                    dataIndex="lname"
 *                    flex={1}
 *                />
 *                <ExtColumn 
 *                    text="Department"
 *                    dataIndex="department"
 *                    flex={1}
 *                />
 *            </ExtGrid>
 *        )
 *    }
 * }
 *
 * const styles = {
 *      name: {
 *          fontSize: '16px',
 *          marginBottom: '5px'
 *      },
 *      department: {
 *          fontWeight: 'bold'
 *      },
 *      title: {
 *          fontWeight: 'bold',
 *          fontSize: '14px'
 *      }
 *  }
 * ```
 * ```javascript
 * @example({framework: 'ext-angular', packages:['ext-angular']})
 * import { Component } from '@angular/core'
 * declare var Ext: any;
 *
 * Ext.require('Ext.grid.plugin.RowExpander');
 * @Component({
 *     selector: 'app-root-1',
 *     styles: [`
 *             `],
 *     template: `
 *     <ExtContainer height="600" width="900">
 *         <ExtGrid
 *             [store]="store"
 *             [fullscreen]="true"
 *             (ready)="gridReady($event)"
 *             [itemConfig]="configObj"
 *             [variableHeights]="true"
 *         >
 *             <ExtColumn 
 *                 text="First Name"
 *                 dataIndex="fname"
 *                 flex= "1"
 *             ></ExtColumn>
 *             <ExtColumn 
 *                 text="Last Name"
 *                 dataIndex="lname"
 *                 flex= "1"
 *             ></ExtColumn>
 *             <ExtColumn
 *                 text="Department"
 *                 dataIndex="department"
 *                 flex= "1"
 *             ></ExtColumn>
 *         </ExtGrid>
 *     </ExtContainer>
 *     `
 * })
 * export class AppComponent {
 *     configObj = {
 *         body: {
 *             tpl: `
 *                 <div>
 *                     <img height="100" src="http://www.sencha.com/assets/images/sencha-avatar-64x64.png"></img>
 *                     <div style="font-size: 16px; margin-bottom: 5px">{fname} {lname}</div>
 *                     <div style="font-weight: bold">{title}</div>
 *                     <div style="font-weight: bold; font-size: 14px">{department}</div>
 *                 </div>
 *             `
 *         }
 *     };
 *
 *     store = Ext.create('Ext.data.Store', {
 *         data: [
 *             {
 *                 'fname': 'Barry',
 *                 'lname': 'Allen',
 *                 'title': 'Director of Engineering',
 *                 'department': 'Engineering'
 *             },
 *             {
 *                 'fname': 'Oliver',
 *                 'lname': 'Queen',
 *                 'title': 'Senior Developer',
 *                 'department': 'Engineering'
 *             },
 *             {
 *                 'fname': 'Kara',
 *                 'lname': 'Zor-El',
 *                 'title': 'Senior Marketing Manager',
 *                 'department': 'Marketing'
 *             },
 *             {
 *                 'fname': 'Helena',
 *                 'lname': 'Bertinelli',
 *                 'title': 'Marketing Associate',
 *                 'department': 'Marketing'
 *             },
 *             {
 *                 'fname': 'Hal',
 *                 'lname': 'Jordan',
 *                 'title': 'Product Manager',
 *                 'department': 'Marketing'
 *             }
 *         ],
 *         sorters: [
 *             { property: 'lname' }
 *         ]
 *     });
 *     
 *     gridReady  = (ele) => {
 *         ele.ext.setPlugins({rowexpander: true});
 *     }
 * }
 * ```
 *
 * @since 6.2.0
 */
Ext.define('Ext.grid.plugin.RowExpander', {
    extend: 'Ext.plugin.Abstract',

    requires: [
        'Ext.grid.cell.Expander'
    ],

    alias: 'plugin.rowexpander',

    config: {
        grid: null,
        column: {
            weight: -1100,
            xtype: 'gridcolumn',
            align: 'center',
            text: '',
            width: 50,
            resizable: false,
            hideable: false,
            sortable: false,
            editable: false,
            ignore: true,
            ignoreExport: true,
            cell: {
                xtype: 'expandercell'
            },
            menuDisabled: true
        }
    },

    expanderSelector: '.' + Ext.baseCSSPrefix + 'expandercell .' + Ext.baseCSSPrefix + 'icon-el',

    init: function(grid) {
        grid.setVariableHeights(true);
        this.setGrid(grid);
    },

    destroy: function() {
        var grid = this.getGrid(),
            col = this.colInstance;

        if (col && !grid.destroying) {
            grid.unregisterColumn(col, true);
        }

        this.callParent();
    },

    applyColumn: function(column, oldColumn) {
        return Ext.factory(Ext.apply({}, column), null, oldColumn);
    },

    updateGrid: function(grid) {
        var me = this;

        if (grid) {
            grid.hasRowExpander = true;
            grid.addCls(Ext.baseCSSPrefix + 'has-rowexpander');

            me.colInstance = grid.registerColumn(me.getColumn());
            grid.refreshScrollerSize();

            grid.element.on({
                tap: 'onGridTap',
                delegate: me.expanderSelector,
                scope: me
            });
        }
    },

    onGridTap: function(e) {
        var cell = Ext.Component.from(e),
            row = cell.row;

        // May have tapped on a descendant grid row. We're only interested in our own.
        if (row.getGrid() === this.getGrid()) {
            row.toggleCollapsed();
        }
    }
});
