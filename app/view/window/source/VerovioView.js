/**
 *  Edirom Online
 *  Copyright (C) 2014 The Edirom Project
 *  http://www.edirom.de
 *
 *  Edirom Online is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  Edirom Online is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with Edirom Online.  If not, see <http://www.gnu.org/licenses/>.
 */
Ext.define('EdiromOnline.view.window.source.VerovioView', {
    extend: 'EdiromOnline.view.window.View',
    
    requires:[
    'EdiromOnline.view.window.image.VerovioImage'],
    
    alias: 'widget.verovioView',
    
    layout: 'border',
    
    border: 0,
    bottomBar: null,
    
    verovioImageView: null,
    
    cls: 'verovioView',
    
    initComponent: function () {
        
        var me = this;
        
        me.addEvents(
        'gotoMeasure',
        'gotoMeasureByName');
        
        me.verovioImageView = Ext.create('EdiromOnline.view.window.image.VerovioImage');
        me.viewerContainer = Ext.create('Ext.panel.Panel', {
            region: 'center',
            border: 0,
            layout: 'card',
            items:[me.verovioImageView]
        });
        
        me.items =[
        me.viewerContainer];
        
        me.callParent();
        
        me.on('afterrender', me.createMenuEntries, me, {
            single: true
        });
    },
    
    setIFrameURL: function (url) {
        var me = this;
        me.verovioImageView.setIFrameURL(url);
    },
    
    createMenuEntries: function () {
        
        var me = this;
        
        me.gotoMenu = Ext.create('Ext.button.Button', {
            text: getLangString('view.window.source.SourceView_gotoMenu'),
            indent: false,
            cls: 'menuButton',
            menu: {
                items:[ {
                    id: me.id + '_gotoMeasure',
                    text: getLangString('view.window.source.SourceView_gotoMeasure'),
                    handler: Ext.bind(me.gotoMeasureDialog, me)
                }]
            }
        });
        me.window.getTopbar().addViewSpecificItem(me.gotoMenu, me.id);
    },
    
    setMovements: function (movements) {
        var me = this;
        
        me.movements = movements;
        
        var movementItems =[];
        movements.each(function (movement) {
            movementItems.push({
                text: movement. get ('name'),
                handler: Ext.bind(me.showMovement, me, movement. get ('id'), true)
            });
        });
        
        me.gotoMenu.menu.add({
            id: me.id + '_gotoMovement',
            text: getLangString('view.window.source.SourceView_gotoMovement'),
            menu: {
                items: movementItems
            }
        });
    },
    
    showMovement: function (menuItem, event, movementId) {
        var me = this;
        me.verovioImageView.showMovement(movementId);
    },
    
    gotoMeasureDialog: function () {
        var me = this;
        
        Ext.create('EdiromOnline.view.window.source.GotoMsg', {
            movements: me.movements,
            callback: Ext.bind(function (measure, movementId) {
                this.fireEvent('gotoMeasureByName', this, measure, movementId);
            },
            me)
        }).show();
    },

    /* 
     * Call showMeasure of corresponding VerovioImageView.
     * @param {string} movementId - The XML-ID of the selected movement.
     * @param {string} measureId - The XML-ID of the selected measure.
     * @param {number} measureCount - The number of measures to be displayed [currently ignored in VerovioView].
     */
    showMeasure: function(movementId, measureId, measureCount){
        var me = this;
        me.verovioImageView.showMeasure(movementId, measureId);
    }
});