/**
 * The Email field creates an HTML5 email input and is usually created inside a form.
 * Because it creates an HTML email input field, most browsers will show a specialized virtual
 * keyboard for email address input. Aside from that, the email field is just a normal text field.
 * Here's an example of how to use it in a form:
 *
 * ```javascript
 *    @example({ framework: 'extjs' })
 *     Ext.create('Ext.form.Panel', {
 *         fullscreen: true,
 *         items: [
 *             {
 *                 xtype: 'fieldset',
 *                 title: 'Register',
 *                 items: [
 *                     {
 *                         xtype: 'emailfield',
 *                         label: 'Email',
 *                         name: 'email'
 *                     },
 *                     {
 *                         xtype: 'passwordfield',
 *                         label: 'Password',
 *                         name: 'password'
 *                     }
 *                 ]
 *             }
 *         ]
 *     });
 *
 * Or on its own, outside of a form:
 *
 *     Ext.create('Ext.field.Email', {
 *         label: 'Email address',
 *         value: 'prefilled@email.com'
 *     });
 *
 * Because email field inherits from {@link Ext.field.Text textfield} it gains all of the
 * functionality that text fields provide, including getting and setting the value at runtime,
 * validations and various events that are fired as the user interacts with the component.
 * Check out the {@link Ext.field.Text} docs to see the additional functionality available.
 * ```
 * ```javascript
 * @example({framework: 'ext-react', packages:['ext-react']})
 * import React, { Component } from 'react';
 * import { ExtContainer, ExtFormPanel, ExtEmailField } from '@sencha/ext-react';
 *
 * export default class MyExample extends Component {
 *     render() {
 *         return (
 *             <ExtContainer layout="center">
 *                <ExtFormPanel shadow>
 *                    <ExtEmailField
 *                        width={250}
 *                        placeholder="user@domain.com"
 *                        label="Email"
 *                     />
 *                  </ExtFormPanel>
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
 *  selector: 'app-root-1',
 *  styles: [``],
 *  template: `
 *      <ExtContainer [layout]='"center"'>
 *          <ExtFormPanel [shadow]>
 *              <ExtEmailField
 *                  [width]='250'
 *                  [placeholder]='"user@domain.com"'
 *                  [label]='"Email"'
 *              >
 *              </ExtEmailField>
 *          </ExtFormPanel>
 *      </ExtContainer>
 *          `
 * })
 * export class AppComponent {}
 * ```
 * ```html
 * @example({framework: 'ext-web-components', packages:['ext-web-components'], tab: 1 })
 *  <ext-container
 *    layout="center"
 *  >
 *   <ext-formpanel
 *         shadow="true"
 *    >
 *       <ext-emailfield
 *            width="250"
 *            placeholder="user@domain.com"
 *            label="Email"
 *        >
 *       </ext-emailfield>
 *    </ext-formpanel>
 * </ext-container>
 * ```
 * ```javascript
 * @example({framework: 'ext-web-components', packages:['ext-web-components'], tab: 2 })
 * import '@sencha/ext-web-components/dist/ext-container.component';
 * import '@sencha/ext-web-components/dist/ext-formpanel.component';
 * import '@sencha/ext-web-components/dist/ext-emailfield.component';
 *
 * export default class EmailFieldComponent {}
 *```
 * @since 6.5.1
 */
Ext.define('Ext.field.Email', {
    extend: 'Ext.field.Text',
    alternateClassName: 'Ext.form.Email',
    xtype: 'emailfield',

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
    inputType: 'email',

    /**
     * @property classCls
     * @inheritdoc
     */
    classCls: Ext.baseCSSPrefix + 'emailfield'
});
