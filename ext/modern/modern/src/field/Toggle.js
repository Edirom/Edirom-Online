/**
 * Specialized {@link Ext.field.Slider} with a single thumb which only supports
 * two {@link #value values}.
 *
 * ## Examples
 *
 * ```javascript
 * @example({ framework: 'extjs' })
 * Ext.Viewport.add({
 *     xtype: 'togglefield',
 *     name: 'awesome',
 *     label: 'Are you awesome?',
 *     labelWidth: '40%'
 * });
 * ```
 *
 * Having a default value of 'toggled':
 *
 * ```javascript
 * @example({ framework: 'extjs' })
 * Ext.Viewport.add({
 *     xtype: 'togglefield',
 *     name: 'awesome',
 *     value: 1,
 *     label: 'Are you awesome?',
 *     labelWidth: '40%'
 * });
 * ```
 *
 * And using the {@link #value} {@link #toggle} method:
 *
 * ```javascript
 * @example({ framework: 'extjs' })
 * Ext.Viewport.add([
 *     {
 *         xtype: 'togglefield',
 *         name: 'awesome',
 *         value: 1,
 *         label: 'Are you awesome?',
 *         labelWidth: '40%'
 *     },
 *     {
 *         xtype: 'toolbar',
 *         docked: 'top',
 *         items: [
 *             {
 *                 xtype: 'button',
 *                 text: 'Toggle',
 *                 flex: 1,
 *                 handler: function() {
 *                     Ext.ComponentQuery.query('togglefield')[0].toggle();
 *                 }
 *             }
 *         ]
 *     }
 * ]);
 * ```
 * ```javascript
 * @example({framework: 'ext-react', packages:['ext-react']})
 * import React, { Component } from 'react';
 * import { ExtContainer, ExtFormPanel, ExtToggleField } from '@sencha/ext-react';
 * export default class MyExample extends Component {
 *     render() {
 *         return (
 *             <ExtContainer layout="center">
 *                 <ExtFormPanel shadow>
 *                     <ExtToggleField boxLabel="On" value={true}/>
 *                     <ExtToggleField boxLabel="Off" value={false}/>
 *                     <ExtToggleField boxLabel="Disabled" disabled />
 *                     <ExtToggleField boxLabel="Disabled (On)" disabled value={true} />
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
 *                 <ExtToggleField boxLabel="On" value="true"></ExtToggleField>
 *                 <ExtToggleField boxLabel="Off" value="false"></ExtToggleField>
 *                 <ExtToggleField boxLabel="Disabled" disabled="true" >
 *                    </ExtToggleField>
 *                 <ExtToggleField boxLabel="Disabled (On)" disabled="true"
 *                     value="true" ></ExtToggleField>
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
 *        <ext-togglefield boxLabel="On" value="true"></ext-togglefield>
 *        <ext-togglefield boxLabel="Off" value="false"></ext-togglefield>
 *        <ext-togglefield boxLabel="Disabled" disabled="true"></ext-togglefield>
 *        <ext-togglefield boxLabel="Disabled (On)" disabled="true" value="true"></ext-togglefield>
 *    </ext-formpanel>
 * </ext-container>
 * ```
 * ```javascript
 * @example({framework: 'ext-web-components', packages:['ext-web-components'], tab: 2 })
 * import '@sencha/ext-web-components/dist/ext-container.component';
 * import '@sencha/ext-web-components/dist/ext-formpanel.component';
 * import '@sencha/ext-web-components/dist/ext-togglefield.component';
 *
 * export default class ToggleFieldComponent {}
 * ```
 *
 */
Ext.define('Ext.field.Toggle', {
    extend: 'Ext.field.SingleSlider',
    xtype: 'togglefield',
    alternateClassName: 'Ext.form.Toggle',
    requires: ['Ext.slider.Toggle'],

    /**
     * @cfg twoWayBindable
     * @inheritdoc
     */
    twoWayBindable: {
        value: 1
    },

    /**
     * @cfg publishes
     * @inheritdoc
     */
    publishes: {
        value: 1
    },

    config: {
        /**
         * @cfg slider
         * @inheritdoc
         */
        slider: {
            xtype: 'toggleslider'
        },

        /**
         * @cfg {String} activeLabel
         * The label to add to the toggle field when it is toggled on. Only available in
         * the Blackberry theme.
         * @accessor
         */
        activeLabel: null,

        /**
         * @cfg {String} inactiveLabel
         * The label to add to the toggle field when it is toggled off. Only available in
         * the Blackberry theme.
         * @accessor
         */
        inactiveLabel: null,

        /**
         * @cfg value
         * @inheritdoc Ext.slider.Slider#cfg-value
         * @accessor
         */
        value: false
    },

    /**
     * @cfg bodyAlign
     * @inheritdoc
     */
    bodyAlign: 'start',

    /**
     * @property classCls
     * @inheritdoc
     */
    classCls: Ext.baseCSSPrefix + 'togglefield',

    /**
     * @event change
     * Fires when an option selection has changed.
     *
     *     Ext.Viewport.add({
     *         xtype: 'togglefield',
     *         label: 'Event Example',
     *         listeners: {
     *             change: function(field, newValue, oldValue) {
     *                 console.log('Value of this toggle has changed:', (newValue) ? 'ON' : 'OFF');
     *             }
     *         }
     *     });
     *
     * @param {Ext.field.Toggle} this
     * @param {Number} newValue the new value of this thumb
     * @param {Number} oldValue the old value of this thumb
     */

    /**
    * @event dragstart
    * @hide
    */

    /**
    * @event drag
    * @hide
    */

    /**
    * @event dragend
    * @hide
    */

    /**
     * @private
     */
    updateActiveLabel: function(newActiveLabel, oldActiveLabel) {
        this.getSlider().element.dom.setAttribute('data-activelabel', newActiveLabel);
    },
    /**
     * @private
     */
    updateInactiveLabel: function(newInactiveLabel, oldInactiveLabel) {
        this.getSlider().element.dom.setAttribute('data-inactivelabel', newInactiveLabel);
    },

    applyValue: function(value, oldValue) {
        value = this.callParent([value, oldValue]);

        if (typeof value !== 'boolean') {
            value = value !== 0;
        }

        return value;
    },

    updateValue: function(value, oldValue) {
        var me = this,
            active = me.getActiveLabel(),
            inactive = me.getInactiveLabel();

        if (active || inactive) {
            me.setLabel(value ? active : inactive);
        }

        me.callParent([value, oldValue]);
    },

    setSliderValue: function(value) {
        this.getSlider().setValue(value ? 1 : 0);

        return !!value;

    },

    /**
     * Toggles the value of this toggle field.
     * @return {Object} this
     */
    toggle: function() {
        // We call setValue directly so the change event can be fired
        this.setValue(!this.getValue());

        return this;
    },

    /**
     * Returns the toggled state of the togglefield.
     * @return {Boolean} True if toggled on, else false
	 * @since 7.0
     */
    getRawValue: function() {
        return this.getValue();
    },

    rawToValue: Ext.emptyFn
});
