/**
 * The HBox (short for horizontal box) layout makes it easy to position items horizontally in a
 * {@link Ext.Container Container}. It can size items based on a fixed width or a fraction of
 * the total width available.
 *
 * For example, an email client might have a list of messages pinned to the left, taking say one
 * third of the available width, and a message viewing panel in the rest of the screen. We can
 * achieve this with hbox layout's *flex* config:
 *
 * ```javascript
 * @example({ framework: 'extjs' })
 * Ext.create('Ext.Container', {
 *     fullscreen: true,
 *     layout: 'hbox',
 *     items: [
 *         {
 *             html: 'message list',
 *             style: 'background-color: #5E99CC;',
 *             flex: 1
 *         },
 *         {
 *             html: 'message preview',
 *             style: 'background-color: #759E60;',
 *             flex: 2
 *         }
 *     ]
 * });
 * ```
 * ```javascript
 * @example({framework: 'ext-react', packages:['ext-react']})
 * import React, { Component } from 'react';
 * import { ExtContainer, ExtPanel } from '@sencha/ext-react';
 *
 * export default class myExample extends Component {
 *     render() {
 *         return (
 *             <ExtContainer layout="hbox">
 *                 <ExtPanel title="Inner Panel 1" flex="1">
 *                     This is the inner panel content
 *                 </ExtPanel>
 *                 <ExtPanel title="Inner Panel 2" flex="1">
 *                     This is the inner panel content
 *                 </ExtPanel>
 *             </ExtContainer>
 *         )
 *     }
 * }
 * ```
 * ```javascript
 * @example({framework: 'ext-angular', packages:['ext-angular']})
 * import { Component } from '@angular/core'
 * declare var Ext: any;
 *
 * @Component({
 *     selector: 'app-root-1',
 *     styles: [``],
 *     template: `
 *         <ExtContainer layout="hbox">
 *             <ExtPanel title="Inner Panel 1" flex="1">
 *                 This is the inner panel content
 *             </ExtPanel>
 *             <ExtPanel title="Inner Panel 2" flex="1">
 *                 This is the inner panel content
 *             </ExtPanel>
 *         </ExtContainer>
 *       `
 * })
 * export class AppComponent {}
 * ```
 * ```html
 * @example({framework: 'ext-web-components', packages:['ext-web-components'], tab: 1 })
 * <ext-container layout="hbox">
 *    <ext-panel title="Inner Panel 1" flex="1">
 *        This is the inner panel content
 *    </ext-panel>
 *    <ext-panel title="Inner Panel 2" flex="1">
 *        This is the inner panel content
 *    </ext-panel>
 * </ext-container>
 * ```
 * ```javascript
 * @example({framework: 'ext-web-components', packages:['ext-web-components'], tab: 2 })
 * import '@sencha/ext-web-components/dist/ext-container.component';
 * import '@sencha/ext-web-components/dist/ext-panel.component';
 *
 * export default class HBoxComponent {}
 * ```
 *
 *
 * This will give us two boxes - one that's one third of the available width, the other being two
 * thirds of the available width.
 *
 * We can also specify fixed widths for child items, or mix fixed widths and flexes. For example,
 * here we have 3 items
 * - one on each side with flex: 1, and one in the center with a fixed width of 100px:
 *
 *     @example
 *     Ext.create('Ext.Container', {
 *         fullscreen: true,
 *         layout: 'hbox',
 *         items: [
 *             {
 *                 html: 'Left item',
 *                 style: 'background-color: #759E60;',
 *                 flex: 1
 *             },
 *             {
 *                 html: 'Center item',
 *                 width: 100
 *             },
 *             {
 *                 html: 'Right item',
 *                 style: 'background-color: #5E99CC;',
 *                 flex: 1
 *             }
 *         ]
 *     });
 */
Ext.define('Ext.layout.HBox', {
    extend: 'Ext.layout.Box',

    alias: 'layout.hbox',

    config: {
        vertical: false
    }
});
