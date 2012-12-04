/**
 * @fileOverview An annotation
 *
 * @author: <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
 * @version 1.0
 */
 
/** @namespace The namespace for the data model */
if(typeof de.edirom.server.data == 'undefined')
    de.edirom.server.data = {}

de.edirom.server.data.Annotation = Class.create({
    initialize: function(id, name, plist, resp, categories, priority, content) {
    
        this.id = id;
        this.name = name;
        this.plist = new de.edirom.server.main.LinkedHashMap(plist);
        this.resp = resp;
        this.categories = categories;
        this.priority = priority;
        this.content = content;
        
        this.listeners = new Array();
    },

/**COMMANDS****************************************/

    addObject: function(list, object){
        
        switch(list){
            case 'participants': this.addParticipant(object); break;
            case 'categories': this.addCategory(object); break;
        }            
    },
    
    removeObject: function(list, objectID){
        
        switch(list){
            case 'participants': this.removeParticipant(objectID); break;
            case 'categories': this.removeCategory(objectID); break;
        }
    },

    moveObject: function(list, objectID, movedAfter){
    },

    getPrecedingObjectID: function(list, objectId) {
        return null;
    },

    getField: function(field){
        
        switch(field){
            case 'name': return this.getName(); break;
            case 'resp': return this.getResp(); break;
            //case 'type': return this.getType(); break;
            case 'priority': return this.getPriority(); break;
            case 'content': return this.getContent(); break;
        }
    },
    
    setField: function(field, value){
    
        switch(field){
            case 'name': this.setName(value); break;
            case 'resp': this.setResp(value); break;
            //case 'type': this.setType(value); break;
            case 'priority': this.setPriority(value); break;
            case 'content': this.setContent(value); break;
        }
    },
    
    getXQueryUpdate: function(field, value){
    
        switch(field){
            case 'name': return 'update value $mei/id("' + this.id + '")/title with "' + value + '"'; break;
            case 'priority': return 'update value $mei/id("' + this.id + '")/ptr[@type eq "priority"]/@plist with "' + value + '"'; break;
            case 'content': return 'update value $mei/id("' + this.id + '")/p with "' + value + '"'; break;
        }
    },
    
    getXQueryUpdateList: function(mode, list, object, movedAfter) {
        
        switch(mode) {
        
            case 'add': {
        
                switch(list){
                    case 'participants': return '(if(not(exists($mei/id("' + this.id + '")[@plist]))) then(update insert attribute {"plist"} {""} into $mei/id("' + this.id + '")) else(), '
                                                + 'update value $mei/id("' + this.id + '")/@plist with "' + this.getParticipantList() + '")'; break;
                
                    case 'categories': return '(if(not(exists($mei/id("' + this.id + '")[./ptr[@type eq "categories"]/@plist]))) then(update insert <ptr type="categories" plist=""/> into $mei/id("' + this.id + '")) else(), '
                                                + 'update value $mei/id("' + this.id + '")/ptr[@type eq "categories"]/@plist with "' + this.getCategoriesList() + '")'; break;
                }
                
                break;
            }
        
            case 'remove': {
        
                switch(list){
                    case 'participants': {
                    
                        var plist = this.getParticipantList();
                        if(plist == '')
                            return 'update delete $mei/id("' + this.id + '")/@plist';
                        else
                            return '(if(not(exists($mei//annot[@xml:id = "' + this.id + '" and @plist]))) then(update insert attribute {"plist"} {""} into $mei/id("' + this.id + '")) else(), '
                                                + 'update value $mei/id("' + this.id + '")/@plist with "' + plist + '")';
                    } break;
                    
                    case 'categories': {
                    
                        var plist = this.getCategoriesList();
                        if(plist == '')
                            return 'update delete $mei/id("' + this.id + '")/ptr[@type eq "categories"]';
                        else
                            return '(if(not(exists($mei/id("' + this.id + '")[./ptr[@type eq "categories"]/@plist]))) then(update insert <ptr type="categories" plist=""/> into $mei/id("' + this.id + '")) else(), '
                                                + 'update value $mei/id( "' + this.id + '")/ptr[@type eq "categories"]/@plist with "' + plist + '")';
                    } break;
                }
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

    setResp: function(resp) {        
        if(this.resp == resp) return;
        
        this.resp = resp;
        this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_MODIFIED, "resp", this.resp));
    },
    
    getResp: function() {
        return this.resp;
    },

    setPriority: function(priority) {        
        if(this.priority == priority) return;
        
        this.priority = priority;
        this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_MODIFIED, "priority", this.priority));
    },
    
    getPriority: function() {
        return this.priority;
    },
    
    getPriorityName: function() {
        return de.edirom.server.data.AnnotationPriorities.get(this.priority);
    },

    setContent: function(content) {        
        if(this.content == content) return;
        
        this.content = content;
        this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_MODIFIED, "content", this.content));
    },
    
    getContent: function() {
        if(this.content == null) {
            new Ajax.Request('/data/xql/getAnnotationContent.xql', {
                method: 'get',
                parameters: {
                    id: this.id
                },
                onSuccess: function(transport){
                    this.setContent(transport.responseText);
                    return this.content;
                }.bind(this),
                onFailure: function(){
                    alert('Die gewünschte Anmerkung konnte nicht gefunden werden');
                }
            });
        } else 
            return this.content;
    },

/**PARTICIPANTS***************************************/

    addParticipant: function(participant) {
        if(!this.plist.containsKey(participant.id)) {
            this.plist.pushElement(participant.id, participant);
            
            this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_ADDED, "participants", participant.id));
            return true;
        }
        
        return false;
    },
    
    removeParticipant: function(participantID) {
        if(this.plist.containsKey(participantID)) {
            this.plist.remove(participantID)

            this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_REMOVED, "participants", participantID));
            return true;
        }
        
        return false;
    },

    getParticipant: function(participantID) {
                        
        if(this.plist.containsKey(participantID)) {
            return this.plist.get(participantID);
        }
        
        return false;
    },
    
    containsParticipant: function(participantID) {
        return (this.getParticipant(participantID) != false);
    },
    
    getParticipants: function() {
        return this.plist;
    },
    
    getParticipantList: function() {
        var plist = '';
        var participants = this.plist.keys();
        for(var i = 0; i < participants.length; i++)
            plist += participants[i] + ' ';
            
        return plist.trim();
    },

    getBars: function() {
        
        var IDs = new Array();
                
        this.plist.each(function(participant) {
            if(participant.type == 'measure')
                IDs.push(participant.participantID);
        });
        
        return IDs;
    },
    
    addCategory: function(categoryID) {
        if(!this.categories.include(categoryID)) {
            this.categories.push(categoryID);
            this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_ADDED, "categories", categoryID));   
        }    
    },
    
    removeCategory: function(categoryID) {
        if(this.categories.include(categoryID)) {
            this.categories = this.categories.without(categoryID);
            this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_REMOVED, "categories", categoryID));
        }    
    },
    
    getCategories: function() {
        return this.categories;
    },
    
    getCategoryName: function(category) {
        return de.edirom.server.data.AnnotationPriorities.get(category);
    },
    
    getCategoriesList: function() {
        return this.categories.join(' ');
    },
    
    hasCategory: function(categoryID) {
       return this.categories.contains(categoryID);
    }
});

/*
 *    a participant of an Annotation
 */
de.edirom.server.data.AnnotParticipant = Class.create({
    initialize: function(id, type, page, sourceID) {
        
        this.id = id;
        this.type = type;
        this.page = page;
        this.sourceID = sourceID;
    },
    
    getPage: function() {
        return this.page;
    },
    
    getType: function() {
        return this.type;
    },
    
    getSourceID: function() {
        return this.sourceID;
    }
    
});

/*
 *   Annotation Categories and Priorities
 */

de.edirom.server.data.AnnotationPriorities = new Hash();
de.edirom.server.data.AnnotationPriorities.set('ediromAnnotPrio1', 'Priorität 1');
de.edirom.server.data.AnnotationPriorities.set('ediromAnnotPrio2', 'Priorität 2');
de.edirom.server.data.AnnotationPriorities.set('ediromAnnotPrio3', 'Priorität 3');

de.edirom.server.data.AnnotationCategories = new Hash();
de.edirom.server.data.AnnotationCategories.set('ediromDefaultCategory_Bogensetzung','Bogensetzung');
de.edirom.server.data.AnnotationCategories.set('ediromDefaultCategory_VerbalInstruction','Verbal instruction');
de.edirom.server.data.AnnotationCategories.set('ediromDefaultCategory_Embellishment','Embellishment');
de.edirom.server.data.AnnotationCategories.set('ediromDefaultCategory_Correction','Correction');
de.edirom.server.data.AnnotationCategories.set('ediromDefaultCategory_DiastematicMark','Diastematic mark');
de.edirom.server.data.AnnotationCategories.set('ediromDefaultCategory_Dynamics','Dynamics');
de.edirom.server.data.AnnotationCategories.set('ediromDefaultCategory_Harmony','Harmony');
de.edirom.server.data.AnnotationCategories.set('ediromDefaultCategory_Rhythm','Rhythm');
de.edirom.server.data.AnnotationCategories.set('ediromDefaultCategory_Articulation','Articulation');
de.edirom.server.data.AnnotationCategories.set('ediromDefaultCategory_EditorialIntervention','Editorial intervention');
de.edirom.server.data.AnnotationCategories.set('ediromDefaultCategory_InclusionFromA','Inclusion from A');
de.edirom.server.data.AnnotationCategories.set('ediromDefaultCategory_NotationalPeculiarity','Notational peculiarity');
de.edirom.server.data.AnnotationCategories.set('ediromDefaultCategory_NotationalVariant','Notational variant');
de.edirom.server.data.AnnotationCategories.set('ediromDefaultCategory_NotationalImprecision','Notational imprecision');
de.edirom.server.data.AnnotationCategories.set('ediromDefaultCategory_AlterationByAnalogy','Alteration by analogy');
de.edirom.server.data.AnnotationCategories.set('ediromDefaultCategory_StematicRelationship','Stemmatic Relationship');
de.edirom.server.data.AnnotationCategories.set('ediromDefaultCategory_SeparativeVariant','Separative Variant');
de.edirom.server.data.AnnotationCategories.set('ediromDefaultCategory_ConjunctiveError','Conjunctive Error');
de.edirom.server.data.AnnotationCategories.set('ediromDefaultCategory_Score','Score');
de.edirom.server.data.AnnotationCategories.set('ediromDefaultCategory_Lyrics','Lyrics');
de.edirom.server.data.AnnotationCategories.set('ediromDefaultCategory_Direction','Direction');
de.edirom.server.data.AnnotationCategories.set('ediromDefaultCategory_Text','Text');
de.edirom.server.data.AnnotationCategories.set('ediromDefaultCategory_Music','Music');
de.edirom.server.data.AnnotationCategories.set('ediromDefaultCategory_Stage','Stage');
de.edirom.server.data.AnnotationCategories.set('ediromDefaultCategory_Scene','Scene');
