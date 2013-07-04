/**
 *  Edirom Online
 *  Copyright (C) 2011 The Edirom Project
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
 *
 *  ID: $Id: RenderingView.js 1334 2012-06-14 12:40:33Z daniel $
 */
Ext.define('de.edirom.online.view.window.RenderingView', {
    extend: 'Ext.panel.Panel',

    requires: [
        /*'de.edirom.online.model.Movements'*/
    ],

    alias : 'widget.renderingView',

    layout: 'fit',
    
    initComponent: function () {

        var me = this;

        me.html = '<iframe id="' + me.id + '_renderingCont" class="renderingViewContent" src=""></iframe>';
		
        me.callParent();
        
        
        
    },
    
    createToolbarEntries: function(movements) {
    	var me = this;
		
		me.mdivSelect = Ext.create('Ext.form.ComboBox', {
			store: movements,
			forceSelection: true,
			autoSelect: true, /*TODO: Buggy?*/
			queryMode: 'local',
			displayField: 'name',
			valueField: 'id',
			owner: me
		});

		me.window.getTopbar().addViewSpecificItem(me.mdivSelect, me.id);
		
		/*TODO: has to be set to '0' as soon as the rendering is faster… */
		me.mdivSelect.setValue(movements.getAt(1).get('id'));
		me.setActiveMovement();
		
		me.mdivSelect.on('select',me.setActiveMovement,me,me.mdivSelect.getValue());  
    },
    
    setActiveMovement: function() {
    	var me = this;
    	
    	me.activeMovement = me.mdivSelect.getValue();
		me.renderMovement(me.activeMovement);
    }, 
    
    renderMovement: function(movementId) {
    	
    	var me = this;
    	
        var me = this;
        var contEl = me.el.getById(me.id + '_renderingCont');
        contEl.set({src:'data/xql/getRendering.xql?uri=' + me.uri + '&movementId=' + movementId + '&stripStaves=' + '' + '&showStaff=' + '' + '&firstMeasure=' + '' + '&lastMeasure=' + ''});
        
        /*
        	'data/xql/getRendering.xql?uri=' + me.uri + '&movementId=' + movementId + '&stripStaves=' + '1%205' + '&firstMeasure=' + '' + '&lastMeasure=' + '' ;
        */

/*    	Ext.Ajax.request({
            url: 'data/xql/getRendering.xql',
            method: 'GET',
            params: {
                uri: me.uri,
                movementId: movementId,
                stripStaves: '1 2 3 5',
                firstMeasure: '',
                lastMeasure: ''
            },
            success: function(response){
                me.setContent(response.responseText);
            },
            scope: this
        });
        */
    },
    
    setContent: function(data) {
        var me = this;
        var contEl = me.el.getById(me.id + '_renderingCont');
        contEl.update(data);
    },
    
    getContentConfig: function() {
        var me = this;
        return {
            id: this.id
        };
    }
    
    /*
    gotoMovement: function(menuItem, event, movementId) {
    	this.fireEvent('gotoMovement', this, movementId);
    },

	setRenderingSet: function(renderingSet) {
		var me = this;
		me.renderingSet = renderingSet;
		
		me.movementSpinner.setStore(me.renderingSet);
		
		if(me.movementToShow != null) {
			me.movementSpinner.setMovement(me.renderingSet.getById(me.movementToShow));
			me.movementToShow = null;
		}else if(me.renderingSet.getCount() > 0)
			me.movementSpinner.setMovement(me.renderingSet.getAt(0));
	},
	
	setMovement: function(combo, store) {
		var me = this;
		
		var id = combo.getValue();
		var movIndex = me.renderingSet.findExact('id', id);
		me.activeMovement = me.renderingSet.getAt(movIndex);
		
		me.renderingViewer.showRendering(me.activeMovement);
	},
	
	showMovement: function(movementId) {
		var me = this;
		
		if(me.renderingSet == null) {
			me.movementToShow = movementId;
			return;
		}
		
		me.movementSpinner.setMovement(me.renderingSet.getById(movementId));
	},
	
	getActiveMovement: function() {
		return this.activeMovement;
	},

	createToolbarEntries: function() {
		var me = this;
		
		me.movementSpinner = Ext.create('de.edirom.online.view.window.rendering.MovementSpinner', {
			width: 100,
			cls: 'pageSpinner',
			owner: me
		});
		me.window.getTopbar().addViewSpecificItem(me.movementSpinner, me.id);
		
		me.gotoMenu = Ext.create('Ext.button.Button', {
			text: 'Zeige…',
			indent: false,
			menu : {
				items: [
					
				]
			}
		});
		me.window.getTopbar(),addViewSpecificItem(me.gotoMenu, me.id);
	}
    
    
    */
});
/*
Ext.define('de.edirom.online,view.window.rendering.MovementSpinner', {
	extent: 'Ext.container.Container',
	
	alias: 'widget.movementSpinner',
	
	layout: 'hbox',
	
	initComponent: function () {

        this.items = [
        ];
        this.callParent();
    },

    next: function() {

        this.store.clearFilter(false);

        var oldIndex = this.store.findExact('id', this.combo.getValue());
        if(oldIndex + 1 < this.store.getCount())
            this.setMovement(this.store.getAt(oldIndex + 1).get('id'));
    },

    prev: function() {

        this.store.clearFilter(false);

        var oldIndex = this.store.findExact('id', this.combo.getValue());
        if(oldIndex > 0)
            this.setMovement(this.store.getAt(oldIndex - 1).get('id'));
    },

    setMovement: function(id) {
        this.combo.setValue(id);
        this.owner.setMovement(this.combo, this.combo.store);
    },

    setStore: function(store) {

        this.removeAll();

        this.store = store;

        this.combo = Ext.create('Ext.form.ComboBox', {
            width: 35,
            hideTrigger: true,
            queryMode: 'local',
            store: store,
            displayField: 'name',
            valueField: 'id',
            cls: 'pageInputBox',
            autoSelect: true
        });

        this.add([
            {
                xtype: 'button',
                text : '<',
                listeners:{
                     scope: this,
                     click: this.prev
                }
            },
            this.combo,
            {
                xtype: 'button',
                text : '>',
                listeners:{
                     scope: this,
                     click: this.next
                }
            }
        ]);

        this.combo.on('select', this.owner.setMovement, this.owner);
    }
});
*/