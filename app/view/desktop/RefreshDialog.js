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
Ext.define('EdiromOnline.view.desktop.RefreshDialog', {
	extend: 'Ext.window.Window',
	title: 'Refresh Windows',
	
	modal: true,
	
	border: false,
	
	closable: false,
	
	width: 300,
	height: 200,
	
	defaults: {
		bodyPadding: 10
	},
	
	storedViews: null,
	
	initComponent: function () {
		
		var me = this;
		
		me.items =[],
		
		me.buttons =[ {
			text: 'Ok',
			handler: function () {
				for (var i = 0; i < me.storedViews.length; i++) {
					var actView = me.storedViews[i].getActiveView();
					actView.refreshUserAnnot();
				}
				
				this.up('window').close();
			}
		}],
		
		
		me.callParent()
	},
	
	
	setViews: function (storedViews) {
		
		var me = this;
		
		me.storedViews = storedViews;
		var names = '';
		for (var i = 0; i < me.storedViews.length; i++) {
			names = names + '\r \n' + me.storedViews[i].title;
		}
		me.add({
			html: 'Folgende Views werden aktualisiert:' + '\r \n' + names
		});
	}
});