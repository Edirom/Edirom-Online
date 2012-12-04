/*
 * a toolbar item for selecting an area on a facsimile in facsimile view
 */
de.edirom.server.source.FacsimileMarkToolbarItem = Class.create(de.edirom.server.main.ToolbarItem, {
    
    initialize: function($super, toolbar, action) {
        $super(toolbar);

        this.action = action;

		$(toolbar.getId()).insert({bottom: '<div class="toolbarButton" id="toolbar_toggleMarking"></div>'});
        
        Event.observe($('toolbar_toggleMarking'), 'click', action.toggleVisibility.bindAsEventListener(action));        
    }
});


/*
 * the actions for showing a sidebar for selecting areas
 */
de.edirom.server.source.FacsimileMarkAction = Class.create(de.edirom.server.main.Action, {
    
    initialize: function($super, toolbar, sidebar, sidebarContent) {
        $super();
        
        this.sidebar = sidebar;
        this.sidebarContent = sidebarContent;
        
        this.toolbarItem = new de.edirom.server.source.FacsimileMarkToolbarItem(toolbar, this);
        
        this.sidebarContent.addVisibilityChangeRequestedListener(new de.edirom.server.main.VisibilityChangeRequestedListener(function(visible) {
            if(visible)
                $('toolbar_toggleMarking').addClassName('toggled');
            else
                $('toolbar_toggleMarking').removeClassName('toggled');
        }));
        
        // when called in toggleVisibility(), the sbc is loaded when needed. when called here, it is loaded on load of facsimileView
        //this.sidebarContent.load();
    },
            
    toggleVisibility: function() {
        
        this.sidebarContent.load();
        this.sidebarContent.loadBars();
        
    	var showBarsAction = this.sidebarContent.facsimile.view.showBarsAction;
    	var func = showBarsAction.changeBarVisibility.bind(showBarsAction);
    	
    	if(this.sidebar.activeContent == this.sidebarContent) {
    	    if(!showBarsAction.keepVisible && showBarsAction.barsVisible)
    	        func();
    	    else
    	        showBarsAction.keepVisible = false;
    	    Event.observe($('toolbar_showBars'), 'click', showBarsAction.changeBarVisibility.bind(showBarsAction));    	    
    	} else {
    	    if(showBarsAction.barsVisible)
    	        showBarsAction.keepVisible = true;
    	    else
    	        func();
    	    $('toolbar_showBars').stopObserving('click');    
    	}
    	
    	this.sidebar.toggleSidebarContent(this.sidebarContent);
    }
});
