Ext.Loader.setConfig({
    paths: {'de.edirom.online': '../EdiromOnline/app'},
    disableCaching: true
});

var panel = Ext.create('de.edirom.online.view.window.image.ImageViewer', {
    width: '100%',
    height: '100%',
    renderTo: Ext.fly('objectView'),
    border: false
});

panel.showImage('edition-74338555/work-1/source-12/00000007.jpg', 1308, 948);