/**
 * @fileOverview A class for a facsimile view in sources
 *
 * @author: <a href="mailto:roewenstrunk@edirom.de">Daniel R�wenstrunk</a>
 * @version 1.0
 */

de.edirom.server.source.XMLView = Class.create(de.edirom.server.main.View, {
    initialize: function($super, module, title) {
    
        $super(module, title);
        
        this.toolbarGroup = new de.edirom.server.main.ToolbarGroup(module.toolbar);
        this.toolbarGroup.setVisible(false);
        
        de.edirom.server.source.XMLView.self = this;
        this.dontOpen = false;
    },

    openEditor: function() {
            this.openEditor(null);
    },
    
    openEditor: function(elementID) {
    
        if(!this.dontOpen) {
            if(elementID){
                 window.status = 'edirom:de.edirom.server:openEditor?uri=/db/contents/sources/' + $('sourceId').value + '.xml&height=59&elementId=' + elementID;
                $$('body')[0].setStyle('overflow:hidden');
                this.dontOpen = false;
            }else{
               window.status = 'edirom:de.edirom.server:openEditor?uri=/db/contents/sources/' + $('sourceId').value + '.xml&height=59';
                $$('body')[0].setStyle('overflow:hidden');
                this.dontOpen = false;   
            }
        }
    },
    
    closeEditor: function() {
        window.status = 'edirom:de.edirom.server:closeEditor?command=de.edirom.server.source.XMLView.doSwitch(%switch)';
    },
    
    switchClicked: function($super, e) {
        if(!this.module.getCommandController().unsavedCommands())
            $super(e);
        else {
            var message = 'Bitte speichern Sie zuerst alle Änderungen, bevor Sie in die XML-Ansicht wechseln.';
            var options = {firstButton: 'Ok',
                            secondButtonVisible: 'false'};
    
            (new de.edirom.server.main.Popup(message, options)).showPopup();
        }
    },
    
    setActive: function($super, active) {
        
        this.setActive($super, active, null)
    },
    
    setActive: function($super, active, elementID) {
        
        $super(active);
        
        this.toolbarGroup.setVisible(active);
        
        this.indicator = this.getModule().getIndicator();
        
        if(active) {
            this.tabBar.hide();
            this.indicator.hide();
            this.openEditor(elementID);
        } else {
            this.closeEditor();
            this.indicator.show();
        }
    },
    
    getActiveContentKey: function($super) {
        return 'content_source_xmlView';
    }
});

de.edirom.server.source.XMLView.self = null;

de.edirom.server.source.XMLView.doSwitch = function(doSwitch) {

    if(doSwitch)
        $$('body')[0].setStyle('overflow:auto');
    else {
        de.edirom.server.source.XMLView.self.dontOpen = true;
        de.edirom.server.source.XMLView.self.module.setActiveView(de.edirom.server.source.XMLView.self);
    }
}