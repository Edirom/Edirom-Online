/*
 * a toolbar item for selecting a page in facsimile view
 */
de.edirom.server.source.ZoomToolbarItem = Class.create(de.edirom.server.main.ToolbarItem, {
    initialize: function($super, toolbar, action) {
        $super(toolbar);

        this.action = action;
        
        $(toolbar.getId()).insert({bottom: '<span class="label">Zoom:</span>'});
		$(toolbar.getId()).insert({bottom: '<div class="toolbarTriangleLeft" id="toolbar_zoomSmaller"></div>'});
		$(toolbar.getId()).insert({bottom: '<input id="toolbar_zoomInput" class="toolbarInput" type="text" value="" />'});
		$(toolbar.getId()).insert({bottom: '<div class="toolbarTriangleRight" id="toolbar_zoomLarger"></div>'});
    }
});


/*
 * the actions for navigating through the pages
 */
de.edirom.server.source.ZoomAction = Class.create(de.edirom.server.main.Action, {
    
    initialize: function($super, toolbar) {
        $super();
        
        this.toolbarItem = new de.edirom.server.source.ZoomToolbarItem(toolbar, this);
    }
});
