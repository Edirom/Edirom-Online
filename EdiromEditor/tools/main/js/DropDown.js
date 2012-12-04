/**
 * @fileOverview This file provides the functionality for the dropdown menu
 *
 * @author: <a href="mailto:johu@mail.uni-paderborn.de">Joachim Hunker</a>
 * @version 1.0
 */ 

de.edirom.server.main.DropDown = Class.create ({

    initialize : function() {   
        this.timeout = 1500;
        this.closeTimer	= null;
        this.item = '';
        
        document.observe('click', this.menuClose.bindAsEventListener(this));
    },
    
    //opens the hidden menu
    menuOpen: function(id) {        
        this.menuCancelCloseTime();

        var item = document.getElementById(id);
        
        if(item)
            item.style.visibility = 'hidden';
            
        item.style.visibility = 'visible';   
    },

    //closes the actual shown menu
    menuClose: function() {      
        var item = document.getElementById('menu');
        if(item)
            item.style.visibility = 'hidden';
    },
    
    //fadeout
    menuCloseTime: function(id) {   
        this.closeTimer = window.setTimeout(this.menuClose.bind(this), this.timeout);
    },
    
    //stop menufadeout
    menuCancelCloseTime: function() {       
        if(this.closeTimer) {
            window.clearTimeout(this.closeTimer);
            this.closeTimer = null;
        }
    }, 
    
    checkVisibility: function() {
        var item = document.getElementById('menu');
        if(item.style.visibility == 'visible')
            return true;
        return false;
    }
});