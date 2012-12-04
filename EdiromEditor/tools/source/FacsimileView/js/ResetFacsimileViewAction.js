/*
 * a toolbar item to show or hide bars
 */
de.edirom.server.source.ResetFacsimileViewToolbarItem = Class.create(de.edirom.server.main.ToolbarItem, {
    initialize: function($super, toolbar, action) {
        $super(toolbar);

        this.action = action;

        $(toolbar.getId()).insert({bottom: '<div class="toolbarButton" id="toolbar_resetFacsimileView"></div>'});
		
        
        Event.observe($('toolbar_resetFacsimileView'), 'click', action.resetFacsimileView.bind(action));
    }
});


/*
 * the actions for hiding or showing bars
 */
de.edirom.server.source.ResetFacsimileViewAction = Class.create(de.edirom.server.main.Action, {
    
    initialize: function($super, toolbar, facsimileContent) {
        $super();
        
        this.facsimileContent = facsimileContent;
        
        this.toolbarItem = new de.edirom.server.source.ResetFacsimileViewToolbarItem(toolbar, this);
    },
    
    resetFacsimileView: function() {
        this.facsimileContent.resetFacsimileView();
    }
});
