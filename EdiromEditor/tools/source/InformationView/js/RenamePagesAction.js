/*
 * a toolbar item to show or hide bars
 */
de.edirom.server.source.RenamePagesToolbarItem = Class.create(de.edirom.server.main.ToolbarItem, {
    initialize: function($super, toolbar, action) {
        
        $super(toolbar);
        this.action = action;
        $(this.getId()).insert({bottom: '<div class="toolbarSpacer"></div>'
                                          +'<div class="toolbarSwitchButton" style="" id="toolbar_renamePages" title="Benennt alle Seiten in der angezeigten Reihenfolge neu"> </div>'});
		
        
        Event.observe($('toolbar_renamePages'), 'click', action.renamePages.bind(action));
    }
});


/*
 * the actions for hiding or showing bars
 */
de.edirom.server.source.RenamePagesAction = Class.create(de.edirom.server.main.Action, {
    
    initialize: function($super, toolbar, facsimileContent) {
        $super();
        
        this.facsimileContent = facsimileContent;
        
        //this.toolbarItem = new de.edirom.server.source.RenamePagesToolbarItem(toolbar, this);
    },
    
    renamePages: function() {
        this.facsimileContent.renamePages();
    }
});
