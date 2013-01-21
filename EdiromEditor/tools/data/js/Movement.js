/**
 * @fileOverview A movement
 *
 * @author: <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
 * @version 1.0
 */
 
/** @namespace The namespace for the data model */
if(typeof de.edirom.server.data == 'undefined')
    de.edirom.server.data = {}

de.edirom.server.data.Movement = Class.create({
     initialize: function(movementID, name, source) {
         
        this.id = movementID;         
        this.name = name;
        this.source = source;
         
        this.bars = new de.edirom.server.main.LinkedHashMap();
         
        this.listeners = new Array();
     },
     
/**COMMANDS****************************************/

    addObject: function(list, object){
        
        switch(list){
            case 'bars': this.addBar(object); break;
        }
    },
    
    removeObject: function(list, object){
        
        switch(list){
            case 'bars': this.removeBar(object); break;
        }
    },
    
    moveObject: function(list, objectID, movedAfter){
        
        switch(list){
            case 'bars': this.moveBar(objectID, movedAfter); break;
        }
    },
    
    getPrecedingObjectID: function(list, objectId) {
    
        switch(list){
            case 'bars': return (this.bars.getPrevious(objectId) == null)?null:this.bars.getPrevious(objectId).id; break;           
        }
    },

    getField: function(field){
        switch(field){
            case 'name': this.getName(); break;
        }
    },
    
    setField: function(field, value){
        
        switch(field){
            case 'name': this.setName(value); break;
        }
    },

    getXQueryUpdate: function(field, value){
    
        switch(field){
            case 'name': return 'update value $mei/id("' + this.id + '")/@n with "' + value + '"'; break;
        }
    },
    
    getXQueryUpdateList: function(mode, list, object, movedAfter) {
        
        switch(mode) {
            case 'add': {
                switch(list) {
                
                    case 'bars': return 'if(not($mei/id("' + this.id + '")[.//measure/id("' + object.id + '")])) then('
                                        + 'if($mei/id("' + this.id + '")[not(./score)]) then('
                                        + 'update insert <score><section/></score> into $mei/id("' + this.id + '")'
                                        + ') else(), '
                                        + 'update insert <zone xml:id="' + object.facs + '" type="measure" ulx="' + object.getLeft() + '" uly="' + object.getTop() 
                                        + '" lrx="' + Math.max(object.getLeft() + object.getWidth(), -1) + '" lry="' + Math.max(object.getTop() + object.getHeight(), -1) 
                                        + '"/> into $mei/id("' + object.surface + '"), '
                                        + 'update insert '
                                        + '<measure xml:id="' + object.id + '" n="' + object.getName() + '" facs="#' + object.facs + '" ' + (object.getUpbeat()?'type="upbeat"':'') + '>'
                                        + (object.getRest() == 1?'<staff><layer><mRest/></layer></staff>':'')
                                        + (object.getRest() > 1?'<staff><layer><multiRest num="' + object.getRest() + '"/></layer></staff>':'')
                                        + '</measure> into $mei/id("' + this.id + '")/score/section[last()]'
                                        + ') else()';
                }
            } break;
            
            case 'move': {
                switch(list) {
                    case 'bars': 
                    
                        if(movedAfter == null)
                            return '('
                                    + 'let $' + object + ' := util:deep-copy($mei/id("' + object + '")) '
                                    + 'return ('
                                    + 'update delete $mei/id("' + object + '"), '
                                    + 'update insert $' + object + ' preceding $mei/id("' + this.id + '")//measure[1]'
                                    + '))';

                        else
                            return '('
                                    + 'let $' + object + ' := util:deep-copy($mei/id("' + object + '")) '
                                    + 'return ('
                                    + 'update delete $mei/id("' + object + '"), '
                                    + 'update insert $' + object + ' following $mei/id("' + movedAfter + '")'
                                    + '))';
                                
                        break;
                    
                    
                    
                    return ''
                }
            } break;
            
            case 'remove': {
                switch(list) {
                    case 'bars': return '('
                                         + 'update delete $mei/id($mei/substring-after(id("' + object + '")/@facs,"#")), '
                                         + 'update delete $mei/id("' + object + '")'
                                         + ')'; break;                    
                }
            } break;
        }
    },
    
/**LISTENERS***************************************/
    
    addListener: function(listener) {
        this.listeners.push(listener);
    },
     
    removeListener: function(listener) {
        this.listeners = this.listeners.without(listener); 
    },
    
    fireEvent: function(event) {
        this.listeners.each(function(listener) {
            //TODO: Checken, ob das wirklich DataListener ist
            listener.eventFired(event);
        });
    },

/**METADATA****************************************/

    setName: function(name) {
        if(this.name == name) return;
        
        this.name = name;
        this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_MODIFIED, "name", this.name));
    },
    
    getName: function() {
        return this.name;
    },
    
/**BARS***************************************/
        
    addBar: function(bar) {
        if(!this.bars.containsKey(bar.id)) {
            this.bars.pushElement(bar.id, bar);
            
            this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_ADDED, "bar", bar.id));
            
            if(bar.getPartId() != this.id)
                bar.setPartId(this.id);

            return true;
        }
        
        return false;
    },
    
    removeBar: function(barID) {
        if(this.bars.containsKey(barID)) {
            
            this.bars.remove(barID)
            this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_REMOVED, "bar", barID));
            
            return true;
        }
        
        return false;
    },
    
    moveBar: function(barID, movedAfter) {
        if(this.bars.containsKey(barID)) {
            var bar = this.getBar(barID);
            this.bars.remove(barID);
            this.bars.insert(movedAfter, bar.id, bar);
            
            this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_MODIFIED, "bars", barID));
            return true;
        }
        
        return false;
    },
    
    getBar: function(barID) {
                        
        if(this.bars.containsKey(barID)) {
            return this.bars.get(barID);
        }
        
        return false;
    },
        
    getBarAfter: function(barID) {
                        
        if(this.bars.containsKey(barID)) {
            return this.bars.getNext(barID);
        }
        
        return false;
    },
    
    getBarBefore: function(barID) {
                        
        if(this.bars.containsKey(barID)) {
            return this.bars.getPrevious(barID);
        }
        
        return false;
    },

    getBars: function() {
        return this.bars.values();
    },
    
    countBars: function() {
        return this.bars.length;
    },

    getFirstBar: function() {
        return this.bars.getFirst();    
    },
    
    getLastBar: function() {
        return this.bars.getFirst();    
    }
 });