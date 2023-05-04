/**
 * This Field is useful for containing multiple {@link Ext.field.Checkbox checkbox}.
 *
 * It plots items into wither horizontal / vertical depending on
 * {@link Ext.field.FieldGroupContainer#vertical} config properties.
 *
 *
 * ```javascript
 * @example({ framework: 'extjs' }
 *     Ext.create('Ext.form.Panel', {
 *         title: 'Checkbox Group',
 *         width: 300,
 *         height: 125,
 *         fullscreen: true,
 *         items:[{
 *             xtype: 'checkboxgroup',
 *             label: 'Checkbox Group',
 *             // Arrange checkboxes distributed vertically.
 *             // Automatically latter items flow to next column if
 *             // available height is less to display all the items in single column.
 *             vertical: true,
 *             height: 100,
 *             items: [
 *                 { label: 'Item 1', name: 'cb-item-1', value: '1' },
 *                 { label: 'Item 2', name: 'cb-item-2', value: '2', checked: true },
 *                 { label: 'Item 3', name: 'cb-item-3', value: '3' },
 *                 { label: 'Item 4', name: 'cb-common', value: '4' },
 *                 { label: 'Item 5', name: 'cb-common', value: '5' },
 *                 { label: 'Item 6', name: 'cb-common', value: '6' }
 *             ]
 *         }]
 *     }
 * );
 *
 * @since 7.0
 * ```
 * ```javascript
 * @example({framework: 'ext-react', packages:['ext-react']})
 * import React, { Component } from 'react';
 * import { ExtFormPanel, ExtCheckBoxGroup, ExtCheckBoxField } from '@sencha/ext-react';
 *
 * export default class MyExample extends Component {
 *      render() {
 *           return (
 *               <ExtFormPanel
 *                title="Checkbox Group"
 *                width="300"
 *                height="125"
 *                fullscreen={true}
 *               >
 *                   <ExtCheckBoxGroup
 *                       label="Checkbox Group"
 *                       vertical
 *                       height="100"
 *                   >
 *                       <ExtCheckBoxField
 *                           label="Item 1"
 *                           name="cb-item-1"
 *                           value="1"
 *                       >
 *                       </ExtCheckBoxField>
 *                       <ExtCheckBoxField
 *                           label="Item 2"
 *                           name="cb-item-2"
 *                           value="2"
 *                           checked="true"
 *                       >
 *                       </ExtCheckBoxField>
 *                       <ExtCheckBoxField
 *                           label="Item 3"
 *                           name="cb-item-3"
 *                           value="3"
 *                       >
 *                       </ExtCheckBoxField>
 *                       <ExtCheckBoxField
 *                           label="Item 4"
 *                           name="cb-common"
 *                           value="4"
 *                       >
 *                       </ExtCheckBoxField>
 *                       <ExtCheckBoxField
 *                           label="Item 5"
 *                           name="cb-common"
 *                           value="5"
 *                       >
 *                       </ExtCheckBoxField>
 *                       <ExtCheckBoxField
 *                           label="Item 6"
 *                           name="cb-common"
 *                           value="6"
 *                       >
 *                       </ExtCheckBoxField>
 *                   </ExtCheckBoxGroup>
 *               </ExtFormPanel>
 *           )
 *      }
 * }
 * ```
 * ```javascript
 * @example({framework: 'ext-angular', packages:['ext-angular']})
 * import { Component } from '@angular/core'
 * declare var Ext: any;
 *
 * @Component({
 *     selector: 'checkboxgroup-component',
 *     styles: [``],
 *     template: `
 *         <ExtFormPanel
 *              title="Checkbox Group"
 *              [width]="600"
 *              [height]="400"
 *              [fullscreen]="true"
 *          >
 *              <ExtCheckBoxGroup
 *                  label="Checkbox Group"
 *                  [vertical]="true"
 *                  [height]="100"
 *              >
 *                  <ExtCheckBoxField
 *                      [label]="'Item 1'"
 *                      [name]="'cb-item-1'"
 *                      value="1"
 *                  >
 *                  </ExtCheckBoxField>
 *                  <ExtCheckBoxField
 *                      [label]="'Item 2'"
 *                      [name]="'cb-item-2'"
 *                      value="2"
 *                      [checked]="true"
 *                  >
 *                  </ExtCheckBoxField>
 *                  <ExtCheckBoxField
 *                      [label]="'Item 3'"
 *                      [name]="'cb-item-3'"
 *                      value="3"
 *                  >
 *                  </ExtCheckBoxField>
 *                  <ExtCheckBoxField
 *                      [label]="'Item 4'"
 *                      [name]="'cb-common'"
 *                      value="4"
 *                  >
 *                  </ExtCheckBoxField>
 *                  <ExtCheckBoxField
 *                      [label]="'Item 5'"
 *                      [name]="'cb-common'"
 *                      value="5"
 *                  >
 *                  </ExtCheckBoxField>
 *                  <ExtCheckBoxField
 *                      [label]="'Item 6'"
 *                      [name]="'cb-common'"
 *                      value="6"
 *                  >
 *                  </ExtCheckBoxField>
 *              </ExtCheckBoxGroup>
 *          </ExtFormPanel>
 *      `
 * })
 * export class CheckBoxGroupComponent  {}
 *```
 *```html
 * @example({framework: 'ext-web-components', packages:['ext-web-components'], tab: 1 })
 * <ext-formpanel
 *      title="Checkbox Group"
 *      width="300"
 *      height="125"
 *      fullscreen="true"
 *  >
 *   <ext-checkboxgroup
 *       label="Checkbox Group"
 *       vertical="true"
 *       height="100"
 *   >
 *       <ext-checkboxfield
 *           label="Item 1"
 *           name="cb-item-1"
 *           value="1"
 *       >
 *       </ext-checkboxfield>
 *       <ext-checkboxfield
 *           label="Item 2"
 *           name="cb-item-2"
 *           value="2"
 *           checked="true"
 *       >
 *       </ext-checkboxfield>
 *       <ext-checkboxfield
 *           label="Item 3"
 *           name="cb-item-3"
 *           value="3"
 *       >
 *       </ext-checkboxfield>
 *       <ext-checkboxfield
 *           label="Item 4"
 *           name="cb-common"
 *           value="4"
 *       >
 *       </ext-checkboxfield>
 *       <ext-checkboxfield
 *           label="Item 5"
 *           name="cb-common"
 *           value="5"
 *       >
 *       </ext-checkboxfield>
 *       <ext-checkboxfield
 *           label="Item 6"
 *           name="cb-common"
 *           value="6"
 *       >
 *       </ext-checkboxfield>
 *   </ext-checkboxgroup>
 * </ext-formpanel>
 *```
 *```javascript
 * @example({framework: 'ext-web-components', packages:['ext-web-components'], tab: 2 })
 * import '@sencha/ext-web-components/dist/ext-formpanel.component';
 * import '@sencha/ext-web-components/dist/ext-checkboxgroup.component';
 * import '@sencha/ext-web-components/dist/ext-checkboxfield.component';
 * export default class CheckBoxGroupComponent {}
 *```
 */
Ext.define('Ext.field.CheckboxGroup', {
    extend: 'Ext.field.FieldGroupContainer',
    xtype: 'checkboxgroup',

    requires: [
        'Ext.field.Checkbox'
    ],

    /**
     * @property {Boolean} isCheckboxGroup
     * The value `true` to identify an object as an instance of this or derived class.
     * @readonly
     */
    isCheckboxGroup: true,

    /**
     * @property {String} defaultType
     * Default item type in radio group
     * @readonly
     */
    defaultType: 'checkbox',

    delegate: '[isCheckbox]',
    instanceCls: Ext.baseCSSPrefix + 'checkbox-group',

    /**
     * Sets the value(s) of all checkboxes in the group. The expected format is an Object
     * of name-value pairs corresponding to the names of the checkboxes in the group. Each pair
     * can have either a single or multiple values:
     *
     *   - A single Boolean or String value will be passed to the `setValue` method of the checkbox
     *     with that name.
     *   - An Array of String values will be matched against the
     *     {@link Ext.field.Checkbox#value value} of checkboxes in the group
     *     with that name; those checkboxes whose value exists in the array will be
     *     checked and others will be unchecked.
     *
     * If a checkbox's name is not in the mapping at all, it will be unchecked.
     *
     * An example:
     *
     *     var myCheckboxGroup = new Ext.field.CheckboxGroup({
     *         items: [{
     *             name: 'cb1',
     *             label: 'Single 1'
     *         }, {
     *             name: 'cb2',
     *             label: 'Single 2'
     *         }, {
     *             name: 'cb3',
     *             label: 'Single 3'
     *         }, {
     *             name: 'cbGroup',
     *             label: 'Grouped 1',
     *             value: 'value1'
     *         }, {
     *             name: 'cbGroup',
     *             label: 'Grouped 2',
     *             value: 'value2'
     *         }, {
     *             name: 'cbGroup',
     *             label: 'Grouped 3',
     *             value: 'value3'
     *         }]
     *     });
     *
     *     myCheckboxGroup.setValue({
     *         cb1: true,
     *         cb3: false,
     *         cbGroup: ['value1', 'value3']
     *     });
     *
     * The above code will cause the checkbox named 'cb1' to be checked, as well as the first
     * and third checkboxes named 'cbGroup'. The other three checkboxes will be unchecked.
     *
     * @param {Object} value The mapping of checkbox names to values.
     * @return {Ext.field.CheckboxGroup} this
     */
    setValue: function(value) {
        var me = this,
            items, ln, item, name, b, cbValue, cbName;

        // Ignore if value is equals to last updated value
        if (me.isEqual(value, me.lastValue)) {
            return me;
        }

        items = me.getGroupItems();
        ln = items.length;
        me.suspendCheckChange = 1;

        for (b = 0; b < ln; b++) {
            item = items[b];
            name = item.getName();
            cbValue = false;

            if (value) {
                cbName = value[name];

                if (Ext.isArray(cbName)) {
                    cbValue = Ext.Array.contains(cbName, item.getValue());
                }
                else {
                    cbValue = cbName;
                }
            }

            item.setChecked(cbValue);
        }

        me.suspendCheckChange = 0;
        me.onGroupChange();

        return me;
    },

    /**
     * Returns an object containing the values of all checked checkboxes within the group.
     * Each key-value pair in the object corresponds to a checkbox
     * {@link Ext.field.Checkbox#name name}. If there is only one checked checkbox
     * with a particular name, the value of that pair will be the String
     * {@link Ext.field.Checkbox#value value} of that checkbox. If there are
     * multiple checked checkboxes with that name, the value of that pair will be an Array
     * of the selected inputValues.
     *
     * The object format returned from this method can also be passed directly to the
     * {@link #setValue} method.
     */
    getValue: function() {
        var items = this.getGroupItems(),
            ln = items.length,
            values = {},
            item, name, value, bucket, b;

        for (b = 0; b < ln; b++) {
            item = items[b];
            name = item.getName();
            value = item.getValue();

            if (value && item.getChecked()) {
                if (values.hasOwnProperty(name)) {
                    bucket = values[name];

                    if (!Ext.isArray(bucket)) {
                        bucket = values[name] = [bucket];
                    }

                    bucket.push(value);
                }
                else {
                    values[name] = value;
                }
            }
        }

        return values;
    }
});
