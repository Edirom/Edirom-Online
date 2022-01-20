Ext.define('EdiromOnline.view.window.image.ImageLeafletContainer', {
	extend: 'Ext.panel.Panel',	
	requires: [
        'Ext.layout.container.HBox'
    ],
    xtype: 'layout-horizontal-box',

 	layout: {
        type: 'hbox',
        pack: 'start',
        align: 'stretch'
    },
   
    defaults: {
        frame: true
    }

});