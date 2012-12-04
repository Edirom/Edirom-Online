/**
 * @fileOverview This file provides an abstract class for actions
 *
 * @author: <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
 * @version 1.0
 */
 
de.edirom.server.main.Action = Class.create({
    
    initialize: function() {
        
    }
});

de.edirom.server.main.SaveAction = Class.create(de.edirom.server.main.Action, {
    
    initialize: function($super, module, toolbar, controller) {
        $super();
        
        this.module = module;
        
        this.toolbarItem = new de.edirom.server.main.toolbar.Save(toolbar, this);
        
        controller.addListener(function(controller) {
            this.toolbarItem.setActive(controller.unsavedCommands());
        }.bind(this));
    },
    
    doSave: function() {
        this.module.doSave();
    }
});


de.edirom.server.main.UndoAction = Class.create(de.edirom.server.main.Action, {
    
    initialize: function($super, module, toolbar, controller) {
        $super();
        
        this.module = module;
        
        this.toolbarItem = new de.edirom.server.main.toolbar.Undo(toolbar, this);
    
        controller.addListener(function(controller) {
            this.toolbarItem.setActive(controller.checkUndo());
        }.bind(this));
    },

    doUndo: function() {
        this.module.doUndo();        
    }  
});

de.edirom.server.main.RedoAction = Class.create(de.edirom.server.main.Action, {
    
    initialize: function($super, module, toolbar, controller) {
        $super();
        
        this.module = module;
        
        this.toolbarItem = new de.edirom.server.main.toolbar.Redo(toolbar, this);
        
        controller.addListener(function(controller) {
            this.toolbarItem.setActive(controller.checkRedo());
        }.bind(this));
    }, 
      
    doRedo: function() {
        this.module.doRedo();
    }
});

de.edirom.server.main.DropDownAction = Class.create(de.edirom.server.main.Action, {
  
    initialize: function($super, module, toolbar, controller, dropDown) {
        $super();
        
        this.module = module;
        
        this.toolbarItem = new de.edirom.server.main.toolbar.dropDown(toolbar, this, dropDown, controller);

        controller.addListener(function(controller) {
            this.toolbarItem.setActive(controller.checkCommandCount());
        }.bind(this));
    },
    
    doDropDown: function() {
        var commandList = this.module.doDropDown();
        return commandList;
    }
});