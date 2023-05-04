/**
 * The Url field creates an HTML5 url input and is usually created inside a form.
 * Because it creates an HTML url input field, most browsers will show a specialized
 * virtual keyboard for web address input. Aside from that, the url field is just a normal
 * text field. Here's an example of how to use it in a form:
 *
 * ```javascript
 * @example({ framework: 'extjs' })
 * Ext.create('Ext.form.Panel', {
 *     fullscreen: true,
 *     items: [
 *         {
 *             xtype: 'fieldset',
 *             title: 'Add Bookmark',
 *             items: [
 *                 {
 *                     xtype: 'urlfield',
 *                     label: 'Url',
 *                     name: 'url'
 *                 }
 *             ]
 *         }
 *     ]
 * });
 * ```
 * ```javascript
 * @example({framework: 'ext-react', packages:['ext-react']})
 * import React, { Component } from 'react';
 * import { ExtContainer, ExtFormPanel, ExtURLField } from '@sencha/ext-react';
 * export default class MyExample extends Component {
 *     render() {
 *         return (
 *             <ExtContainer layout="center">
 *                 <ExtFormPanel shadow>
 *                     <ExtURLField placeholder="http://www.domain.com" label="URL" width="200"/>
 *                 </ExtFormPanel>
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
 *         <ExtContainer layout="center">
 *             <ExtFormPanel shadow="true" >
 *                 <ExtURLField
 *                     placeholder="http://www.domain.com"
 *                     label="URL"
 *                     width="200"
 *                 >
 *                 </ExtURLField>
 *             </ExtFormPanel>
 *         </ExtContainer>
 *     `
 * })
 * export class AppComponent {}
 * ```
 * ```html
 * @example({framework: 'ext-web-components', packages:['ext-web-components'], tab: 1 })
 * <ext-container layout="center">
 *    <ext-formpanel shadow="true">
 *        <ext-urlfield placeholder="http://www.domain.com" label="URL" width="200"></ext-urlfield>
 *    </ext-formpanel>
 * </ext-container>
 * ```
 * ```javascript
 * @example({framework: 'ext-web-components', packages:['ext-web-components'], tab: 2 })
 * import '@sencha/ext-web-components/dist/ext-container.component';
 * import '@sencha/ext-web-components/dist/ext-formpanel.component';
 * import '@sencha/ext-web-components/dist/ext-urlfield.component';
 *
 * export default class URLFieldComponent {}
 * ```
 *
 * Or on its own, outside of a form:
 *
 * Ext.create('Ext.field.Url', {
 *     label: 'Web address',
 *     value: 'http://sencha.com'
 * });
 *
 * Because url field inherits from {@link Ext.field.Text textfield} it gains all of the
 * functionality that text fields provide, including getting and setting the value at runtime,
 * validations and various events that are fired as the user interacts with the component.
 * Check out the {@link Ext.field.Text} docs to see the additional functionality available.
 */
Ext.define('Ext.field.Url', {
    extend: 'Ext.field.Text',
    xtype: 'urlfield',
    alternateClassName: 'Ext.form.Url',

    config: {
        /**
         * @cfg autoCapitalize
         * @inheritdoc
         */
        autoCapitalize: false
    },

    /**
     * @cfg inputType
     * @inheritdoc
     */
    inputType: 'url',

    /**
     * @property classCls
     * @inheritdoc
     */
    classCls: Ext.baseCSSPrefix + 'urlfield'
});
