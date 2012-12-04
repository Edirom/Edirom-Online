/**
 * A Toolbar
 */
de.edirom.server.main.Toolbar = Class.create({
    initialize: function() {
        this.items = new Array();
    },
    
    addItem: function(item) {
        this.items.push(item);
    },
    
    getId: function() {
        return 'objectToolbar';
    },
    hide: function() {
        $('objectToolbar').style.display = 'none';
    }
});

/**
 * A Toolbar Item
 */
de.edirom.server.main.ToolbarItem = Class.create({
    initialize: function(toolbar) {
        this.toolbar = toolbar;
        this.active = false;
        
        this.id = 'toolbarItem_' + (new Date).getTime();
        while($(this.id) != null)
            this.id = 'toolbarItem_' + (new Date).getTime();
        
        $(toolbar.getId()).insert({bottom: '<div id="' + this.id + '"></div>'});
        
        
    },
    setActive: function(active) {
        this.active = active;
    },
    setVisible: function(visible) {
        if(visible)
            $(this.id).show();
        else
            $(this.id).hide();
    },
    getId: function() {
        return this.id;
    }
});

/**
 * A Toolbar Group
 */
de.edirom.server.main.ToolbarGroup = Class.create({
    initialize: function(toolbar) {
        this.id = 'toolbarGroup_' + (new Date).getTime();
        while($(this.id) != null)
            this.id = 'toolbarGroup_' + (new Date).getTime();
        
        $(toolbar.getId()).insert({bottom: '<div id="' + this.id + '"></div>'});
        
        this.items = new Array();
    },
    setVisible: function(visible) {
        if(visible)
            $(this.id).show();
        else
            $(this.id).hide();
    },
    getId: function() {
        return this.id;
    }
});

de.edirom.server.main.toolbar = {}

de.edirom.server.main.toolbar.Save = Class.create(de.edirom.server.main.ToolbarItem, {
    initialize: function($super, toolbar, action) {
        $super(toolbar);

        this.action = action;
        this.active = false;

        $(toolbar.getId()).insert({bottom: '<div title="Speichern" id="toolbar_save" class="saveButton inactive"> </div><span id="toolbar_save_dirty" class="" style="display:none;"/>'});
        
        Event.observe($('toolbar_save'), 'click', this.doSave.bind(this));
        
    },
    doSave : function(event) {
        if(this.active)
            this.action.doSave();
    },
    setActive: function($super, active) {
        $super();
        
        this.active = active;
        
        if(active) {
            $('toolbar_save').removeClassName('inactive');
            $('toolbar_save').addClassName('active');
            
            $('toolbar_save_dirty').addClassName('dirty');
            
        }else {
            $('toolbar_save').removeClassName('active');
            $('toolbar_save').addClassName('inactive');
            
            $('toolbar_save_dirty').removeClassName('dirty');
        }
    }
});

de.edirom.server.main.toolbar.Undo = Class.create(de.edirom.server.main.ToolbarItem, {
    initialize: function($super, toolbar, action) {
        $super(toolbar);

        this.action = action;
        this.active = false;

        $(toolbar.getId()).insert({bottom: '<div title="Zurücksetzen" id="toolbar_undo" class="undoButton inactive"> </div>'});
        
        Event.observe($('toolbar_undo'), 'click', this.doUndo.bind(this));
        
    },
    doUndo : function(event) {
        if(this.active)
            this.action.doUndo();
    },
    setActive: function($super, active) {
        $super();
        
        this.active = active;
        
        if(active) {
            $('toolbar_undo').removeClassName('inactive');
            $('toolbar_undo').addClassName('active');
        }else {
            $('toolbar_undo').removeClassName('active');
            $('toolbar_undo').addClassName('inactive');
        }
    }
});

de.edirom.server.main.toolbar.Redo = Class.create(de.edirom.server.main.ToolbarItem, {
    initialize: function($super, toolbar, action) {
        $super(toolbar);
        
        this.action = action;
        this.active = false;
        
        $(toolbar.getId()).insert({bottom: '<div title="Wiederherstellen" id="toolbar_redo" class="redoButton inactive"> </div>'});
        
        Event.observe($('toolbar_redo'), 'click', this.doRedo.bind(this));
    },    
    
    doRedo : function(event) {
        if(this.active)
            this.action.doRedo();
    },
    
    setActive: function($super, active) {
        $super();
        
        this.active = active;
        
        if(active) {
            $('toolbar_redo').removeClassName('inactive');
            $('toolbar_redo').addClassName('active');
        }else {
            $('toolbar_redo').removeClassName('active');
            $('toolbar_redo').addClassName('inactive');
        }
    }
});

de.edirom.server.main.toolbar.dropDown = Class.create(de.edirom.server.main.ToolbarItem, {
    initialize: function($super, toolbar, action, dropDown, controller) {
        $super(toolbar);
        
        this.action = action;
        this.active = false;
        
        this.dropDown = dropDown;
        
        this.controller = controller;
        
        this.commandString = '';
        
        $(toolbar.getId()).insert({bottom:

            '<div title="DropDown" id="toolbar_dropdown" class="dropDownButton inactive">\
                <div id="menu">\
                </div>\
            </div>'
        }), 
        
        Event.observe($('toolbar_dropdown'), 'mousedown', function(event) {
                if(!this.dropDown.checkVisibility())
                    this.doDropDown();
                else {
                    var clicked = event.findElement('.toolbar_dropdown_command');
                    if(clicked)
                        var temp = clicked.readAttribute('id');
                        var position = temp.split('_');
                        this.createUndo(position[1]);
                }                
        }.bindAsEventListener(this));
    },
    
    doDropDown: function(event) {
        if(this.active) {
                this.commandString = this.action.doDropDown();            
                
                $('menu').remove();
                $('toolbar_dropdown').insert('<div id="menu">' + this.commandString + '</div>');
                
                this.dropDown.menuOpen('menu');     
        }     
    },

    createUndo: function(position) {
        this.controller.createMultiUndo(position);
    },

    setActive: function($super, active) {
        $super();
        
        this.active = active;
        
        if(active) {
            $('toolbar_dropdown').removeClassName('inactive');
            $('toolbar_dropdown').addClassName('active');
        }else {
            $('toolbar_dropdown').removeClassName('active');
            $('toolbar_dropdown').addClassName('inactive');
        }
    }
});

de.edirom.server.main.toolbar.View = Class.create(de.edirom.server.main.ToolbarItem, {
    initialize: function($super, toolbar) {
        $super(toolbar);

        $(toolbar.getId()).insert({bottom: '<div id="view">Info</div>'});
        
        Event.observe($('view'), 'click', this.changeView.bind(this));
        
    },
    changeView : function(event) {
        
    }
});
