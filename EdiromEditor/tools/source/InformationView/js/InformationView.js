/**
 * @fileOverview A class for a info view in sources
 *
 * @author: <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
 * @version 1.0
 */
 
de.edirom.server.source.InfoView = Class.create(de.edirom.server.main.View, {
    initialize: function($super, module, title) {
    
        $super(module, title);
        
        this.toolbarGroup = new de.edirom.server.main.ToolbarGroup(module.toolbar);
        this.toolbarGroup.setVisible(false);
        
        if($('sourceId').value == '-1') {
            
            //TODO: muss geändert werden. Hier soll ein eigenständiges Content-Element für eine neue Quelle rein
            this.addContentWithTab(new de.edirom.server.source.Overview(this), 'Übersicht');
            this.tabBar.hide();

        }else {
            module.getShortcutController().addShortcutListener('view', 'view.information', this.shortcutListener.bind(this));

            this.addContentWithTab(new de.edirom.server.source.Overview(this), 'Übersicht');
            this.addContentWithTab(new de.edirom.server.source.Pages(this), 'Seiten');
            this.addContentWithTab(new de.edirom.server.source.Structure(this), 'Struktur');
            this.addContentWithTab(new de.edirom.server.source.Bars(this), 'Takte');
            this.addContentWithTab(new de.edirom.server.source.Description(this), 'Beschreibung');
        }
        
        
    },
    
    setActive: function($super, active) {
        
        $super(active);
        this.toolbarGroup.setVisible(active);
        
        if(active) {
            this.tabBar.show();
            this.module.getShortcutController().addShortcutListener('view', 'view.information', this.shortcutListener.bind(this));
        } else
            this.module.getShortcutController().removeShortcutListener('view', 'view.information');        
    },
    
    shortcutListener: function(event) {
            
        var isMac = (navigator.userAgent.indexOf('Macintosh') != -1);
        
        if(event.which == 83 && ((isMac && event.metaKey) | (!isMac && event.ctrlKey))) {
            this.module.doSave();
            return true;
        }
        
        return false;
        
    }
});
