/**
 * {@link Ext.ActionSheet ActionSheets} are used to display a list of {@link Ext.Button buttons}
 * in a popup dialog.
 *
 * The key difference between ActionSheet and {@link Ext.Sheet} is that ActionSheets are
 * docked at the bottom of the screen, and the {@link #defaultType} is set to
 * {@link Ext.Button button}.
 *
 * ## Example
 *
 * ```javascript
 * @example({ framework: 'extjs' })
 * var actionSheet = Ext.create('Ext.ActionSheet', {
 *     items: [
 *         {
 *             text: 'Delete draft',
 *             ui  : 'decline'
 *         },
 *         {
 *             text: 'Save draft'
 *         },
 *         {
 *             text: 'Cancel',
 *             ui  : 'confirm'
 *         }
 *     ]
 * });
 *
 * Ext.Viewport.add(actionSheet);
 * actionSheet.show();
 * ```
 *
 * ## Edge Menus
 * Action Sheets can be used with {@link Ext.Viewport#setMenu}. They can be linked with
 * any side of the screen (top, left, bottom or right). To use this menu you will call various
 * menu related functions on the {@link Ext.Viewport Viewport} such as
 * {@link Ext.Viewport#showMenu}, {@link Ext.Viewport#hideMenu}, {@link Ext.Viewport#toggleMenu},
 * {@link Ext.Viewport#hideOtherMenus}, or {@link Ext.Viewport#hideAllMenus}.
 *
 * ```javascript
 * @example({ framework: 'extjs' })
 * var menu = Ext.create({
 *     xtype: 'actionsheet',
 *     items: [{
 *         text: 'Settings',
 *         iconCls: 'settings'
 *     }, {
 *         text: 'New Item',
 *         iconCls: 'compose'
 *     }, {
 *         text: 'Star',
 *         iconCls: 'star'
 *     }]
 * });
 *
 * Ext.Viewport.add({
 *     xtype: 'panel',
 *     html: 'Main View Content'
 * });
 *
 * Ext.Viewport.setMenu(menu, {
 *     side: 'left',
 *     // omitting the reveal config defaults the animation to 'cover'
 *     reveal: true
 * });
 *
 * Ext.Viewport.showMenu('left');
 * ```
 *
 * ```html
 * @example({framework: 'ext-web-components', packages:['ext-web-components'], tab: 1 })
 * <ext-container layout="center">
 *     <ext-actionsheet displayed="true">
 *         <ext-button ui="decline" text="Delete Draft"></ext-button>
 *         <ext-button text="Save Draft"></ext-button>
 *         <ext-button text="Cancel"></ext-button>
 *     </ext-actionsheet>
 * </ext-container>
 * ```
 * ```javascript
 * @example({framework: 'ext-web-components', tab: 2, packages: ['ext-web-components']})
 * import '@sencha/ext-web-components/dist/ext-container.component';
 * import '@sencha/ext-web-components/dist/ext-actionsheet.component';
 * import '@sencha/ext-web-components/dist/ext-button.component';
 * 
 * export default class ActionSheetComponent {}
 * ```
 * ```javascript
 * @example({framework: 'ext-react', packages:['ext-react']})
 * import React, { Component } from 'react';
 * import { ExtContainer, ExtActionSheet, ExtButton } from '@sencha/ext-react';
 *
 * export default class MyExample extends Component {
 *    render() {
 *        return (
 *            <ExtContainer>
 *                <ExtActionSheet displayed>
 *                    <ExtButton ui="decline" text="Delete Draft"/>
 *                    <ExtButton text="Save Draft"/>
 *                    <ExtButton text="Cancel"/>
 *                </ExtActionSheet>
 *            </ExtContainer>
 *        )
 *    }
 * }
 * ```
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
 *          <ExtContainer>
 *              <ExtActionSheet [displayed]="true">
 *                  <ExtButton ui="decline" text="Delete Draft"></ExtButton>
 *                  <ExtButton text="Save Draft"></ExtButton>
 *                  <ExtButton text="Cancel"></ExtButton>
 *              </ExtActionSheet>
 *          </ExtContainer>
 *              `
 *  })
 *  export class AppComponent {
 *  
 *  }
 * ```
 */
Ext.define('Ext.ActionSheet', {
    extend: 'Ext.Sheet',
    requires: ['Ext.Button'],
    xtype: 'actionsheet',
    classCls: Ext.baseCSSPrefix + 'actionsheet',
    centered: false,
    layout: 'vbox',
    side: 'bottom',
    defaultType: 'button'
});
