/*
 * a toolbar item for selecting a page in facsimile view
 */
de.edirom.server.source.PageToolbarItem = Class.create(de.edirom.server.main.ToolbarItem, {
    initialize: function($super, toolbar, action) {
        $super(toolbar);

        this.action = action;

        $(toolbar.getId()).insert({bottom: '<span class="label">Seite:</span>'});
		$(toolbar.getId()).insert({bottom: '<div class="toolbarTriangleLeft" id="toolbar_prevPage"></div>'});
		$(toolbar.getId()).insert({bottom: '<input id="toolbar_pageInput" class="toolbarInput" type="text" value="" />'});
		$(toolbar.getId()).insert({bottom: '<div class="toolbarTriangleRight" id="toolbar_nextPage"></div>'});
    }
});


/*
 * the actions for navigating through the pages
 */
de.edirom.server.source.PageAction = Class.create(de.edirom.server.main.Action, {
    
    initialize: function($super, toolbar) {
        $super();
        
        this.toolbarItem = new de.edirom.server.source.PageToolbarItem(toolbar, this);
    }
});
