/**
 * @fileOverview This file provides a command for the undo function of the commands
 *
 * @author: <a href="mailto:johu@mail.uni-paderborn.de">Joachim Hunker</a>
 * @version 1.0
 *
 *
 */ 

de.edirom.server.main.UndoCommand = Class.create({
    
    type: 'UndoCommand',
    
    initialize: function(list, pointer) {
        this.list = list;
        this.pointer = pointer;
        this.undone = true;
    },

    //undo
    redo: function() {
        this.list[this.pointer].undo();
    },
    
    //undo the undo
    undo: function() {
        this.list[this.pointer].redo();
    },
    
    //Gets the xQueryUpdate from the reversed command
    getXQueryUpdate: function() {
        return this.list[this.pointer].getXQueryUpdate();
    },
    
    setCommandUndone: function(value) {
        this.list[this.pointer].setUndone(value);
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
