/*    
 *    toolbar control for working with bars in sources/infoview
 */
de.edirom.server.source.BarCountToolbarItem = Class.create(de.edirom.server.main.ToolbarItem, {
    
    initialize: function($super, toolbar, action) {
    
        $super(toolbar);
        
        this.action = action;
        
        $(this.id).insert({bottom: '<div class="toolbarSpacer"></div>'
                                          +'<div class="toolbarPressButton" id="toolbar_countBarsUp">+1</div>'
                                          +'<div class="toolbarPressButton" id="toolbar_countBarsDown">-1</div>'});

        Event.observe($('toolbar_countBarsUp'), 'click', action.countBarsUp.bindAsEventListener(action));
        Event.observe($('toolbar_countBarsDown'), 'click', action.countBarsDown.bindAsEventListener(action));
    }
    
});


/*
 * the actions for working with bars in sources/infoview
 */
de.edirom.server.source.BarCountAction = Class.create(de.edirom.server.main.Action, {
    initialize: function($super, toolbar, barsJS) {
        $super();
        
        this.barsJS = barsJS;
    },
    
    countBarsUp: function() {
        this.barsJS.changeBarNumbers(1);    
    },
    
    countBarsDown: function() {
        this.barsJS.changeBarNumbers(-1);
    }

});