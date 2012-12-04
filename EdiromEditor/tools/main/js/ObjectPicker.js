/**
 * A Popup that allows to select objects from the db. Has two buttons
 * @class A objectPicker dialog
 * 
 * @param {Array} _filter contains all types of objects that should be included for selection. All if empty
 * @param {Array} _preselection contains IDs of all preselected items
 */
de.edirom.server.main.ObjectPicker = Class.create({
    
    initialize: function(filter, preselection, selectedFunc, inputType) {
        
        var sources = filter.include('sources');
        var works = filter.include('works');
        var texts = filter.include('texts');
        
        this.selectedFunc = selectedFunc;
        
        if(!$('oPdiv')) {
            var oPdiv = document.createElement('div');
    		oPdiv.id = 'oPdiv';
    		document.getElementsByTagName('body')[0].appendChild(oPdiv);
        }
        
        new Ajax.Updater('oPdiv', '../main/xql/ObjectPicker.xql', {
        //new Ajax.Request('../main/xql/ObjectPicker.xql', {
            method: 'get',
            parameters: {
                sources: sources,
                works: works,
                texts: texts,
                inputType: inputType
            },
            onComplete: function(transport) {
                
                if(preselection.length > 0) {                    
                    preselection.each(function(itemID) {                        
                        if($('select_' + itemID)) {                  
                            $('select_' + itemID).checked = true;
                        }                        
                    });
                }
                
                
                window.module.getShortcutController().addShortcutListener('popup', 'popup.objectPicker', this.shortcutListener.bind(this));
                
                Event.observe($('objectPicker_cancelButton'), 'click', this.cancelButtonClick.bind(this));
                Event.observe($('objectPicker_okButton'), 'click', this.okButtonClick.bind(this));
               
               
            }.bind(this),
            onFailure: function(transport) {
                console.log('ObjectPicker konnte nicht geladen werden: \n\n' + transport.responseText);
            }
        });
        
    },
        
    closePopup: function() {
        window.module.getShortcutController().removeShortcutListener('popup', 'popup.objectPicker');
        
        Event.stopObserving($('objectPicker_cancelButton'));
        Event.stopObserving($('objectPicker_okButton'));
        
        $('objectPickerBox').remove();
    },
    
    cancelButtonClick: function() {
        this.closePopup();
    },
        
    okButtonClick: function() {
        
        var allItems = $$('.objectPicker_itemChecker input');
        var items = new Array();
        
        for(var i=0;i<allItems.length;i++) {
            if(allItems[i].checked == true)
                items.push(allItems[i].id.substring(7));
        }
        
        this.closePopup();
        if(typeof(selectedFunc) != 'null') this.selectedFunc(items);
    },
    
    shortcutListener: function(event) {
        if(event.keyCode == Event.KEY_RETURN) {
            this.okButtonClick();
            return true;
        }
        if(event.keyCode == Event.KEY_ESC) {
            this.cancelButtonClick();
            return true
        }
        
        return false;        
    }
});