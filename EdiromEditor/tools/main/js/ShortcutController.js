/**
 * @fileOverview This file provides a controller for shortcuts
 *
 * @author: <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
 * @version 1.0
 */ 

de.edirom.server.main.ShortcutController = Class.create({

    initialize: function() {
        this.listeners = new de.edirom.server.main.LinkedHashMap();
        this.inactiveHashMaps = new Hash();
        
        Event.observe(document, "keydown", this.fireShortcut.bindAsEventListener(this));
    },
    
    debug: function() {
        console.log("listeners:");
        console.log(this.listeners.keys());
        console.log("inactive:");
        console.log(this.inactiveHashMaps.keys());
    },
    
    addShortcutListener: function(type, id, func) {
        if(!this.listenerExists(id)) {
            var listener = new de.edirom.server.main.ShortcutListener(type, id, func);
            if(this.listenerTypeExists(type))
                this.replaceListener(listener);
            else
                this.addOrReuseListener(listener);
        }
    },
    
    listenerTypeExists: function(type) {
        var exists = false;
        
        this.listeners.each(function(listener) {
            exists = (listener.type == type || exists);
        });
        
        return exists;
    },
    
    replaceListener: function(listener) {
        this.saveListeners(listener.type);
        this.addOrReuseListener(listener);
    },
    
    addOrReuseListener: function(listener) {
        if(this.inactiveHashMaps.keys().indexOf(listener.id) != -1) {
            var inactiveListeners = this.inactiveHashMaps.get(listener.id);
            this.inactiveHashMaps.unset(listener.id);

            inactiveListeners.each(function(l) {
                this.listeners.pushElement(l.id, l);
            }.bind(this));
        
        }else
            this.listeners.pushElement(listener.id, listener);
    },
    
    listenerExists: function(id) {
        return this.listeners.containsKey(id);
    },
    
    saveListeners: function(type) {
        var inactiveListeners = new de.edirom.server.main.LinkedHashMap();

        var l = this.listeners.getLast();
        this.listeners.popElement();
        
        inactiveListeners.pushElement(l.id, l);
        
        while(l.type != type) {
            l = this.listeners.getLast();
            this.listeners.popElement();
    
            inactiveListeners.pushElement(l.id, l);
        }
        
        if(inactiveListeners.size() > 1) {
            inactiveListeners.reverse();
            this.inactiveHashMaps.set(inactiveListeners.getFirst().id, inactiveListeners);
        }
    },
    
    removeShortcutListener: function(type, id) {
        if(this.listenerExists(id))
            this.saveListeners(type);
    },
    
    fireShortcut: function(event) {
    
        var caught = false;
    
        var l = this.listeners.getLast();
        while(l != null && !caught) {
            caught = l.callFunc(event);
            l = this.listeners.getPrevious(l.id);
        }
        
        if(caught) {
            event.preventDefault();
            return false;
        }
    }
});

de.edirom.server.main.ShortcutListener = Class.create({

    initialize: function(type, id, func) {
        this.type = type;
        this.id = id;
        this.func = func;
    },
    
    callFunc: function(event) {
        return this.func(event);
    }
});