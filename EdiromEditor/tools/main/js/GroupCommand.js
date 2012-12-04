/**
 * @fileOverview  Combines similar Commands to Groups
 *
 * @author: <a href="mailto:johu@mail.uni-paderborn.de">Joachim Hunker</a>
 * @version 1.0
 */ 
 
 
de.edirom.server.main.GroupCommand = Class.create({

    type: 'GroupCommand',

    initialize: function(){      
       this.list = new Array();
       this.undone = false;
    },

    addGroupCommand: function(object){
        this.list.push(object);
    },

    undo: function(){
        for(var index = this.list.length -1; index >= 0; index--){
            this.list[index].undo();
        }           
    },
    
    redo: function(){       
        for(var index = 0; index < this.list.length; index++){
            this.list[index].redo();
        }
    },
     
    getXQueryUpdate: function() {
        var xqueryupdate = '';
    
        for(var index = 0; index < this.list.length; index++) {
            xqueryupdate += this.list[index].getXQueryUpdate() + (index == this.list.length - 1?"":",");     
        }
        
        return xqueryupdate;
    },
    
    getLength: function() {
        return this.list.length;
    },
    
    getUndone: function() {
        return this.undone;
    },
    
    setUndone: function(value) {
        this.undone = value;
    },
    
    getType: function() {
        return this.type;
    }
});