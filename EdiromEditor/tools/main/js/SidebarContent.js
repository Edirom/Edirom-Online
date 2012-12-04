/*
 * the content of a sidebar
 */
 de.edirom.server.main.SidebarContent = Class.create({
    
    // Listeners of types de.edirom.server.main.VisibilityChangeRequestedListener and de.edirom.server.main.VisibilityChangedListener
    // have to be instantiated in subclasses (visibilityXListeners: new Array())
    visibilityChangeRequestedListeners: null,
    visibilityChangedListeners: null,
    
    initialize: function(sidebarId, sidebarContentId) {
        
        this.sidebar = sidebarId;
        this.id = sidebarContentId;
        this.loaded = false;
    
        if (!$(sidebarId))
            $(sidebarId).insert({bottom: '<div class="sidebarContent" id="' + this.id + '"></div>'});
        
        $(this.id).setStyle( { display: "none" } );
    },
    
    load: function() {
        this.loaded = true;
    },
    isLoaded: function() {
        return this.loaded;
    },
    
    requestHide: function() {
        this.visibilityChangeRequestedListeners.each(function(listener) {
            listener.visibilityChangeRequested(false);
        });
    },
    
    hide: function() {
        $(this.id).setStyle( { display: "none" } );
    },
    
    requestShow: function() {
        this.visibilityChangeRequestedListeners.each(function(listener) {
            listener.visibilityChangeRequested(true);
        }.bind(this));
    },
    
    show: function() {
        $(this.id).setStyle( { display: "block" } );
        
        if (this.visibilityChangedListeners) {
            this.visibilityChangedListeners.each(function(listener) {
                listener.visibilityChanged(true);
            }.bind(this));
        }
    },
    
    reload: function() {
    
    },
    
    addVisibilityChangeRequestedListener: function(listener) {
        this.visibilityChangeRequestedListeners.push(listener);
    },
    
    addVisibilityChangedListener: function(listener) {
        this.visibilityChangedListeners.push(listener);
    }
});
 