/**
 * @fileOverview A class for a facsimile view in sources
 *
 * @author: <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
 * @version 1.0
 */

de.edirom.server.source.FacsimileView = Class.create(de.edirom.server.main.View, {
    initialize: function($super, module, title) {
    
        $super(module, title);

        this.content = new de.edirom.server.source.Facsimile(this);
        this.addContent(this.content);
         
        
        this.toolbarGroup = new de.edirom.server.main.ToolbarGroup(module.toolbar);
        
        this.pageAction = new de.edirom.server.source.PageAction(this.toolbarGroup);
        this.zoomAction = new de.edirom.server.source.ZoomAction(this.toolbarGroup);
        
        this.showBarsAction = new de.edirom.server.source.ShowBarsAction(this.toolbarGroup, this.content);
        //this.showAnnotationsAction = new de.edirom.server.source.ShowAnnotationsAction(this.toolbarGroup, this.content);
        this.resetFacsimileViewAction = new de.edirom.server.source.ResetFacsimileViewAction(this.toolbarGroup, this.content);
        
        this.toolbarGroup.setVisible(false);
    },
    setActive: function($super, active) {
        
        $super(active);
        
        this.toolbarGroup.setVisible(active);
        
        if(active) {
            this.module.getShortcutController().addShortcutListener('view', 'view.facsimile', this.shortcutListener.bind(this));
            
            this.tabBar.hide();
            this.content.setVisible(true);
            
            $(this.content.id).setStyle({top: $('objectHeadFrame').getHeight() +"px" });
        }else {
            this.module.getShortcutController().removeShortcutListener('view', 'view.facsimile');
            //TODO: weg? this.tabBar.show();
        }
    },
    
    shortcutListener: function(event) {
            
        var isMac = (navigator.userAgent.indexOf('Macintosh') != -1);
        
        // event.which = s
        if(event.which == 83 && ((isMac && event.metaKey) | (!isMac && event.ctrlKey))) {
            this.module.doSave();
            return true;
        }
        
        return false;
        
    },
    
    showPage: function(pageID) {
    	this.content.showPage(pageID);
    }
});
