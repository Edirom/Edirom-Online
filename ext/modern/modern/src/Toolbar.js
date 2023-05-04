/**
 * {@link Ext.Toolbar}s are most commonly used as docked items as within a {@link Ext.Container}.
 * They can be docked either `top` or `bottom` using the {@link #docked} configuration.
 *
 * They allow you to insert items (normally {@link Ext.Button buttons}) and also add a
 * {@link #title}.
 *
 * The {@link #defaultType} of {@link Ext.Toolbar} is {@link Ext.Button}.
 *
 * You can alternatively use {@link Ext.TitleBar} if you want the title to automatically adjust the
 * size of its items.
 *
 * ## Examples
 *
 * ```javascript
 * @example({ framework: 'extjs' })
 *     Ext.create('Ext.Container', {
 *         fullscreen: true,
 *         layout: {
 *             type: 'vbox',
 *             pack: 'center'
 *         },
 *         items: [
 *             {
 *                 xtype : 'toolbar',
 *                 docked: 'top',
 *                 title: 'My Toolbar'
 *             },
 *             {
 *                 xtype: 'container',
 *                 defaults: {
 *                     xtype: 'button',
 *                     margin: '10 10 0 10'
 *                 },
 *                 items: [
 *                     {
 *                         text: 'Toggle docked',
 *                         handler: function() {
 *                             var toolbar = Ext.ComponentQuery.query('toolbar')[0],
 *                                 newDocked = (toolbar.getDocked() === 'top') ? 'bottom' : 'top';
 *
 *                             toolbar.setDocked(newDocked);
 *                         }
 *                     },
 *                     {
 *                         text: 'Toggle UI',
 *                         handler: function() {
 *                             var toolbar = Ext.ComponentQuery.query('toolbar')[0],
 *                                 newUi = (toolbar.getUi() === 'light') ? 'dark' : 'light';
 *
 *                             toolbar.setUi(newUi);
 *                         }
 *                     },
 *                     {
 *                         text: 'Change title',
 *                         handler: function() {
 *                             var toolbar = Ext.ComponentQuery.query('toolbar')[0],
 *                                 titles = ['My Toolbar', 'Ext.Toolbar',
 *                                          'Configurations are awesome!', 'Beautiful.'],
                                   // internally, the title configuration gets converted into a
                                   // {@link Ext.Title} component,
                                   // so you must get the title configuration of that component
 *                                 title = toolbar.getTitle().getTitle(),
 *                                 newTitle = titles[titles.indexOf(title) + 1] || titles[0];
 *
 *                             toolbar.setTitle(newTitle);
 *                         }
 *                     }
 *                 ]
 *             }
 *         ]
 *     });
 * ```
 *
 * ```html
 * @example({framework: 'ext-web-components', packages:['ext-web-components'], tab: 1 })
 * <ext-panel shadow bodyPadding=0>
 *     <ext-toolbar docked="top">
 *         <ext-button text="Default" badgeText="2">
 *         </ext-button>
 *         <ext-spacer>
 *             <ext-segmentedbutton>
 *                 <ext-button text="Option 1" pressed></ext-button>
 *                 <ext-button text="Option 2"></ext-button>
 *             </ext-segmentedbutton>
 *         </ext-spacer>
 *         <ext-button ui="action" text="Action">
 *         </ext-button>
 *     </ext-toolbar>
 *     Some Text!
 * </ext-panel>
 * ```
 * ```javascript
 * @example({framework: 'ext-web-components', tab: 2, packages: ['ext-web-components']})
 *
 * import '@sencha/ext-web-components/dist/ext-toolbar.component';
 * import '@sencha/ext-web-components/dist/ext-button.component';
 * import '@sencha/ext-web-components/dist/ext-spacer.component';
 * import '@sencha/ext-web-components/dist/ext-segmentedbutton.component';
 * import '@sencha/ext-web-components/dist/ext-panel.component';
 *  
 * export default class ToolbarComponent {}
 * ```
 * 
 * ```javascript
 * @example({framework: 'ext-react', packages:['ext-react']})
 * import React, { Component } from 'react';
 * import { ExtToolbar, ExtPanel, ExtButton, ExtSegmentedButton, ExtSpacer, ExtSearchField }
 *    from '@sencha/ext-react';
 *
 *  export default class MyExample extends Component {
 *      render() {
 *          return (
 *              <ExtPanel shadow bodyPadding={0}>
 *                  <ExtToolbar docked="top">
 *                      <ExtButton text="Default" badgeText="2"/>
 *                      <ExtSpacer/>
 *                      <ExtSegmentedButton>
 *                          <ExtButton text="Option 1" pressed/>
 *                          <ExtButton text="Option 2"/>
 *                      </ExtSegmentedButton>
 *                      <ExtSpacer/>
 *                      <ExtButton ui="action" text="Action"/>
 *                  </ExtToolbar>
 *                 Some Text!
 *              </ExtPanel>
 *          )
 *      }
 *  }
 * ```
 * 
 * ```javascript
 * @example({framework: 'ext-angular', packages:['ext-angular']})
 *  import { Component } from '@angular/core'
 *  declare var Ext: any;
 *
 *  @Component({
 *      selector: 'app-root-1',
 *      styles: [`
 *              `],
 *      template: `
 *          <ExtToolBar docked="top">
 *              <ExtButton text="Default" badgeText="2"></ExtButton>
 *              <ExtSpacer></ExtSpacer>
 *              <ExtSegmentedButton>
 *                  <ExtButton text="Option 1" pressed="true"></ExtButton>
 *                  <ExtButton text="Option 2"></ExtButton>
 *              </ExtSegmentedButton>
 *              <ExtSpacer> </ExtSpacer>
 *              <ExtButton ui="action" text="Action"></ExtButton>
 *          </ExtToolBar>
 *              `
 *  })
 *  export class AppComponent {
 *  }
 * ```
 * ## Notes
 *
 * You must use a HTML5 doctype for {@link #docked} `bottom` to work. To do this, simply add the
 * following code to the HTML file:
 *
 *     <!doctype html>
 *
 * So your index.html file should look a little like this:
 *
 *     <!doctype html>
 *     <html>
 *         <head>
 *             <title>MY application title</title>
 *             ...
 *
 */
Ext.define('Ext.Toolbar', {
    extend: 'Ext.Container',
    xtype: 'toolbar',

    requires: [
        'Ext.Button',
        'Ext.Title',
        'Ext.Spacer',
        'Ext.layout.Box'
    ],

    /**
     * @private
     */
    isToolbar: true,

    config: {
        /**
         * @cfg {String/Ext.Title} title
         * The title of the toolbar.
         * @accessor
         */
        title: null,

        /**
         * @cfg {String} defaultType
         * The default xtype to create.
         * @accessor
         */
        defaultType: 'button',

        /**
         * @cfg {String}
         * A default {@link Ext.Component#ui ui} to use for {@link Ext.Button Button} items.
         */
        defaultButtonUI: null,

        /**
         * @cfg {String} docked
         * The docked position for this {@link Ext.Toolbar}.
         * If you specify `left` or `right`, the {@link #layout} configuration will automatically
         * change to a `vbox`. It's also recommended to adjust the {@link #width} of the toolbar if
         * you do this.
         * @accessor
         */

        /**
         * @cfg {Number/String} minHeight
         * The minimum height height of the Toolbar.
         * @accessor
         */
        minHeight: null,

        /**
         * @cfg {Object/String} layout Configuration for this Container's layout. Example:
         *
         *     Ext.create('Ext.Container', {
         *         layout: {
         *             type: 'hbox',
         *             align: 'middle'
         *         },
         *         items: [
         *             {
         *                 xtype: 'panel',
         *                 flex: 1,
         *                 style: 'background-color: red;'
         *             },
         *             {
         *                 xtype: 'panel',
         *                 flex: 2,
         *                 style: 'background-color: green'
         *             }
         *         ]
         *     });
         *
         * __Note:__ If you set the {@link #docked} configuration to `left` or `right`, the default
         * layout will change from the `hbox` to a `vbox`.
         *
         * @accessor
         */
        layout: {
            type: 'box',
            align: 'center'
        }
    },

    statics: {
        shortcuts: {
            '->': true
        }
    },

    autoSize: null,

    border: false,

    classCls: Ext.baseCSSPrefix + 'toolbar',

    constructor: function(config) {
        config = config || {};

        if (config.docked === 'left' || config.docked === 'right') {
            config.layout = Ext.apply({
                type: 'box',
                align: 'stretch',
                vertical: true
            }, config.layout);
        }

        this.callParent([config]);
    },

    /**
     * @private
     */
    applyTitle: function(title) {
        if (typeof title === 'string') {
            title = {
                title: title,
                centered: true
            };
        }

        return Ext.factory(title, Ext.Title, this.getTitle());
    },

    /**
     * @private
     */
    updateTitle: function(newTitle, oldTitle) {
        if (newTitle) {
            this.add(newTitle);
        }

        if (oldTitle) {
            oldTitle.destroy();
        }
    },

    /**
     * Shows the title, if it exists.
     */
    showTitle: function() {
        var title = this.getTitle();

        if (title) {
            title.show();
        }
    },

    /**
     * Hides the title, if it exists.
     */
    hideTitle: function() {
        var title = this.getTitle();

        if (title) {
            title.hide();
        }
    },

    /**
     * Returns an {@link Ext.Title} component.
     * @member Ext.Toolbar
     * @method getTitle
     * @return {Ext.Title}
     */

    /**
     * Use this to update the {@link #title} configuration.
     * @member Ext.Toolbar
     * @method setTitle
     * @param {String/Ext.Title} title You can either pass a String, or a config/instance of
     * {@link Ext.Title}.
     */

    onItemAdd: function(item, index) {
        var defaultButtonUI = this.getDefaultButtonUI();

        if (defaultButtonUI) {
            if (item.isSegmentedButton) {
                if (item.getDefaultUI() == null) {
                    item.setDefaultUI(defaultButtonUI);
                }
            }
            else if (item.isButton && (item.getUi() == null)) {
                item.setUi(defaultButtonUI);
            }
        }

        this.callParent([item, index]);
    },

    factoryItem: function(config) {
        if (config === '->') {
            config = {
                xtype: 'component',
                flex: 1
            };
        }

        return this.callParent([config]);
    }
});
