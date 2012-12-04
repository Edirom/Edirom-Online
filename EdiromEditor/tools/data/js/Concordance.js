/**
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
    
});    