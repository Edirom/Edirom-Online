/**
 * A FieldSet is a great way to visually separate elements of a form. It's normally
 * used when you have a form with fields that can be divided into groups - for example a
 * customer's billing details in one fieldset and their shipping address in another. A fieldset
 * can be used inside a form or on its own elsewhere in your app. Fieldsets can optionally have
 * a title at the top and instructions at the bottom. Here's how we might create a FieldSet
 * inside a form:
 *
 * ```javascript
 * @example({ framework: 'extjs' })
 *     Ext.create('Ext.form.Panel', {
 *         fullscreen: true,
 *         items: [
 *             {
 *                 xtype: 'fieldset',
 *                 title: 'About You',
 *                 instructions: 'Tell us all about yourself',
 *                 items: [
 *                     {
 *                         xtype: 'textfield',
 *                         name : 'firstName',
 *                         label: 'First Name'
 *                     },
 *                     {
 *                         xtype: 'textfield',
 *                         name : 'lastName',
 *                         label: 'Last Name'
 *                     }
 *                 ]
 *             }
 *         ]
 *     });
 * ```
 * ```javascript
 *  @example({framework: 'ext-react', packages:['ext-react']})
 * import React from 'react';
 * import { ExtContainer, ExtFieldSet, ExtTextField, ExtFormPanel } from '@sencha/ext-react';
 * export default function FieldSetExample() {
 *     return (
 *         <ExtContainer layout="center">
 *             <ExtFormPanel shadow>
 *                 <ExtFieldSet
 *                    title="About You"
 *                    instructions="Tell us about yourself."
 *                    width={300}
 *                 >
 *                     <ExtTextField label="First Name" labelAlign="placeholder"/>
 *                     <ExtTextField label="Last Name" labelAlign="placeholder"/>
 *                 </ExtFieldSet>
 *             </ExtFormPanel>
 *         </ExtContainer>
 *     )
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
 *             <ExtFormPanel shadow="true">
 *                 <ExtFieldSet title="About You"
 *                       instructions="Tell us about yourself." width="300">
 *                     <ExtTextField label="First Name"
 *                           labelAlign="placeholder"></ExtTextField>
 *                     <ExtTextField label="Last Name"
 *                           labelAlign="placeholder"></ExtTextField>
 *                 </ExtFieldSet>
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
 *        <ext-fieldset title="About You" instructions="Tell us about yourself." width="300">
 *            <ext-textfield label="First Name" labelAlign="placeholder"></ext-textfield>
 *            <ext-textfield label="Last Name" labelAlign="placeholder"></ext-textfield>
 *        </ext-fieldset>
 *    </ext-formpanel>
 * </ext-container>
 * ```
 * ```javascript
 * @example({framework: 'ext-web-components', packages:['ext-web-components'], tab: 2 })
 * import '@sencha/ext-web-components/dist/ext-container.component';
 * import '@sencha/ext-web-components/dist/ext-formpanel.component';
 * import '@sencha/ext-web-components/dist/ext-fieldset.component';
 * import '@sencha/ext-web-components/dist/ext-textfield.component';
 *
 * export default class FieldSetComponent {}
 *
 * Above we created a {@link Ext.form.Panel form} with a fieldset that contains two text fields.
 * In this case, all of the form fields are in the same fieldset, but for longer forms we may choose
 * to use multiple fieldsets. We also configured a {@link #title} and {@link #instructions} to give
 * the user more information on filling out the form if required.
 */
Ext.define('Ext.form.FieldSet', {
    extend: 'Ext.Container',
    xtype: 'fieldset',

    mixins: [
        'Ext.form.Borders',
        'Ext.mixin.FieldDefaults'
    ],

    requires: [
        'Ext.Title'
    ],

    config: {
        /**
         * @cfg {String} title
         * Optional fieldset title, rendered just above the grouped fields.
         *
         * ## Example
         *
         *     Ext.create('Ext.form.Fieldset', {
         *         fullscreen: true,
         *
         *         title: 'Login',
         *
         *         items: [{
         *             xtype: 'textfield',
         *             label: 'Email'
         *         }]
         *     });
         *
         * @accessor
         */
        title: null,

        /**
         * @cfg {String} instructions
         * Optional fieldset instructions, rendered just below the grouped fields.
         *
         * ## Example
         *
         *     Ext.create('Ext.form.Fieldset', {
         *         fullscreen: true,
         *
         *         instructions: 'Please enter your email address.',
         *
         *         items: [{
         *             xtype: 'textfield',
         *             label: 'Email'
         *         }]
         *     });
         *
         * @accessor
         */
        instructions: null

        /**
         * @cfg {Object} fieldDefaults
         * The properties in this object are used as default config values for field instance.
         */
    },

    autoSize: null,

    baseCls: Ext.baseCSSPrefix + 'form-fieldset',

    /**
     * @private
     */
    applyTitle: function(title) {
        if (typeof title === 'string') {
            title = { title: title };
        }

        Ext.applyIf(title, {
            docked: 'top',
            cls: this.baseCls + '-title'
        });

        return Ext.factory(title, Ext.Title, this._title);
    },

    /**
     * @private
     */
    updateTitle: function(newTitle, oldTitle) {
        if (newTitle) {
            this.add(newTitle);
        }

        if (oldTitle) {
            this.remove(oldTitle);
        }
    },

    /**
     * @private
     */
    getTitle: function() {
        var title = this._title;

        if (title && title instanceof Ext.Title) {
            return title.getTitle();
        }

        return title;
    },

    /**
     * @private
     */
    applyInstructions: function(instructions) {
        if (typeof instructions === 'string') {
            instructions = { title: instructions };
        }

        Ext.applyIf(instructions, {
            docked: 'bottom',
            cls: this.baseCls + '-instructions'
        });

        return Ext.factory(instructions, Ext.Title, this._instructions);
    },

    /**
     * @private
     */
    updateInstructions: function(newInstructions, oldInstructions) {
        if (newInstructions) {
            this.add(newInstructions);
        }

        if (oldInstructions) {
            this.remove(oldInstructions);
        }
    },

    /**
     * @private
     */
    getInstructions: function() {
        var instructions = this._instructions;

        if (instructions && instructions instanceof Ext.Title) {
            return instructions.getTitle();
        }

        return instructions;
    },

    /**
     * A convenient method to disable all fields in this FieldSet
     * @return {Ext.form.FieldSet} This FieldSet
     */
    updateDisabled: function(newDisabled) {
        this.query('field').forEach(function(field) {
            field.setDisabled(newDisabled);
        });

        return this;
    }
});
