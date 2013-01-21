/**
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
            /*case 'name': return 'update value $mei/id("' + this.id + '")/titlestmt/title with "' + value + '"'; break;
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
            
            case 'type': return 'update value $mei/id("' + this.id + '")/classification/termlist/term[@classcode="ediromSourceTypes"] with "' + value + '"'; break;*/
        }
    },
    
    getXQueryUpdateList: function(mode, list, object, movedAfter) {
        
        /*switch(mode) {
        
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
        }*/
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
 
 