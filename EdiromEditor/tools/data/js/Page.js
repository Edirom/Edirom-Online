/**
 * @fileOverview A page
 *
 * @author: <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
 * @version 1.0
 */
 
/** @namespace The namespace for the data model */
if(typeof de.edirom.server.data == 'undefined')
    de.edirom.server.data = {}

de.edirom.server.data.Page = Class.create({
    initialize: function(id, name, width, height, fileName, date, path, href) {
        
        this.id = id;
        this.name = name;
        this.width = width;
        this.height = height;
        this.fileName = fileName;
        this.date = date;
        this.path = path;
        this.href = href;
        
        this.bars = new Array();
        this.annotations = new Array();
        
        this.listeners = new Array();
    },

/**COMMANDS****************************************/
    
    addObject: function(list, object){
        
        switch(list){
            case 'bars': this.addBar(object); break;
            case 'annotations': this.addAnnotation(object); break;
        }
    },
    
    removeObject: function(list, object){
    
        switch(list){
            case 'bars': this.removeBar(object); break;
            case 'annotations': this.removeAnnotation(object); break;
        }
    },
    
    getField: function(field){
        switch(field){    
            case 'name': return this.getName(); break;
            case 'width': return this.getWidth(); break;
            case 'height': return this.getHeight(); break;
            case 'fileName': return this.getFileName(); break;
            case 'date': return this.getDate(); break;
            case 'path': return this.getPath(); break;
            case 'href': return this.getHref(); break;
        }           
    },
    
    setField: function(field, value){
        
        switch(field){            
            case 'name': this.setName(value); break;
            case 'width': this.setWidth(value); break;
            case 'height': this.setHeight(value); break;
            case 'fileName': this.setFileName(value); break;
            case 'date': this.setDate(value); break;
            case 'path': this.setPath(value); break;
            case 'href': this.setHref(value); break;
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
                    // Hier muss etwas stehen, damit der Update funktioniert
                    case 'bars': return '()'; break;
                    case 'annotations': return '()'; break;
                }
            } break;

            case 'remove': {
                switch(list) {
                    // Hier muss etwas stehen, damit der Update funktioniert
                    case 'bars': return '()'; break;
                    case 'annotations': return '()'; break;
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
    
    removeListeners: function(contextId) {
        this.listeners.each(function(listener) {
            if(listener.getContextId() == contextId)
                this.removeListener(listener);
                
        }.bind(this));
    },

    clearListeners: function() {
        this.listeners.clear();
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
    
    setWidth: function(width) {
        if(this.width == width) return;
        
        this.width = width;
        this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_MODIFIED, "width", this.width));
    },

    getWidth: function() {
        return this.width;
    },
    
    setHeight: function(height) {
        if(this.height == height) return;
        
        this.height = height;
        this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_MODIFIED, "height", this.height));
    },
    
    getHeight: function() {
        return this.height;
    },
    
    setFileName: function(fileName) {
        if(this.fileName == fileName) return;
        
        this.fileName = fileName;
        this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_MODIFIED, "fileName", this.fileName));
    },
    
    getFileName: function() {
        return this.fileName;
    },
    
    setDate: function(date) {
        if(this.date == date) return;
        
        this.date = date;
        this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_MODIFIED, "date", this.date));
    },
    
    getDate: function() {
        return this.date;
    },
    
    setPath: function(path) {
        if(this.path == path) return;
        
        this.path = path;
        this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_MODIFIED, "path", this.path));
    },
    
    getPath: function() {
        return this.path;
    },
    
    setHref: function(href) {
        if(this.href == href) return;
        
        this.href = href;
        this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_MODIFIED, "href", this.href));
    },
    
    getHref: function() {
        return this.href;
    },
    
/**BARS***************************************/
        
    addBar: function(barID) {
    
        if(this.bars.indexOf(barID) == -1) {
            this.bars.push(barID);
            
            this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_ADDED, "bar", barID));
            return true;
        }
        
        return false;
    },
    
    removeBar: function(barID) {
        if(this.bars.indexOf(barID) != -1) {
            this.bars = this.bars.without(barID);

            this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_REMOVED, "bar", barID));
            return true;
        }
        
        return false;
    },
    
    getBarIDs: function() {
        return this.bars;
    },
    
/**ANNOTATIONS***************************************/
    
    // Stores a combination of annotation and participant id ("edirom_annot_9cb9a940-b2aa-4034-9523-c4bc9d176639#edirom_measure_9ad4b4c7-fd95-4c25-a77b-d7be13059e26")

    addAnnotation: function(annotationID) {
        if(this.annotations.indexOf(annotationID) == -1) {
            this.annotations.push(annotationID);
            
            this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_ADDED, "annotations", annotationID));
            return true;
        }
        
        return false;
    },
    
    removeAnnotation: function(annotationID) {
        if(this.annotations.indexOf(annotationID) != -1) {
            this.annotations = this.annotations.without(annotationID);
            
            this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_REMOVED, "annotations", annotationID));
            return true;
        }
        
        return false;
    },
    
    getAnnotationIDs: function() {
        return this.annotations;
    }
});