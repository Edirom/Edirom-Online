/**
 * @fileOverview This file provides the Indicator and a stack for jobs
 *
 * @author: <a href="mailto:johu@mail.uni-paderborn.de">Joachim Hunker</a>
 * @version 1.0
 */ 

de.edirom.server.main.Indicator = Class.create ({

    initialize : function(viewId) {   
        this.hashMap = new de.edirom.server.main.LinkedHashMap();
        this.index = -1;
        this.viewId = viewId;
        this.view = $(this.viewId);
        this.active = false;
        //var indicatorContainer = new Element("div", {id:"indicator"});
        
        this.view.insert({bottom: '<div id="indicator" style="display:block">\
                                       <div id="indicator_icon" class="inactive"></div>\
                                       <div id="indicator_text" class="inactive"></div>\
                                   </div>'
        });
        
        this.getJob();
    },
    
    refresh: function() {            
        this.getJob();
    },
    
    addJob: function(id, name) {
        this.hashMap.pushElement(id,name);
        this.index++;
        
        this.refresh();
    },
    
    setJobDescription: function(id, desc) {
        this.hashMap.setValue(id, desc);
        this.refresh();
    },
    
    jobFinished: function(id) {
        
        $('indicator_text').update(this.hashMap.get(id) + ' complete');
        
        this.hashMap.remove(id);
        this.index--;
        
        window.setTimeout(this.refresh.bindAsEventListener(this), 1000);
    },
    
    hide: function() {
        $('indicator').style.display = 'none';
    },
    
    show: function() {
        $('indicator').style.display = 'block';
    },
    
    //Jobs still in queue?
    getJob: function() {
        //no jobs there
        if(this.hashMap.length == 0) {
            this.active = false;
            $('indicator_text').update('');
        }
        else {            
            var idList = this.hashMap.keys();
            
            this.active = true;
            $('indicator_text').update(this.hashMap.get(idList[this.index]));
        }
        
        this.setActive(this.active);
    },
    
    setActive: function(active) {
        
        if(active) {
            $('indicator_icon').removeClassName('inactive');
            $('indicator_text').removeClassName('inactive');
            $('indicator_icon').addClassName('active');
            $('indicator_text').addClassName('active');
        } else {
            $('indicator_text').removeClassName('active');
            $('indicator_icon').removeClassName('active');
            $('indicator_text').addClassName('inactive');
            $('indicator_icon').addClassName('inactive');
        }
    }    
});    