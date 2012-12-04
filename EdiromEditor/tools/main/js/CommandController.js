/**
 * @fileOverview This file provides a commandcontroller
 *
 * @author: <a href="mailto:johu@mail.uni-paderborn.de">Joachim Hunker</a>
 * @version 1.0
 */

de.edirom.server.main.CommandController = Class.create({

    listeners: new Array(),
    
    initialize: function() {
        // The stack for the commands
        this.stack = new Array();
        
        //Position after saving
        this.saved = -1;
        
        //Last command given
        this.pointer = -1;
        
        // Counts the commands except Undo Commands
        this.commandCount = 0;
        
        //Flags 
        this.isThereUndo = false;
    },

    
    addListener: function(listener) {
        this.listeners.push(listener);
    },
    
    removeListener: function(listener) {
        this.listeners = this.listeners.without(listener); 
    },
    
    updateListeners: function(action, command) {
        this.listeners.each(function(listener) {
            listener(this, action, command);
        }.bind(this));
    },
    
    //Adds a new command to the command stack
    addCommand: function(object) {
        
        if( (this.pointer == -1) && (this.saved == -1) || ((this.saved == 0) && (this.pointer == -1)) ) {
            
            this.stack = new Array();
            
            this.saved = -1;
            
            this.pointer = -1;
            
            this.commandCount = 0;
            
            this.isThereUndo = false;
            
            this.stack.push(object);
        }else {
            this.stack.push(object); 
        }
        
        object.redo();
        
        //Important just to react to the non-undo commands
        if(object.getType() != 'UndoCommand') {
            this.pointer++;
            this.commandCount++;
        
            this.updateListeners('redo', object);
        }
    },
    
    //Creates an undo command which undoes the connected command
    undoCommand: function() {
    
        this.addCommand(new de.edirom.server.main.UndoCommand(this.stack, this.pointer));
        this.stack[this.pointer].setUndone(true);
        
        this.pointer--;

        this.isThereUndo = true;

        this.updateListeners('undo', this.stack[this.pointer + 1]);
    },
    
    //Redoes the last undone command and removes the connected undo command
    redoCommand: function() {
        
        var temp = this.stack.length-1;
        
        this.stack[temp].undo();
        this.stack[temp].setUndone(false);
        this.stack[temp].setCommandUndone(false);
        
        this.stack.splice(temp,1);
        
        this.pointer++;
        
        if(this.pointer == this.stack.length-1)
            this.isThereUndo = false;
        
        this.updateListeners('redo', this.stack[this.pointer]);
    },
    
    //Refreshes and cleans the stack
    refresh: function() {
        var border = this.stack.length;
        var index = 0
        
        for(var index; index < border; index++) {
            if(this.stack[index].getUndone() == true) {
                this.stack.splice(index,1);
                border--;
                index = 0;
            }
        }
    },
    
    getXQueryUpdates: function() {
        
        var updateString = '';
        
        if(this.undoOrRedo()) {
            for(var index = this.saved+1; index <= this.pointer; index++) {
                updateString += this.stack[index].getXQueryUpdate() + (index == this.pointer?"":",");
            }
        }else {
            for(var index = this.stack.length-1; index >= this.pointer; index--) {
                if(this.stack[index].getType() != 'UndoCommand')
                    updateString += this.stack[index].getXQueryUpdate() + (((index == 0) || (index == this.pointer))?"":",");
                if(index == 0)
                    break;
            }
        }
        this.saved = this.pointer;
        
        this.refresh();
        
        this.updateListeners();
        
        this.isThereUndo = false;
        
        return updateString;        
    },
    
    unsavedCommands: function() {
        if(this.pointer == this.saved)
            return false;
        return true;
    },

    checkUndo: function() {
        if(this.saved == this.pointer)
            return false;
        return true;
    },
    
    checkRedo: function() {
        if(this.isThereUndo)
            return true;            
        return false;
    },
    
    undoOrRedo: function() {
        return true;
    },
    
/**
 * The following two functions are executed to built up the Drop-Down-Menu
 *
 */
    //Creates a string for the dropdownlist and highlights the actual position in the drop down menu
    getCommandList: function() {
        var commandString = '';
        var temp = 7;

        //if( (this.pointer == this.position) || (this.commandCount <= 8) ) {   
        if( this.commandCount <= 8 || (this.pointer == this.stack.length-1) ) {
            for(var index = this.stack.length-1; index > this.saved; index--) {
                if( (this.stack[index].type != 'UndoCommand') && (temp >= 0) ) {
                    if(index == this.position) {
                        commandString +='<div id="Command_' + index + '" class="toolbar_dropdown_command active">' + this.stack[index].getType() + '</div>';
                    } else if( ((this.id == index) && (this.id != 0)) || ((this.id == 0) && (index == 0)) ) {
                        commandString +='<div id="Command_' + index + '" class="toolbar_dropdown_command active">' + this.stack[index].getType() + '</div>';
                    } else
                        commandString +='<div id="Command_' + index + '" class="toolbar_dropdown_command">' + this.stack[index].getType() + '</div>';
                    temp--;
                }
            }
        } else {
            //defining two borders, one for the end of the stack, one for the start, this maybe buggy
            var index = this.pointer;
            var upperBorder = index+4;
            var lowerBorder = index-3;

            //calculating the borders to display the right commands
            if(index < 3)
                switch(index) {
                    case 2: upperBorder = index+5; lowerBorder = index-2; break;  
                    case 1: upperBorder = index+6; lowerBorder = index-1; break;
                    case 0: upperBorder = index+7; lowerBorder = index; break;
                    case -1: upperBorder = index+8; lowerBorder = index+1; break;
                }
            
            var value = this.position - this.pointer;
            if(value < 7)
                switch(value){
                    case 6: upperBorder = index+3; lowerBorder = index-4; break;
                    case 4: upperBorder = index+2; lowerBorder = index-5; break;
                    case 2: upperBorder = index+1; lowerBorder = index-6; break;
                    case 0: upperBorder = index; lowerBorder = index-7; break;
                }

            for(upperBorder; upperBorder >= lowerBorder; upperBorder--) {
                if( (this.stack[upperBorder].type != 'UndoCommand') )
                    if(upperBorder == this.position) {
                        commandString +='<div id="Command_' + index + '" class="toolbar_dropdown_command active">' + this.stack[upperBorder].getType() + '</div>';
                    } else if( ((this.id == upperBorder) && (this.id != 0)) || ((this.id == 0) && (upperBorder == 0)) ) {
                        commandString +='<div id="Command_' + index + '" class="toolbar_dropdown_command active">' + this.stack[upperBorder].getType() + '</div>';
                    } else
                        commandString +='<div id="Command_' + index + '" class="toolbar_dropdown_command">' + this.stack[upperBorder].getType() + '</div>';          
            }
        }
        return commandString;
    },
    
    //id: the commands id/position from the dropdownlist
    //creates Undo Commands for every undone command before the command NOT including itself
    createMultiUndo: function(id) {
        this.id = id;
        
        var counter = this.pointer;               
        if(id <= counter) 
            while(counter > id) {
                this.undoCommand();
                counter--;
            }
        else 
            while(counter < id) {
                this.redoCommand();
                counter++;
            }
    },
    
    checkCommandCount: function() {
        if(this.commandCount >= 0)
            return true;          
        return false;
    },
});