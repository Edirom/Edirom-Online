/**
 * @fileOverview A bar
 *
 * @author: <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
 * @version 1.0
 */
 
/** @namespace The namespace for the data model */
if(typeof de.edirom.server.data == 'undefined')
    de.edirom.server.data = {}

de.edirom.server.data.Bar = Class.create({
    initialize: function(id, name, top, left, width, height, partId, rest, upbeat, surface, facs) {
    
        this.id = id;
        this.name = name;
        this.top = top;
        this.left = left;
        this.width = width;
        this.height = height;
        this.partId = partId;
        this.rest = rest;
        this.upbeat = upbeat;
        this.surface = surface;
        this.facs = facs;
        
        this.listeners = new Array();
    },

/**COMMANDS****************************************/

    getField: function(field){
        
        switch(field){
            case 'name': return this.getName(); break;
            case 'top': return this.getTop(); break;
            case 'left': return this.getLeft(); break;
            case 'width': return this.getWidth(); break;
            case 'height': return this.getHeight(); break;
            case 'partId': return this.getPartId(); break;
            case 'rest': return this.getRest(); break;
            case 'upbeat': return this.getUpbeat(); break;
            case 'surface': return this.getSurface(); break;
        }
    },
    
    setField: function(field, value){
    
        switch(field){          
            case 'name': this.setName(value); break;
            case 'top': this.setTop(value); break;
            case 'left': this.setLeft(value); break;
            case 'width': this.setWidth(value); break;
            case 'height': this.setHeight(value); break;
            case 'partId': this.setPartId(value); break;
            case 'rest': this.setRest(value); break;
            case 'upbeat': this.setUpbeat(value); break;
            //TODO: surface
        }
    },
    
    getXQueryUpdate: function(field, value){
    
        switch(field){
            case 'name': return 'update value $mei/id("' + this.id + '")/@n with "' + value + '"'; break;
            case 'top': return 'update value $mei/id(substring-after($mei/id("' + this.id + '")/@facs,"#"))/@uly with "' + value + '"'; break;
            case 'left': return 'update value $mei/id(substring-after($mei/id("' + this.id + '")/@facs,"#"))/@ulx with "' + value + '"'; break;
            case 'width': return 'update value $mei/id(substring-after($mei/id("' + this.id + '")/@facs,"#"))/@lrx with "' + (this.getLeft() + value) + '"'; break;
            case 'height': return 'update value $mei/id(substring-after($mei/id("' + this.id + '")/@facs,"#"))/@lry with "' + (this.getTop() + value) + '"'; break;
            
            case 'rest': {
                if(value == 0)
                    return 'update delete $mei/id("' + this.id + '")//mRest | $mei/id("' + this.id + '")//multiRest';
                else if(value == 1)
                    return '(update delete $mei/id("' + this.id + '")//multiRest, '
                            + 'if(not(exists($mei/id("' + this.id + '")[.//mRest]))) then ('
                            + 'update insert <staff><layer><mRest/></layer></staff> into $mei/id("' + this.id + '"))'
                        + 'else())';
                else if(value > 1)
                    return '(update delete $mei/id("' + this.id + '")//mRest, '
                            + 'if(exists($mei/id("' + this.id + '")[.//multiRest])) then ('
                                + 'update value $mei/id("' + this.id + '")//multiRest/@num with "' + value + '"'
                            + ') else('
                                + 'update insert <staff><layer><multiRest num="' + value + '"/></layer></staff> into $mei/id("' + this.id + '")'
                            + '))';
            } break;

            case 'upbeat': {
                if(value)
                    return '(if(not(exists($mei/id("' + this.id + '")[@type]))) then('
                            + 'update insert attribute {"type"} {""} into $mei/id("' + this.id + '")'
                        + ') else(),'
                        + 'update value $mei/id("' + this.id + '")/@type with "upbeat")';
                else
                    return 'update delete $mei/id("' + this.id + '")/@type';
            } break;
            /* partId: hier bewusst rausgenommen, da es zu Problemen mit gleichzeitigen Commands am Movement kommt, */
        }
    },

/**LISTENERS***************************************/
    
    addListener: function(listener) {
        this.listeners.push(listener);
    },
     
    removeListener: function(listener) {
        this.listeners = this.listeners.without(listener); 
    },
    
    removeListeners: function(contextId) {
        this.listeners.each(function(listener) {
            if(listener.getContextId() == contextId)
                this.removeListener(listener);
                
        }.bind(this));
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
    
    setTop: function(top){
        if(this.top == top)
            return;
        this.top = top;
        this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_MODIFIED, "top", this.top));
    },
    
    setLeft: function(left){
        if(this.left == left)
            return;
        this.left = left;
        this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_MODIFIED, "left", this.left));
    },
    
    setWidth: function(width){
        if(this.width == width)
            return;
        this.width = width;
        this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_MODIFIED, "width", this.width));
    },
    
    setHeight: function(height){
        if(this.height == height)
            return;
        this.height = height;
        this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_MODIFIED, "height", this.height));
    },
    
    getTop: function(){
        return this.top;
    },
    
    getLeft: function(){
        return this.left;
    },
    
    getWidth: function(){
        return this.width;
    },
    
    getHeight: function(){
        return this.height;
    },
    
    setPartId: function(partId) {
        if(this.partId == partId) return;
        
        this.partId = partId;
        this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_MODIFIED, "partId", this.partId));
    },
    
    getPartId: function() {
        return this.partId;
    },
    
    setRest: function(rest) {
        if(this.rest == rest) return;
        
        this.rest = rest;
        this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_MODIFIED, "rest", this.rest));
    },
    
    getRest: function() {
        return this.rest;
    },
    
    setUpbeat: function(upbeat) {
        if(this.upbeat == upbeat) return;
        
        this.upbeat = upbeat;
        this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_MODIFIED, "upbeat", this.upbeat));
    },
    
    getUpbeat: function() {
        return this.upbeat;
    }, 
    
    getSurface: function() {
        return this.surface;
    },
    
    setSurface: function(surface) {
        if(this.surface == surface) return;
        
        this.surface = surface;
        this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_MODIFIED, "surface", this.surface));
    },
    
    /**** FUNCTIONS ****/
    
    changeBarNumber: function(diff) {
        var pattern = /\d+[a-z]/;
        //TODO: Was passiert mit freien Namen, die mehr als einen Kleinbuchstaben enthalten?
        
        
        var oldName = this.getName();
        if(oldName.match(pattern))
            return String(Number(oldName.match(/\d+/))+diff) + oldName.substr(-1);
        else
            return String(Number(oldName)+diff);
        
    }
});