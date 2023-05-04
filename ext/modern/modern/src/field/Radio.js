/**
 * The radio field is an enhanced version of the native browser radio controls and is a good
 * way of allowing your user to choose one option out of a selection of several (for example,
 * choosing a favorite color):
 * ```javascript
 * @example({ framework: 'extjs' })
 * var form = Ext.create('Ext.form.Panel', {
 *     fullscreen: true,
 *     items: [
 *         {
 *             xtype: 'radiofield',
 *             name : 'color',
 *             value: 'red',
 *             label: 'Red',
 *             checked: true
 *         },
 *         {
 *             xtype: 'radiofield',
 *             name : 'color',
 *             value: 'green',
 *             label: 'Green'
 *         },
 *         {
 *             xtype: 'radiofield',
 *             name : 'color',
 *             value: 'blue',
 *             label: 'Blue'
 *         }
 *     ]
 * });
 * ```
 * ```javascript
 * @example({framework: 'ext-react', packages:['ext-react']})
 * import React, { Component } from 'react';
 * import { ExtContainer, ExtFormPanel, ExtRadioField, ExtFieldSet } from '@sencha/ext-react';
 * const radioProps = {
 *     name: 'radios'
 * };
 *
 * export default class MyExample extends Component {
 *     render() {
 *         return (
 *             <ExtContainer layout="center">
 *                 <ExtFormPanel shadow layout={{type: 'vbox', align: 'left'}}>
 *                     <ExtRadioField {...radioProps} boxLabel="Checked" value="checked"
 *                           checked/>
 *                     <ExtRadioField {...radioProps} boxLabel="Unchecked"
 *                          value="unchecked"/>
 *                     <ExtRadioField {...radioProps} boxLabel="Disabled"
 *                          value="disabled" disabled/>
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
 *             <ExtFormPanel shadow="true"
 *                   [layout]="{type: 'vbox', align: 'left'}">
 *                 <ExtRadioField name="radios" boxLabel="Checked" value="checked"
 *                    checked="true"></ExtRadioField>
 *                 <ExtRadioField name="radios" boxLabel="Unchecked"
 *                   value="unchecked"></ExtRadioField>
 *                 <ExtRadioField name="radios" boxLabel="Disabled"
 *                        value="disabled" disabled="true"></ExtRadioField>
 *             </ExtFormPanel>
 *         </ExtContainer>
 *    `
 * })
 * export class AppComponent {}
 * ```
 * ```html
 * @example({framework: 'ext-web-components', packages:['ext-web-components'], tab: 1 })
 * <ext-container layout="center">
 *    <ext-formpanel
 *         shadow="true"
 *         layout='{"type": "vbox", "align": "left"}'
 *    >
 *        <ext-radiofield
 *           name="radios"
 *           boxLabel="Checked"
 *           value="checked"
 *           checked="true"
 *        >
 *        </ext-radiofield>
 *        <ext-radiofield
 *            name="radios"
 *            boxLabel="Unchecked"
 *            value="unchecked"
 *        >
 *        </ext-radiofield>
 *        <ext-radiofield
 *            name="radios"
 *            boxLabel="Disabled"
 *            value="disabled"
 *            disabled="true"
 *        >
 *        </ext-radiofield>
 *    </ext-formpanel>
 * </ext-container>
 * ```
 * ```javascript
 * @example({framework: 'ext-web-components', packages:['ext-web-components'], tab: 2 })
 * import '@sencha/ext-web-components/dist/ext-container.component';
 * import '@sencha/ext-web-components/dist/ext-formpanel.component';
 * import '@sencha/ext-web-components/dist/ext-radiofield.component';
 *
 * export default class RadioFieldComponent {}
 * ```
 *
 * Above we created a simple form which allows the user to pick a color from the options red,
 * green and blue. Because we gave each of the fields above the same {@link #name}, the radio
 * field ensures that only one of them can be checked at a time. When we come to get the values
 * out of the form again or submit it to the server, only 1 value will be sent for each group of
 * radio fields with the same name:
 *
 *     form.getValues(); //looks like {color: 'red'}
 *     form.submit(); //sends a single field back to the server (in this case color: red)
 *
 */
Ext.define('Ext.field.Radio', {
    extend: 'Ext.field.Checkbox',
    xtype: [
        'radio',
        'radiofield'
    ],
    alternateClassName: 'Ext.form.Radio',

    isRadio: true,

    inputType: 'radio',

    classCls: Ext.baseCSSPrefix + 'radiofield',

    getValue: function() {
        return this._value === undefined ? null : this._value;
    },

    setValue: function(value) {
        this._value = value;

        return this;
    },

    getSubmitValue: function() {
        var value = this._value;

        if (value === undefined || value === null) {
            value = true;
        }

        return (this.getChecked()) ? value : null;
    },

    updateChecked: function(checked, oldChecked) {
        var me = this;

        me.callParent([checked, oldChecked]);

        if (me.initialized && checked) {
            me.refreshGroupValues(me);
        }
    },

    /**
     * Returns the selected value if this radio is part of a group (other radio fields with the
     * same name, in the same FormPanel),
     * @return {String}
     */
    getGroupValue: function() {
        var fields = this.getSameGroupFields(),
            ln = fields.length,
            i = 0,
            field;

        for (; i < ln; i++) {
            field = fields[i];

            if (field.getChecked()) {
                return field.getValue();
            }
        }

        return null;
    },

    /**
     * return all radio fields with same name in nameHolder
     */
    getSameGroupFields: function() {
        var me = this,
            component = me.lookupNameHolder(),
            name = me.name.replace(me.qsaLeftRe, '\\[').replace(me.qsaRightRe, '\\]');

        return component.query('radiofield[name=' + name + ']');
    },

    /**
     * Set the matched radio field's status (that has the same value as the given string)
     * to checked.
     * @param {String} value The value of the radio field to check.
     * @return {Ext.field.Radio} The field that is checked.
     */
    setGroupValue: function(value) {
        var fields = this.getSameGroupFields(),
            ln = fields.length,
            i = 0,
            field;

        for (; i < ln; i++) {
            field = fields[i];

            if (field.getValue() === value) {
                field.setChecked(true);

                return field;
            }
        }
    },

    /**
     * Loops through each of the fields this radiofield is linked to (has the same name) and
     * calls `onChange` on those fields so the appropriate event is fired.
     * @private
     */
    refreshGroupValues: function(trigger) {
        var fields = this.getSameGroupFields(),
            ln = fields.length,
            i = 0,
            field;

        for (; i < ln; i++) {
            field = fields[i];

            if (field !== trigger) {
                field.setChecked(false);
            }
        }
    }
});
