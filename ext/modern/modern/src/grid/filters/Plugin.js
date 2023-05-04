/**
 * This plugin enables user-defined filters for a grid.
 * @since 6.7.0
 *
 * In general an gridfilters plugin will be passed to the grid:
 *
 * ```javascript
 * @example({ framework: 'extjs' })
 *  var store = Ext.create('Ext.data.Store', {
 *      fields: ['firstname', 'lastname', 'seniority', 'department', 'hired', 'active'],
 *      data: [
 *          {
 *               firstname:"Michael",
 *               lastname:"Scott",
 *               seniority:7,
 *               department:"Management",
 *               hired:"01/10/2004",
 *               active: true
 *          },
 *          {
 *               firstname:"Dwight",
 *               lastname:"Schrute",
 *               seniority:2,
 *               department:"Sales",
 *               hired:"04/01/2004",
 *               active: true
 *          },
 *          {
 *               firstname:"Jim",
 *               lastname:"Halpert",
 *               seniority:3,
 *               department:"Sales",
 *               hired:"02/22/2006",
 *               active: false
 *          },
 *          {
 *               firstname:"Kevin",
 *               lastname:"Malone",
 *               seniority:4,
 *               department:"Accounting",
 *               hired:"06/10/2007",
 *               active: true
 *          },
 *          {
 *               firstname:"Angela",
 *               lastname:"Martin",
 *               seniority:5,
 *               department:"Accounting",
 *               hired:"10/21/2008",
 *               active: false
 *          }
 *      ]
 *  });
 *
 *  Ext.create({
 *      xtype: 'grid',
 *      title: 'Filter Grid Demo',
 *      itemConfig: {
 *          viewModel: true
 *      },
 *      plugins: {
 *           gridfilters: true
 *      },
 *      store: store,
 *      columns: [
 *          {text: 'First Name',  dataIndex:'firstname'},
 *          {text: 'Last Name',  dataIndex:'lastname'},
 *          {text: 'Hired Month',  dataIndex:'hired'},
 *          {
 *              text: 'Department',
 *              width: 200,
 *              cell: {
 *                 bind: '{record.department} ({record.seniority})'
 *              }
 *          }
 *      ],
 *      width: 500,
 *      fullscreen: true
 *  });
 * ```
 * ```html
 * @example({framework: 'ext-web-components', packages:['ext-web-components'], tab: 1 })
 *  <ext-grid
 *    fullscreen="true"
 *    itemConfig='{ "viewmodel": true }'
 *    plugins='{"gridfilters": true}'
 *    title='Filter Grid Demo'
 *    width="500"
 *    onready="plugin.onGridReady"
 *  >
 *    <ext-column dataIndex='firstname' text='First Name'></ext-column>
 *    <ext-column dataIndex='lastname' text='Last Name'></ext-column>
 *    <ext-column dataIndex='hired' text='Hired Month'></ext-column>
 *    <ext-column
 *        bind='{record.department} ({record.seniority})'
 *        text='Department'
 *        width="200"
 *    >
 *    </ext-column>
 *  </ext-grid>
 * ```
 * ```javascript
 * @example({framework: 'ext-web-components', tab: 2, packages: ['ext-web-components']})
 * import '@sencha/ext-web-components/dist/ext-grid.component';
 * import '@sencha/ext-web-components/dist/ext-column.component';
 *
 * export default class PluginComponent {
 *     constructor() {
 *         this.store=Ext.create('Ext.data.Store', {
 *             fields: ['firstname', 'lastname', 'seniority', 'department', 'hired', 'active'],
 *                 data: [{
 *                     firstname:"Michael",
 *                     lastname:"Scott",
 *                     seniority:7,
 *                     department:"Management",
 *                     hired:"01/10/2004",
 *                     active: true
 *                },
 *                {
 *                     firstname:"Dwight",
 *                     lastname:"Schrute",
 *                     seniority:2,
 *                     department:"Sales",
 *                     hired:"04/01/2004",
 *                     active: true
 *                },
 *                {
 *                     firstname:"Jim",
 *                     lastname:"Halpert",
 *                     seniority:3,
 *                     department:"Sales",
 *                     hired:"02/22/2006",
 *                     active: false
 *                },
 *                {
 *                     firstname:"Kevin",
 *                     lastname:"Malone",
 *                     seniority:4,
 *                     department:"Accounting",
 *                     hired:"06/10/2007",
 *                     active: true
 *                },
 *                {
 *                     firstname:"Angela",
 *                     lastname:"Martin",
 *                     seniority:5,
 *                     department:"Accounting",
 *                     hired:"10/21/2008",
 *                     active: false
 *                }
 *            ]
 *        });
 *     }
 * 
 *     onGridReady(event) {
 *         this.gridCmp = event.detail.cmp;
 *         this.gridCmp.setStore(this.store);
 *     }
 * }
 *
 * window.plugin = new PluginComponent();
 * ```
 * ```javascript
 * @example({framework: 'ext-react', packages:['ext-react']})
 * var store = Ext.create('Ext.data.Store', {
 *     fields: ['firstname', 'lastname', 'seniority', 'department', 'hired', 'active'],
 *     data: [
 *         {
 *              firstname:"Michael",
 *              lastname:"Scott",
 *              seniority:7,
 *              department:"Management",
 *              hired:"01/10/2004",
 *              active: true
 *         },
 *         {
 *              firstname:"Dwight",
 *              lastname:"Schrute",
 *              seniority:2,
 *              department:"Sales",
 *              hired:"04/01/2004",
 *              active: true
 *         },
 *         {
 *              firstname:"Jim",
 *              lastname:"Halpert",
 *              seniority:3,
 *              department:"Sales",
 *              hired:"02/22/2006",
 *              active: false
 *         },
 *         {
 *              firstname:"Kevin",
 *              lastname:"Malone",
 *              seniority:4,
 *              department:"Accounting",
 *              hired:"06/10/2007",
 *              active: true
 *         },
 *         {
 *              firstname:"Angela",
 *              lastname:"Martin",
 *              seniority:5,
 *              department:"Accounting",
 *              hired:"10/21/2008",
 *              active: false
 *         }
 *     ]
 * });
 *
 * render() {
 *     return (
 *       <ExtGrid
 *           fullscreen
 *           itemConfig={{
 *               viewModel: true
 *           }}
 *           plugins={{
 *               gridfilters: true
 *           }}
 *           store={store}
 *           title='Filter Grid Demo'
 *           width={500}
 *       >
 *         <ExtColumn 
 *             dataIndex='firstname'
 *             text='First Name'
 *         />
 *         <ExtColumn 
 *             dataIndex='lastname'
 *             text='Last Name'
 *         />
 *         <ExtColumn 
 *             dataIndex='hired'
 *             text='Hired Month'
 *         />
 *         <ExtColumn 
 *             bind='{record.department} ({record.seniority})'
 *             text='Department'
 *             width={200}
 *         />
 *       </ExtGrid>
 *     );
 * }
 * ```
 * ```javascript
 * @example({framework: 'ext-angular', packages:['ext-angular']})
 * import { Component } from '@angular/core'
 * declare var Ext: any;
 *
 * Ext.require('Ext.grid.filters');
 * @Component({
 *     selector: 'app-root-1',
 *     styles: [`
 *             `],
 *     template: `
 *       <ExtGrid
 *           [height]="600"
 *           [title]="'Filter Grid Demo'"
 *           [itemConfig]="{viewModel: true}"
 *           [plugins]="{gridfilters: true}"
 *           [store]="store"
 *           [columns]="columns"
 *       ></ExtGrid>
 *     `
 * })
 * export class AppComponent {
 *   store = Ext.create('Ext.data.Store', {
 *       fields: ['firstname', 'lastname', 'seniority', 'department', 'hired', 'active'],
 *       data: [
 *           {
 *               firstname:"Michael",
 *               middlename:"Phineas",
 *               lastname:"Scott",
 *               seniority:7,
 *               department:"Management",
 *               hired:"01/10/2004",
 *               active: true
 *           },
 *           {
 *               firstname:"Dwight",
 *               middlename:"Thaddeus",
 *               lastname:"Schrute",
 *               seniority:2,
 *               department:"Sales",
 *               hired:"04/01/2004",
 *               active: true
 *           },
 *           {
 *               firstname:"Jim",
 *               middlename:"Ezekiel",
 *               lastname:"Halpert",
 *               seniority:3,
 *               department:"Sales",
 *               hired:"02/22/2006",
 *               active: false
 *           },
 *           {
 *               firstname:"Kevin",
 *               middlename:"Jethro",
 *               lastname:"Malone",
 *               seniority:4,
 *               department:"Accounting",
 *               hired:"06/10/2007",
 *               active: true
 *           },
 *           {
 *               firstname:"Angela",
 *               middlename:"Rebecca",
 *               lastname:"Martin",
 *               seniority:5,
 *               department:"Accounting",
 *               hired:"10/21/2008",
 *               active: false
 *           }
 *       ]
 *   });
 *
 *   columns = [
 *       {text: 'First Name', width: 120, dataIndex:'firstname'},
 *       {text: 'Middle Name',  width: 120, dataIndex:'middlename'},
 *       {text: 'Last Name',  width: 120, dataIndex:'lastname'},
 *       {text: 'Hired Month', width: 150, dataIndex:'hired'},
 *       {text: 'Department', width: 200, cell: {bind: '{record.department} ({record.seniority})'}}
 *   ]
 * }
 * ```
 *
 * # Convenience Subclasses
 *
 * There are several menu subclasses that provide default rendering for various data types
 *
 *  - {@link Ext.grid.filters.menu.Boolean}: Renders for boolean input fields
 *  - {@link Ext.grid.filters.menu.Date}: Renders for date input fields
 *  - {@link Ext.grid.filters.menu.Number}: Renders for numeric input fields
 *  - {@link Ext.grid.filters.menu.String}: Renders for string input fields
 *  - {@link Ext.grid.filters.menu.List}: Used for a range of values, but must be explicitly 
 *  configured
 *
 *  These subclasses can be configured in columns as such:
 *
 *
 *      columns: [
 *          {text: 'First Name',  dataIndex:'firstname'},
 *          {text: 'Middle Name',  dataIndex:'firstname', 'filter': 'list'},
 *          {text: 'Last Name',  dataIndex:'lastname', filter: 'string'},
 *          {text: 'seniority', dataIndex: 'seniority', filter: 'number'},
 *          {text: 'Hired Month',  dataIndex:'hired', filter: 'date'},
 *          {text: 'Active',  dataIndex:'active', filter: 'boolean'}
 *      ]
 *
 *
 *  Menu items can also be customised as shown below. 
 *  
 *  Note that most filters specify menu.items members as filter operators. The list filter is 
 *  different: it's backed by a {@link Ext.field.ComboBox combobox} on the menu.items.list property.
 *  The combobox {@link Ext.field.ComboBox#multiSelect multiSelect} config is used to determine
 *  the operator dynamically and defaults to single select which uses == for the selected
 *  value, whereas multiSelect is `true`, uses "in" with the array of selected values.
 *
 *      columns: [
 *          {
 *              text: 'First Name',
 *              dataIndex:'firstname'
 *          },
 *          {
 *              text: 'Middle Name',
 *              filter: {
 *                  type: 'list',
 *                  menu: {
 *                      items: {
 *                          list: {
 *                              placeholder: 'Choose something',
 *                              multiSelect: true
 *                          }
 *                      }
 *                  }
 *              }
 *          },
 *          {
 *              text: 'Last Name',
 *              filter: {
 *                  type: 'string',
 *                  menu: {
 *                      items: {
 *                          like: {
 *                              placeholder: 'Custom Like...'
 *                          }
 *                      }
 *                  }
 *              }
 *          },
 *          {
 *              text: 'Hired Month',
 *              filter: {
 *                  type: 'date',
 *                  menu: {
 *                      items: {
 *                          lt: {
 *                              label: 'Custom Less than',
 *                              placeholder: 'Custom Less than...',
 *                              dateFormat: 'd-m-y'
 *                          },
 *                          gt: {
 *                              label: 'Custom Greater than',
 *                              placeholder: 'Custom Greater than...',
 *                              dateFormat: 'd-m-y'
 *                          },
 *                          eq: {
 *                              label: 'Custom On',
 *                              placeholder: 'Custom On...',
 *                              dateFormat: 'd-m-y'
 *                          }
 *                      }
 *                  }
 *              }
 *          },
 *          {
 *              text: 'seniority'
 *              filter: {
 *                  type: 'number',
 *                  menu: {
 *                      items: {
 *                          lt: {
 *                              label: 'Custom Less than',
 *                              placeholder: 'Custom Less than...',
 *                          },
 *                          gt: {
 *                              label: 'Custom Greater than',
 *                              placeholder: 'Custom Greater than...',
 *                          },
 *                          eq: {
 *                              label: 'Custom Equal to',
 *                              placeholder: 'Custom Equal to...',
 *                          }
 *                      }
 *                  }
 *              }
 *          },
 *          {
 *              text: 'Active',
 *              filter: {
 *                  type: 'boolean',
 *                  menu: {
 *                      items: {
 *                          yes: {
 *                              text: 'Custom True'
 *                          },
 *                          no: {
 *                              text: 'Custom False'
 *                          }
 *                      }
 *                  }
 *              }             
 *          }
 *      ]
 *
 *  Filters can also specify "value", which is the initial value for the filter. To use this you
 *  can either specify a value appropriate for the filter type, or for filters that use <, =, 
 *  and > operators, the initial value for the operator. Here are some examples:
 * 
 *      {
 *          text: 'Active',
 *          filter: {
 *              type: 'boolean',
 *              value: true
 *          }
 *      }
 *
 *      {
 *          text: 'Seniority'
 *          filter: {
 *              type: 'number',
 *              value: 7
 *          }
 *      }
 *
 *      {
 *          text: 'Seniority'
 *          filter: {
 *              type: 'number',
 *              value: {
 *                  "<": 100,
 *                  ">": 10
 *              }
 *          }
 *      }
 *
 *      {
 *          text: 'Hired Month',
 *          filter: {
 *              type: 'date',
 *              value: {
 *                  "<": new Date()
 *              }
 *          }
 *      }
 * 
 *      {
 *          text: 'Last Name',
 *          filter: {
 *              type: 'list',
 *              value: 'Smith'
 *          }
 *      }
 *      
 *      {
 *          text: 'Last Name',
 *          filter: {
 *              type: 'list',
 *              value: ['Smith', 'Jones], // This is an [] because the combobox is multiSelect:true
 *              menu: {
 *                  list: {
 *                      multiSelect: true
 *                  }
 *              }
 *          }
 *      }
 * 
 */
Ext.define('Ext.grid.filters.Plugin', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.gridfilters',

    requires: [
        'Ext.grid.filters.menu.*',
        'Ext.grid.filters.Column', // an override that extends Column w/filter config
        'Ext.data.Query',
        'Ext.util.Filter'
    ],

    mixins: [
        'Ext.state.Stateful',
        'Ext.mixin.StoreWatcher',
        'Ext.mixin.Bufferable'
    ],

    // The query modified is buffered by avoid the duplicate
    // loads in the initial start up process.
    bufferableMethods: {
        queryModified: 100
    },

    config: {
        /**
         * @cfg {String/Object} activeFilter
         * This config holds the current filter. This config is stateful.
         * @private
         */
        activeFilter: null,

        query: {
            type: 'default',
            format: 'filters'
        }
    },

    /**
     * @property {String} [filterCls="x-grid-filters-filtered-column"]
     * The CSS applied to column headers with active filters.
     */
    filterCls: Ext.baseCSSPrefix + 'grid-filters-filtered-column',

    stateful: [
        'activeFilter'
    ],

    init: function(grid) {
        this.setOwner(grid);

        grid.on({
            beforeshowcolumnmenu: 'onBeforeShowColumnMenu',
            scope: this
        });

        this.initColumns();
    },

    destroy: function() {
        this.setOwner(null);

        this.callParent();
    },

    // activeFilter

    updateActiveFilter: function(filter) {
        var query = this.getQuery();

        if (Ext.isString(filter)) {
            query.setSource(filter);
        }
        else {
            query.setFilters(filter);
        }
    },

    // query

    applyQuery: function(config, query) {
        return Ext.Factory.query.update(query, config);
    },

    updateQuery: function(query) {
        if (query) {
            // eslint-disable-next-line vars-on-top
            var me = this,
                fn = query.compile;

            query.compile = function() {
                fn.call(query);
                me.queryModified(query);
            };
        }
    },

    // store (StoreWatcher)

    updateStore: function(store, oldStore) {
        var me = this,
            query = me.getQuery();

        me.mixins.storewatcher.updateStore.call(me, store, oldStore);

        if (oldStore && !(oldStore.destroying || oldStore.destroyed)) {
            oldStore.getFilters().remove(query);
        }

        if (store) {
            store.getFilters().add(query);
        }
    },

    //--------------------------------------------

    onSetFilter: function(menuItem) {
        this.setActiveFilter(menuItem.rec.data.query);
    },

    privates: {

        /**
         * Create all filters.
         */
        initColumns: function() {
            var grid = this.getOwner(),
                columns = grid.getColumns(),
                len = columns.length,
                i, column;

            for (i = 0; i < len; i++) {
                column = columns[i];
                this.createFilter(grid, column, column.getMenu());
            }
        },

        /**
         * Creates the Filter objects for the current configuration.
         * Reconfigure and on add handlers.
         */
        createFilter: function(grid, column, menu) {
            var me = this,
                filterMenuItem, menuConfig, filter;

            if (!menu) {
                return;
            }

            filterMenuItem = menu.getComponent('filter');

            if (!filterMenuItem) {
                // This method is provided by our Column override:
                menuConfig = column.createFilter({
                    itemId: 'filter',
                    plugin: me,
                    column: column
                });

                filterMenuItem = menuConfig && menu.add(Ext.Factory.gridFilters(menuConfig));

                if (filterMenuItem) {
                    filterMenuItem.setCheckHandler(me.onFilterItemCheckChange.bind(me));

                    filter = column.getFilter();

                    if (!Ext.isObject(filter) || filter.value === undefined) {
                        filterMenuItem.syncFilter();
                    }
                }
            }

            return filterMenuItem;
        },

        onBeforeShowColumnMenu: function(grid, column, menu) {
            var me = this,
                filterMenuItem = menu.getComponent('filter');

            // The column may have been added after the plugin
            // initialization.
            if (!filterMenuItem) {
                filterMenuItem = me.createFilter(grid, column, menu);
            }

            if (filterMenuItem) {
                filterMenuItem.syncFilter();
            }
        },

        onFilterItemCheckChange: function(item) {
            item.syncQuery();
        },

        doQueryModified: function() {
            var filters = this.cmp.getStore();

            filters = filters && filters.getFilters();

            if (filters) {
                filters.beginUpdate();
                ++filters.generation;
                filters.endUpdate();
            }
        }
    }
});
