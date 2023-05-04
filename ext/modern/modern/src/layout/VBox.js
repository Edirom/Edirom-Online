/**
 * The VBox (short for vertical box) layout makes it easy to position items vertically in a
 * {@link Ext.Container Container}. It can size items based on a fixed height or a fraction
 * of the total height available.
 *
 * For example, let's say we want a banner to take one third of the available height, and an
 * information panel in the rest of the screen. We can achieve this with vbox layout's *flex*
 * config:
 * ```javascript
 *  @example({ framework: 'extjs' })
 *     Ext.create('Ext.Container', {
 *         fullscreen: true,
 *         layout: 'vbox',
 *         items: [
 *             {
 *                 html: 'Awesome banner',
 *                 style: 'background-color: #759E60;',
 *                 flex: 1
 *             },
 *             {
 *                 html: 'Some wonderful information',
 *                 style: 'background-color: #5E99CC;',
 *                 flex: 2
 *             }
 *         ]
 *     });
 * ```
 * ```javascript
 * @example({framework: 'ext-react', packages:['ext-react']})
 * import React, { Component } from 'react';
 * import { ExtContainer, ExtPanel } from '@sencha/ext-react';
 *
 * export default class myExample extends Component {
 *     render() {
 *         return (
 *             <ExtContainer layout="vbox">
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
 *      styles: [``],
 *     template: `
 *         <ExtContainer layout="vbox">
 *             <ExtPanel title="Inner Panel 1" flex="1">
 *                 This is the inner panel content
 *             </ExtPanel>
 *             <ExtPanel title="Inner Panel 2" flex="1">
 *                 This is the inner panel content
 *             </ExtPanel>
 *          </ExtContainer>
 *     `
 * })
 * export class AppComponent {}
 * ```
 * ```html
 * @example({framework: 'ext-web-components', packages:['ext-web-components'], tab: 1 })
 * <ext-container layout="vbox">
 *    <ext-panel title="Inner Panel 1" flex="1">
 *         This is the inner panel content
 *    </ext-panel>
 *    <ext-panel title="Inner Panel 2" height="100">
 *         This is the inner panel content
 *    </ext-panel>
 *    <ext-panel title="Inner Panel 3" flex="1">
 *         This is the inner panel content
 *    </ext-panel>
 * </ext-container>
 * ```
 * ```javascript
 * @example({framework: 'ext-web-components', packages:['ext-web-components'], tab: 2 })
 * import '@sencha/ext-web-components/dist/ext-container.component';
 * import '@sencha/ext-web-components/dist/ext-panel.component';
 *
 * export default class myExample extends Component {}
 * ```
 *
 * This will give us two boxes - one that's one third of the available height, the other being two
 * thirds of the available height.
 *
 * We can also specify fixed heights for child items, or mix fixed heights and flexes. For example,
 * here we have 3 items
 * - one at the top and bottom with flex: 1, and one in the center with a fixed width of 100px:
 *
 *     @example
 *     Ext.create('Ext.Container', {
 *         fullscreen: true,
 *         layout: 'vbox',
 *         items: [
 *             {
 *                 html: 'Top item',
 *                 style: 'background-color: #5E99CC;',
 *                 flex: 1
 *             },
 *             {
 *                 html: 'Center item',
 *                 height: 100
 *             },
 *             {
 *                 html: 'Bottom item',
 *                 style: 'background-color: #759E60;',
 *                 flex: 1
 *             }
 *         ]
 *     });
 */
Ext.define('Ext.layout.VBox', {
    extend: 'Ext.layout.Box',

    alias: 'layout.vbox',

    config: {
        vertical: true
    }
});
