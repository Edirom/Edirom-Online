/**
 * @fileOverview This file provides a command for changing fields
 *
 * @author: <a href="mailto:johu@mail.uni-paderborn.de">Joachim Hunker</a>
 * @version 1.0
 */ 
 
de.edirom.server.main.ChangeFieldCommand = Class.create({
    
    type: 'ChangeFieldCommand',
    
    initialize: function(object, field, newValue, title){
        
        this.object = object;
        this.field = field;
        this.newValue = newValue;
        this.title = title;
        this.oldValue = object.getField(field);
        this.undone = false;       
    },
        
/**METHODS***************************************/
    
    undo: function() {
        this.object.setField(this.field, this.oldValue);
        this.undone = true;
    },
        
    redo: function() {
        this.object.setField(this.field, this.newValue);
        this.undone = false;
        this.name = this.field + ': ' + this.oldValue;
    },
    
    getXQueryUpdate: function() {
        if(this.undone){
            if(isNaN(this.oldValue))
                return this.object.getXQueryUpdate(this.field, this.oldValue.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
            else
                return this.object.getXQueryUpdate(this.field, this.oldValue);
        }else{
            if(isNaN(this.newValue))
                return this.object.getXQueryUpdate(this.field, this.newValue.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
            else
                return this.object.getXQueryUpdate(this.field, this.newValue);
        }
    },
    
    getType: function() {        
        if(this.title == undefined)
            return this.type;        
        return this.title;
    },
    
    getOldValue: function() {
        return this.oldValue;
    },
    
    getUndone: function() {
        return this.undone;
    },
    
    setUndone: function(value) {
        this.undone = value;
    }
});
