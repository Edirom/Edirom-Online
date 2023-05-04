/**
 * The Search field creates an HTML5 search input and is usually created inside a form.
 * Because it creates an HTML search input type, the visual styling of this input is
 * slightly different to normal text input controls (the corners are rounded), though the virtual
 * keyboard displayed by the operating system is the standard keyboard control.
 *
 * As with all other form fields, the search field gains a "clear" button that appears
 * whenever there is text entered into the form, and which removes that text when tapped.
 *
 * ```javascript
 *  @example({ framework: 'extjs' })
 *     Ext.create('Ext.form.Panel', {
 *         fullscreen: true,
 *         items: [{
 *          xtype: 'fieldset',
 *          title: 'Search',
 *          items: [{
 *              xtype: 'searchfield',
 *              label: 'Query',
 *              name: 'query'
 *          }]
 *     }]
 * });
 * ```
 * ```javascript
 * @example({framework: 'ext-react', packages:['ext-react']})
 * import React, { Component } from 'react';
 * import { ExtContainer, ExtFormPanel, ExtSearchField } from '@sencha/ext-react'
 *
 * export default class SearchFieldExample extends Component {
 *     state = { };
 *     search = (field, value) => {
 *         this.setState({ query: value });
 *     }
 *
 *     render() {
 *         const { query } = this.state;
 *
 *         return (
 *                <ExtContainer layout="center">
 *                    <ExtFormPanel shadow>
 *                        <ExtSearchField
 *                            value={query}
 *                            width="300"
 *                            placeholder="Search..."
 *                            onChange={this.search}
 *                        />
 *                        { query && <div>You searched for "{query}"</div> }
 *                    </ExtFormPanel>
 *                </ExtContainer>
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
 *                 <ExtSearchField
 *                     [value]="query"
 *                     width="300"
 *                     placeholder="Search..."
 *                     (change)="search($event)"
 *                 >
 *                 </ExtSearchField>
 *                 <div>You searched for "{{query}}"</div>
 *             </ExtFormPanel>
 *          </ExtContainer>
 *     `
 * })
 * export class AppComponent {
 *     query:string = "";
 *     search = (event) => {
 *         console.log("In search : " + event.newValue);
 *         this.query = event.newValue;
 *     }
 * }
 * ```
 * ```html
 * @example({framework: 'ext-web-components', packages:['ext-web-components'], tab: 1 })
 * <ext-container layout="center">
 *    <ext-formpanel shadow="true">
 *        <ext-searchfield
 *             width="300"
 *             placeholder="Search..."
 *             onChange="searchfield.search"
 *             onready="searchfield.searchFieldReady()"
 *        >
 *        </ext-searchfield>
 *        <ext-container
 *             onready="searchfield.searchMessageReady()"
 *        >
 *        </ext-container>
 *    </ext-formpanel>
 * </ext-container>
 * ```
 * ```javascript
 * @example({framework: 'ext-web-components', packages:['ext-web-components'], tab: 2 })
 * import '@sencha/ext-web-components/dist/ext-container.component';
 * import '@sencha/ext-web-components/dist/ext-formpanel.component';
 * import '@sencha/ext-web-components/dist/ext-searchfield.component';
 *
 * export default class SearchFieldComponent {
 *
 *    search = (field, value) => {
 *       this.searchFieldView.setValue(value);
 *       this.searchMessage.setHTML(`<div>You searched for ${value} </div>`);
 *    }
 *
 *    searchFieldReady = (event) => {
 *        this.searchFieldView = event.detail.cmp;
 *    }
 *
 *    searchMessageRead = (event) => {
 *        this.searchMessage = event.detail.cmp;
 *    }
 * }
 *
 * window.searchfield = new SearchFieldComponent();
 * ```
 *
 * Or on its own, outside of a form:
 *
 *     Ext.create('Ext.field.Search', {
 *         label: 'Search:',
 *         value: 'query'
 *     });
 *
 * Because search field inherits from {@link Ext.field.Text textfield} it gains all of the
 * functionality that text fields provide, including getting and setting the value at runtime,
 * validations and various events that are fired as the user interacts with the component.
 * Check out the {@link Ext.field.Text} docs to see the additional functionality available.
 */
Ext.define('Ext.field.Search', {
    extend: 'Ext.field.Text',
    xtype: 'searchfield',
    alternateClassName: 'Ext.form.Search',

    requires: [
        'Ext.field.trigger.Search'
    ],

    inputType: 'search',

    triggers: {
        search: {
            type: 'search',
            side: 'left'
        }
    },

    classCls: Ext.baseCSSPrefix + 'searchfield'
});
