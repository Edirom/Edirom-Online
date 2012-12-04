/**
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
   
});