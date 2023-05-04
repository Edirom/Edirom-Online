/**
 * This is a layout for container that contain a single item that automatically expands to
 * fill the container. This class is intended to be extended or created via the layout:'fit'
 * {@link Ext.container.Container#layout} config, and should generally not need to be created
 * directly via the new keyword.
 *
 * Fit layout does not have any direct config options (other than inherited ones). To fit a
 * panel to a container using Fit layout, simply set `layout: 'fit'` on the container and
 * add a single panel to it.
 *
 * ```javascript
 * @example({ framework: 'extjs' })
 * var panel = Ext.create('Ext.Panel', {
 *     title: 'Fit Layout',
 *     width: 300,
 *     height: 150,
 *     layout:'fit',
 *     items: {
 *         title: 'Inner Panel',
 *         html: 'This is the inner panel content',
 *         bodyPadding: 20,
 *         border: false
 *     }
 * });
 *
 * Ext.Viewport.add(panel);
 * ```
 * ```javascript
 * @example({framework: 'ext-react', packages:['ext-react']})
 * import React, { Component } from 'react';
 * import { ExtContainer, ExtPanel } from '@sencha/ext-react';
 *
 * export default class myExample extends Component {
 *     render() {
 *         return (
 *             <ExtContainer width="300" height="150" layout="fit">
 *                  <ExtPanel title="Inner Panel" bodyPadding="20" border="false">
 *                      This is the inner panel content
 *                  </ExtPanel>
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
 *         <ExtContainer width="300" height="150" layout="fit">
 *             <ExtPanel
 *                title="Inner Panel" bodyPadding="20"
 *                border="false"
 *                [html]="'This is the inner panel content'"
 *             >
 *             </ExtPanel>
 *         </ExtContainer>
 *     `
 * })
 * export class AppComponent {}
 * ```
 * ```html
 * @example({framework: 'ext-web-components', packages:['ext-web-components'], tab: 1 })
 * <ext-container width="300" height="150" layout="fit">
 *    <ext-panel title="Inner Panel" bodyPadding="20" border="false">
 *         This is the inner panel content
 *    </ext-panel>
 * </ext-container>
 * ```
 * ```javascript
 * @example({framework: 'ext-web-components', packages:['ext-web-components'], tab: 2 })
 * import '@sencha/ext-web-components/dist/ext-container.component';
 * import '@sencha/ext-web-components/dist/ext-formpanel.component';
 * import '@sencha/ext-web-components/dist/ext-spinnerfield.component';
 *
 * export default class FitComponent {}
 * ```

 */
Ext.define('Ext.layout.Fit', {
    extend: 'Ext.layout.Auto',
    alias: 'layout.fit',

    isFit: true,

    cls: Ext.baseCSSPrefix + 'layout-fit',

    itemCls: Ext.baseCSSPrefix + 'layout-fit-item'
});
