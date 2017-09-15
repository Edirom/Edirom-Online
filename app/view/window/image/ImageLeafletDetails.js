Ext.define('EdiromOnline.view.window.image.ImageLeafletDetails', {
	extend: 'Ext.panel.Panel',	
	requires: [
        'Ext.layout.container.VBox'
    ],
    xtype: 'layout-vertical-box',

 	layout: {
        type: 'vbox',
        pack: 'start',
        align: 'stretch'
    },
   
    defaults: {
        frame: true
    }

});