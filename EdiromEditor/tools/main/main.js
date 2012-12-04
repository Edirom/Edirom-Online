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
});/**
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
});/**
 * @fileOverview This file provides an abstract class for contents (like Structure in Source)
 *
 * @author: <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
 * @version 1.0
 */

de.edirom.server.main.Content = Class.create({
    initialize: function(view, id) {
    	this.view = view;
        this.loaded = false;
        this.visible = false;
        
        this.id = id;
/*        this.id = 'content_' + (new Date).getTime();
        while($(this.id) != null)
            this.id = 'content_' + (new Date).getTime();
            */
        
        $(view.id).insert({bottom: '<div class="ediromDetailContent" id="' + this.id + '" />'});
        
        this.elements = new Array();
    },
    
    load: function() {
        this.loaded = true;
    },
    
    isLoaded: function() {
        return this.loaded;
    },
    
    setUnloaded: function() {
        this.loaded = false;
        $(this.id).update();
    },
    
    setVisible: function(visible) {
    
        this.visible = visible;
    
        if(visible) {
            $(this.id).show();
            this.load();
        }else
            $(this.id).hide();
    },
    
    isActive: function() {
        return this.visible;
    },
    
    getKey: function() {
        return this.id;
    }
});/**
 * @fileOverview digilibViewer
 *
 * @author: <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
 * @version 1.0
 */

de.edirom.server.main.DigilibViewer = Class.create({

    OVERLAP: 12,


    initialize: function(facsimileViewer, canvasId, width, height) {

        this.facsimileViewer = facsimileViewer;

        this.instance = Raphael(canvasId, width, height);
        this.svgDoc = $(canvasId).getElementsByTagNameNS("http://www.w3.org/2000/svg", "svg")[0];
        this.svgDoc.setAttribute("viewBox", "0 0 " + width + " " + height);

        this.images = new Array();
    },

    buildInitialStructure: function() {

        for(var k = this.facsimileViewer.getMaxKey(); k >= 0; k--) {

            this.images[k] = new Array();

            for(var col = 0; col < this.facsimileViewer.getNumCols(k); col++) {

                this.images[k][col] = new Array();

                for(var row = 0; row < this.facsimileViewer.getNumRows(k); row++) {

                    this.images[k][col][row] = this.instance.image("", col * this.facsimileViewer.TILE_SIZE * Math.pow(2.0, k), row * this.facsimileViewer.TILE_SIZE * Math.pow(2.0, k));
                }
            }
        }
    },

    loadImages: function() {

//        var sec = (new Date).getTime();

        var TILE_SIZE = this.facsimileViewer.TILE_SIZE;
        var k = this.facsimileViewer.getKey();

        var divWidth = this.facsimileViewer.getContainerWidth();
        var divHeight = this.facsimileViewer.getContainerHeight();

        var x = this.facsimileViewer.getOffX();
        var y = this.facsimileViewer.getOffY();

        var zoom = this.facsimileViewer.getZoom();

        var firstRow = 0;
        var firstCol = 0;

        if (x < 0)
            firstCol = Math.floor(Math.round((x * - 1.0) / zoom / Math.pow(2.0, k)) / TILE_SIZE);

        if (y < 0)
            firstRow = Math.floor(Math.round((y * - 1.0) / zoom / Math.pow(2.0, k)) / TILE_SIZE);

        var lastCol = Math.floor(((divWidth - x) / Math.pow(2.0, k)) / zoom / TILE_SIZE);
        var lastRow = Math.floor(((divHeight - y) / Math.pow(2.0, k)) / zoom / TILE_SIZE);

        if (firstCol < 0) firstCol = 0;
        if (firstRow < 0) firstRow = 0;

        if (lastCol > this.facsimileViewer.getNumCols(k) - 1) lastCol = this.facsimileViewer.getNumCols(k) - 1;
        if (lastRow > this.facsimileViewer.getNumRows(k) - 1) lastRow = this.facsimileViewer.getNumRows(k) - 1;

//        console.log('key: ' + k + '  #cols: ' + this.facsimileViewer.getNumCols(k) + '  #rows: ' + this.facsimileViewer.getNumRows(k));
//        console.log('firstCol: ' + firstCol + '  lastCol: ' + lastCol + '  firstRow: ' + firstRow + '  lastRow: ' + lastRow);

    	for (var col = firstCol; col <= lastCol; col++) {
    	    for (var row = firstRow; row <= lastRow; row++) {
//    	        console.log('loadImage(' + col + ',' + row + ',' + k + ')');
                this.loadImage(col, row, k);
            }
        }

//        console.log((((new Date).getTime() - sec) / 1000) + " sec. needed");
    },

    loadImage: function(col, row, k) {

        if (this.images[k][col][row].attrs.src != "about:blank") return;

        var TILE_SIZE = this.facsimileViewer.TILE_SIZE;

        var width = this.facsimileViewer.getFacsimileWidth(k);
        var height = this.facsimileViewer.getFacsimileHeight(k);

        var dw = TILE_SIZE;
        var dh = TILE_SIZE;

        var wx = col * (TILE_SIZE / width);
        var wy = row * (TILE_SIZE / height);

        if (col == this.facsimileViewer.getNumCols(k) - 1) {
            dw = width % TILE_SIZE;
            if (dw == 0) dw = TILE_SIZE;

            ww = dw / width;
        }else if(col == this.facsimileViewer.getNumCols(k) - 2) {
            var lastWidth = width % TILE_SIZE;
            lastWidth = (lastWidth == 0?TILE_SIZE:lastWidth);

            dw += Math.min(lastWidth, this.OVERLAP);

        }else {
            dw += this.OVERLAP;
        }


        if (row == this.facsimileViewer.getNumRows(k) - 1) {
            dh = height % TILE_SIZE;
            if (dh == 0) dh = TILE_SIZE;

            wh = dh / height;
        }else if(row == this.facsimileViewer.getNumRows(k) - 2) {
            var lastHeight = height % TILE_SIZE;
            lastHeight = (lastHeight == 0?TILE_SIZE:lastHeight);

            dh += Math.min(lastHeight, this.OVERLAP);

        }else {
            dh += this.OVERLAP;
        }

        var ww = dw / width;
        var wh = dh / height;


        var path;
        if (this.key != 0)
            path = '/digilib/Scaler/' + this.facsimileViewer.getFacsimilePath() + '?dw=' + dw + '&amp;dh=' + dh + '&amp;wx=' + wx + '&amp;wy=' + wy + '&amp;ww=' + ww + '&amp;wh=' + wh + '&amp;mo=fit&amp;key=' + k;
        else
            path = '/digilib/Scaler/' + this.facsimileViewer.getFacsimilePath() + '?dw=' + dw + '&amp;dh=' + dh + '&amp;wx=' + wx + '&amp;wy=' + wy + '&amp;mo=clip&amp;key=' + k;

        this.images[k][col][row].attr({"src": path, "width": Math.round(dw * Math.pow(2.0, k)), "height": Math.round(dh * Math.pow(2.0, k))});
    },

    setSize: function(width, height) {

        this.svgDoc.setAttribute("width", width);
        this.svgDoc.setAttribute("height", height);
    },

    setPosition: function(x, y) {

        this.svgDoc.setAttribute("style", "top:" +  y + "px; left:" +  x + "px; position: absolute;");
    }

});/**
 * @fileOverview This file provides the functionality for the dropdown menu
 *
 * @author: <a href="mailto:johu@mail.uni-paderborn.de">Joachim Hunker</a>
 * @version 1.0
 */ 

de.edirom.server.main.DropDown = Class.create ({

    initialize : function() {   
        this.timeout = 1500;
        this.closeTimer	= null;
        this.item = '';
        
        document.observe('click', this.menuClose.bindAsEventListener(this));
    },
    
    //opens the hidden menu
    menuOpen: function(id) {        
        this.menuCancelCloseTime();

        var item = document.getElementById(id);
        
        if(item)
            item.style.visibility = 'hidden';
            
        item.style.visibility = 'visible';   
    },

    //closes the actual shown menu
    menuClose: function() {      
        var item = document.getElementById('menu');
        if(item)
            item.style.visibility = 'hidden';
    },
    
    //fadeout
    menuCloseTime: function(id) {   
        this.closeTimer = window.setTimeout(this.menuClose.bind(this), this.timeout);
    },
    
    //stop menufadeout
    menuCancelCloseTime: function() {       
        if(this.closeTimer) {
            window.clearTimeout(this.closeTimer);
            this.closeTimer = null;
        }
    }, 
    
    checkVisibility: function() {
        var item = document.getElementById('menu');
        if(item.style.visibility == 'visible')
            return true;
        return false;
    }
});/**
 * @fileOverview facsimileViewer
 *
 * @author: <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
 * @version 1.0
 */


de.edirom.server.main.FacsimileViewer = Class.create({

    TILE_SIZE: 512,
    
    ZOOM_MIN: 0.05,
    ZOOM_MAX: 4.0,


    zoom: -1,

    offX: -1,
    offY: -1,
    mouseOffX: 0,
    mouseOffY: 0,
    posX: 0,
    posY: 0,

    
    key: 1,

    maxKey: -1,

    initialize: function(container, facsimiles) {
        this.id = 'facsimileView_' + (new Date).getTime();
        this.facsimiles = facsimiles;

        this.container = container;

        container.insert({bottom: '<div id="canvas_' + this.id + '" style="position:absolute; top:0px; left:0px; bottom:0px; right:0px; -moz-user-select:none;"> </div>'});
        container.insert({bottom: '<div id="eventHandler_' + this.id + '" style="position:absolute; top:0px; left:0px; bottom:0px; right:0px; -moz-user-select:none;"> </div>'});

        this.zoomListeners = new Array();
        this.offsetListeners = new Array();

        this.mouseDownListeners = new Array();

        this.addListeners();
    },

    addListeners: function() {

        this.handleMouseDownFunc = this.handleMouseDown.bindAsEventListener(this);
        Event.observe($("eventHandler_" + this.id), 'mousedown', this.handleMouseDownFunc);

        this.handleImageZoomFunc = this.handleImageZoom.bindAsEventListener(this);
        Event.observe($("eventHandler_" + this.id), "mousewheel", this.handleImageZoomFunc);
        Event.observe($("eventHandler_" + this.id), "DOMMouseScroll", this.handleImageZoomFunc); //Firefox
    },

    loadFacsimile: function(facsimileId) {
        this.readFacsimile(facsimileId);

        this.startULX = 0;
        this.startULY = 0;

        this.startLRX = this.facsimileWidth[0];
        this.startLRY = this.facsimileHeight[0];

        var svgDoc = $("canvas_" + this.id).getElementsByTagNameNS("http://www.w3.org/2000/svg", "svg")[0];
        if(svgDoc) $("canvas_" + this.id).removeChild(svgDoc);

        this.digilib = new de.edirom.server.main.DigilibViewer(this, 'canvas_' + this.id, this.facsimileWidth[0], this.facsimileHeight[0]);
        this.digilib.buildInitialStructure();
        this.resetFacsimileView();
        this.digilib.loadImages();
    },

    readFacsimile: function(facsimileId) {

        this.facsimileId = facsimileId;

        var facsimile = this.facsimiles.get(facsimileId);

        this.facsimilePath = facsimile.getPath();

        this.facsimileWidth = new Array();
        this.facsimileHeight = new Array();

        this.facsimileWidth[0] = Number(facsimile.getWidth());
        this.facsimileHeight[0] = Number(facsimile.getHeight());

        for (var i = 1; i <= this.getMaxKey(); i++) {
            this.facsimileWidth[i] = Math.round(facsimile.getWidth() / Math.pow(2, i));
            this.facsimileHeight[i] = Math.round(facsimile.getHeight() / Math.pow(2, i));
        }

    },
    
    loadRect: function(ulx, uly, lrx, lry) {
        
            this.startULX = ulx;
            this.startULY = uly;
            this.startLRX = lrx;
            this.startLRY = lry;
            
            this.resetFacsimileView();
    },

    resetFacsimileView: function() {
        var divWidth = this.container.getWidth();
        var divHeight = this.container.getHeight();

        var width = this.startLRX - this.startULX;
        var height = this.startLRY - this.startULY;

        var offX;
        var offY;

        var diffWidth = 0;
        var diffHeight = 0;

        if ((divWidth / width) > (divHeight / height)) {
            this.setZoom(divHeight / height);

            offY = this.startULY * this.zoom;
            offX = this.startULX * this.zoom;

            diffWidth = Math.round((divWidth - (width * this.zoom)) / 2); //
        } else {
            this.setZoom(divWidth / width);

            offY = this.startULY * this.zoom;
            offX = this.startULX * this.zoom;

            diffHeight = Math.round((divHeight - (height * this.zoom)) / 2); //
        }

        this.setOffset(((offX * - 1) + diffWidth), ((offY * - 1) + diffHeight));
        this.digilib.loadImages();
    },

    getFacsimileId: function() {
        return this.facsimileId;
    },

    getFacsimileWidth: function(k) {
        return this.facsimileWidth[k];    
    },

    getFacsimileHeight: function(k) {
        return this.facsimileHeight[k];    
    },

    getFacsimilePath: function() {
        return this.facsimilePath;
    },

    getMaxKey: function() {

        if(this.maxKey == -1)
            this.maxKey = Math.max(this.getMaxKeyInt(Number(this.facsimileWidth[0]) / this.TILE_SIZE), this.getMaxKeyInt(Number(this.facsimileHeight[0]) / this.TILE_SIZE));

        return this.maxKey;
    },

    getMaxKeyInt: function(n) {
        if(n <= 1.0)
            return 0;
    	if(n <= 2.0)
            return 1;
    	if(n <= 4.0)
    	    return 2;
    	if(n <= 8.0)
    	    return 3;
    	if(n <= 16.0)
        	return 4;

    	return 5;
    },

    getNumCols: function(k) {
        return Math.ceil(this.facsimileWidth[k] / this.TILE_SIZE);
    },

    getNumRows: function(k) {
        return Math.ceil(this.facsimileHeight[k] / this.TILE_SIZE);
    },

    nextFacsimile: function() {
        var next = this.facsimiles.getNext(this.facsimileId);
        if(next != null)
            this.loadFacsimile(next.id);

        return next;
    },

    prevFacsimile: function() {
        var prev = this.facsimiles.getPrevious(this.facsimileId);
        if(prev != null)
            this.loadFacsimile(prev.id);

        return prev;
    },
    
    firstFacsimile: function() {
        var first = this.facsimiles.getFirst();
        if(first != null)
            this.loadFacsimile(first.id);

        return first;
    },

    showFacsimile: function(facsimileId) {
        var facsimile = this.facsimiles.get(facsimileId);
        if(facsimile != null)
            this.loadFacsimile(facsimile.id);

        return facsimile;
    },
    
    hasNextFacsimile: function() {
        var next = this.facsimiles.getNext(this.facsimileId);
        return next != null;
    },
    
    hasPrevFacsimile: function() {
        var prev = this.facsimiles.getPrevious(this.facsimileId);
        return prev != null;
    },

    handleMouseDown: function(e) {
        this.mouseOffX = this.offX;
        this.mouseOffY = this.offY;

        this.posX = e.screenX;
        this.posY = e.screenY;

        if(!e.shiftKey) {
            this.mouseMoveHandle = this.handleMouseMove.bindAsEventListener(this);
            this.mouseUpHandle = this.handleMouseUp.bindAsEventListener(this);

            Event.observe(window.document, 'mousemove', this.mouseMoveHandle);
            Event.observe(window.document, 'mouseup', this.mouseUpHandle);
        }

        this.mouseDownListeners.each(function(listener) {
            listener(e);
        });
    },

    handleMouseMove: function(e) {
        this.setOffset(this.mouseOffX - (this.posX - e.screenX), this.mouseOffY - (this.posY - e.screenY));

        this.digilib.loadImages();
    },

    handleMouseUp: function(e) {
        Event.stopObserving(window.document, 'mousemove', this.mouseMoveHandle);
        Event.stopObserving(window.document, 'mouseup', this.mouseUpHandle);

        this.setOffset(this.mouseOffX - (this.posX - e.screenX), this.mouseOffY - (this.posY - e.screenY));

        this.digilib.loadImages();
    },

    handleImageZoom: function(e) {
        this.lastZoomAction = new Date().getTime();
        var time = this.lastZoomAction;

        window.setTimeout(this.handleImageZoomThread.bind(this, e, time), "10");
    },

    handleImageZoomThread: function(e, time) {

        if(time < this.lastZoomAction) {
            return;
        }

        var lastZoom = this.zoom;

        var factor = 1;
        if(this.zoom < 0.5) factor = 1.0;
        else if(this.zoom < 1.0) factor = 1.5;
        else if(this.zoom < 2.0) factor = 1.8;
        else factor = 2.2;

        var newZoom = Math.round(this.zoom * 100 + (Event.wheel(e) * factor)) / 100.0; //
        this.setZoom(newZoom);


        var offSet = de.edirom.server.main.getPositionOnPage($("canvas_" + this.id));

        var mousePosX = e.pageX - offSet[0];
        var mousePosY = e.pageY - offSet[1];

        var centerX = Math.round((mousePosX - this.offX) / lastZoom); //
        var centerY = Math.round((mousePosY - this.offY) / lastZoom); //

        this.setOffset(mousePosX - Math.round(centerX * this.zoom), mousePosY - Math.round(centerY * this.zoom));

        this.digilib.loadImages();
    },

    setOffset: function(x, y) {
        this.offX = x;
        this.offY = y;

        this.digilib.setPosition(this.offX, this.offY);

        this.offsetListeners.each(function(listener) {
            listener(this.offX, this.offY);
        }.bind(this));
    },

    setZoom: function(zoom) {

        if(zoom > this.ZOOM_MAX) this.zoom = this.ZOOM_MAX;
        else if(zoom < this.ZOOM_MIN) this.zoom = this.ZOOM_MIN;
        else this.zoom = zoom;

        this.getKeyForZoom();

        if(typeof this.digilib != 'undefined')
        this.digilib.setSize(Math.round(this.getFacsimileWidth(0) * this.getZoom()), Math.round(this.getFacsimileHeight(0) * this.getZoom()));

        this.zoomListeners.each(function(listener) {
            listener(this.zoom);
        }.bind(this));
    },

    getZoom: function() {
        return this.zoom;
    },

    getOffX: function() {
        return this.offX;
    },

    getOffY: function() {
        return this.offY;
    },

    updateZoom: function(zoomInput, zoomStep) {
        var lastZoom = this.zoom;

		if (isNaN(zoomInput))
			this.setZoom(lastZoom);
		else {

		    if(typeof zoomStep != 'undefined')
		        zoomInput = Number(zoomInput) + (Number(zoomStep) * 10);

            this.setZoom(zoomInput / 100.0);

            var centerX = Math.round(((this.getContainerWidth() / 2.0) - this.offX) / lastZoom); //
            var centerY = Math.round(((this.getContainerHeight() / 2.0) - this.offY) / lastZoom); //

            this.setOffset(Math.round((this.getContainerWidth() / 2.0) - (centerX * this.zoom)),
                           Math.round((this.getContainerHeight() / 2.0) - (centerY * this.zoom)));

            this.digilib.loadImages();
		}
    },

    getContainerWidth: function() {
        return $("eventHandler_" + this.id).getWidth();
    },

    getContainerHeight: function() {
        return $("eventHandler_" + this.id).getHeight();
    },
    
    getKeyForZoom: function() {
        this.key = this.maxKey;
        for(var i = this.maxKey; i > 0;) {
            if(1 / Math.pow(2.0, i) > this.zoom) break;

            i = i - 1;
            this.key = i;
        }
    },

    getKey: function() {
        return this.key;    
    },

    addZoomListener: function(listener) {
        this.zoomListeners.push(listener);
    },

    addOffsetListener: function(listener) {
        this.offsetListeners.push(listener);
    },

    addMouseDownListener: function(listener) {
        this.mouseDownListeners.push(listener);
    },

    destroy: function() {

        Event.stopObserving($("eventHandler_" + this.id), 'mousedown', this.handleMouseDownFunc);

        Event.stopObserving($("eventHandler_" + this.id), "mousewheel", this.handleImageZoomFunc);
        Event.stopObserving($("eventHandler_" + this.id), "DOMMouseScroll", this.handleImageZoomFunc); //Firefox

        this.container.removeChild($('canvas_' + this.id));
        this.container.removeChild($('eventHandler_' + this.id));
    }
});/**
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
});/**
 * @fileOverview This file provides the Indicator and a stack for jobs
 *
 * @author: <a href="mailto:johu@mail.uni-paderborn.de">Joachim Hunker</a>
 * @version 1.0
 */ 

de.edirom.server.main.Indicator = Class.create ({

    initialize : function(viewId) {   
        this.hashMap = new de.edirom.server.main.LinkedHashMap();
        this.index = -1;
        this.viewId = viewId;
        this.view = $(this.viewId);
        this.active = false;
        //var indicatorContainer = new Element("div", {id:"indicator"});
        
        this.view.insert({bottom: '<div id="indicator" style="display:block">\
                                       <div id="indicator_icon" class="inactive"></div>\
                                       <div id="indicator_text" class="inactive"></div>\
                                   </div>'
        });
        
        this.getJob();
    },
    
    refresh: function() {            
        this.getJob();
    },
    
    addJob: function(id, name) {
        this.hashMap.pushElement(id,name);
        this.index++;
        
        this.refresh();
    },
    
    setJobDescription: function(id, desc) {
        this.hashMap.setValue(id, desc);
        this.refresh();
    },
    
    jobFinished: function(id) {
        
        $('indicator_text').update(this.hashMap.get(id) + ' complete');
        
        this.hashMap.remove(id);
        this.index--;
        
        window.setTimeout(this.refresh.bindAsEventListener(this), 1000);
    },
    
    hide: function() {
        $('indicator').style.display = 'none';
    },
    
    show: function() {
        $('indicator').style.display = 'block';
    },
    
    //Jobs still in queue?
    getJob: function() {
        //no jobs there
        if(this.hashMap.length == 0) {
            this.active = false;
            $('indicator_text').update('');
        }
        else {            
            var idList = this.hashMap.keys();
            
            this.active = true;
            $('indicator_text').update(this.hashMap.get(idList[this.index]));
        }
        
        this.setActive(this.active);
    },
    
    setActive: function(active) {
        
        if(active) {
            $('indicator_icon').removeClassName('inactive');
            $('indicator_text').removeClassName('inactive');
            $('indicator_icon').addClassName('active');
            $('indicator_text').addClassName('active');
        } else {
            $('indicator_text').removeClassName('active');
            $('indicator_icon').removeClassName('active');
            $('indicator_text').addClassName('inactive');
            $('indicator_icon').addClassName('inactive');
        }
    }    
});    /*
 *    a two-way linked hashmap, combining the benefits of associative arrays and arrays
 */
 
de.edirom.server.main.LinkedHashMap = Class.create();
Object.extend(de.edirom.server.main.LinkedHashMap.prototype, Enumerable);
Object.extend(de.edirom.server.main.LinkedHashMap.prototype, {
     initialize: function(array) {
         
         this.hash = new Hash();
         this.length = 0;
         
         this.startID;
         this.endID;
         
         
         if(typeof(array) != 'undefined') {
             $A(array).each(function(item) {
                 this.pushElement(item.id, item);
             }.bind(this));
         }
     },
     
     _each: function(iterator) {
                     
         var object = this.startID;
         
         for(var i = this.length; i > 0; i--) {
             iterator(this.get(object));             
             object = this.hash.get(object)._next;
         }
         
     },
     
     //adds an element to the end of the linked HashMap
     pushElement: function(ID,elem) {
         
         var previousID;
         var nextID = null;
         
         if(this.length == 0) {
             previousID = null;
             this.startID = ID;
         } else {
             previousID = this.endID;
             this.hash.get(this.endID)._next = ID;
         }
                  
         this.endID = ID;
         
         var object = new Object();
         object._previous = previousID;       
         object.value = elem;
         object._next = nextID;  
         
         this.hash.set(ID, object);
         this.length++;
         
     },
     
     //adds an element to the beginning of the linked Hashmap
     unshiftElement: function(ID,elem) {
         
         var previousID = null;
         var nextID;
         
         if(this.length == 0) {
             nextID = null;
             this.endID = ID;
         } else {
             nextID = this.startID;
             this.hash.get(this.startID)._previous = ID;
         }
         this.startID = ID;
         
         var object = new Object();
         object._previous = previousID;
         object.value = elem;
         object._next = nextID;
         
         this.hash.set(ID, object);
         this.length++;
         
     },
     
     //inserts an element after a given element
     insert: function(precedingID, ID, elem) {
         
         if(precedingID == this.endID)
             this.pushElement(ID,elem);
         else if(precedingID == null)
             this.unshiftElement(ID, elem);
         else {
             
             var forward = this.hash.get(precedingID)._next;
                          
             this.hash.get(precedingID)._next = ID;
             this.hash.get(forward)._previous = ID;
             
             
             var object = new Object();
             object._previous = precedingID;
             object.value = elem;
             object._next = forward;
             
             this.hash.set(ID, object);
             
             this.length++;
         }
                  
     },
     
     //removes the last element
     popElement: function() {
         
         if(this.length <= 0)
             return false;
         
         var temp = this.endID
         
         if(this.length > 1) 
             this.endID = this.hash.get(this.endID)._previous;
         else if(this.length == 1) {
             this.endID = null;
             this.startID = null;
         }
         
         this.hash.unset(temp);
         this.length--;
         
     },
     
     //removes the first element
     shiftElement: function() {
         
         if(this.length <= 0)
             return false;
         
         var temp = this.startID
     
         if(this.length > 1)
             this.startID = this.hash.get(this.startID)._next;
         else if(this.length == 1) {
             this.startID = null;
             this.endID = null;
         }
         
         this.hash.unset(temp);         
         this.length--;
     },
     
     //removes a given element
     remove: function(ID) {
         
         if(!this.containsKey(ID))
             return false;
         
         if(ID == this.startID)
             this.shiftElement();
         else if(ID == this.endID)
             this.popElement();
         else {
             
             var forward = this.hash.get(ID)._next;
             var backward = this.hash.get(ID)._previous;
             
             this.hash.get(forward)._previous = backward;
             this.hash.get(backward)._next = forward;
             
             this.hash.unset(ID);
             this.length--;
             
         }
         
     },
     
     containsKey: function(ID) {
         return (this.hash.keys().indexOf(ID) != -1);             
     },
     
     get: function(ID) {
         if(this.containsKey(ID))
             return this.hash.get(ID).value;
         else
             return false;
     },
     
     getNext: function(ID) {
         if(!this.containsKey(ID))
             return false;
         else if(ID == this.endID)
             return null;
         else    
             return this.hash.get(this.hash.get(ID)._next).value;
     },
     
     getPrevious: function(ID) {
         if(!this.containsKey(ID))
             return false;
         else if(ID == this.startID)
             return null;
         else 
             return this.hash.get(this.hash.get(ID)._previous).value;
     },
     
     getFirst: function() {
         if(this.length == 0) return null;
         
         return this.get(this.startID);
     },
     
     getLast: function() {
         if(this.length == 0) return null;
         
         return this.get(this.endID);
     },
     
     values: function() {
     
         var values = new Array();
         var value = this.get(this.startID);
         while(value != null && value != false) {
             values.push(value);
             value = this.getNext(value.id);
         }
         
         return values;
     },
     
     keys: function() {
         return this.hash.keys();
     },
     
     reverse: function() {
     
         var num = this.size();
         if(num < 2) return;
         
         var firstId = this.getFirst().id;
     
         for(var i = num - 1; i > 0; i--) {
             var elem = this.getLast();
             this.popElement();
             
             var insertAfter = this.getPrevious(firstId);
             if(insertAfter == null)
                 this.insert(null, elem.id, elem);
             else
                 this.insert(insertAfter.id, elem.id, elem);
         }
         
         this.hash.get(this.startID)._previous = null;
         this.hash.get(this.endID)._next = null;
     },
     
     setValue: function(ID, value) {
         if(this.containsKey(ID))
             this.hash.get(ID).value = value;
     }
});/*!
Math.uuid.js (v1.4)
http://www.broofa.com
mailto:robert@broofa.com

Copyright (c) 2009 Robert Kieffer
Dual licensed under the MIT and GPL licenses.
*/

/*
 * Generate a random uuid.
 *
 * USAGE: Math.uuid(length, radix)
 *   length - the desired number of characters
 *   radix  - the number of allowable values for each character.
 *
 * EXAMPLES:
 *   // No arguments  - returns RFC4122, version 4 ID
 *   >>> Math.uuid()
 *   "92329D39-6F5C-4520-ABFC-AAB64544E172"
 * 
 *   // One argument - returns ID of the specified length
 *   >>> Math.uuid(15)     // 15 character ID (default base=62)
 *   "VcydxgltxrVZSTV"
 *
 *   // Two arguments - returns ID of the specified length, and radix. (Radix must be <= 62)
 *   >>> Math.uuid(8, 2)  // 8 character ID (base=2)
 *   "01001010"
 *   >>> Math.uuid(8, 10) // 8 character ID (base=10)
 *   "47473046"
 *   >>> Math.uuid(8, 16) // 8 character ID (base=16)
 *   "098F4D35"
 */
Math.uuid = (function() {
  // Private array of chars to use
  var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''); 

  return function (len, radix) {
    var chars = CHARS, uuid = [];
    radix = radix || chars.length;

    if (len) {
      // Compact form
      for (var i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
    } else {
      // rfc4122, version 4 form
      var r;

      // rfc4122 requires these characters
      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
      uuid[14] = '4';

      // Fill in random data.  At i==19 set the high bits of clock sequence as
      // per rfc4122, sec. 4.1.5
      for (var i = 0; i < 36; i++) {
        if (!uuid[i]) {
          r = 0 | Math.random()*16;
          uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
        }
      }
    }

    return uuid.join('');
  };
})();

// A more compact, but less performant, RFC4122v4 compliant solution:
Math.uuid2 = function() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
  }).toUpperCase();
};
/**
 * A class that provides an abstract module (to be used by Source, Text, Work, etc.)
 * @class {abstract} de.edirom.server.main.Module
 * @author <a href="mailto:roewenstrunk@edirom.de">Daniel R�wenstrunk</a>
 */
de.edirom.server.main.Module = Class.create({

    /**
    * Initializes a new Module
    * @constructor {protected} ?
    */
    initialize: function() {
        this.toolbar = new de.edirom.server.main.Toolbar();
        
        this.views = new Array();
        
        $('viewSwitch').hide();
    },
    
    /**
    * @function {protected void} ? Adds a {@link de.edirom.server.main.View View} to the Module 
    * @param {View} view - the {@link de.edirom.server.main.View View} to add
    */
    addView: function(view) {
        this.views.push(view);
        
        if(this.views.size() == 1)
            this.setActiveView(view);
            
        if(this.views.size() > 1)
            $('viewSwitch').show();
    },
    
    /**
    * @function {protected void} ? Activates a {@link de.edirom.server.main.View View}
    * @param {View} view - the {@link de.edirom.server.main.View View} to set active
    */
    setActiveView: function(view) {
        
        this.setActiveView(view, null);
    },
    
    /**
    * @function {protected void} ? Activates a {@link de.edirom.server.main.View View}
    * If there is a function specified to trigger before switching views, it will be executed before switching views
    * @param {View} view - the {@link de.edirom.server.main.View View} to set active
    * @param {String optional} elementID - the id of an element to activate on that view
    */
    setActiveView: function(view, elementID) {
        
        if(typeof(this.funcBeforeViewSwitch) == 'function') {
            this.funcBeforeViewSwitch();
            
            this.funcBeforeViewSwitch = null;
        }
        
        this.views.each(function(_view) {
            if(_view == view)
                _view.setActive(true, elementID);
            else
                _view.setActive(false, elementID);
        });
    },
    
    /**
    * @function {public} ? Returns the key of the actual displayed content
    * @returns key of the actual displayed content
    */
    getActualContentKey: function() {
    
        var activeView;
        for(var i = 0; i < this.views.size(); i++) {
            if(this.views[i].isActive())
                activeView = this.views[i];
        }
        
        if(typeof(activeView) != 'undefined') {
            return activeView.getActiveContentKey();
        }
    
        return "";
    }
});   /**
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
/**
 * A Popup that allows to select objects from the db. Has two buttons
 * @class A objectPicker dialog
 * 
 * @param {Array} _filter contains all types of objects that should be included for selection. All if empty
 * @param {Array} _preselection contains IDs of all preselected items
 */
de.edirom.server.main.ObjectPicker = Class.create({
    
    initialize: function(filter, preselection, selectedFunc, inputType) {
        
        var sources = filter.include('sources');
        var works = filter.include('works');
        var texts = filter.include('texts');
        
        this.selectedFunc = selectedFunc;
        
        if(!$('oPdiv')) {
            var oPdiv = document.createElement('div');
    		oPdiv.id = 'oPdiv';
    		document.getElementsByTagName('body')[0].appendChild(oPdiv);
        }
        
        new Ajax.Updater('oPdiv', '../main/xql/ObjectPicker.xql', {
        //new Ajax.Request('../main/xql/ObjectPicker.xql', {
            method: 'get',
            parameters: {
                sources: sources,
                works: works,
                texts: texts,
                inputType: inputType
            },
            onComplete: function(transport) {
                
                if(preselection.length > 0) {                    
                    preselection.each(function(itemID) {                        
                        if($('select_' + itemID)) {                  
                            $('select_' + itemID).checked = true;
                        }                        
                    });
                }
                
                
                window.module.getShortcutController().addShortcutListener('popup', 'popup.objectPicker', this.shortcutListener.bind(this));
                
                Event.observe($('objectPicker_cancelButton'), 'click', this.cancelButtonClick.bind(this));
                Event.observe($('objectPicker_okButton'), 'click', this.okButtonClick.bind(this));
               
               
            }.bind(this),
            onFailure: function(transport) {
                console.log('ObjectPicker konnte nicht geladen werden: \n\n' + transport.responseText);
            }
        });
        
    },
        
    closePopup: function() {
        window.module.getShortcutController().removeShortcutListener('popup', 'popup.objectPicker');
        
        Event.stopObserving($('objectPicker_cancelButton'));
        Event.stopObserving($('objectPicker_okButton'));
        
        $('objectPickerBox').remove();
    },
    
    cancelButtonClick: function() {
        this.closePopup();
    },
        
    okButtonClick: function() {
        
        var allItems = $$('.objectPicker_itemChecker input');
        var items = new Array();
        
        for(var i=0;i<allItems.length;i++) {
            if(allItems[i].checked == true)
                items.push(allItems[i].id.substring(7));
        }
        
        this.closePopup();
        if(typeof(selectedFunc) != 'null') this.selectedFunc(items);
    },
    
    shortcutListener: function(event) {
        if(event.keyCode == Event.KEY_RETURN) {
            this.okButtonClick();
            return true;
        }
        if(event.keyCode == Event.KEY_ESC) {
            this.cancelButtonClick();
            return true
        }
        
        return false;        
    }
});/**
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
});/* 
 *	Scrollview, Scrolltable and Scrollbar Implementation
 * 	(Scrollview uses Scrollbar; Scrolltable inherits from Scrollview)
 *	Author: Markus Haupt
 *
 * Dependencies: Prototype (javascript framework from prototypejs.org), Util2.js
 * The current version works only with Firefox.
 */


//document.write('<link rel="stylesheet" type="text/css" href="scrolling.css"></link>');

if ( typeof de == 'undefined' ) de = {};
if ( typeof de.edirom == 'undefined' ) de.edirom = {};
if ( typeof de.edirom.server == 'undefined' ) de.edirom.server = {};

/*
 * The Scrollview class makes a div scrollable
 *
 * 'viewId' is the id of the parent div which has to be scrollable
 * The other params are related to the scrollbars (see also Scrollbar class) and
 *		can either be stated as single values or arrays of 2 values each
 *		for differentiation of vertical (Array Pos. 0) and horizontal (Array Pos. 1) scrollbar.
 *
 * First instantiate a new object from this class and give it the div's Id
 * Then:
 * Invoke 'setVerticalScrolling(boolean yesNo)' for enabling/disabling vertical scrolling
 * Invoke 'setHorizontalScrolling(boolean yesNo)' for enabling/disabling horizontal scrolling
 *
 * Invoke 'refresh()' i.e. if the size of the view has changed
 * Invoke 'refresh(x,y)' to jump directly to a position in the view's content
 * Invoke 'focusElement(elementId)' to jump directly to an element in the view's content
 *
 * Notice: this class adds new divs nested around the content of the view's div
 *
 * The ids of the scrollbar divs will be the following:
 * 	"<viewId>_vScrollbar" AND "<viewId>_hScrollbar" AND "<viewId>_cornerRect"
 * The ids of the corresponding dragbar divs will be the following:
 *    "<viewId>_vScrollbar_vDragbar" AND "<viewId>_hScrollbar_hDragbar"
 * (Notice: you are allowed to customize several CSS style attributes, but don't change the positioning and size!)
 */
de.edirom.server.Scrollview = Class.create({
	initialize: function(viewId, refreshOnDocumentResize, minDrawbarLengthPx) {
		this.viewId = viewId;
		this.view = $(viewId);
		
		if (typeof(minDrawbarLengthPx) == "object") { // is array?
			this.minDrawbarLengthV = minDrawbarLengthPx[0];
			this.minDrawbarLengtH = minDrawbarLengthPx[1];
		} else {
			this.minDrawbarLengthV = minDrawbarLengthPx;
			this.minDrawbarLengthH = minDrawbarLengthPx;
		}
		
		// adapt the required attribute values of the VIEW, position-mode has to be non-static!
		this.view.setStyle({overflow:"hidden"});
		if (this.view.getStyle("position") == "static")
			this.view.setStyle({position:"relative"});
		
		// create a FRAME div with a fix size which is set to the inner size of the VIEW
		// the FRAME defines the area where the content is visible
		var frameId = this.viewId+"_scrollViewFrame";
		var frame = new Element("div", {id: frameId});
		this.frameWidth = getBoxModelWidth(this.view, 'inner');
		this.frameHeight = getBoxModelHeight(this.view, 'inner');
		frame.setStyle({width: this.frameWidth+"px", height: this.frameHeight+"px", overflow: "hidden", whiteSpace: "normal"});
		
		// create an INNER-FRAME within the FRAME which covers the whole content
		var frameInnerId = this.viewId+"_scrollViewInnerFrame";
		var frameInner = new Element("div", {id: frameInnerId});
		frameInner.setStyle({width:"auto", height:"auto", overflow:"hidden", display: "inline"});
		
		// nest the divs so that VIEW contains FRAME and FRAME contains INNER-FRAME
		frameInner.update(this.view.innerHTML);
		frame.update(frameInner);
		this.view.update(frame);
		
		// differ between FRAME and INNER-FRAME for vertical and horizontal notion (important for table scrolling mode)
		this.vFrame = frame; // frame to get vertical axis values from (e.g. height)
		this.hFrame = frame; // frame to get horizontal axis values from (e.g. width)
		this.vFrameId = frameId;
		this.hFrameId = frameId;
		this.vFrameInner = frameInner; // frameInner to get vertical axis values from (e.g. height)
		this.hFrameInner = frameInner; // frameInner to get horizontal axis values from (e.g. width)
		this.vFrameInnerId = frameInnerId;
		this.hFrameInnerId = frameInnerId;
		
		// init Scrollbar related vars
		this.vScrollbar = null;
		this.hScrollbar = null;
		this.vThickness = 0;
		this.hThickness = 0;
		
		// init vars related to table scrolling
		this.scrollbarTopOffset = 0;
		this.scrollbarBottomOffset = 0;
		
		// init corner rectangle
		this.cornerRectId = this.viewId+"_cornerRect";
		this.cornerRect = new Element("div", {id: this.cornerRectId});
		this.cornerRect.setStyle({position:"absolute", bottom:"0px", right:"0px", display:"none"});
		this.cornerRect.addClassName("cornerRect");
		this.view.insert({top: this.cornerRect});
		
		if (refreshOnDocumentResize) {
			Event.observe(document.onresize ? document : window, 'resize', function(event) {
			    if (this.calcOwnTableWidths && this.refreshTableWidths)
	                this.refreshTableWidths();
		        this.refresh();
		    }.bindAsEventListener(this));
		}
	},
	setTableScrolling: function(headTableId, footTableId, bodyTableId, bodyTableWrapperId) { // activates table scrolling mode
		this.vFrame = $(bodyTableWrapperId);
		this.vFrameId = bodyTableWrapperId;
		this.vFrameInner = $(bodyTableId);
		this.vFrameInnerId = bodyTableId;
		this.scrollbarTopOffset = getBoxModelHeight($(headTableId), 'outer');
		if (footTableId != null)
		    this.scrollbarBottomOffset = getBoxModelHeight($(footTableId), 'outer');
		this.refresh();
	},
	setVerticalScrolling: function(yesNo) {
	    if (this.deactivated) return;
	    
		if (!yesNo && this.vScrollbar) { // remove vertical scrolling
			// remove scrollbar
			var tmp = this.vScrollbar.getScrollbar();
			this.vScrollbar = null;
			tmp.remove();
			
			// resize frame dimensions
			this.hFrame.setStyle({width: "auto"});
			
			// update related vars
			this.frameWidth = getBoxModelWidth(this.hFrame, 'inner');
			this.vThickness = 0;
			
			this.updateCornerRect();
			
		} else if (yesNo && !this.vScrollbar) { // create vertical scrolling
			// create and insert the scrollbar container
			var scrollbarId = this.viewId+"_vScrollbar";
			var scrollbarContainer = new Element("div", {id: scrollbarId});
			var topPadding;
			if (this.scrollbarTopOffset > 0) topPadding = this.scrollbarTopOffset;
			else topPadding = this.vFrame.getStyle("padding-top");
			scrollbarContainer.setStyle({position:"absolute", right:"0px", height: this.frameHeight+"px", top: topPadding+"px"});
			scrollbarContainer.addClassName("scrollbarV");
			this.view.insert({top: scrollbarContainer});
			this.vThickness = getBoxModelWidth(scrollbarContainer, "native");
			
			// update frame dimensions which will correspond to the scrollbar dimensions
			this.frameWidth = getBoxModelWidth(this.hFrame, 'inner') - this.vThickness;
			this.hFrame.setStyle({width: this.frameWidth+"px"});
			
			if (this.hScrollbar) {
				// update width of horizontal scrollbar
				this.hScrollbar.getScrollbar().setStyle({width: this.frameWidth+"px"});
				this.hScrollbar.updateDragbar();
			}
			
			// create and insert the scrollbar
			this.vScrollbar = new de.edirom.server.Scrollbar(scrollbarId, this.vFrameId, this.vFrameInnerId, "vertical", this.minDrawbarLengthV);
			this.vScrollbar.getDragbar().addClassName("dragbarV");
			
			this.updateCornerRect();
		}
	},
	setHorizontalScrolling: function(yesNo) {
	    if (this.deactivated) return;
	    
		if (!yesNo && this.hScrollbar) { // remove horizontal scrolling
			// remove scrollbar
			var tmp = this.hScrollbar.getScrollbar();
			this.hScrollbar = null;
			tmp.remove();
			
			// resize frame dimensions
			this.vFrame.setStyle({height: "auto"});
			
			// turn on auto line-breaks
			this.vFrame.setStyle({whiteSpace: "normal"});
			
			// update related vars
			this.frameHeight = getBoxModelHeight(this.vFrame, 'inner');
			this.hThickness = 0;
			
			this.updateCornerRect();
			
		} else if (yesNo && !this.hScrollbar) { // create horizontal scrolling
			// create and insert the scrollbar container
			var scrollbarId = this.viewId+"_hScrollbar";
			var scrollbarContainer = new Element("div", {id: scrollbarId});
			scrollbarContainer.setStyle({position:"absolute", bottom:"0px", width: this.frameWidth+"px", left: "0px"});
			scrollbarContainer.addClassName("scrollbarH");
			this.view.insert({top: scrollbarContainer});
			
			this.hThickness = getBoxModelHeight(scrollbarContainer, "native");
			
			// update frame dimensions which will correspond to the scrollbar dimensions
			this.frameHeight = getBoxModelHeight(this.vFrame, 'inner') - this.hThickness;
			this.vFrame.setStyle({height: this.frameHeight+"px"});
			
			// turn off auto line-breaks
			this.vFrame.setStyle({whiteSpace: "nowrap"});
			
			if (this.vScrollbar) {
				// update height of vertical scrollbar
				this.vScrollbar.getScrollbar().setStyle({height: this.frameHeight+"px"});
				this.vScrollbar.updateDragbar();
			}
			
			// create and insert the scrollbar
			this.hScrollbar = new de.edirom.server.Scrollbar(scrollbarId, this.hFrameId, this.hFrameInnerId, "horizontal", this.minDrawbarLengthH);
			this.hScrollbar.getDragbar().addClassName("dragbarH");
			
			this.updateCornerRect();
		}
	},
	refresh: function(xJump, yJump) { // to do a simple refresh omit the jump-coordinate params
	    if (this.deactivated) return;
	    
	    // don't refresh if the frame/view is not visible
	    var anc = this.vFrame.ancestors();
	    for (var i = 0; i < anc.length; i++) if (!anc[i].visible()) return;
	    
		// resize frame div and update related vars
		this.hFrame.setStyle({ height: "auto" });
		this.vFrame.setStyle({ width: "auto" });
		this.vFrame.setStyle({ height: "auto", maxHeight: "none" });
		
		this.frameWidth = getBoxModelWidth(this.view, 'inner') - this.vThickness;
		this.frameHeight = getBoxModelHeight(this.view, 'inner') - this.hThickness;
		this.hFrame.setStyle({width: this.frameWidth+"px", height: this.frameHeight+"px"});
		if (this.hFrame != this.vFrame)
		    this.vFrame.setStyle({width: this.frameWidth+"px", height: this.frameHeight+"px"});

		this.frameHeight -= this.scrollbarTopOffset + this.scrollbarBottomOffset;
        
		this.vFrame.setStyle({height: this.frameHeight+"px", maxHeight: getBoxModelHeight(this.hFrameInner, 'outer')+"px"});
        
		// apply jump coords, resize scrollbar containers and update dragbars
		if (this.vScrollbar) {
			this.vScrollbar.getScrollbar().setStyle({height: this.frameHeight+"px"});
			if (!yJump)
				this.vScrollbar.updateDragbar();
			else {
				if (yJump < 0) yJump = 0;
				this.vScrollbar.scrollToOffset(-yJump);
			}
		}
		if (this.hScrollbar) {
			this.hScrollbar.getScrollbar().setStyle({width: this.frameWidth+"px"});
			if (!xJump)
				this.hScrollbar.updateDragbar();
			else {
				if (xJump < 0) xJump = 0;
				this.hScrollbar.scrollToOffset(-xJump);
			}
		}
	},
	focusElement: function(elementId, leftTopOffsetPx) {
	    if (this.deactivated) return;
	    
		var leftOffset = 0;
		var topOffset = 0;
		if (typeof(leftTopOffsetPx) == "object") { // is array?
			leftOffset = leftTopOffsetPx[0];
			topOffset = leftTopOffsetPx[1];
		} else if (leftTopOffsetPx) {
			leftOffset = leftTopOffsetPx;
			topOffset = leftTopOffsetPx;
		}
		
		if (leftOffset == 'center')
		    leftOffset = this.frameWidth*0.5 - $(elementId).getWidth()*0.5;
		if (topOffset == 'center')
		    topOffset = this.frameHeight*0.5 - $(elementId).getHeight()*0.5;
		
		this.refresh( ($(elementId).viewportOffset()[0] - this.hFrameInner.viewportOffset()[0]) - leftOffset,
							($(elementId).viewportOffset()[1] - this.vFrameInner.viewportOffset()[1]) - topOffset);
	},
	updateCornerRect: function() {
		if (this.vScrollbar && this.hScrollbar) { // show corner rectangle
			// update and show cornerRect
			this.cornerRect.setStyle({width: this.vThickness+"px", height: this.hThickness+"px"});
			this.cornerRect.show();
		} else { // hide corner rectangle
			this.cornerRect.hide();
		}
	},
	deactivate: function() {
	    if (this.deactivated) return;
	    
	    this.backupFrameStyle = this.vFrame.readAttribute("style");
	    this.vFrame.writeAttribute({style: ""});
	    this.backupFrameInnerStyle = this.vFrameInner.readAttribute("style");
	    this.vFrameInner.writeAttribute({style: ""});
	    if (this.vScrollbar) $(this.viewId+"_vScrollbar").hide();
	    if (this.hScrollbar) $(this.viewId+"_hScrollbar").hide();
	    this.deactivated = true;
	},
	reactivate: function() {
	    if (!this.deactivated) return;
	    
	    if (this.backupFrameStyle != null) {
    	    this.vFrame.writeAttribute({style: this.backupFrameStyle});
    	    this.backupFrameStyle = null;
	    }
	    if (this.backupFrameInnerStyle != null) {
    	    this.vFrameInner.writeAttribute({style: this.backupFrameInnerStyle});
    	    this.backupFrameInnerStyle = null;
	    }
	    if (this.vScrollbar) $(this.viewId+"_vScrollbar").show();
	    if (this.hScrollbar) $(this.viewId+"_hScrollbar").show();
	    this.deactivated = false;
	}
});

/*
 * The Scrolltable is a special case of Scrollview
 *
 * It will be distinguished between the head and the body of the table.
 *		While scrolling vertically the head of the table remains in position.
 *
 * Notice: this class divides the table into two separate tables.
 *
 * The ids of the tables will be the following:
 *		"<tableId>_scrollHeadTable" AND "<tableId>_scrollBodyTable"
 */
de.edirom.server.Scrolltable = Class.create(de.edirom.server.Scrollview, {
		initialize: function($super, viewId, tableId, refreshOnDocumentResize, minDrawbarLengthPx) {
			// get the widths of the columns to be able to reconstruct the dimensions of the table later
		    tableFirstRow = firstDisplayed($(tableId), "tr").select("td, th");
		    this.syncWidthsArray = new Array(tableFirstRow.length);
		    for (var i = 0; i < tableFirstRow.length; i++)
		        this.syncWidthsArray[i] = getBoxModelWidth(tableFirstRow[i], "inner");
		    
			// separation into three tables
			var headTable = $(tableId).cloneNode(false); // clone table without innerHTML
			this.headTableId = $(tableId).identify()+"_scrollHeadTable";
			headTable.writeAttribute({id: this.headTableId});
			headTable.setStyle({whiteSpace: "nowrap", width: "auto", paddingBottom:"0px", marginBottom:"0px"});
			
			var footTable = $(tableId).cloneNode(false); // clone table without innerHTML
			this.footTableId = $(tableId).identify()+"_scrollFootTable";
			footTable.writeAttribute({id: this.footTableId});
			footTable.setStyle({whiteSpace: "nowrap", width: "auto", paddingTop:"0px", marginTop:"0px", borderTop:"0px hidden"});
			
			var bodyTable = $(tableId);
			this.bodyTableId = $(tableId).identify()+"_scrollBodyTable";
			bodyTable.writeAttribute({id: this.bodyTableId});
			bodyTable.setStyle({whiteSpace: "nowrap", width: "auto", paddingTop:"0px", marginTop:"0px", borderTop:"0px hidden"});
			
			// re-allocate tfoot and thead
			var tableParts = bodyTable.childElements();
			for (var i = 0; i < tableParts.length; i++) {
				if (tableParts[i].match("thead"))
				    headTable.insert({ bottom: tableParts[i].remove() });
				else if (tableParts[i].match("tfoot"))
				    footTable.insert({ bottom: tableParts[i].remove() });
		    }
		    
		    // insert new tables
		    bodyTable.insert({ before: headTable });
		    if (footTable.childElements().length > 0) {
		        bodyTable.insert({ after: footTable });
		        bodyTable.setStyle({paddingBottom:"0px", marginBottom:"0px"});
		    } else {
		        // delete footTable if tfoot didn't existed
		        footTable = null;
		        this.footTableId = null;
		    }
			
			// create bodyTable wrapper div (represents the frame div for vertical scrolling)
			this.bodyTableWrapperId = this.bodyTableId+"_scrollBodyWrapper";
			var bodyTableWrapper = new Element("div", {id: this.bodyTableWrapperId});
			var bodyWrapperWidth = getBoxModelWidth($(viewId), 'inner');
			var bodyWrapperHeight = getBoxModelHeight($(viewId), 'inner') - headTable.getHeight();
			if (footTable != null) bodyWrapperHeight -= footTable.getHeight();
			var bodyWrapperMaxHeight = getBoxModelHeight(bodyTable, 'outer');
			bodyTableWrapper.setStyle({width: bodyWrapperWidth+"px", height: bodyWrapperHeight+"px", maxHeight: bodyWrapperMaxHeight+"px", overflow:"hidden", whiteSpace:"normal"});
			Element.wrap(bodyTable, bodyTableWrapper);
			
			// create Scrollview and set table scrolling mode
			$super(viewId, refreshOnDocumentResize, minDrawbarLengthPx);
			this.setTableScrolling(this.headTableId, this.footTableId, this.bodyTableId, this.bodyTableWrapperId);
			
			// synchronize column widths of the tables
			this.isHeadSynced = false;
			this.isBodySynced = false;
			this.isFootSynced = false;
			this.synchronizeColumnWidths();
			
		},
		// private. assigns the fix widths stored in this.syncWidthArray and optionally updates the percentual widths (user-assigned with 'setTableWidth()')
		//   to the first columns in the first row of each new table (head, body, foot)
		synchronizeColumnWidths: function() {
		
		    // note: currently works under the assumption that the first row of either the head and foot table is always the same
		    
		    if (!this.isHeadSynced && displayedExists($(this.headTableId), "tr")) {
			    this.headFirstRow = firstDisplayed($(this.headTableId), "tr").select("td, th");
			    for (var col = 0; col < this.headFirstRow.length; col++)
				    this.headFirstRow[col].setStyle( {width: this.syncWidthsArray[col]+"px", minWidth: this.syncWidthsArray[col]+"px"} );
				this.isHeadSynced = true;
			}
            
            if (!this.isBodySynced && displayedExists($(this.bodyTableId), "tr")) {
			    currentFirstRow = firstDisplayed($(this.bodyTableId), "tr").select("td, th");
			    if (this.bodyFirstRow && currentFirstRow != this.bodyFirstRow) {
			        // row order has changed: remove widths of the old first row
			        for (var col = 0; col < this.bodyFirstRow.length; col++)
	                    this.bodyFirstRow[col].setStyle( {width: "auto", minWidth: "0", maxWidth: "none"} );
			    }
			    this.bodyFirstRow = currentFirstRow;
			    for (var col = 0; col < this.bodyFirstRow.length; col++)
	                this.bodyFirstRow[col].setStyle( {width: this.syncWidthsArray[col]+"px", minWidth: this.syncWidthsArray[col]+"px"} );
				this.isBodySynced = true;
			}
			
			if (!this.isFootSynced && this.footTableId != null && displayedExists($(this.footTableId), "tr")) {
			    this.footFirstRow = firstDisplayed($(this.footTableId), "tr").select("td, th");
			    for (var col = 0; col < this.footFirstRow.length; col++)
				    this.footFirstRow[col].setStyle( {width: this.syncWidthsArray[col]+"px", minWidth: this.syncWidthsArray[col]+"px"} );
				this.isFootSynced = true;
			}
			
			if (this.calcOwnTableWidths)
		        this.refreshTableWidths();
		},
		// public. call if the content of the tables has changed in order to adjust errors in the view that could have been arised
		refreshTable: function() {
		    if (this.deactivated) return;
		    
		    this.isHeadSynced = false;
		    this.isBodySynced = false;
		    this.isFootSynced = false;
		    this.synchronizeColumnWidths();
		},
		// public. replaces the original table widths by own values either given by fix and/or percentual widths
		//  (this method updates this.syncWidthArray and does a refresh of the view accordingly, this.calcOwnTableWidths will be set to 'true')
		setTableWidths: function(fixWidths, percentualWidths) {
		    if (this.deactivated) return;
		    
		    // set all fix widths completely
		    if (fixWidths) {
    		    for (var i = 0; i < fixWidths.length; i++) {
    		        var index = fixWidths[i][0];
    		        var widthPx = fixWidths[i][1];
    		        this.syncWidthsArray[index] = widthPx;
    		        if (displayedExists($(this.headTableId), "tr"))
    		            this.headFirstRow[index].setStyle( {width: widthPx+"px", minWidth: widthPx+"px"} );
    		        if (displayedExists($(this.bodyTableId), "tr"))
    		            this.bodyFirstRow[index].setStyle( {width: widthPx+"px", minWidth: widthPx+"px"} );
    		        if (this.footTableId != null && displayedExists($(this.footTableId), "tr"))
    		            this.footFirstRow[index].setStyle( {width: widthPx+"px", minWidth: widthPx+"px"} );
    		    }
		    }
		    
		    if (!percentualWidths)
		        return;
		    
		    // get the width available for the percentual division
		    for (var i = 0; i < percentualWidths.length; i++)
		        this.syncWidthsArray[percentualWidths[i][0]] = 0;
		    var fixArea = 0;
		    for (var i = 0; i < this.syncWidthsArray.length; i++) {
		        if (this.syncWidthsArray[i] > 0)
		            fixArea += getBoxModelWidth(this.headFirstRow[i], 'outer');
		    }
		    this.percentualWidths = percentualWidths;
		    this.initPercArea = getBoxModelWidth(this.hFrame, 'inner') - fixArea - window.innerWidth;
		    
		    // set all percentual widths completely
		    this.refreshTableWidths();
		    
		    this.calcOwnTableWidths = true; // causes the (percentual) table widths to refresh on document-resize
		},
		// private. (re-)calculates the percentual widths (previously set with 'setTableWidths()') and updates the view accordingly,
		//   i.e. after the width of the whole table has changed
		refreshTableWidths: function() {
		    if (this.deactivated) return;
		    
		    var percArea = this.initPercArea + window.innerWidth;
		    
		    // calculate and assign the percentual widths
		    for (var i = 0; i < this.percentualWidths.length; i++) {
		        var index = this.percentualWidths[i][0];
		        var padding = getBoxModelWidth(this.headFirstRow[index], 'outer') - getBoxModelWidth(this.headFirstRow[index], 'inner');
    		    var widthPx = this.percentualWidths[i][1] * percArea / 100 - padding;
    		    if (displayedExists($(this.headTableId), "tr"))
    	            this.headFirstRow[index].setStyle( {width: widthPx+"px", minWidth: widthPx+"px", maxWidth: widthPx+"px"} );
    	        if (displayedExists($(this.bodyTableId), "tr"))
    	            this.bodyFirstRow[index].setStyle( {width: widthPx+"px", minWidth: widthPx+"px", maxWidth: widthPx+"px"} );
    	        if (this.footTableId != null && displayedExists($(this.footTableId), "tr"))
    	            this.footFirstRow[index].setStyle( {width: widthPx+"px", minWidth: widthPx+"px", maxWidth: widthPx+"px"} );
		    }
		},
		setVerticalScrolling: function($super, yesNo) {
		    if (this.deactivated) return;
		    
		    var addSb = yesNo && !this.vScrollbar;
		    var subtractSb = !yesNo && this.vScrollbar;
		    
			$super(yesNo);
			
			// Subtract or re-add the thickness of the vertical scrollbar from the width of the last column of the tables
			if (addSb || subtractSb) {
			    var newWidth = this.syncWidthsArray.last();
			    if (addSb)
    			    newWidth -= this.vThickness;
    			else
    			    newWidth += this.vThickness;
    			
    			this.syncWidthsArray[this.syncWidthsArray.length-1] = newWidth;
    			
    			// refresh view
    			if (this.bodyFirstRow != null && this.bodyFirstRow.last() != null)
    			    this.bodyFirstRow.last().setStyle( {width: newWidth+"px", minWidth: newWidth+"px"});
    			if (this.headFirstRow != null && this.headFirstRow.last() != null)
    			    this.headFirstRow.last().setStyle( {width: newWidth+"px", minWidth: newWidth+"px"});
    			if (this.footFirstRow != null && this.footFirstRow.last() != null)
    			    this.footFirstRow.last().setStyle( {width: newWidth+"px", minWidth: newWidth+"px"});
			}
		},/*
		setHorizontalScrolling: function($super, yesNo) {
		    if (this.deactivated) return;
		    
			var flag = yesNo && !this.hScrollbar;
		   
			if(flag)
				$(this.bodyTableWrapperId).setStyle({width: $(this.bodyTableId).getWidth()+"px"});
			
			$super(yesNo);
		},*/
		refresh: function($super, xJump, yJump) {
		    if (this.deactivated) return;
		    this.synchronizeColumnWidths();
		    $super(xJump, yJump);
		}
});




/*
 * The Scrollbar class makes a scrollbar out of a given scrollbar container div by inserting a dragbar
 *
 * 'frameId' identifies a content div which acts as a frame with fix width and height values
 * 'frameInnerId' identifies a div which is the only child of the frame and wraps the whole content (with CSS overflow="hidden")
 * 'axis' is either 'vertical' or 'horizontal'
 * 'minDrawbarHeightPx' (optional) is to avoid the dragbar to get tiny if the content grows very large
 *
 * Invoke 'updateDragbar' to update the dragbar
 * Invoke 'getDragbar' or 'getScrollbar' to get the dragbar or the scrollbar (as Prototype elements)
 * Invoke 'scroll(px)' or 'scrollToOffset(-px)' to either scroll an amount or to scroll to an absolute position
 * Inkove 'setMousewheelScrolling(true/false)' to change the standard configuration for enabled/disabled mousewheel scrolling
 *             (standard: true for vertical scrolling, false for horizontal scrolling)
 *
 * The ids of the dragbar divs will be the following:
 *		"<scrollbarContainerId>_vDragbar" OR "<scrollbarContainerId>_hDragbar"
 * (Notice: you are allowed to customize several CSS style attributes, but don't change the positioning and size!)
 *
 * Even though both vertical and horizontal scrolling are supported,
 * variable naming in the code of the class conforms to vertical scrolling.
 */
de.edirom.server.Scrollbar = Class.create({
	initialize: function(scrollbarContainerId, frameId, frameInnerId, axis, minDrawbarLengthPx) {
		this.scrollbar = $(scrollbarContainerId);
		this.contentView = $(frameId);
		this.content = $(frameInnerId);
		
		axis = axis.toLowerCase();
		if (axis == "horizontal" || axis == "h" || axis == "x") {
			this.vScroll = false;
			this.mousewheelScrolling = false;
		} else {
			this.vScroll = true;
			this.mousewheelScrolling = true;
		}
		
		if (this.vScroll)
			this.content.setStyle({position: "relative", top: "0px"});
		else
			this.content.setStyle({position: "relative", left: "0px"});
		
		if (this.vScroll)
			this.drawbarPaddingLongitudinal = getCssIntAttr(this.scrollbar, "padding-top") + getCssIntAttr(this.scrollbar, "padding-bottom");
		else
			this.drawbarPaddingLongitudinal = getCssIntAttr(this.scrollbar, "padding-left") + getCssIntAttr(this.scrollbar, "padding-right");
			
		if (!minDrawbarLengthPx)
			this.minDbHeight = 12;
		else
			this.minDbHeight = Math.max(2, minDrawbarLengthPx);
		
		this.r; // length of dragbar (px)
		this.p = 0; // scroll position (px, top/left side of dragbar)
		this.contentFits;
		
		// create the dragbar
		var dragbarId = scrollbarContainerId;
		if (this.vScroll)
			dragbarId += "_vDragbar";
 		else
 			dragbarId += "_hDragbar";
		this.dragbar = new Element("div", {id: dragbarId});
		this.scrollbar.insert({top: this.dragbar});		
		
		// EVENT HANDLING
		
		this.eventMouseDown = this.startDrag.bindAsEventListener(this);
		this.eventMouseUp = this.endDrag.bindAsEventListener(this);
		this.eventMouseMove = this.updateDrag.bindAsEventListener(this);
		this.eventMouseWheel = this.updateWheel.bindAsEventListener(this);
		
		this.observe = false;
		
		this.dragging = false;
		
		this.updateDragbar();
	},
	getScrollbar: function() {
		return this.scrollbar;
	},
	getDragbar: function() {
		return this.dragbar;
	},
	updateDragbar: function() {
		this.dragbar.setStyle({position:"absolute"});
		
		this.refreshScrollTargetValues();
		
		if (this.vScroll)
			this.dragbar.setStyle({width: getBoxModelWidth(this.scrollbar, "inner")+"px", height: this.r+"px", top: this.p+"px"});
		else
			this.dragbar.setStyle({height: getBoxModelHeight(this.scrollbar, "inner")+"px", width: this.r+"px", left: this.p+"px"});
 		
		this.startObserving();
		if (this.contentFits) {
 			this.scrollbar.setStyle({visibility:"hidden"});
 			this.stopObserving();
 			
 			if (this.vScroll)
			    this.content.setStyle({top: "0px"});
    		else
    			this.content.setStyle({left: "0px"});
    	    
		} else {
 			this.scrollbar.setStyle({visibility:"visible"});
		}
	},
	refreshScrollTargetValues: function() {	
		if (this.vScroll) {
			this.contentViewHeight = this.contentView.getHeight();
			this.contentHeight = this.content.getHeight();
		} else {
			this.contentViewHeight = this.contentView.getWidth();
			this.contentHeight = this.content.getWidth();
		}

		if (this.vScroll)
			this.scrollbarHeight = this.scrollbar.getHeight();
		else
			this.scrollbarHeight = this.scrollbar.getWidth();
		this.scrollbarHeight -= this.drawbarPaddingLongitudinal*2;
		
		// start with max. height for no-scrolling
		this.r = this.scrollbarHeight
		// now downsize for enabled scrolling
		if (this.contentHeight > this.contentViewHeight) {
			var idealR = Math.ceil((this.contentViewHeight / this.contentHeight) * this.r);
			this.r = Math.max(this.minDbHeight, idealR);
			var overlap = this.r - idealR;
			this.contentFits = false;
		} else {
			this.contentFits = true;
		}
		
		var contentOffset;
		if (this.vScroll)
			contentOffset = parseInt(this.content.getStyle("top"));
		else
			contentOffset = parseInt(this.content.getStyle("left"));
		
		// get scroll position
		var normalizedPosition;
		if (this.contentHeight > this.contentViewHeight)
			normalizedPosition = Math.min(0.0, contentOffset / this.contentHeight);
		else
			normalizedPosition = 0.0;
		
		this.p = Math.floor(-normalizedPosition * (this.scrollbarHeight-overlap))+this.drawbarPaddingLongitudinal;
	},
	setMousewheelScrolling: function(onOff) { // for external/public use
	    if (onOff && this.observe && !this.mousewheelScrolling) {
            this.contentView.observe("mousewheel", this.eventMouseWheel);
    		this.contentView.observe("DOMMouseScroll", this.eventMouseWheel); // mousewheel for Firefox
    		this.scrollbar.observe("mousewheel", this.eventMouseWheel);
    		this.scrollbar.observe("DOMMouseScroll", this.eventMouseWheel); // mousewheel for Firefox
        } else if (!onOff && this.observe && this.mousewheelScrolling) {
            this.contentView.stopObserving("mousewheel", this.eventMouseWheel);
    		this.contentView.stopObserving("DOMMouseScroll", this.eventMouseWheel);
    		this.scrollbar.stopObserving("mousewheel", this.eventMouseWheel);
    		this.scrollbar.stopObserving("DOMMouseScroll", this.eventMouseWheel);
	    }
	    this.mousewheelScrolling = onOff;
	},
	startObserving: function() {
		if (this.observe) return;
		this.scrollbar.observe("mousedown", this.eventMouseDown);
		document.observe("mouseup", this.eventMouseUp);
		document.observe("mousemove", this.eventMouseMove);
		if (this.mousewheelScrolling) {
			this.contentView.observe("mousewheel", this.eventMouseWheel);
			this.contentView.observe("DOMMouseScroll", this.eventMouseWheel); // mousewheel for Firefox
			this.scrollbar.observe("mousewheel", this.eventMouseWheel);
			this.scrollbar.observe("DOMMouseScroll", this.eventMouseWheel); // mousewheel for Firefox
		}
		this.observe = true;
	},
	stopObserving: function() {
		if (!this.observe) return;
		this.scrollbar.stopObserving("mousedown", this.eventMouseDown);
		document.stopObserving("mouseup", this.eventMouseUp);
		document.stopObserving("mousemove", this.eventMouseMove);
		if (this.mousewheelScrolling) {
			this.contentView.stopObserving("mousewheel", this.eventMouseWheel);
			this.contentView.stopObserving("DOMMouseScroll", this.eventMouseWheel);
			this.scrollbar.stopObserving("mousewheel", this.eventMouseWheel);
			this.scrollbar.stopObserving("DOMMouseScroll", this.eventMouseWheel);
		}
		this.observe = false;
	},
	startDrag: function(event) {
		if (Event.isLeftClick(event) && !this.dragging) {
			// check if event is a click on the scrollbar besides the dragbar
			if (event.findElement() == this.scrollbar) {
				var clickPosition;
				if (this.vScroll)
					clickPosition = (Event.pointerY(event)-this.scrollbar.cumulativeOffset()[1]-(this.dragbar.getHeight()/2)) / this.scrollbar.getHeight();
				else
					clickPosition = (Event.pointerX(event)-this.scrollbar.cumulativeOffset()[0]-(this.dragbar.getWidth()/2)) / this.scrollbar.getWidth();
				
				this.scrollToNormalizedOffset(clickPosition);
			} else {
				this.dragging = true;
				if (this.vScroll) {
					this.startPointer = Event.pointerY(event);
					this.startScrollingAt = parseInt(this.content.getStyle("top"));
				} else {
					this.startPointer = Event.pointerX(event);
					this.startScrollingAt = parseInt(this.content.getStyle("left"));
				}
			}
		}
		Event.stop(event);
	},
	endDrag: function(event) {
		this.dragging = false;
		Event.stop(event);
	},
	updateDrag: function(event) {
		if (this.dragging) {
			if (this.vScroll)
				distance = this.startPointer - Event.pointerY(event);
			else
				distance = this.startPointer - Event.pointerX(event);
			
			var normalizedDistance = distance / this.scrollbarHeight;
			if (normalizedDistance > 1.0 || normalizedDistance < -1.0) return;
			
			this.scrollToOffset(this.startScrollingAt + (normalizedDistance * this.contentHeight));

			Event.stop(event);
		}
	},
	updateWheel: function(event) {
		if (this.vScroll)
			this.scroll(Event.wheel(event)*10);
		else
			this.scroll(Event.wheel(event)*10);
		Event.stop(event);
	},
	scroll: function(amount) { // expects a relative pixel distance of the content area, defining the view's top/left corner
		var contentOffset;
		if (this.vScroll)
			contentOffset = parseInt(this.content.getStyle("top"));
		else
			contentOffset = parseInt(this.content.getStyle("left"));
		
		contentOffset += amount;
		
		this.scrollToOffset(contentOffset);
	},
	scrollToOffset: function(contentOffset) { // expects an absolute negative pixel distance of the content area, defining the view's top/left corner
		if (this.vScroll) {
			this.contentViewHeight = this.contentView.getHeight();
			this.contentHeight = this.content.getHeight();
		} else {
			this.contentViewHeight = this.contentView.getWidth();
			this.contentHeight = this.content.getWidth();
		}
		
		if (this.contentViewHeight >= this.contentHeight)
		    contentOffset = 0;
		else
		    contentOffset = Math.max(Math.min(0, contentOffset), -(this.contentHeight - this.contentViewHeight));
		
		if (this.vScroll)
			this.content.setStyle({top: contentOffset+"px"});
		else
			this.content.setStyle({left: contentOffset+"px"});
		
		this.updateDragbar();
	},
	scrollToNormalizedOffset: function(contentOffset) { // expects a value between 0.0 and 1.0, defining the view's top/left corner
		if (this.vScroll)
			this.scrollToOffset(-(contentOffset*this.content.getHeight()));
		else
			this.scrollToOffset(-(contentOffset*this.content.getWidth()));
	}
});
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
});/*
 * a sidebar, depending on content
 */
 de.edirom.server.main.Sidebar = Class.create({
    
    SIDEBAR_WIDTH: 285,
    
    activeContent: null,    
    
    initialize: function(contentID) {
        
        this.id = contentID + '_sidebar';
        
        var VerticalScrollbarThickness = 4;
        
        this.SIDEBAR_WIDTH += VerticalScrollbarThickness;
        
        if ($('_sidebar'))
            $('_sidebar').writeAttribute({id: this.id});
        else
            $(contentID).insert({bottom: '<div class="sidebar" id="' + this.id + '"></div>'});
        
        $(this.id).style.width = '0px';
        
        this.contents = new Array();
        
        this.scrollview = new de.edirom.server.Scrollview(this.id, true);
        this.scrollview.setVerticalScrolling(true);
    },
    
    getId: function() {
        return id;
    },
 
    checkVisible: function() {
        return (this.activeContent != null);
    },
    
    getActiveContent: function() {
        return this.activeContent;
    },
 
    getContentContainerId: function() { // due to scrolling, "this.id" doesn't address the location of the content!
        return this.scrollview.vFrameInnerId;
    },
    
    addContent: function(content) {
        this.contents.push(content);
    },
    
    showContent: function(sidebarContent) {
        this.activeContent = sidebarContent;
        this.startSidebarExpandAnimation();
    },
    
    startSidebarExpandAnimation: function() {
        $(this.id).morph('width:' + this.SIDEBAR_WIDTH + 'px;', { duration: 0.8, queue: 'end', afterFinish: this.sidebarExpandAnimationFinished.bind(this) });
    },
    
    sidebarExpandAnimationFinished: function() {
        this.scrollview.refresh();
        this.activeContent.show();
        this.scrollview.refresh();
    },
    
    hideContent: function(sidebarContent) {
        this.activeContent = sidebarContent;
        this.startSidebarRetractAnimation();
    },
    
    startSidebarRetractAnimation: function() {
        $(this.id).morph('width:0px;', { duration: 0.8, queue: 'end', afterFinish: this.sidebarRetractAnimationFinished.bind(this) });
    },
    
    sidebarRetractAnimationFinished: function() {
        this.activeContent.hide();
        this.activeContent = null;
        
        if (this.showAfterHide != null) {
            this.showContent(this.showAfterHide);
            this.showAfterHide = null;
        }
    },
    
    toggleSidebarContent: function(sidebarContent) {
        if(this.activeContent == null) {
            //if there is no sidebar shown
            sidebarContent.requestShow();
            this.showContent(sidebarContent);
        } else if(this.activeContent == sidebarContent) {
            //if the sidebarContent handed over is already shown
            sidebarContent.requestHide();
            this.hideContent(sidebarContent);
        } else if(this.activeContent != null && sidebarContent == null) {
            //if the sidebarContent handed over is null the sidebar will hide
            this.activeContent.requestHide();
            this.hideContent(this.activeContent);
        } else {
            //if the sidebarContent handed over differs from the shown one
            this.activeContent.requestHide();
            sidebarContent.requestShow();
            this.showAfterHide = sidebarContent;
            this.hideContent(this.activeContent);
        }
    }
});
/*
 * the content of a sidebar
 */
 de.edirom.server.main.SidebarContent = Class.create({
    
    // Listeners of types de.edirom.server.main.VisibilityChangeRequestedListener and de.edirom.server.main.VisibilityChangedListener
    // have to be instantiated in subclasses (visibilityXListeners: new Array())
    visibilityChangeRequestedListeners: null,
    visibilityChangedListeners: null,
    
    initialize: function(sidebarId, sidebarContentId) {
        
        this.sidebar = sidebarId;
        this.id = sidebarContentId;
        this.loaded = false;
    
        if (!$(sidebarId))
            $(sidebarId).insert({bottom: '<div class="sidebarContent" id="' + this.id + '"></div>'});
        
        $(this.id).setStyle( { display: "none" } );
    },
    
    load: function() {
        this.loaded = true;
    },
    isLoaded: function() {
        return this.loaded;
    },
    
    requestHide: function() {
        this.visibilityChangeRequestedListeners.each(function(listener) {
            listener.visibilityChangeRequested(false);
        });
    },
    
    hide: function() {
        $(this.id).setStyle( { display: "none" } );
    },
    
    requestShow: function() {
        this.visibilityChangeRequestedListeners.each(function(listener) {
            listener.visibilityChangeRequested(true);
        }.bind(this));
    },
    
    show: function() {
        $(this.id).setStyle( { display: "block" } );
        
        if (this.visibilityChangedListeners) {
            this.visibilityChangedListeners.each(function(listener) {
                listener.visibilityChanged(true);
            }.bind(this));
        }
    },
    
    reload: function() {
    
    },
    
    addVisibilityChangeRequestedListener: function(listener) {
        this.visibilityChangeRequestedListeners.push(listener);
    },
    
    addVisibilityChangedListener: function(listener) {
        this.visibilityChangedListeners.push(listener);
    }
});
 /**
 * @fileOverview This file provides classes for a tab bar
 *
 * @author: <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
 * @version 1.0
 */
 
 de.edirom.server.main.TabBar = Class.create({
    
    initialize: function() {
        this.tabs = new Array();
    },
    
    /**
     * Adds a new tab to this bar
     *
     * @param {de.edirom.server.main.Tab} tab The tab to add
     */
    addTab: function(tab) {
        this.tabs.push(tab);

        if(this.tabs.length == 1)
            tab.activate();
        else
            tab.deactivate(true);
    },
    
    setActive: function(tab) {
        this.tabs.each(function(_tab) {
            if(_tab == tab)
                _tab.activate();
            else
                _tab.deactivate();
        });
    },
    
    getId: function() {
        return 'tabBoxItems';
    },
    hide: function() {
        $('objectTabBox').style.display = 'none';
        $('objectHeadFrame').style.height = '72px';
    },
    show: function() {
        $('objectTabBox').style.display = 'block';
        $('objectHeadFrame').style.height = '97px';
    }
});

/**
 * A tab
 * 
 * @param {de.edirom.server.main.TabBar} tabBar The tab bar the tab is in
 * @param {String} tabId The id of the tab
 * @param {String} contentId The id of the content element to show
 */
de.edirom.server.main.Tab = Class.create({
    initialize: function(tabBar, label, content) {
        this.active = false;
        this.tabBar = tabBar;
        this.label = label;
        
        this.content = content;
        
        this.id = 'tab_' + label;
        
        $(tabBar.getId()).insert({bottom: '<div id="' + this.id + '" class="ediromDetailTab">' + label + '</div>'});
        
        Event.observe($(this.id), 'click', this.tabClicked.bind(this));
    },
    
    tabClicked: function(e) {
        if(!this.active)
            this.tabBar.setActive(this);
    },
    
    /**
     * Activates this tab
     */
    activate: function() {
        
        if(this.active) return;
        
        this.active = true;
        
        this.content.setVisible(true);
        
        $(this.id).addClassName('activeTab');
    },
    
    /**
     * Deactivates this tab
     */
    deactivate: function(force) {
        
        if((typeof(force) != 'undefined' && !force) && !this.active) return;
        
        this.active = false;
        
        this.content.setVisible(false);
        
        $(this.id).removeClassName('activeTab');
    }
});
/* 
 *	Tabs Implementation
 *		uses Yetii tabs (see below), which is not based on Prototype
 *	Author: Markus Haupt
 *
 * Dependencies: Prototype (javascript framework from prototypejs.org), Util2.js
 * The current version works only with Firefox.
 */
 

//document.write('<link rel="stylesheet" type="text/css" href="tabs.css"></link>');


/*
 * The Tabs class creates a tab structure
 *
 * 'menuDivId' is the id of the tabs-menu
 * 'containerDivId' is the id of the container for the content-divs of the tabs
 *
 * All divs in the containerDiv are taken as initial tabs, where the title-attributes will be the names of the tabs.
 * You can add tabs dynamically with the "addTab"-function.
 *
 */
de.edirom.server.Tabs = Class.create({
	initialize: function(menuDivId, containerDivId, refreshOnDocumentResize) {
		this.contentContainerId = containerDivId;
		this.tabsBarContainerId = menuDivId;
		this.tabsBarId = menuDivId+'-nav';
		this.moveBackId = menuDivId+'-back';
		this.moveForId = menuDivId+'-for';
		
		this.tabContentClassName = "tabContent";
		this.tabLinkClassName = "tabLink";
		this.tabActiveLinkClassName = "tabActiveLink";
		
		$(this.tabsBarContainerId).insert({top: '\
<div id="'+this.moveBackId+'" class="tabBackButton" style="display:inline-block; float:left;"></div>\
<div style="display:inline-block; float:left; overflow:hidden">\
	<div id="'+this.tabsBarId+'" style="white-space:nowrap">\
	</div>\
</div>\
<div id="'+this.moveForId+'" class="tabForButton" style="display:inline-block; float: left;"></div>\
		'});
		
		$(this.moveBackId).observe('click', this.moveBack.bindAsEventListener(this));
		$(this.moveForId).observe('click', this.moveFor.bindAsEventListener(this));
		
		this.yetiiTabs = new Yetii({id: this.contentContainerId, tabsId: this.tabsBarId, tabclass: this.tabContentClassName, activeclass: this.tabActiveLinkClassName, callback: this.showTabLink.bind(this)});
		

		this.stdMoveOverhead = 10; // defines how much pixels a scroll action goes beyond showing only the (automatically) targeted tab
		this.overlapTolerance = 20; // defines how much pixels a tab can be outside of the view so that a scroll action targets the next tab yet (instead of only making making this slightly overlapped tab fully visible)
		this.stdMoveDuration = 0.5; // defines how much seconds one scrolling animation will take for 100 pixels
		this.moveDurationBounds = [0.3, 2.0]; //defines a lower and an upper bound of how much seconds one scrolling animation will take
		
		this.position = 0;

        if (refreshOnDocumentResize)
		    Event.observe(document.onresize ? document : window, 'resize', this.refreshMenu.bindAsEventListener(this));
		
		var existentTabContainers = $(this.contentContainerId).childElements();
		for (var i = 0; i < existentTabContainers.length; i++)
			this.addTab(existentTabContainers[i], false, true);
		
		this.unlocked = true;
	},
	refreshMenu: function() {
		this.navWidthPx = $(this.tabsBarContainerId).getWidth();

		if (this.getOffsetPositionOfTab(-1,"right") > this.navWidthPx) { // set scrolling on
			this.navWidthPx -= (getBoxModelWidth($(this.moveBackId), 'outer') + getBoxModelWidth($(this.moveForId), 'outer') + 2);
			$(this.moveBackId).show();
			$(this.moveForId).show();
		} else { // set scrolling off
			$(this.moveBackId).hide();
			$(this.moveForId).hide();
		}
		$(this.tabsBarId).ancestors()[0].setStyle({width: this.navWidthPx+"px"});
	},
	addTab: function(newTabContentDiv, label, alreadyInserted) {
	    
	    if (!label) {
	        var label;
	        if (newTabContentDiv.readAttribute("title"))
				label = newTabContentDiv.readAttribute("title");
			else
				label = "Tab " + ($(this.tabsBarId).childElements().length + 1);
		}
				
		newTabContentDiv.setStyle( { display: "none" } );
		newTabContentDiv.addClassName(this.tabContentClassName);
		
		if (!alreadyInserted)
		    $(this.contentContainerId).insert({bottom: newTabContentDiv});
		
		// tab link
		var newTabLink = new Element("div");
		newTabLink.setStyle( { display: "inline-block", cursor: "pointer" } );
		newTabLink.addClassName(this.tabLinkClassName);
		newTabLink.innerHTML = label;
		
		$(this.tabsBarId).insert({bottom: newTabLink});
		
		this.yetiiTabs.refresh();
		this.refreshMenu();
	},
	moveBack: function(event, distance) {
		if (!this.unlocked) return;
		
		if (!distance) {
		    var maxIndex = $(this.tabsBarId).childElements().length - 1;
            var i = 1;
    		while (i <= maxIndex && this.getOffsetPositionOfTab(i, 'left') < (this.position - this.overlapTolerance) ) i++;
		    this.showTabLink(i);
		    return;
		}
		
		duration = Math.min(this.moveDurationBounds[1], Math.max(this.moveDurationBounds[0], distance/100 * this.stdMoveDuration));
		
		var tooMuch = -Math.min(0, this.position - distance);
		var actualMoveDistance = distance - tooMuch;
		new Effect.Move(this.tabsBarId, { x: actualMoveDistance, y: 0, duration: duration, transition: Effect.Transitions.sinoidal, afterFinish: this.unlock.bind(this) });
		this.unlocked = false;
		this.position -= actualMoveDistance;
	},
	moveFor: function(event, distance) {
		if (!this.unlocked) return;
        
		if (!distance) {
		    var maxIndex = $(this.tabsBarId).childElements().length - 1;
            var i = 1;
    		while (i <= maxIndex && this.getOffsetPositionOfTab(i, 'right') < (this.position + $(this.tabsBarId).getWidth() + this.overlapTolerance) ) i++;
    		i++;
		    this.showTabLink(i);
		    return;
		}
		
		duration = Math.min(this.moveDurationBounds[1], Math.max(this.moveDurationBounds[0], distance/100 * this.stdMoveDuration));
		
		var upperBound = this.getOffsetPositionOfTab(-1) - $(this.tabsBarId).getWidth();
		var tooMuch = Math.max(upperBound, this.position + distance) - upperBound;
		var actualMoveDistance = distance - tooMuch;
		new Effect.Move(this.tabsBarId, { x: -actualMoveDistance, y: 0, duration: duration, transition: Effect.Transitions.sinoidal, afterFinish: this.unlock.bind(this) });
		this.unlocked = false;
		this.position += actualMoveDistance;
	},
	showTabLink: function(number) {
		var absPosition;
		if ( (absPosition = this.getOffsetPositionOfTab(number-1, "left")) < this.position ) {
			// move because left border of tab is not visible
			this.moveBack(false, -(absPosition - this.position) + this.stdMoveOverhead);
		} else if ( (absPosition = this.getOffsetPositionOfTab(number-1, "right")) > (this.position + $(this.tabsBarId).getWidth()) ) {
			// move because right border of tab is not visible
			this.moveFor(false, absPosition - $(this.tabsBarId).getWidth() - this.position + this.stdMoveOverhead);
		}
	},
	gotoTabNumber: function(number) {
	    this.yetiiTabs.show(number);
	},
	gotoTab: function(tabContentDiv) {
	    tabs = $(this.contentContainerId).childElements();
		for (var i = 0; i < tabs.length; i++) {
		    if (tabs[i] == tabContentDiv) {
		        this.gotoTabNumber(i+1);
		        break;
		    }
		}
	},
	getOffsetPositionOfTab: function(index, rightLeft) {
		tabs = $(this.tabsBarId).childElements();
		
		if (index < 0 || index > tabs.length-1)
			index = tabs.length-1;
		
		sum = 0;
		// first assume rightLeft is "right"
		for (var i = 0; i <= index; i++) {
			sum += getBoxModelWidth(tabs[i], "outer");
		}
		
		// now subtract the last tabs width if rightLeft is "left"
		if (rightLeft == "left")
			sum -= getBoxModelWidth(tabs[index], "outer");
		return sum;
	},
	unlock: function() {
		this.unlocked = true;
	}
});




/*
Yetii - Yet (E)Another Tab Interface Implementation
version 1.6
http://www.kminek.pl/lab/yetii/
Copyright (c) Grzegorz Wojcik
Code licensed under the BSD License:
http://www.kminek.pl/bsdlicense.txt
*/

function Yetii() {

	this.defaults = {
		
		id: null,
		tabsId: null,
		active: 1,
		interval: null,
		wait: null,
		persist: null,
		tabclass: 'tab',
		activeclass: 'active',
		callback: null,
		leavecallback: null
	
	};
	
	this.activebackup = null;
	
	for (var n in arguments[0]) { this.defaults[n]=arguments[0][n]; };	
	
	this.getTabs = function() {
        	
        var retnode = [];
        var elem = document.getElementById(this.defaults.id).getElementsByTagName('*');
		
        var regexp = new RegExp("(^|\\s)" + this.defaults.tabclass.replace(/\-/g, "\\-") + "(\\s|$)");
	
        for (var i = 0; i < elem.length; i++) {
        	  if (regexp.test(elem[i].className)) retnode.push(elem[i]);
        }
    
        return retnode;
    
    };

	this.show = function(number) {
      
		if (number < 1 || number > this.tabs.length) return;
		
      for (var i = 0; i < this.tabs.length; i++) {
			
			this.tabs[i].style.display = ((i+1)==number) ? 'block' : 'none';
				
			if ((i+1)==number) {
				this.addClass(this.links[i], this.defaults.activeclass);
			} else {
				this.removeClass(this.links[i], this.defaults.activeclass);
			}
		
		}
		
		
		if (this.defaults.leavecallback && (number != this.activebackup)) this.defaults.leavecallback(this.defaults.active);
		
		this.activebackup = number;
		
		
		this.defaults.active = number;
		
		if (this.defaults.callback) this.defaults.callback(number);
		
    
    };
	
	this.rotate = function(interval) {
    
        this.show(this.defaults.active);
        this.defaults.active++;
    
        if (this.defaults.active > this.tabs.length) this.defaults.active = 1;
    
	
        var self = this;
		
		if (this.defaults.wait) clearTimeout(this.timer2);
		 
        this.timer1 = setTimeout(function(){self.rotate(interval);}, interval*1000);
    
    };
	
	this.next = function() {

        var _target = (this.defaults.active + 1 > this.tabs.length) ? 1 : this.defaults.active + 1;
        this.show(_target);
        this.defaults.active = _target;

    };
	
	this.previous = function() {

        var _target = ((this.defaults.active - 1) == 0) ? this.tabs.length : this.defaults.active - 1;
        this.show(_target);
        this.defaults.active = _target; 

    };
	
	this.previous = function() {
		
		this.defaults.active--;
    	if(!this.defaults.active) this.defaults.active = this.tabs.length;
		this.show(this.defaults.active);
	
	};
	
	this.gup = function(name) {
		name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
		var regexS = "[\\?&]"+name+"=([^&#]*)";
		var regex = new RegExp( regexS );
		var results = regex.exec( window.location.href );
		if (results == null) return null;
		else return results[1];
	};
	
	this.parseurl = function(tabinterfaceid) {
		
		var result = this.gup(tabinterfaceid);
		
		if (result==null) return null;
		if (parseInt(result)) return parseInt(result); 
		if (document.getElementById(result)) {	
			for (var i=0;i<this.tabs.length;i++) {
				if (this.tabs[i].id == result) return (i+1);
			}
		}
		
		return null;
		
	};

	this.createCookie = function(name,value,days) {
		if (days) {
			var date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000));
			var expires = "; expires="+date.toGMTString();
		}
		else var expires = "";
		document.cookie = name+"="+value+expires+"; path=/";
	};
	
	this.readCookie = function(name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		}
		return null;
	};
	
	this.contains = function(el, item, from) {
		return el.indexOf(item, from) != -1;
	};
	
	this.hasClass = function(el, className){
		return this.contains(el.className, className, ' ');
	};
	
	this.addClass = function(el, className){
		if (!this.hasClass(el, className)) el.className = (el.className + ' ' + className).replace(/\s{2,}/g, ' ').replace(/^\s+|\s+$/g, '');
	};
	
	this.removeClass = function(el, className){
		el.className = el.className.replace(new RegExp('(^|\\s)' + className + '(?:\\s|$)'), '$1');
		el.className.replace(/\s{2,}/g, ' ').replace(/^\s+|\s+$/g, '');
	};

	this.refresh = function() {
    	this.links = document.getElementById(this.defaults.tabsId).getElementsByTagName('div');
    	this.tabs = this.getTabs();
    	
    	this.defaults.active = (this.parseurl(this.defaults.id)) ? this.parseurl(this.defaults.id) : this.defaults.active;
		if (this.defaults.persist && this.readCookie(this.defaults.id)) this.defaults.active = this.readCookie(this.defaults.id);  
		this.activebackup = this.defaults.active;
		this.show(this.defaults.active);
		
    	var self = this;
		for (var i = 0; i < this.links.length; i++) {
			if (this.links[i].customindex) continue;
			this.links[i].customindex = i+1;
			this.links[i].onclick = function(){
				if (self.timer1) clearTimeout(self.timer1);
				if (self.timer2) clearTimeout(self.timer2); 
				
				self.show(this.customindex);
				if (self.defaults.persist) self.createCookie(self.defaults.id, this.customindex, 0);
				
				if (self.defaults.wait) self.timer2 = setTimeout(function(){self.rotate(self.defaults.interval);}, self.defaults.wait*1000);
				
				return false;
			};
		 }
		 
		 if (this.defaults.interval) this.rotate(this.defaults.interval);
   };
   
   if (this.getTabs().length > 0)
       this.refresh();
	
};/**
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
de.edirom.areArraysEqual = function(array1, array2) {
    if(typeof(array1) != typeof(array2))
        return false;
        
    if(!array1[0] || !array2[0])
        return false;
        
    if(array1.length != array2.length)
        return false;
        
    var length = array1.length;
    for(var i = 0; i < length; i++) {
        if(array1[i] !== array2[i])
            return false;
    }
    
    return true;
}

de.edirom.closeWindow = function() {
    window.status = 'edirom:de.edirom.server:closeWindow';
}

de.edirom.checkChanged = function(elemId) {
    
    if(!$(elemId) || !$('old_' + elemId))
        return false;
    
//	console.log($(elemId).value + ' eq ' + $('old_' + elemId).value + '?');

    if($(elemId).value == $('old_' + elemId).value)
        return false;
        
    return true;
}

de.edirom.getPositionOnPage = function(obj) {
    var left = obj.offsetLeft;
    var top = obj.offsetTop;
    
    if(obj.offsetParent) {
        while(obj = obj.offsetParent) {
            left += obj.offsetLeft;
            top += obj.offsetTop;
        }
    }
    
    return [left, top];
}

de.edirom.changeActiveTab = function(tabId, contentId) {
	var tabs = document.getElementById(tabId).parentNode.childNodes;
	for(var i = 0; i < tabs.length; i++) {
		if(typeof tabs[i].removeClassName != 'undefined')
		    tabs[i].removeClassName('activeTab');
    }
		
	var contents = document.getElementById("ediromDetail").childNodes;
	for(var i = 0; i < contents.length; i++) {
		if(contents[i].className && contents[i].className.indexOf("ediromDetailContent") != -1)
			contents[i].style.display = "none";
	}
		
	document.getElementById(contentId).style.display = "block";
	
	document.getElementById(tabId).addClassName('activeTab');
}


de.edirom.ImportListener = function(script, func) {
    var self = this;
    var scriptLoaded = false;
    var unique = 'scriptLoaded_' + (new Date()).getTime();
    
    this.scriptLoaded = function() {
    
        if(scriptLoaded)
            return;
        
        scriptLoaded = true;
        Ajile.RemoveImportListener(eval(unique));

        func();
    }
    
    window[unique] = self.scriptLoaded;
    Ajile.AddImportListener(eval(unique));
}

de.edirom.WindowResize = function() {
    var self = this;
    
    var width;
    var height;
    
    var listeners = new Array();
    
    window.onresize = resize;
    width = getWidth();
    height = getHeight();
    
    function resize() {
        
        if(width != getWidth() || height != getHeight()) {
            width = getWidth();
            height = getHeight();

            for(var i = 0; i < listeners.length; i++)
                listeners[i]();
        }
    }
    
    function getWidth() {
        if(window.innerWidth)
            return window.innerWidth;
        
        else if (document.body && document.body.offsetWidth)
            return document.body.offsetWidth;
        
        return 0;
    }
    
    function getHeight() {
        if(window.innerHeight)
            return window.innerHeight;
        
        else if (document.body && document.body.offsetHeight)
            return document.body.offsetHeight;
        
        return 0;
    }
    
    this.addListener = function(func) {
        if(listeners.indexOf(func) == -1)
            listeners.push(func);
    }
    
    this.removeListener = function(func) {
        if(listeners.indexOf(func) != -1)
            listeners = listeners.without(func);
    }
}

var windowResize = new de.edirom.WindowResize();

/*
* Orginal: http://adomas.org/javascript-mouse-wheel/
* prototype extension by "Frank Monnerjahn" <themonnie@gmail.com>
*/
Object.extend(Event, {
    wheel: function (event) {
        var delta = 0;
        if (! event) event = window.event;
        if (event.wheelDelta) {
            delta = event.wheelDelta / 120;
            if (window.opera) delta = - delta;
        } else if (event.detail) {
            delta = - event.detail / 3;
        }
        return Math.round(delta);
        //Safari Round
    }
});






// TODO: aufräumen



function checkContentNotEmpty(elem) {

	if(elem.value.strip().length == 0) 
		return false;
	
	else
	    return true;
}

function requestFocus(elem) {
	$(elem).focus();
	$(elem).select();
}


var popup;

function openPopup(_message, _okButton, _cancelButton, _okFunc) {
    popup = new Popup(_message, _okButton, _cancelButton, _okFunc);
    popup.showPopup();
}

function Popup(_message, _okButton, _cancelButton, _okFunc) {
    var self = this;
    
    var width = 350;
    var height = 130;
    
    var message = _message;
    
    var okButton = _okButton;
    var cancelButton = _cancelButton;
    
    var okFunc = _okFunc + ';';
    
    this.showPopup = function() {
        Event.observe(window, 'keyup', handleKeys);
    
    	if(!$('popup_background')) {
    		var popup_background = document.createElement('div');
    		popup_background.id = 'popup_background';
    		popup_background.style.position = 'fixed';
    		
    		popup_background.style.top = '0px';
    		popup_background.style.left = '0px';
    		popup_background.style.bottom = '0px';
    		popup_background.style.right = '0px';
    		
    		popup_background.style.backgroundColor = '#000000';
    		popup_background.style.opacity = '0.5';
    		
    		popup_background.style.zIndex = '9000';
    		
    		document.getElementsByTagName('body')[0].appendChild(popup_background);
    	}
    	
    	if(!$('popup')) {
    		var popup = document.createElement('div');
    		popup.id = 'popup';
    		popup.style.position = 'fixed';
    		
    		popup.style.width = width + 'px';
    		popup.style.height = height + 'px';
    		
    		popup.style.top = '50%';
    		popup.style.left = '50%';
    		
    		popup.style.marginLeft = '-' + Math.round(width / 2) + 'px';
    		popup.style.marginTop = '-' + Math.round(height / 2) + 'px';
    		
    		popup.style.backgroundColor = '#eeeeee';
    		
    		popup.style.zIndex = '9001';
    
            var text = '<div style="position:absolute; top:20px; left:20px; right:20px; bottom:50px;">'
                        + message
                     + '</div>';
                     
    		var buttons = '<div style="position:absolute; bottom:10px; right:10px;" class="saveBox">'
    		                + '<span class="saveBoxButton" onclick="popup.closePopup();">' + cancelButton + '</span>'
    		                + '<span class="saveBoxButton" onclick="popup.closePopup();' + okFunc + '">' + okButton + '</span>'
    		            + '</div>';
    		popup.innerHTML = text + buttons;
    		
    		document.getElementsByTagName('body')[0].appendChild(popup);
    	}
    }
    
    this.closePopup = function() {
        Event.stopObserving(window, 'keyup', handleKeys);
    
        var parent = $('popup').parentNode;
        parent.removeChild($('popup'));
        parent.removeChild($('popup_background'));
    }
    
    var handleKeys = function(e) {
        if(e.keyCode == Event.KEY_RETURN) {
            self.closePopup();
            eval(okFunc);
        }
        
        if(e.keyCode == Event.KEY_ESC)
            self.closePopup();
    }
}

/* getWidth() and getHeight() for different options of the CSS2 box-model
 *		possible values for 'outmostBorder' are: 'content'/'inner', 'padding', 'border'/'native' and 'margin'/'outer'
 *	 NOTICE: this functions require that all relevant dimension data has been assigned in pixels ('px')
 */
function getBoxModelWidth(element, outmostBorder)
{
	// get 'content + padding + border'
	var width = element.getWidth();
	
	if (outmostBorder == "padding" || outmostBorder == "content" || outmostBorder == "inner")
	{
		// reduce to 'content + padding'
		width -= getCssIntAttr(element,"border-left-width") + getCssIntAttr(element,"border-right-width");
		
		if (outmostBorder == "content" || outmostBorder == "inner")
		{
			// reduce to 'content'
			width -= getCssIntAttr(element,"padding-left") + getCssIntAttr(element,"padding-right");
		}
	}
	else if (outmostBorder == "margin" || outmostBorder == "outer")
	{
		// extend to 'content + padding + border + margin'
		width += getCssIntAttr(element,"margin-left") + getCssIntAttr(element,"margin-right");
	}
	return width;
}

function getBoxModelHeight(element, outmostBorder)
{
	// get 'content + padding + border'
	var height = element.getHeight();
	
	if (outmostBorder == "padding" || outmostBorder == "content" || outmostBorder == "inner")
	{
		// reduce to 'content + padding'
		height -= getCssIntAttr(element,"border-top-width") + getCssIntAttr(element,"border-bottom-width");
		
		if (outmostBorder == "content" || outmostBorder == "inner")
		{
			// reduce to 'content'
			height -= getCssIntAttr(element,"padding-top") + getCssIntAttr(element,"padding-bottom");
		}
	}
	else if (outmostBorder == "margin" || outmostBorder == "outer")
	{
		// extend to 'content + padding + border + margin'
		height += getCssIntAttr(element,"margin-top") + getCssIntAttr(element,"margin-bottom");
	}
	return height;
}

function getCssIntAttr(element, attrName)
{
	if (isNaN(parseInt(element.getStyle(attrName))))
		return 0;
	else
		return parseInt(element.getStyle(attrName));
}


// returns the first element hit by cssSelector that takes its space on the display (if visible or not)
function firstDisplayed(parentElem, cssSelector)
{
    var hitElems = parentElem.select(cssSelector);
    for (var i = 0; i < hitElems.length; i++) {
        if (hitElems[i].getStyle("display") != "none")
            return hitElems[i];
    }
    return null;
}

// uses the function firstDisplayed() to return a boolean if min. 1 element has been found
function displayedExists(parentElem, cssSelector)
{
    if(firstDisplayed(parentElem, cssSelector) != null)
        return true;
    else
        return false;
}



function validateXQueryDate(inputString) {
    // the XQuery dateTime format is YYYY-MM-DD
    
    arr = inputString.split("-");
    
    if (arr.length != 3 || arr[0].length > 4 || arr[1].length > 2 || arr[2].length > 2)
        return false;
    
    if (parseInt(arr[0]) == NaN || parseInt(arr[1]) == NaN || parseInt(arr[2]) == NaN)
        return false;
    
    monthMaxDays = new Array(31, 30, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
    
    if (arr[0] < 1 || arr[1] < 1 || arr[1] > 12 || arr[2] < 1 || arr[2] > monthMaxDays[parseInt(arr[1]) - 1])
        return false
    
    return formatNumberString("0000-11-22", arr);
}

// builds a new string from signature, where the numbers in the signature are replaced by the corresponding array content (right-aligned)
// example: when signature is "00-11-2222" and inputArray is ["12", "3456", "78"] then the output string will be "12-56-0078"
function formatNumberString(signature, inputArray)
{
    var outputString = signature;
    
    var c;
    var content;
    var x;
    var newChar;
    
    // for every element in inputArray
    for (var i = 0; i <= 9; i++) {
        content = '';  // let content be a string
        if (i < inputArray.length)
            content += inputArray[i];
        
        x = content.length - 1;
        // for every digit in signature
        for (var j = signature.length - 1; j >= 0; j--) {
            c = signature.charAt(j);
            if (parseInt(c) == i) {
                // replace the character
                if (x >= 0) {
                    // replace with array content
                    newChar = content.charAt(x);
                    x --;
                } else {
                    // replace with '0'
                    newChar = '0';
                }
                outputString = replaceCharInString(outputString, j, newChar);
            }
        }
    }
    
    return outputString;
}

function replaceCharInString(str, index, newChar) {
    var out = '';
    
    if (index > 0)
        out += str.substring(0, index);
    
    out += newChar;
    
    if (index < str.length-1)
        out += str.substring(index+1, str.length);
    
    return out;
}



/*
 * Orginal: http://adomas.org/javascript-mouse-wheel/
 * prototype extension by "Frank Monnerjahn" themonnie @gmail.com
 */
Object.extend(Event, {
        wheel:function (event){
                var delta = 0;
                if (!event) event = window.event;
                if (event.wheelDelta) {
                        delta = event.wheelDelta/120;
                        if (window.opera) delta = -delta;
                } else if (event.detail) { delta = -event.detail/3;     }
                return delta;
        }
});/**
 * A class that provides an abstract view (to be used by Info, Facsimile, XML, etc.)
 * @class {abstract} de.edirom.server.main.View
 * @author <a href="mailto:roewenstrunk@edirom.de">Daniel R�wenstrunk</a>
 */
 de.edirom.server.main.View = Class.create({
    initialize: function(module, title) {
        this.module = module;
        this.active = false;
        
        this.id = 'view_' + (new Date).getTime();
        while($(this.id) != null)
            this.id = 'view_' + (new Date).getTime();
        
        $('viewSwitch').insert({bottom: '<div class="viewSwitchButton" id="switch_' + this.id + '">' + title + '</div>'})

        $('ediromObject').insert({bottom: '<div id="' + this.id + '" />'});
        $(this.id).hide();
        
        this.tabBar = new de.edirom.server.main.TabBar();
        
        this.contents = new Array();
        
        Event.observe($('switch_' + this.id), 'click', this.switchClicked.bind(this));
    },
    
    switchClicked: function(e) {
        if(!this.active)
            this.module.setActiveView(this);
    },
    
    addContent: function(content) {
        this.contents.push(content);
    },
    
    addContentWithTab: function(content, label) {
    
        this.addContent(content);
    
        this.tabBar.addTab(new de.edirom.server.main.Tab(this.tabBar, label, content));
    },
    
    setActive: function(active) {
        
        this.active = active;
        
        if(active) {
            $('switch_' + this.id).addClassName('active');
            $(this.id).show();
        }else {
            $('switch_' + this.id).removeClassName('active');
            $(this.id).hide();
        }
   },
   
   isActive: function() {
       return this.active;
   },
   
   getModule: function() {
       return this.module;
   },
   
   getActiveContentKey: function() {
       var activeContent;
        for(var i = 0; i < this.contents.size(); i++) {
            if(this.contents[i].isActive())
                activeContent = this.contents[i];
        }
        
        if(typeof(activeContent) != 'undefined') {
            return activeContent.getKey();
        }
    
        return "";
   }
});/*
 * the VisibilityChangeRequestedListener calls a function when the visibility status of an element is about to change
 */
de.edirom.server.main.VisibilityChangeRequestedListener = Class.create({
 
     initialize: function(visibilityChangeRequestedFunc) {
         this.visibilityChangeRequested = visibilityChangeRequestedFunc;
     } 
});

/*
 * the VisibilityChangedListener calls a function when the visibility status of an element has completely changed
 */
de.edirom.server.main.VisibilityChangedListener = Class.create({
 
     initialize: function(visibilityChangedFunc) {
         this.visibilityChanged = visibilityChangedFunc;
     } 
});
    var buttonsEnabled = true;

function createNewObject(uri) {
	buttonsEnabled = false;

	window.location.href = uri;
}

function getSelectedOption() {
	return document.getElementById('objectTypes').value;
}

function dataListener(command) {

}if(typeof(console) == 'undefined' || typeof(console.log) == 'undefined') {
    
    console = {}
    
    console.log = function(message){
        alert(message);
    }
}


/**
 * calculates the objects position on the browser window
 * 
 * @param {Element} obj The element
 */
de.edirom.server.main.getPositionOnPage = function(obj) {
    var left = obj.offsetLeft;
    var top = obj.offsetTop;
    
    if(obj.offsetParent) {
        while(obj = obj.offsetParent) {
            left += obj.offsetLeft;
            top += obj.offsetTop;
        }
    }
    
    return [left, top];
}

/**
 * Opens an ajax request to the comet servlet, to get actual data modifications
 * 
 * @param {Function} success The function to execute on success
 * @param {Function} failure The function to execute on failure
 */
de.edirom.server.main.registerCometListener = function(success, failure, lastEvent) {
    
    new Ajax.Request('/comet/', {
    	method:'get',
    	parameters: {lastEvent:lastEvent},
    	onSuccess: function(transport) {
    	    
    	    var resp = transport.responseText;
            
            resp = resp.strip();
            
            var tokens = resp.split(':');
            var lastEvent = -1;
            if(tokens[0] == "lastEvent") {
                lastEvent = tokens[1];
                resp = resp.substring("lastEvent:".length + tokens[1].length + ":".length);
            }

            de.edirom.server.main.registerCometListener(success, failure, (lastEvent == -1?null:lastEvent));

            de.edirom.server.main.logger.debug('new comet registered');

            success(resp);
            
            de.edirom.server.main.logger.debug('comet success function finished');
    	},
    	onFailure: function(transport) {
    	    failure();
            
            //TODO: Hier sollten u.U. noch zwei weitere Versuche unternommen werden
            // der Benutzer muss dann die Möglichkeit bekommen, manuell weitere Versuche zu starten
            //de.edirom.server.main.registerCometListener(success, failure, lastEvent);
    	}
    });
}

de.edirom.server.main.Logger = function(module, level) {
        
    this.TRACE = 0;
    this.DEBUG = 1;
    this.INFO = 2;
    this.WARN = 3;
    this.ERROR = 4;
    this.FATAL = 5;
    
    this.module = module;
    
    this.level = level ? level : this.TRACE;
        
    var log = function(level, message) {
    
        new Ajax.Request('/logger/', {
    	    method:'get',
    	    parameters: {level:level,
    	                 module:this.module,
    	                 message:message}
    	});
    }
        
    this.trace = function(message) {
        if(this.level <= this.TRACE)
            log('trace', message);
    }
    
    this.debug = function(message) {
        if(this.level <= this.DEBUG)
            log('debug', message);
    }
    
    this.info = function(message) {
        if(this.level <= this.INFO)
            log('info', message);
    }
    
    this.warn = function(message) {
        if(this.level <= this.WARN)
            log('warn', message);
    }
    
    this.error = function(message) {
        if(this.level <= this.ERROR)
            log('error', message);
    }
    
    this.fatal = function(message) {
        if(this.level <= this.FATAL)
            log('fatal', message);
    }
}

de.edirom.server.main.logger = new de.edirom.server.main.Logger('main');

/**
 * Opens a dialog with predefined button labels for a "delete"-question
 * 
 * @param {String} message The question the dialog should display
 * @param {Array} options An array of options. Possible options are:
 * cancelFunc: the function to call, if the cancel button is hit (ESC) and
 * deleteFunc: the function to call, if the delete button is hit (RETURN)
 */
de.edirom.server.main.deleteItem = function(message, options) {
    options['firstButton'] = 'Nein';
    options['secondButton'] = 'Ja';
    options['firstFunc'] = options['cancelFunc'];
    options['secondFunc'] = options['deleteFunc'];
    
    (new de.edirom.server.main.Popup(message, options)).showPopup();
}


/**
 * A Popup with two buttons
 * @class A popup dialog
 * 
 * @param {String} _message The message the dialog should display
 * @param {Array} _options An array of options. Possible options are:
 * firstButton: the text for the first button,
 * firstFunc: the function to call, if the first button is hit (ESC),
 * secondButton: the text for the first button and
 * secondFunc: the function to call, if the second button is hit (RETURN)
 */
de.edirom.server.main.Popup = function(_message, _options, _title, _detailedMessage) {

    var self = this;
        
    var message = _message;
    var options = _options;
    var title = _title;
    var detailedMessage = _detailedMessage;
    
    var firstButton = options['firstButton']?options['firstButton']:'Abbrechen';
    var firstFunc = options['firstFunc']?options['firstFunc']:';';
    var secondButton = options['secondButton']?options['secondButton']:'Bestätigen';
    var secondFunc = options['secondFunc']?options['secondFunc']:';';
    
    var firstButtonVisible = options['firstButtonVisible']?options['firstButtonVisible']:'true';
    var secondButtonVisible = options['secondButtonVisible']?options['secondButtonVisible']:'true';
    
    
    /**
     * Creates a popup if needed and sets it's visibility to visible 
     */
    this.showPopup = function() {
    
    	if(!$('popup_background')) {
    		var popup_background = document.createElement('div');
    		popup_background.id = 'popup_background';
    		    		
    		document.getElementsByTagName('body')[0].appendChild(popup_background);
    	}
    	
    	if(!$('popup')) {
    		var popup = document.createElement('div');
    		popup.id = 'popup';
    		
            var header = (typeof(title) != 'undefined')?'<h1>' + title + '</h1>':'<h1>Hinweis</h1>';
            
            var text = '<div id="popupMessage">'
                        + message
                     + '</div>';
                     
            var details = (typeof(detailedMessage) != 'undefined')?'<div id="popupDetails">' + detailedMessage + '</div>':'';                 
            
    		var buttons = '<div id="popupButtons" class="saveBox">'
    		                + '<span id="Popup_firstButton" class="saveBoxButton">' + firstButton + '</span>'
    		                + '<span id="Popup_secondButton" class="saveBoxButton">' + secondButton + '</span>'
    		            + '</div>';
    		popup.innerHTML = header + text + details + buttons;
    		
    		document.getElementsByTagName('body')[0].appendChild(popup);
    	}
    	
    	if(firstButtonVisible == 'true') $('Popup_firstButton').show();
    	else $('Popup_firstButton').hide();

        if(secondButtonVisible == 'true') $('Popup_secondButton').show();
    	else $('Popup_secondButton').hide();
    	
        Event.observe(window, 'keyup', handleKeys);
        Event.observe($('Popup_firstButton'), 'click', firstButtonClick);
        Event.observe($('Popup_secondButton'), 'click', secondButtonClick);
    }
    
    /**
     * Closes an existing popup and unregisters listeners
     * @function
     */
    var closePopup = function() {
        Event.stopObserving(window, 'keyup', handleKeys);
        Event.stopObserving($('Popup_firstButton'), 'click', firstButtonClick);
        Event.stopObserving($('Popup_secondButton'), 'click', secondButtonClick);
    
        var parent = $('popup').parentNode;
        parent.removeChild($('popup'));
        parent.removeChild($('popup_background'));
    }
    
    /**
     * Handles ESC and RETURN keys
     * @function
     *
     * @param {Object} e The event which invoked this method
     */
    var handleKeys = function(e) {
        if(e.keyCode == Event.KEY_RETURN)
            secondButtonClick();
        
        if(e.keyCode == Event.KEY_ESC)
            firstButtonClick();
    }
    
    /**
     * Code to run, when first button is clicked
     * @function
     */
    var firstButtonClick = function() {
        closePopup();
        
        if(typeof(firstFunc) == 'function')
            firstFunc();
        else
            eval(firstFunc);
    }
    
    /**
     * Code to run, when second button is clicked
     * @function
     */
    var secondButtonClick = function() {
        closePopup();
        
        if(typeof(secondFunc) == 'function')
            secondFunc();
        else
            eval(secondFunc);
    }
    
    return self;
}
/** 
 * @description		Prototype.js based simple context menu
 * @author        Juriy Zaytsev; kangax [at] gmail [dot] com; http://thinkweb2.com/projects/prototype/
 * @version       0.71
 * @date          4/17/09
 * @requires      prototype.js 1.6+
*/

if (Object.isUndefined(Proto)) { var Proto = { } }

Proto.Menu = Class.create((function(){
  
  var e = Prototype.emptyFunction;
  var isIE = Prototype.Browser.IE;
  
  var defaultOptions = {
		selector: '.contextmenu',
		className: 'protoMenu',
		pageOffset: 25,
		fade: false,
		zIndex: 100,
		beforeShow: e,
		beforeHide: e,
		beforeSelect: e
	};
	
	var isContextMenuSupported = (function(el){
	  el.setAttribute('oncontextmenu', '');
	  var result = typeof el.oncontextmenu == 'function';
	  el = null;
	  return result;
	})(document.createElement('div'));
	
  return {
    initialize: function() {
  		this.options = Object.extend(Object.clone(defaultOptions), arguments[0] || { });
  		this.shim = new Element('iframe', {
  			style: 'position:absolute;filter:progid:DXImageTransform.Microsoft.Alpha(opacity=0);display:none',
  			src: 'javascript:false;',
  			frameborder: 0
  		});
  		this.options.fade = this.options.fade && !Object.isUndefined(Effect);
  		this.container = new Element('div', {
  		  className: this.options.className, 
  		  style: 'display:none'
  		})
  		.observe('contextmenu', Event.stop)
  		.observe('click', this.onClick.bind(this));
  		var list = new Element('ul');
  		this.options.menuItems.each(function(item) {
  			list.insert(
  				new Element('li', {className: item.separator ? 'separator' : ''}).insert(
  					item.separator 
  						? '' 
  						: Object.extend(new Element('a', {
  							href: '#',
  							title: item.name,
  							className: (item.className || '') + (item.disabled ? ' disabled' : ' enabled')
  						}), { _callback: item.callback })
  						.update(item.name)
  				)
  			)
  		}.bind(this));
  		$(document.body).insert(this.container.insert(list).observe('contextmenu', Event.stop));
  		isIE && $(document.body).insert(this.shim);
  		document.observe('click', function(e) {
  			this.hide(e);
  		}.bind(this));


        $$(this.options.selector).invoke('observe', isContextMenuSupported ? 'contextmenu' : 'click', function(e){
  			if (!isContextMenuSupported && !e.ctrlKey) {
  				return;
  			}
  			this.show(e);
  		}.bind(this));
  	},
  	show: function(e) {
  		e.stop();
  		
  		if(typeof window.contextmenu != 'undefined' && window.contextmenu != null)
  		    window.contextmenu.hide(e);
  		
  		window.contextmenu = this;
  		
  		this.options.beforeShow(e);
  		var x = Event.pointer(e).x,
  			y = Event.pointer(e).y,
  			vpDim = document.viewport.getDimensions(),
  			vpOff = document.viewport.getScrollOffsets(),
  			elDim = this.container.getDimensions(),
  			elOff = {
  				left: ((x + elDim.width + this.options.pageOffset) > vpDim.width 
  					? (vpDim.width - elDim.width - this.options.pageOffset) : x) + 'px',
  				top: ((y - vpOff.top + elDim.height) > vpDim.height && (y - vpOff.top) > elDim.height 
  					? (y - elDim.height) : y) + 'px'
  			};
  		this.container.setStyle(elOff).setStyle({zIndex: this.options.zIndex});
  		if (isIE) { 
  			this.shim.setStyle(Object.extend(Object.extend(elDim, elOff), {zIndex: this.options.zIndex - 1})).show();
  		}
  		this.options.fade ? Effect.Appear(this.container, {duration: 0.25}) : this.container.show();
  		this.event = e;
  	},
  	hide: function(e) {
  	    if (this.container.visible()) {// && !e.isRightClick()) {
  			this.options.beforeHide(e);
  			if (isIE) this.shim.hide();
  			this.container.hide();
  			
  			window.contextmenu = null;
		}
  	},
  	onClick: function(e, el) {
  	  if ((el = e.findElement('li a')) && el.descendantOf(this.container)) {
  	    e.stop();
  	    if (el._callback && !el.hasClassName('disabled')) {
    			this.options.beforeSelect(e, el);
    			if (isIE) this.shim.hide();
    			this.container.hide();
    			el._callback(this.event);
    		}
  	  }
  	}
  }
})());