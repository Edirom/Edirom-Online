/**
 * @fileOverview This file provides a command for removing objects
 *
 * @author: <a href="mailto:johu@mail.uni-paderborn.de">Joachim Hunker</a>
 * @version 1.0
 */ 
 
 de.edirom.server.main.RemoveObjectCommand = Class.create({
 
     type: 'RemoveObjectCommand', 
 
    initialize: function(subject, list, object) {
        
        this.subject = subject;    
        this.list = list;
        this.object = object;
        this.oldPreceding = (object.id?this.subject.getPrecedingObjectID(list, object.id):null);
        this.undone = false;
    },
 
/**UNDO AND REDO***************************************/
    
    undo: function() {
        this.subject.addObject(this.list, this.object);
        
        if(this.object.id)
            this.subject.moveObject(this.list, this.object.id, this.oldPreceding);
    },
    
    redo: function() {
        if(this.object.id)
            this.subject.removeObject(this.list, this.object.id);
        else
            this.subject.removeObject(this.list, this.object);
    },
    
    getXQueryUpdate: function() {
        if(this.object.id)
            return this.subject.getXQueryUpdateList('remove', this.list, this.object.id);
        else
            return this.subject.getXQueryUpdateList('remove', this.list, this.object);
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