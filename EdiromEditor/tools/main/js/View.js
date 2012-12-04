/**
 * A class that provides an abstract view (to be used by Info, Facsimile, XML, etc.)
 * @class {abstract} de.edirom.server.main.View
 * @author <a href="mailto:roewenstrunk@edirom.de">Daniel Ršwenstrunk</a>
 */
 de.edirom.server.main.View = Class.create({
    initialize: function(module, title) {
        this.module = module;
        this.active = false;
        
        this.id = 'view_' + (new Date).getTime();
        while($(this.id) != null)
            this.id = 'view_' + (new Date).getTime();
        
        $('viewSwitch').insert({bottom: '<div class="viewSwitchButton" id="switch_' + this.id + '">' + title + '</div>'})

        $('ediromObject').insert({bottom: '<div id="' + this.id + '" />'});
        $(this.id).hide();
        
        this.tabBar = new de.edirom.server.main.TabBar();
        
        this.contents = new Array();
        
        Event.observe($('switch_' + this.id), 'click', this.switchClicked.bind(this));
    },
    
    switchClicked: function(e) {
        if(!this.active)
            this.module.setActiveView(this);
    },
    
    addContent: function(content) {
        this.contents.push(content);
    },
    
    addContentWithTab: function(content, label) {
    
        this.addContent(content);
    
        this.tabBar.addTab(new de.edirom.server.main.Tab(this.tabBar, label, content));
    },
    
    setActive: function(active) {
        
        this.active = active;
        
        if(active) {
            $('switch_' + this.id).addClassName('active');
            $(this.id).show();
        }else {
            $('switch_' + this.id).removeClassName('active');
            $(this.id).hide();
        }
   },
   
   isActive: function() {
       return this.active;
   },
   
   getModule: function() {
       return this.module;
   },
   
   getActiveContentKey: function() {
       var activeContent;
        for(var i = 0; i < this.contents.size(); i++) {
            if(this.contents[i].isActive())
                activeContent = this.contents[i];
        }
        
        if(typeof(activeContent) != 'undefined') {
            return activeContent.getKey();
        }
    
        return "";
   }
});