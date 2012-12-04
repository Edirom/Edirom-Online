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
            case 'top': return 'update value $mei/id($mei/id("' + this.id + '")/@facs)/@uly with "' + value + '"'; break;
            case 'left': return 'update value $mei/id($mei/id("' + this.id + '")/@facs)/@ulx with "' + value + '"'; break;
            case 'width': return 'update value $mei/id($mei/id("' + this.id + '")/@facs)/@lrx with "' + (this.getLeft() + value) + '"'; break;
            case 'height': return 'update value $mei/id($mei/id("' + this.id + '")/@facs)/@lry with "' + (this.getTop() + value) + '"'; break;
            
            case 'rest': {
                if(value == 0)
                    return 'update delete $mei/id("' + this.id + '")/mrest | $mei/id("' + this.id + '")/multirest';
                else if(value == 1)
                    return '(update delete $mei/id("' + this.id + '")/multirest, '
                            + 'if(not(exists($mei/id("' + this.id + '")[./mrest]))) then ('
                            + 'update insert <mrest/> into $mei/id("' + this.id + '"))'
                        + 'else())';
                else if(value > 1)
                    return '(update delete $mei/id("' + this.id + '")/mrest, '
                            + 'if(exists($mei/id("' + this.id + '")[./multirest])) then ('
                                + 'update value $mei/id("' + this.id + '")/multirest/@num with "' + value + '"'
                            + ') else('
                                + 'update insert <multirest num="' + value + '"/> into $mei/id("' + this.id + '")'
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
});/**
 * @fileOverview A local object that resembles a concordance of different types
 *
 * @author: <a href="mailto:kepper@edirom.de">Johannes Kepper</a>
 * @version 1.0
 */

/** @namespace The namespace for the data model */
if(typeof de.edirom.server.data == 'undefined')
    de.edirom.server.data = {}

de.edirom.server.data.Concordance = Class.create ({
    initialize: function(parent, type) {
    
        this.parent = parent;
        this.type = type;
        
        this.concordance = new de.edirom.server.main.LinkedHashMap();
        this.reverseIndex = {};
        
        this.listeners = new Array();
        
        /*TODO: Discussion
         *   
         *  Wenn wir das lokale Datenmodell beschleunigen wollen, indem wir nicht
         *  alles vorab laden, müsste hier ein entsprechender Ajax-Request aufgerufen
         *  werden, der anhand von this.parent und this.type die entsprechenden  
         *  Inhalte aufbaut.
         *
         */
    },
    
/**COMMANDS****************************************/    

    addObject: function(list, object){
        switch(list){
            case 'connections': this.addConnection(object); break;
             
        }
    },
    
    removeObject: function(list, objectID) {
        switch(list){
            case 'connections': this.removeConnection(objectID); break;
            
        }
    },
    
    moveObject: function(list, objectID, movedAfter){
    
    },
    
    getPrecedingObjectID: function(list, objectId) {
    
        switch(list){
            case 'connections': return (this.concordance.getPrevious(objectId) == null)?null:this.concordance.getPrevious(objectId).id; break;           
        }
    },
    
    getField: function(field){
    
    },
    
    setField: function(field, value){
    
    },
    
    getXQueryUpdate: function(field, value){
    
    },
    
    getXQueryUpdateList: function(mode, list, object, movedAfter) {
        if(this.type == 'mdiv') {
            switch(mode) {
            
                case 'add': {
                    switch(list) {
                        case 'connections': return 'update insert '
                                                  + '<annot type="connection" xml:id="' + object.id + '">'
                                                  + object.getParticipantList()
                                                  + '</annot>'
                                                  + ' into $mei//annot[@type eq "movementConcordance"]'; break;
                        
                    }
                    
                    break;
                }
                
                case 'move': {
                    switch(list) {
                        case 'connections': return ''; break;
                    }
                    
                    break;
                }
                
                case 'remove': {
                    switch(list) {
                        case 'connections': return 'update delete $mei/id("' + object + '")'; break;
                    }
                }
            }
        } else if(this.type == 'measure') {
            switch(mode) {
            
                case 'add': {
                    switch(list) {
                        case 'connections': return 'update insert '
                                                  + '<annot type="connection" xml:id="' + object.id + '">'
                                                  + object.getParticipantList()
                                                  + '</annot>'
                                                  + ' into $mei//annot[@type eq "measureConcordance"]'; break;
                                                                       
                    }
                    
                    break;
                }
                
                case 'move': {
                    switch(list) {
                        case 'connections': return ''; break;
                    }
                    
                    break;
                }
                
                case 'remove': {
                    switch(list) {
                        case 'connections': return 'update delete $mei/id("' + object + '")'; break;
                    }
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
    
    fireEvent: function(event) {
        
        this.listeners.each(function(listener) {
            //TODO: Checken, ob das wirklich DataListener ist            
            listener.eventFired(event);
        });
    },

/**METADATA***************************************/

    getType: function(){
        return this.type;
    },

/**DATA*******************************************/

    getConnectionByParticipant: function(participant) {
        
        if(typeof this.reverseIndex[participant] == 'undefined')
            return null;
        
        return this.reverseIndex[participant];
    },
    
    getConnection: function(connectionID) {
        return this.concordance.get(connectionID);
    },
    
    existsConnection: function(connectionID) {
        return this.concordance.containsKey(connectionID);
    },
    
    addConnection: function(connection){
        
        if(!this.concordance.containsKey(connection.id)) {
            
            this.concordance.pushElement(connection.id, connection);
            
            var participants = connection.getParticipants();
            participants.each(function(participant) {
                if(typeof this.reverseIndex[participant] == 'undefined')
                    this.reverseIndex[participant] = connection;
            }.bind(this));
            
            connection.addListener(new de.edirom.server.data.DataListener('concordance', this.reindexConnection.bind(this)));
            
            this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_ADDED, "connections", connection));
            
            return true;
        }
        
        return false;
    },
    
    removeConnection: function(connectionID){
        if(this.concordance.containsKey(connectionID)) {
            
            var connection = this.concordance.get(connectionID);
            
            var participants = connection.getParticipants();
            participants.each(function(participant) {
                if(typeof this.reverseIndex[participant] != 'undefined')
                    delete this.reverseIndex[participant];
            }.bind(this));
            
            connection.removeListeners('concordance');
            
            this.concordance.remove(connectionID);
            this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_REMOVED, "connections", connection));
            
            return true;
        }
        
        return false;
    },
    
    reindexConnection: function(event) {
        if(event.getField() != 'participants')
            return;
    
        if(event.getType() == de.edirom.server.data.DataEvent.TYPE_ADDED)
            this.reverseIndex[event.getValue()] = event.getSource();
        
        else if(event.getType() == de.edirom.server.data.DataEvent.TYPE_REMOVED)
            delete this.reverseIndex[event.getValue()];    
    },
    
    getConnections: function() {
        return this.concordance.values();
    }
    
});    /**
* @fileOverview A local object that resembles a connection within a concordance
*
* @author: <a href="mailto:kepper@edirom.de">Johannes Kepper</a>
* @version 1.0
*/

/** @namespace The namespace for the data model */
if (typeof de.edirom.server.data == 'undefined')
    de.edirom.server.data = {}

de.edirom.server.data.Connection = Class.create({
   initialize: function (id, participants) {
      
      this.id = id;
      this.participants = participants;
      
      this.lines;
      
      this.listeners = new Array();
   },
   
   /**COMMANDS****************************************/
   
   addObject: function (list, object) {
      
      switch (list) {
         case 'participants': this.addParticipant(object);
         break;
      }
   },
   
   removeObject: function (list, objectID) {
      switch (list) {
         case 'participants': this.removeParticipant(objectID);
         break;
      }
   },
   
   getField: function () {
   },
   
   setField: function () {
   },
   
   getXQueryUpdate: function (field, value) {
   },
   
   getXQueryUpdateList: function (mode, list, object, movedAfter) {
      switch (mode) {
         case 'add': {
            
            switch (list) {
               case 'participants': return 'if(not(exists($mei/id("' + this.id + '")[@type eq "connection"]/extptr[@xlink:href eq "xmldb:exist:///db/contents/sources/' + object.replace('#', '.xml#') + '"])))'
                                         + 'then(update insert <extptr xlink:href="xmldb:exist:///db/contents/sources/' + object.replace('#', '.xml#') + '"/> into $mei/id("' + this.id + '")[@type eq "connection"])'
                                         + 'else()'; break;
            }
            
            break;
         }
         
         case 'remove': {
            switch (list) {
               case 'participants': return 'update delete $mei/id("' + this.id + '")[@type eq "connection"]/extptr[@xlink:href eq "xmldb:exist:///db/contents/sources/' + object.replace('#', '.xml#') + '"]'; break;
            }
         }
      }
   },
   
   /**LISTENERS***************************************/
   
   addListener: function (listener) {
      this.listeners.push(listener);
   },
   
   removeListener: function (listener) {
      this.listeners = this.listeners.without(listener);
   },
    
    removeListeners: function(contextId) {
        this.listeners.each(function(listener) {
            if(listener.getContextId() == contextId)
                this.removeListener(listener);
                
        }.bind(this));
    },
   
   fireEvent: function (event) {
      
      this.listeners.each(function (listener) {
         //TODO: Checken, ob das wirklich DataListener ist
         listener.eventFired(event);
      });
   },
   
   /**DATA MODEL******************/
   
   addParticipant: function (participant) {
      
      if (! this.participants.include(participant)) {
         
         this.participants.push(participant);
         this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_ADDED, "participants", participant));
         
         return true;
      }
      
      return false;
   },
   
   removeParticipant: function (participant) {
      if (this.participants.include(participant)) {
         
         this.participants = this.participants.without(participant);
         this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_REMOVED, "participants", participant));
         
         return true;
      }
      
      return false;
   },
   
   getParticipants: function () {
      return this.participants;
   },
   
   countParticipants: function () {
      return this.participants.length;
   },
   
   existsParticipant: function (participant) {
      
      var contained = this.participants.include(participant);
      return contained;
   },
   
   getParticipantList: function () {
      var plist = '';
      for (var i = 0; i < this.participants.length; i++)
      plist += '<extptr xlink:href="xmldb:exist:///db/contents/sources/' + this.participants[i].replace('#', '.xml#') + '"/>';
      
      return plist;
   },
   
   getLines: function () {
      return this.lines;
   },
   
   setLines: function (lines) {
      this.lines = lines;
   }
   
});/**
 * @fileOverview An event used for data listeners
 *
 * @author: <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
 * @version 1.0
 */


/** @namespace The namespace for the data model */
if(typeof de.edirom.server.data == 'undefined')
    de.edirom.server.data = {}

de.edirom.server.data.DataEvent = Class.create ({
    
    initialize: function(source, type, field, value) {
        this.source = source;
        this.type = type;
        this.field = field;
        this.value = value;
    },
    
    getSource: function() {
        return this.source;
    },
    
    getType: function() {
        return this.type;
    },
    
    getField: function() {
        return this.field;
    },
    
    getValue: function() {
        return this.value;
    },
});

de.edirom.server.data.DataEvent.TYPE_ADDED = 0;
de.edirom.server.data.DataEvent.TYPE_REMOVED = 1;
de.edirom.server.data.DataEvent.TYPE_MODIFIED = 2;/**
 * @fileOverview A listener for data objects
 *
 * @author: <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
 * @version 1.0
 */


/** @namespace The namespace for the data model */
if(typeof de.edirom.server.data == 'undefined')
    de.edirom.server.data = {}

de.edirom.server.data.DataListener = Class.create ({
    initialize: function(arg1, arg2) {
        
        if(typeof arg1 == 'string' && typeof arg2 == 'function') {        
            this.contextId = arg1;
            this.func = arg2;
            
        }else if(typeof arg1 == 'function' && typeof arg2 == 'undefined') {
            this.contextId = '';
            this.func = arg1;
        }
    },
    
    eventFired: function(event) {
        this.func(event);
    },
    
    getContextId: function() {
        return this.contextId;
    }
});/**
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
                                        + '<measure xml:id="' + object.id + '" n="' + object.getName() + '" facs="' + object.facs + '" ' + (object.getUpbeat()?'type="upbeat"':'') + '>'
                                        + (object.getRest() == 1?'<mrest/>':'')
                                        + (object.getRest() > 1?'<multirest num="' + object.getRest() + '"/>':'')
                                        + '</measure> into $mei/id("' + this.id + '")/score/section'
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
                                         + 'update delete $mei/id($mei/id("' + object + '")/@facs), '
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
 });/**
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
});/**
 * @fileOverview A local object that resembles a complete source
 *
 * @author: <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
 * @version 1.0
 */

/** @namespace The namespace for the data model */
if(typeof de.edirom.server.data == 'undefined')
    de.edirom.server.data = {}

de.edirom.server.data.Source = Class.create ({
    initialize: function(sourceID, onSuccessFunc) {
        
        this.id = sourceID;
        this.name;
        this.signature;
        this.composer;
        this.workName;        
        this.dating;
        this.type;        
        
        this.movements = new de.edirom.server.main.LinkedHashMap();
        this.pages = new de.edirom.server.main.LinkedHashMap();
        this.texts = new de.edirom.server.main.LinkedHashMap();
        
        this.listeners = new Array();
        
        this.logger = new de.edirom.server.main.Logger('de.edirom.server.data.Source', 0);
        
        new Ajax.Request('../data/xql/getSource.xql', {
           method: 'get',
           parameters: {
               id: sourceID
           },
           onSuccess: function(transport) {

               //this.logger.trace('initialize(): trying to get source data');
               eval(transport.responseText);
               //this.logger.trace('initialize(): done building local data');

               window.source = this;
               
               if(typeof(onSuccessFunc) != 'undefined')
                   onSuccessFunc(this);
               
           }.bind(this),
           onFailure: function(transport) {
               console.log('Seiten konnten nicht geladen werden: \n\n' + transport.responseText);
           }
       });
    },

/**COMMANDS****************************************/

    addObject: function(list, object){
        
        switch(list){
            case 'pages': this.addPage(object); break;
            case 'movements': this.addMovement(object); break;
            case 'texts': this.addText(object); break;
        }
    },
    
    
    removeObject: function(list, objectID){
        
        switch(list){
            case 'pages': this.removePage(objectID); break;
            case 'movements': this.removeMovement(objectID); break;
            case 'texts': this.removeText(objectID); break;
        }
    },
    
    moveObject: function(list, objectID, movedAfter){
        
        switch(list){
            case 'pages': this.movePage(objectID, movedAfter); break;
            case 'movements': this.moveMovement(objectID, movedAfter); break;
        }
    },
    
    getPrecedingObjectID: function(list, objectId) {
    
        switch(list){
            case 'pages': return (this.pages.getPrevious(objectId) == null)?null:this.pages.getPrevious(objectId).id; break;    
            case 'movements': return (this.movements.getPrevious(objectId) == null)?null:this.movements.getPrevious(objectId).id; break;    
        }
    },
    
    getField: function(field){
        
        switch(field){
            case 'name': return this.getName(); break;
            case 'signature': return this.getSignature(); break;
            case 'composer': return this.getComposer(); break;
            case 'workname': return this.getWorkName(); break;
            case 'dating': return this.getDating(); break;
            case 'type': return this.getType(); break;
        }
    },
    
    setField: function(field, value){
        
        switch(field){
            case 'name': this.setName(value); break;
            case 'signature': this.setSignature(value); break;
            case 'composer': this.setComposer(value); break;
            case 'workname': this.setWorkName(value); break;
            case 'dating': this.setDating(value); break;
            case 'type': this.setType(value); break;
        }
    },

    getXQueryUpdate: function(field, value){
    
        switch(field){
            case 'name': return 'update value $mei/id("' + this.id + '")/titlestmt/title with "' + value + '"'; break;
            case 'composer': return 'update value $mei/mei/meihead/filedesc/titlestmt/respstmt/persname[@role eq "composer"] with "' + value + '"'; break;
            case 'signature': return 'update value $mei/id("' + this.id + '")/pubstmt/identifier[@type = "signature"] with "' + value + '"'; break;
            case 'workname': return 'update value $mei/mei/meihead/filedesc/titlestmt/title with "' + value + '"'; break;

            case 'dating': return (value != ""?
                                    '(if(not(exists($mei/id("'+ this.id + '")/pubstmt/date)))'
                                    + 'then(update insert <date>' + value + '</date> into $mei/id("'+ this.id + '")/pubstmt)'
                                    + 'else(update value $mei/id("'+ this.id + '")/pubstmt/date with "' + value + '"))'
                                    :
                                    '(if(exists($mei/id("'+ this.id + '")/pubstmt/date))'
                                    + 'then(update delete $mei/id("'+ this.id + '")/pubstmt/date)'
                                    + 'else())'
                                    ); break;
            
            case 'type': return 'update value $mei/id("' + this.id + '")/classification/termlist/term[@classcode="ediromSourceTypes"] with "' + value + '"'; break;
        }
    },
    
    getXQueryUpdateList: function(mode, list, object, movedAfter) {
        
        switch(mode) {
        
            case 'add': {
        
                switch(list) {
                
                    case 'pages': return 'update insert '
              					         + '<surface xml:id="' + object.id + '" n="' + object.getName() + '">'
              					             + '<graphic xlink:href="' + object.getHref() + '" xml:id="edirom_graphic_' + Math.uuid().toLowerCase() + '" type="facsimile"/>'
              					         + '</surface>'
              					         + ' into $mei//music/facsimile[@source eq "' + this.id + '"]'; break;
                    
                    case 'movements': return 'update insert <mdiv xml:id="' + object.id + '" n="' + object.getName() + '"/> into $mei//music/body'; break;
                    case 'texts': return ( 'if(exists($mei//notesstmt))'
                                         + 'then(update insert <annot type="ediromSourceDesc" plist="' + this.id + '" xlink:href="xmldb:exist:///db/contents/texts/' + object.id + '.xml" xml:id="'+ object.id +'_desc"/> into $mei//notesstmt)'
                                         + 'else(update insert <notesstmt><annot type="ediromSourceDesc" plist="' + this.id + '" xlink:href="xmldb:exist:///db/contents/texts/' + object.id + '.xml" xml:id="'+ object.id +'_desc"/></notesstmt> preceding $mei//sourcedesc)'); break;
                                        
                }
                
                break;
            }
        
            case 'move': {
        
                switch(list){
                    case 'pages': {
                        
                        if(movedAfter == null)
                            return '(let $' + object + ' := util:deep-copy($mei/id("' + object + '")) '
                                    + 'return ('
                                    + 'update delete $mei/id("' + object + '"), '
                                    + 'update insert $' + object + ' preceding $mei//music/facsimile[@source eq "' + this.id + '"]/surface[1]))';
                        
                        else
                        
                            return '(let $' + object + ' := util:deep-copy($mei/id("' + object + '")) '
                                    + 'return ('
                                    + 'update delete $mei/id("' + object + '"), '
                                    + 'update insert $' + object + ' following $mei/id("' + movedAfter + '")))';
                        break;
                    }
                
                    break;


                    case 'movements': {
                        
                        if(movedAfter == null)
                        
                            return '(let $' + object + ' := util:deep-copy($mei/id("' + object + '")) '
                                    + 'return ('
                                    + 'update delete $mei/id("' + object + '"), '
                                    + 'update insert $' + object + ' preceding $mei//music/body/mdiv[1]))';
                        
                        else
                        
                            return '(let $' + object + ' := util:deep-copy($mei/id("' + object + '")) '
                                    + 'return ('
                                    + 'update delete $mei/id("' + object + '"), '
                                    + 'update insert $' + object + ' following $mei/id("' + movedAfter + '")))';
                                
                        break;
                    }
                
                    break;
                }
                
                break;
            }

            case 'remove': {
        
                switch(list){
                    case 'pages': return 'update delete $mei/id("' + object + '")'; break;
                    case 'movements': return 'update delete $mei/id("' + object + '")'; break;
                    case 'texts': return 'update delete $mei/id("' + object + '_desc")'; break;
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
    
    setSignature: function(signature) {
        if(this.signature == signature) return;
        
        this.signature = signature;
        this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_MODIFIED, "signature", this.signature));
    },
    
    getSignature: function() {
        return this.signature;
    },
    
    setDating: function(dating) {
        if(this.dating == dating) return;
        
        this.dating = dating;
        this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_MODIFIED, "dating", this.dating));
    },
    
    getDating: function() {
        return this.dating;
    },
    
    setType: function(type) {
        if(this.type == type) return;
        
        this.type = type;
        this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_MODIFIED, "type", this.type));
    },
    
    getType: function() {
        return this.type;
    },
    
    setComposer: function(composer) {
        if(this.composer == composer) return;
        
        this.composer = composer;
        this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_MODIFIED, "composer", this.composer));
    },
    
    getComposer: function() {
        return this.composer;
    },
    
    setWorkName: function(workName) {
        if(this.workName == workName) return;
        
        this.workName = workName;
        this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_MODIFIED, "workName", this.workName));
    },
    
    getWorkName: function() {
        return this.workName;
    },
    

/**PAGES*******************************************/

    addPage: function(page) {        
        if(!this.pages.containsKey(page.id)) {
            this.pages.pushElement(page.id, page);
            
            this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_ADDED, "page", page.id));
            return true;
        }
        
        return false;
    },
    
    removePage: function(pageID) {
        if(this.pages.containsKey(pageID)) {
            this.pages.remove(pageID);
            
            this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_REMOVED, "page", pageID));
            return true;
        }
        
        return false;
    },
    
    movePage: function(pageID, movedAfter) {
        if(this.pages.containsKey(pageID)) {
            var page = this.getPage(pageID);
            this.pages.remove(pageID);
            this.pages.insert(movedAfter, page.id, page);
            
            this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_MODIFIED, "page", pageID));
            return true;
        }
        
        return false;
    },
    
    getPage: function(pageID) {
        if(this.pages.containsKey(pageID)) {
            return this.pages.get(pageID);
        }    
        
        return false;
    },
    
    getPages: function() {
        return this.pages.values();
    },

    getPagesAsMap: function() {
        return this.pages;
    },
    
    getFirstPage: function() {
        return this.pages.getFirst();
    },
    
    getPageAfter: function(pageID) {
        return this.pages.getNext(pageID);
    },
    
    getPageBefore: function(pageID) {
        return this.pages.getPrevious(pageID);
    },

    findPage: function(term) {
    
        var page = null;
    
        this.pages.each(function(p) {
            if(p.getName() == term) {
                page = p;
                throw $break;
            }
        });
        
        return page;
    },
    

/**MOVEMENTS***************************************/

    addMovement: function(movement) {
        if(!this.movements.containsKey(movement.id)) {
            this.movements.pushElement(movement.id, movement);
            this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_ADDED, "movement", movement.id));
            
            return true;
        }
        
        return false;
    },
    
    removeMovement: function(movementID) {
        if(this.movements.containsKey(movementID) && this.movements.length > 1) {
            this.movements.remove(movementID);
            
            this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_REMOVED, "movement", movementID));
            return true;
        }
        
        return false;
    },
    
    moveMovement: function(movementID, movedAfter) {
        if(this.movements.containsKey(movementID)) {
            var movement = this.getMovement(movementID);
            this.movements.remove(movementID);
            this.movements.insert(movedAfter, movement.id, movement);
            
            this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_MODIFIED, "movement", movementID));
            return true;
        }
        
        return false;
    },

    getMovement: function(movementID) {
        if(this.movements.containsKey(movementID)) {
            return this.movements.get(movementID);
        }    
        
        return false;
    },

    getMovements: function() {
        return this.movements.values();
    },

    getMovementAfter: function(movementID) {
        return this.movements.getNext(movementID);
    },
    
/**BARS***************************************/
   
    getBar: function(barID) {
        
        if(this.movements.length <= 0)
            return false;
        
        var found = false;
        
        this.movements.each(function(movement) {
            found = movement.getBar(barID);
            if(found != false)
                throw $break;
        });
        
        return found;
    },
    
    getBarAfter: function(barID) {
        
        var allBars = this.getAllBars();
        var precedingBar = this.getBar(barID);
        
        var index = allBars.indexOf(precedingBar);
        if(allBars.length >= index)
            return allBars[index + 1];
        else
            return null;    
        
        
        //TODO: fragt nur innerhalb eines Satzes, findet also nicht den ersten des Folgesatzes
    },
    
    getBarBefore: function(barID) {
        var allBars = this.getAllBars();
        var precedingBar = this.getBar(barID);
        
        var index = allBars.indexOf(precedingBar);
        if(index > 0)
            return allBars[index - 1];
        else
            return null;  
    },
    
    getBars: function(barIDs) {
        var bars = new Array();
        for(var i = 0; i < barIDs.length; i++)
            bars.push(this.getBar(barIDs[i]));
            
        return bars;
    },
    
    getAllBars: function() {
        var bars = new Array();
        
        this.movements.each(function(movement) {
            var newbars = movement.getBars();
            bars = bars.concat(newbars);
        });
        
        return bars;
    },
    
    getBarsSorted: function(barIDs) {
        var bars = new Hash();
        var barsSorted = new Array();
        
        for(var i = 0; i < barIDs.length; i++) {
            var bar = this.getBar(barIDs[i]);
            var movementId = bar.getPartId();
            
            if(bars.get(movementId) == 'undefined' | bars.get(movementId) == null)
                bars.set(movementId, new Array());
                
            bars.get(movementId).push(bar);
        }
        
        var movementIds = bars.keys();
        for(var i = 0; i < movementIds.length; i++) {
            
            var moveemntId = movementIds[i];
            var barsOfMovement = bars.get(movementId);
            var barsOfMovement2 = this.getMovement(movementId).getBars();
            
            barsOfMovement.sort(function(bar1, bar2) {
                return barsOfMovement2.indexOf(bar1) - barsOfMovement2.indexOf(bar2);
            }.bind(this));
            
            for(var j = 0; j < barsOfMovement.length; j++)
                barsSorted.push(barsOfMovement[j]);
        }
        
        return barsSorted;
    },
    
    
/**TEXTS******************************/

    addText: function(text) {
        if(!this.texts.containsKey(text.id)) {
            this.texts.pushElement(text.id, text);
            
            this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_ADDED, "text", text.id));
            
            return true;
        }
        
        return false;
    },
    
    removeText: function(textID) {
        if(this.texts.containsKey(textID)) {
            this.texts.remove(textID);
            
            this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_REMOVED, "text", textID));
            return true;
        }
        
        return false;
    },
    
    moveText: function(textID, movedAfter) {
        if(this.texts.containsKey(textID)) {
            var text = this.gettext(textID);
            this.texts.remove(textID);
            this.texts.inser(movedAfter, text.id, text);
            
            this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_MODIFIED, "text", textID));
            return true;
        }
        
        return false;
    },
    
    getText: function(textID) {
        if(this.texts.containsKey(textID)) {
            return this.texts.get(textID);
        }
        
        return false;
    },
    
    getTexts: function() {
        return this.texts.values();
    },
    
    getFirstText: function() {
        return this.texts.getFirst();
    },
    
    getTextAfter: function(textID) {
        return this.texts.getNext(textID);
    },
    
    getTextBefore: function(textID) {
        return this.texts.getPrevious(textID);
    }

    
    
});
 
 /**
 * @fileOverview A local object that resembles a complete text
 *
 * @author: <a href="mailto:kepper@edirom.de">Johannes Kepper</a>
 * @version 1.0
 */
 
/** @namespace The namespace for the data model */


if(typeof de.edirom.server.data == 'undefined')
    de.edirom.server.data = {}
    
de.edirom.server.data.Text = Class.create ({
    initialize: function(textID, onSuccessFunc) {
        
        this.id = textID;
        this.body;
        this.title;
        
        this.listeners = new Array();
        
        this.logger = new de.edirom.server.main.Logger('de.edirom.server.data.Text', 0);
        
        new Ajax.Request('../data/xql/getText.xql', {
            method: 'get',
            parameters: {
                id: textID //$('textId').value
            },
            onSuccess: function(transport) {
                
                //this.logger.trace('initialize(): trying to get text data');
                
                eval(transport.responseText);
                
                //this.logger.trace('initialize(): done building local data');
                
                window.text = this;
                
                onSuccessFunc(this);
                
            }.bind(this),
            onFailure: function(transport) {
                console.log('Text konnte nicht geladen werden: \n\n' + transport.responseText);
            }
        });
        
        new Ajax.Request('../data/xql/getTextBody.xql', {
            method: 'get',
            parameters: {
                id: textID //$('textId').value
            },
            onSuccess: function(transport) {
                
                //this.logger.trace('initialize(): trying to get text body');                    
                this.setText(transport.responseText);                    
                //this.logger.trace('initialize(): done building local data (text body)');
                                
            }.bind(this),
            onFailure: function(transport) {
                console.log('Text konnte nicht geladen werden: \n\n' + transport.responseText);
            }
        });
    },    

/**COMMANDS****************************************/

    getField: function(field){
        
        switch(field){
            case 'text': return this.getText(); break;
            case 'title': return this.getTitle(); break;
        }
    },
    
    setField: function(field, value){
        
        switch(field){
            case 'text': this.setText(value); break;
            case 'title': this.setTitle(value); break;
        }
    },
   
    getXQueryUpdate: function(field, value){
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
    
/**TEXT***************************************/
    
    setText: function(text) {
        if(this.body == text) return;
        
        this.body = text;
        this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_MODIFIED, "body", this.body));
    },
    
    getText: function() {
        return this.body;
    },
    
    setTitle: function(title) {
        if(this.title == title) return;
        
        this.title = title;
        this.fireEvent(new de.edirom.server.data.DataEvent(this, de.edirom.server.data.DataEvent.TYPE_MODIFIED, "title", this.title));
    },
    
    getTitle: function() {
        return this.title;
    }
});
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
        
        
        
        