/*
 * the VisibilityChangeRequestedListener calls a function when the visibility status of an element is about to change
 */
de.edirom.server.main.VisibilityChangeRequestedListener = Class.create({
 
     initialize: function(visibilityChangeRequestedFunc) {
         this.visibilityChangeRequested = visibilityChangeRequestedFunc;
     } 
});

/*
 * the VisibilityChangedListener calls a function when the visibility status of an element has completely changed
 */
de.edirom.server.main.VisibilityChangedListener = Class.create({
 
     initialize: function(visibilityChangedFunc) {
         this.visibilityChanged = visibilityChangedFunc;
     } 
});
    