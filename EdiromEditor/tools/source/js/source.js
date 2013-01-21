/**
 * @fileOverview This file provides common functionality used in source windows
 *
 * @author: <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
 * @version 1.0
 */

/** @namespace The namespace for source specific objects and functions */
if ( typeof de == 'undefined' ) de = {};
if ( typeof de.edirom == 'undefined' ) de.edirom = {};
if ( typeof de.edirom.server == 'undefined' ) de.edirom.server = {};
if ( typeof de.edirom.server.source == 'undefined' ) de.edirom.server.source = {};

/**
 * Local instance of a de.edirom.server.main.Module
 */
de.edirom.server.source.Module = Class.create(de.edirom.server.main.Module, {
    initialize: function($super) {
        $super();

        this.preInitialize();
        
        if($('sourceId').value == '-1') {
            this.postInitialize();
            
        }else {
        
            var func = function() {
                this.postInitialize();
            }.bind(this);
        
            this.source = new de.edirom.server.data.Source($('sourceId').value, func);
       }
    },
    
    preInitialize: function() {
    
        this.ignoreNextCometUpdate = false;
        
        this.logger = new de.edirom.server.main.Logger('Source', 3);
        
        this.indicator = new de.edirom.server.main.Indicator('ediromObject');
        
        this.shortcutController = new de.edirom.server.main.ShortcutController();
        this.shortcutController.addShortcutListener('module', 'module.source', this.shortcutListener.bind(this));
        
        this.controller = new de.edirom.server.main.CommandController();

        this.dropDown = new de.edirom.server.main.DropDown();

        this.saveAction = new de.edirom.server.main.SaveAction(this, this.toolbar, this.controller);
        this.undoAction = new de.edirom.server.main.UndoAction(this, this.toolbar, this.controller);
        this.redoAction = new de.edirom.server.main.RedoAction(this, this.toolbar, this.controller);        
        //this.dropDownAction = new de.edirom.server.main.DropDownAction(this, this.toolbar, this.controller, this.dropDown);
//        this.saveAction.addVisibilityListener(this.undoAction);
//        this.undoAction.addListener(this.saveAction);
    },
    
    postInitialize: function() {
    
        $('loading').hide();
//        this.addView(new de.edirom.server.source.InfoView(this, 'Struktur'));

        if(typeof(this.source) != 'undefined') {
            
            this.source.addListener(new de.edirom.server.data.DataListener(function (event) {
                
                if(event.field == 'name') {
                    $('objectTitle').update(event.getValue());
                	document.title = event.getValue();
                }
            }));
        }

        if($('sourceId').value == '-1') {
            $('objectID').innerHTML = '';
            
            this.toolbar.hide();

        }else {
            
            this.facsimile = new de.edirom.server.source.FacsimileView(this, 'Facsimile');
            this.addView(this.facsimile);
//            this.xmlView = new de.edirom.server.source.XMLView(this, 'XML');
//            this.addView(this.xmlView);
//            de.edirom.server.main.registerCometListener(this.cometUpdate.bind(this), function() {});
            
            if(window.location.search.indexOf('showPage=') != -1) {
                var pageId = window.location.search;
                pageId = pageId.substr(pageId.indexOf('showPage=') + 'showPage='.length);
                
                if(pageId.indexOf('&') != -1)
                    pageId = pageId.substring(0, pageId.indexOf('&'));
                    
                this.showPage(pageId);
            }
            
            if(window.location.search.indexOf('openXMLView') != -1) {
               this.showXMLPage(null);
            }
        }
    },
    
    shortcutListener: function(event) {
        return false;
    },
    
    getSource: function() {
        return this.source;
    },
    
    getCommandController: function() {
        return this.controller;
    },
    
    getIndicator: function() {
        return this.indicator;
    },
    
    getShortcutController: function() {
        return this.shortcutController;
    },

    getFacsimileView: function() {
        return this.facsimile;
    },

    doSave: function() {

        this.indicator.addJob('save','Saving');
  
        if(!this.controller.unsavedCommands()) return;
        
        var xqueryupdate = 'let $mei := doc("' + $('sourceId').value + '")/root() '
                            + 'return (# exist:batch-transaction #) {'
                            + this.controller.getXQueryUpdates()
                            + '}';

        $('toolbar_save_dirty').addClassName('saving');
        $('loading').innerHTML = "<span>Quelle wird gespeichert</span>";
        $('loading').show();
        
        this.ignoreNextCometUpdate = true;
        
        new Ajax.Request('../data/xql/saveObject.xql', {
            method: 'post',
            parameters: {
                updates: xqueryupdate,
                namespace: 'http://www.music-encoding.org/ns/mei'
            },
            
            onSuccess: function(transport) {
            	
            	$('toolbar_save_dirty').removeClassName('saving');
            	$('loading').hide();
            	window.status = 'edirom:closeAfterSave';
            	
            	this.indicator.jobFinished('save');
           }.bind(this),
           
           onFailure: function(transport) {
               console.log('Quelle konnte nicht gespeichert werden: \n\n' + transport.responseText);
               
               this.indicator.jobFinished('save');
           }.bind(this)
       });
    },
    
    doUndo: function() {      
        this.controller.undoCommand();
    },
    
    doRedo: function() {
        this.controller.redoCommand();
    },

    doDropDown: function() {
        var commandList = this.controller.getCommandList();
        return commandList;
    },

   showPage: function(pageID) {
    	this.setActiveView(this.facsimile);
    	this.facsimile.showPage(pageID);
    },
    
    showXMLPage: function(elementID) {
    	this.setActiveView(this.xmlView, elementID);
    },
    
    cometUpdate: function(event) {
    
        if(event.length == 0) return;
    
        var tokens = event.split(':');
        
        if(tokens[1].endsWith('.xml'))
            tokens[1] = tokens[1].substring(0, tokens[1].length - '.xml'.length);
            
        // if the update is not for this source
        if(tokens[1] != $('sourceId').value) return;

        if(this.ignoreNextCometUpdate) {
            this.ignoreNextCometUpdate = false;
            return;
        }
        
        if(tokens[0] == 'removed') {
    
            var message = 'Der Notentext ist in der Datenbank gelöscht worden. Das Fenster wird nun geschlossen.';
            var options = {firstButton: 'Ok',
                            firstFunc: "window.status = 'edirom:de.edirom.server:closeWindow'",
                            secondButtonVisible: 'false'};
    
            (new de.edirom.server.main.Popup(message, options)).showPopup();
            
        }else if(tokens[0] == 'modified') {
            
            if(this.xmlView.active) {
            
                this.checkTitle();
            
                this.funcBeforeViewSwitch = function() { this.updateAfterComet(); }.bind(this);
                return;
            }
            
            var message = 'Der Notentext ist entweder in der XML-Ansicht oder in der Datenbank geändert worden. Die Inhalte werden nun neu geladen.';
            var options = {firstButton: 'Ok',
                            firstFunc: function() { this.updateAfterComet(); }.bind(this),
                            secondButtonVisible: 'false'};
    
            (new de.edirom.server.main.Popup(message, options)).showPopup();
    	}
	},
	
	updateAfterComet: function() {
	
	    window.location = 'index.xql?id=' + $('sourceId').value;
	},
	
	checkTitle: function() {
	    new Ajax.Request('../data/xql/getSourceTitle.xql', {
            method: 'get',
            parameters: {
                id: $('sourceId').value
            },
            
            onSuccess: function(transport) {
            	
            	if(this.source.getName() != transport.responseText) {
            	    $('objectTitle').update(transport.responseText);
            	    document.title = transport.responseText;
            	}
            	    
           }.bind(this)
       });
	}
});

/**
 * Initializes the contents and listeners
 */
document.observe("dom:loaded", function() {
    window.module = new de.edirom.server.source.Module();
});

function onElementFocussed(e) {
    if(e && e.target)
        window.elementWithFocus = e.target == document ? null : e.target;
} 

if(document.addEventListener)
    document.addEventListener("focus", onElementFocussed, true);