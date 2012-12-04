/*
 * a toolbar item to show or hide bars
 */
de.edirom.server.source.ShowBarsToolbarItem = Class.create(de.edirom.server.main.ToolbarItem, {
    initialize: function($super, toolbar, action) {
        $super(toolbar);

        this.action = action;

        $(toolbar.getId()).insert({bottom: '<div class="toolbarButton" id="toolbar_showBars"></div>'});
		
        
        Event.observe($('toolbar_showBars'), 'click', action.changeBarVisibility.bind(action));
    },
    
    refreshItemLabel: function(visible) {
        if(visible)
            $('toolbar_showBars').addClassName('toggled');
        else
            $('toolbar_showBars').removeClassName('toggled');
    }
});


/*
 * the actions for hiding or showing bars
 */
de.edirom.server.source.ShowBarsAction = Class.create(de.edirom.server.main.Action, {
    
    initialize: function($super, toolbar, facsimileContent) {
        $super();
        
        this.facsimileContent = facsimileContent;
        
        this.toolbarItem = new de.edirom.server.source.ShowBarsToolbarItem(toolbar, this);
        
        this.barsVisible = false;
        this.keepVisible = false;
    },
    
    changeBarVisibility: function() {
        
        if(this.keepVisible) return;
    
        this.barsVisible = !this.barsVisible;
        
        this.toolbarItem.refreshItemLabel(this.barsVisible);
        this.facsimileContent.setBarsVisibility(this.barsVisible);
    }
});
