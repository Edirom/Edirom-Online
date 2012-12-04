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
