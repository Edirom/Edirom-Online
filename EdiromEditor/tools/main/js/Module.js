/**
 * A class that provides an abstract module (to be used by Source, Text, Work, etc.)
 * @class {abstract} de.edirom.server.main.Module
 * @author <a href="mailto:roewenstrunk@edirom.de">Daniel Ršwenstrunk</a>
 */
de.edirom.server.main.Module = Class.create({

    /**
    * Initializes a new Module
    * @constructor {protected} ?
    */
    initialize: function() {
        this.toolbar = new de.edirom.server.main.Toolbar();
        
        this.views = new Array();
        
        $('viewSwitch').hide();
    },
    
    /**
    * @function {protected void} ? Adds a {@link de.edirom.server.main.View View} to the Module 
    * @param {View} view - the {@link de.edirom.server.main.View View} to add
    */
    addView: function(view) {
        this.views.push(view);
        
        if(this.views.size() == 1)
            this.setActiveView(view);
            
        if(this.views.size() > 1)
            $('viewSwitch').show();
    },
    
    /**
    * @function {protected void} ? Activates a {@link de.edirom.server.main.View View}
    * @param {View} view - the {@link de.edirom.server.main.View View} to set active
    */
    setActiveView: function(view) {
        
        this.setActiveView(view, null);
    },
    
    /**
    * @function {protected void} ? Activates a {@link de.edirom.server.main.View View}
    * If there is a function specified to trigger before switching views, it will be executed before switching views
    * @param {View} view - the {@link de.edirom.server.main.View View} to set active
    * @param {String optional} elementID - the id of an element to activate on that view
    */
    setActiveView: function(view, elementID) {
        
        if(typeof(this.funcBeforeViewSwitch) == 'function') {
            this.funcBeforeViewSwitch();
            
            this.funcBeforeViewSwitch = null;
        }
        
        this.views.each(function(_view) {
            if(_view == view)
                _view.setActive(true, elementID);
            else
                _view.setActive(false, elementID);
        });
    },
    
    /**
    * @function {public} ? Returns the key of the actual displayed content
    * @returns key of the actual displayed content
    */
    getActualContentKey: function() {
    
        var activeView;
        for(var i = 0; i < this.views.size(); i++) {
            if(this.views[i].isActive())
                activeView = this.views[i];
        }
        
        if(typeof(activeView) != 'undefined') {
            return activeView.getActiveContentKey();
        }
    
        return "";
    }
});   