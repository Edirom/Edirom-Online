/**
 * Hidden fields allow you to easily inject additional data into a {@link Ext.form.Panel form}
 * without displaying additional fields on the screen. This is often useful for sending dynamic
 * or previously collected data back to the server in the same request as the normal form
 * submission.
 * For example, here is how we might set up a form to send back a hidden userId field:
 *
 * ```javascript
 * @example({ framework: 'extjs' })
 * var form = Ext.create('Ext.form.Panel', {
 *     fullscreen: true,
 *     items: [{
 *         xtype: 'fieldset',
 *         title: 'Enter your name',
 *         items: [{
 *                   xtype: 'hiddenfield',
 *                   name: 'userId',
 *                   value: 123
 *                }, {
 *                   xtype: 'checkboxfield',
 *                   label: 'Enable notifications',
 *                   name: 'notifications'
 *                }]
 *         }]
 *  });
 * ```
 * ```javascript
 * @example({framework: 'ext-react', packages:['ext-react']})
 * import React, { Component } from 'react';
 * import { ExtContainer, ExtFormPanel, ExtHiddenField } from '@sencha/ext-react';
 * export default class MyExample extends Component {
 *     render() {
 *         return (
 *             <ExtContainer layout="center">
 *                 <ExtFormPanel shadow>
 *                     <ExtHiddenField
 *                       value="123"
 *                       name="hide"
 *                     />
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
 * @Component({
 *  selector: 'app-root-1',
 *  styles: [``],
 *  template: `
 *      <ExtContainer layout="center">
 *          <ExtFormPanel shadow="true">
 *              <ExtHiddenField
 *                  value="123"
 *                  name="hide"
 *              >
 *              </ExtHiddenField>
 *          </ExtFormPanel>
 *      </ExtContainer>
 *  `
 * })
 * export class AppComponent {}
 * ```
 * ```html
 * @example({framework: 'ext-web-components', packages:['ext-web-components'], tab: 1 })
 * <ext-container layout="center">
 *        <ext-hiddenfield
 *             value="123"
 *             name="hide"
 *         >
 *        </ext-hiddenfield>
 * </ext-container>
 * ```
 * ```javascript
 * @example({framework: 'ext-web-components', packages:['ext-web-components'], tab: 2 })
 * import '@sencha/ext-web-components/dist/ext-container.component';
 * import '@sencha/ext-web-components/dist/ext-formpanel.component';
 * import '@sencha/ext-web-components/dist/ext-hiddenfield.component';
 *
 * export default class HiddenFieldComponent {}
 * ```
 *
 * In the form above we created two fields - a hidden field and a
 * {@link Ext.field.Checkbox check box field}. Only the check box will be visible, but both fields
 * will be submitted. Hidden fields cannot be tabbed to - they are removed from the tab index so
 * when your user taps the next/previous field buttons the hidden field is skipped over.
 *
 * It's easy to read and update the value of a hidden field within a form. Using the example
 * above, we can get a reference to the hidden field and then set it to a new value in 2 lines
 * of code:
 *
 *     var userId = form.down('hiddenfield')[0];
 *     userId.setValue(1234);
 */
Ext.define('Ext.field.Hidden', {
    extend: 'Ext.field.Input',
    alternateClassName: 'Ext.form.Hidden',
    xtype: 'hiddenfield',

    /**
     * @cfg
     * @hide
     */
    inputType: 'hidden',

    hidden: true,

    classCls: Ext.baseCSSPrefix + 'hiddenfield'
});
