/**
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
de.edirom.server.data.DataEvent.TYPE_MODIFIED = 2;