/**
 * @fileOverview This file provides classes for a tab bar
 *
 * @author: <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
 * @version 1.0
 */
 
 de.edirom.server.main.TabBar = Class.create({
    
    initialize: function() {
        this.tabs = new Array();
    },
    
    /**
     * Adds a new tab to this bar
     *
     * @param {de.edirom.server.main.Tab} tab The tab to add
     */
    addTab: function(tab) {
        this.tabs.push(tab);

        if(this.tabs.length == 1)
            tab.activate();
        else
            tab.deactivate(true);
    },
    
    setActive: function(tab) {
        this.tabs.each(function(_tab) {
            if(_tab == tab)
                _tab.activate();
            else
                _tab.deactivate();
        });
    },
    
    getId: function() {
        return 'tabBoxItems';
    },
    hide: function() {
        $('objectTabBox').style.display = 'none';
        $('objectHeadFrame').style.height = '25px';
    },
    show: function() {
        $('objectTabBox').style.display = 'block';
        $('objectHeadFrame').style.height = '50px';
    }
});

/**
 * A tab
 * 
 * @param {de.edirom.server.main.TabBar} tabBar The tab bar the tab is in
 * @param {String} tabId The id of the tab
 * @param {String} contentId The id of the content element to show
 */
de.edirom.server.main.Tab = Class.create({
    initialize: function(tabBar, label, content) {
        this.active = false;
        this.tabBar = tabBar;
        this.label = label;
        
        this.content = content;
        
        this.id = 'tab_' + label;
        
        $(tabBar.getId()).insert({bottom: '<div id="' + this.id + '" class="ediromDetailTab">' + label + '</div>'});
        
        Event.observe($(this.id), 'click', this.tabClicked.bind(this));
    },
    
    tabClicked: function(e) {
        if(!this.active)
            this.tabBar.setActive(this);
    },
    
    /**
     * Activates this tab
     */
    activate: function() {
        
        if(this.active) return;
        
        this.active = true;
        
        this.content.setVisible(true);
        
        $(this.id).addClassName('activeTab');
    },
    
    /**
     * Deactivates this tab
     */
    deactivate: function(force) {
        
        if((typeof(force) != 'undefined' && !force) && !this.active) return;
        
        this.active = false;
        
        this.content.setVisible(false);
        
        $(this.id).removeClassName('activeTab');
    }
});
