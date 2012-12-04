/**
 * @fileOverview This file provides a command for adding objects
 *
 * @author: <a href="mailto:johu@mail.uni-paderborn.de">Joachim Hunker</a>
 * @version 1.0
 */ 
 
 de.edirom.server.main.AddObjectCommand = Class.create({
    
    type: 'AddObjectCommand',
    
    initialize: function(subject, list, object) {
        
        this.subject = subject;
        this.list = list;
        this.object = object;
        this.undone = false;
    },
       
/**METHODS***************************************/
    
    undo: function() {
        if(this.object.id)
            this.subject.removeObject(this.list, this.object.id);
        else
            this.subject.removeObject(this.list, this.object);
    },
    
    redo: function() {
        this.subject.addObject(this.list, this.object);
    },
    
    getXQueryUpdate: function() {
        return this.subject.getXQueryUpdateList('add', this.list, this.object);
    },
    
    getType: function() {
        return this.type;
    },
    
    getUndone: function() {
        return this.undone;
    },
    
    setUndone: function(value) {
        this.undone = value;
    }
});
