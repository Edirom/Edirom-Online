/**
 * @fileOverview This file provides a command for moving objects
 *
 * @author: <a href="mailto:johu@mail.uni-paderborn.de">Joachim Hunker</a>
 * @version 1.0
 */ 

de.edirom.server.main.MoveObjectCommand = Class.create({
 
     type: 'MoveObjectCommand',
 
    initialize: function(subject, list, objectId, movedAfter) {
        
        this.subject = subject;
        this.list = list;
        this.objectId = objectId;
        this.movedAfter = movedAfter;       
        this.oldPreceding = this.subject.getPrecedingObjectID(list, objectId);        
        this.undone = false;
    },
     
/**UNDO AND REDO***************************************/
 
    undo: function() {
        this.subject.moveObject(this.list, this.objectId, this.oldPreceding);
    },
     
    redo: function() {
        this.subject.moveObject(this.list, this.objectId, this.movedAfter);
    },
    
    getXQueryUpdate: function() {
        return this.subject.getXQueryUpdateList('move', this.list, this.objectId, this.movedAfter);
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
