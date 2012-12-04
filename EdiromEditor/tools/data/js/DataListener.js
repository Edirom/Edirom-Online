/**
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
});