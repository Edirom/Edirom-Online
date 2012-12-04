/**
 * @fileOverview A local object that resembles a complete work
 *
 * @author: <a href="mailto:kepper@edirom.de">Johannes Kepper</a>
 * @version 1.0
 */
 
/** @namespace The namespace for the data model */


if(typeof de.edirom.server.data == 'undefined')
    de.edirom.server.data = {}
    
de.edirom.server.data.Work = Class.create ({
    initialize: function(workID, onSuccessFunc) {

        this.onSuccessFunc = onSuccessFunc;

        this.id = workID;
        this.title;
        this.composer;
        this.compositionDate;
        this.dedicatee;
        this.dedicationDate;
        this.premiereDate;
        this.premierePlace;

        this.movementConcordance = null;
        this.measureConcordance;
        
        this.annotationPriorities = new Hash();
        this.annotationCategories = new Hash();
        this.annotations = new de.edirom.server.main.LinkedHashMap();
        
        this.sources = new de.edirom.server.main.LinkedHashMap();
        this.sourcesToLoad = 0;
        
        this.listeners = new Array();
        
        this.logger = new de.edirom.server.main.Logger('de.edirom.server.data.Work', 0);
        
        new Ajax.Request('../data/xql/getWork.xql', {
            method: 'get',
            parameters: {
                id: $('workId').value
            },
            onSuccess: function(transport) {
                
                //this.logger.trace('initialize(): trying to get work data');
                
                eval(transport.responseText);
                
                //this.logger.trace('work:initialize(): done building local data');
                
                window.work = this;
                
                this.checkSourcesToLoad();
                
            }.bind(this),
            onFailure: function(transport) {
                console.log('Werk konnte nicht geladen werden: \n\n' + transport.responseText);
            }
            
        });
        
    },
    
    checkSourcesToLoad: function() {
        if(this.sourcesToLoad == 0)
            this.onSuccessFunc(this);
    },
    
    reduceSourcesToLoad: function() {
        this.sourcesToLoad--;
        this.checkSourcesToLoad();
    },

/**COMMANDS****************************************/
    
    addObject: function(list, object){
        
        switch(list){
            case 'sources': this.addSource(object); break;
            case 'annotations': this.addAnnotation(object); break;
        }
    },
    
    removeObject: function(list, objectID){
        
        switch(list){
            case 'sources': this.removeSource(objectID); break;
            case 'annotations': this.removeAnnotation(objectID); break;
        }
    },
    
    moveObject: function(list, objectID, movedAfter){
        
        switch(list){
            case 'sources': this.moveSource(objectID, movedAfter); break;
        }
    },
    
    getPrecedingObjectID: function(list, objectId) {
    
        switch(list){
            case 'sources': return (this.sources.getPrevious(objectId) == null)?null:this.sources.getPrevious(objectId).id; break;           
        }
    },
    
    getField: function(field){
        switch(field){
            case 'title': return this.getTitle(); break;
            case 'composer': return this.getComposer(); break;
            case 'compositionDate': return this.getCompositionDate(); break;
            case 'dedicatee': return this.getDedicatee(); break;
            case 'dedicationDate': return this.getDedicationDate(); break;
            case 'premiereDate': return this.getPremiereDate(); break;
            case 'premierePlace': return this.getPremierePlace(); break;
        }
    },

    setField: function(field, value){
        switch(field){
            case 'title': this.setTitle(value); break;
            case 'composer': this.setComposer(value); break;
            case 'compositionDate': this.setCompositionDate(value); break; 
            case 'dedicatee': this.setDedicatee(value); break;
            case 'dedicationDate': this.setDedicationDate(value); break;
            case 'premiereDate': this.setPremiereDate(value); break;
            case 'premierePlace': this.setPremierePlace(value); break;
        }
    },
    
    getXQueryUpdate: function(field, value){
        
        switch(field){
            case 'title': return 'update value $mei/meicorpus/meihead[@type = "corpus"]/filedesc/titlestmt/title with "' + value + '"'; break;
            case 'composer': return 'update value $mei/meicorpus/meihead[@type = "corpus"]/filedesc/titlestmt/respstmt/persname[@role eq "composer"] with "' + value + '"'; break;
            case 'compositionDate': return 'update value $mei/meicorpus/meihead[@type = "corpus"]/profiledesc/creation/p[@n = "Creation"]/date with "' + value + '"'; break;                  
            case 'dedicatee': return 'update value $mei/meicorpus/meihead[@type = "corpus"]/profiledesc/creation/p[@n = "Dedication"]/*[@type = "Dedicatee"] with "' + value + '"'; break;          
            case 'dedicationDate': return 'update value $mei/meicorpus/meihead[@type = "corpus"]/profiledesc/creation/p[@n = "Dedication"]/date with "' + value + '"'; break;           
            case 'premiereDate': return 'update value $mei/meicorpus/meihead[@type = "corpus"]/profiledesc/creation/p[@n = "Premiere"]/date with "' + value + '"'; break;
            case 'premierePlace': return 'update value $mei/meicorpus/meihead[@type = "corpus"]/profiledesc/creation/p[@n = "Premiere"]/geogname with "' + value + '"'; break;
        }
    },
    
    getXQueryUpdateList: function(mode, list, object, movedAfter) {
        switch(mode) {
            case 'add': {
                switch(list){
                		case 'sources': return 'update insert <source><extptr xlink:href="xmldb:exist:///db/contents/sources/' + object.id + '.xml"/></source> into $mei//meihead[@type eq "corpus"]//sourcedesc'; break;
                        case 'annotations': return 'update insert <annot xml:id="' + object.id + '" type="editorialComment"><title/><p/><ptr type="priority" plist="ediromAnnotPrio1"/></annot> into $mei//meihead[@type eq "corpus"]//annot[@type eq "criticalCommentary"]'; break;
                }
                
                break;
            }
            
            case 'move': {
                switch(list){
                    case 'sources': {
                        
                        if(movedAfter == null)
                            return '('
                                    + 'let $' + object.id + ' := util:deep-copy($mei//meihead[@type eq "corpus"]//sourcedesc/source[./extptr/@xlink:href eq "xmldb:exist:///db/contents/sources/' + object.id + '.xml"]) '
                                    + 'return ('
                                    + 'update delete $mei//meihead[@type eq "corpus"]//sourcedesc/source[./extptr/@xlink:href eq "xmldb:exist:///db/contents/sources/' + object.id + '.xml"], '
                                    + 'update insert $' + object.id + ' preceding $mei//meihead[@type eq "corpus"]//sourcedesc/source[1]'
                                    + '))';
                                
                        else
                            return '('
                                    + 'let $' + object.id + ' := util:deep-copy($mei//meihead[@type eq "corpus"]//sourcedesc/source[./extptr/@xlink:href eq "xmldb:exist:///db/contents/sources/' + object.id + '.xml"]) '
                                    + 'return ('
                                    + 'update delete $mei//meihead[@type eq "corpus"]//sourcedesc/source[./extptr/@xlink:href eq "xmldb:exist:///db/contents/sources/' + object.id + '.xml"], '
                                    + 'update insert $' + object.id + ' following $mei//meihead[@type eq "corpus"]//sourcedesc/source[./extptr/@xlink:href eq "xmldb:exist:///db/contents/sources/' + movedAfter.id + '.xml"]'
                                    + '))';
                        
                        break;
                    } 
                    
                    break; 
                } 
                
                break;
            }
            
            case 'remove': {
                switch(list){
                    case 'sources': return 'update delete $mei//meihead[@type eq "corpus"]//sourcedesc/source[./extptr/@xlink:href eq "xmldb:exist:///db/contents/sources/' + object + '.xml"]'; break;
                    
                    case 'annotations': return 'update delete $mei//meihead[@type eq "corpus"]//annot[@type eq "criticalCommentary"]/annot/id("' + object + '")'; break;
                }
                
                break;
            }
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
    
    
    
/**WORK***************************************/

    setTitle: function(title) {
        if(this.title == title) return;
        
        this.title = title;
        this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_MODIFIED, "title", this.title));
    },
    
    getTitle: function() {
        return this.title;
    },
    
    setComposer: function(composer) {
        if(this.composer == composer) return;
        
        this.composer = composer;
        this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_MODIFIED, "composer", this.composer));
    },
    
    getComposer: function() {
        return this.composer;
    },
    
    setCompositionDate: function(compositionDate) {
        if(this.compositionDate == compositionDate) return;
        
        this.compositionDate = compositionDate;
        this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_MODIFIED, "compositionDate", this.compositionDate));
    },
    
    getCompositionDate: function() {
        return this.compositionDate;
    },
    
    setDedicatee: function(dedicatee) {
        if(this.dedicatee == dedicatee) return;
        
        this.dedicatee = dedicatee;
        this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_MODIFIED, "dedicatee", this.dedicatee));
    },
    
    getDedicatee: function() {
        return this.dedicatee;
    },
    
    setDedicationDate: function(dedicationDate) {
        if(this.dedicationDate == dedicationDate) return;
        
        this.dedicationDate = dedicationDate;
        this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_MODIFIED, "dedicationDate", this.dedicationDate));
    },
    
    getDedicationDate: function() {
        return this.dedicationDate;
    },
    
    setPremiereDate: function(premiereDate) {
        if(this.premiereDate == premiereDate) return;
        
        this.premiereDate = premiereDate;
        this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_MODIFIED, "premiereDate", this.premiereDate));
    },
    
    getPremiereDate: function() {
        return this.premiereDate;
    },
    
    setPremierePlace: function(premierePlace) {
        if(this.premierePlace == premierePlace) return;
        
        this.premierePlace = premierePlace;
        this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_MODIFIED, "premierePlace", this.premierePlace));
    },
    
    getPremierePlace: function() {
        return this.premierePlace;
    },
    
    getAnnotCategories: function() {
       return this.annotationCategories;
    },
    
    getAnnotCategoryName: function(categoryID) {
        var name = this.annotationCategories.get(categoryID);
        if (name == undefined)
            return false;
        else 
            return name;
    },
    
    getAnnotPriorityName: function(priorityID) {
        var name = this.annotationPriorities.get(priorityID);
        if(name == undefined)
            return false;
        else
            return name;
    },
    
    addSource: function(source) {
        
        if(!this.sources.containsKey(source.id)) {
            this.sources.pushElement(source.id, source);
            
            this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_ADDED, "sources", source.id));
            
            return true;
        }
        
        return false;
    },
    
    removeSource: function(sourceID) {
        if(this.sources.containsKey(sourceID)) {
            this.sources.remove(sourceID);
            
            this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_REMOVED, "sources", sourceID));
            return true;
        }
        
        return false;
    },
    
    moveSource: function(sourceID, movedAfter) {
        if(this.sources.containsKey(sourceID)) {
            var source = this.getSource(sourceID);
            this.sources.remove(sourceID);
            this.sources.insert(movedAfter, source.id, source);
            
            this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_MODIFIED, "sources", sourceID));
            return true;
        }
        
        return false;
    },
    
    getSource: function(sourceID) {
        if(this.sources.containsKey(sourceID)) {
            return this.sources.get(sourceID);
        }
        
        return false;
    },
    
    getSources: function() {
        return this.sources.values();
    },
    
    getFirstSource: function() {
        return this.sources.getFirst();
    },
    
    getSourceAfter: function(sourceID) {
        return this.sources.getNext(sourceID);
    },
    
    getSourceBefore: function(sourceID) {
        return this.sources.getPrevious(sourceID);
    },
    
/*********ANNOTATIONS************/
    addAnnotation: function(annotation) {
       
       if(!this.annotations.containsKey(annotation.id)) {    
            
            this.annotations.pushElement(annotation.id, annotation);

            this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_ADDED, "annotations", annotation));
            return true;
        }
        
        return false;
    },
    
    removeAnnotation: function(annotationID) {
       
       if(this.annotations.containsKey(annotationID)) {
            
            this.annotations.remove(annotationID);
            
            this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_REMOVED, "annotations", annotationID));
            return true;
            
        }
        
        return false;
    },
    
    getAnnotation: function(annotationID) {
        if(this.annotations.containsKey(annotationID)) {
            return this.annotations.get(annotationID);
        }    
        
        return false;
    },
    
    getAnnotations: function() {
        return this.annotations;
    },
    
    getAnnotationsByIDs: function(annotationIDs) {
        var annotations = new Array();
        for(var i = 0; i < annotationIDs.length; i++)
            annotations.push(this.getAnnotation(annotationIDs[i]));
            
        return annotations;
    },
    
    checkAnnotationsPerBar: function(barId) {
        var annotations = this.annotations.values();
        for(var i = 0; i < annotations.length; i++) {
            if(annotations[i].containsParticipant(barId))
                return true;
        }
        
        return false;
    },
    
    getAnnotationsByBarID: function(barId) {
        var allAnnotations = this.annotations.values();
        var annotations = new Array;
        for(var i = 0; i < allAnnotations.length; i++) {
            if(allAnnotations[i].containsParticipant(barId))
                annotations.push(allAnnotations[i]);
        }
        
        return annotations;
    },
    
    registerParticipants: function(sourceID) {
        
        var source = this.getSource(sourceID);
        if(!source) return;
        
        this.annotations.each(function(annotation) {
            annotation.getParticipants().each(function(participant) {
                if(participant.getSourceID() == sourceID) {
                    var page = source.getPage(participant.getPage());
                    if(!page) return;
                    
                    page.addAnnotation(annotation.id + '#' + participant.id);
                }
            }.bind(this));
        }.bind(this));
    }
});
        
        
        
        