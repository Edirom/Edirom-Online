/**
 * @fileOverview This file provides an abstract class for contents (like Structure in Source)
 *
 * @author: <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
 * @version 1.0
 */

de.edirom.server.main.Content = Class.create({
    initialize: function(view, id) {
    	this.view = view;
        this.loaded = false;
        this.visible = false;
        
        this.id = id;
/*        this.id = 'content_' + (new Date).getTime();
        while($(this.id) != null)
            this.id = 'content_' + (new Date).getTime();
            */
        
        $(view.id).insert({bottom: '<div class="ediromDetailContent" id="' + this.id + '" />'});
        
        this.elements = new Array();
    },
    
    load: function() {
        this.loaded = true;
    },
    
    isLoaded: function() {
        return this.loaded;
    },
    
    setUnloaded: function() {
        this.loaded = false;
        $(this.id).update();
    },
    
    setVisible: function(visible) {
    
        this.visible = visible;
    
        if(visible) {
            $(this.id).show();
            this.load();
        }else
            $(this.id).hide();
    },
    
    isActive: function() {
        return this.visible;
    },
    
    getKey: function() {
        return this.id;
    }
});