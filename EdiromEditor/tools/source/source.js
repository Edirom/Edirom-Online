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
        this.addView(new de.edirom.server.source.InfoView(this, 'Struktur'));

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
            this.xmlView = new de.edirom.server.source.XMLView(this, 'XML');
            this.addView(this.xmlView);
            de.edirom.server.main.registerCometListener(this.cometUpdate.bind(this), function() {});
            
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
        
        var xqueryupdate = 'let $mei := collection("/db/contents/sources")//source/id("' + $('sourceId').value + '")/root() '
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
                namespace: 'http://www.edirom.de/ns/mei'
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
    document.addEventListener("focus", onElementFocussed, true);de.edirom.server.source.Bars = Class.create(de.edirom.server.main.Content, {
    initialize: function($super, view) {
        $super(view, 'content_source_informationView_bars');
        
        this.toolbarGroup = view.toolbarGroup;
        
        this.barCountAction = new de.edirom.server.source.BarCountAction(this.toolbarGroup, this);
        
        this.barCountToolbarItem = new de.edirom.server.source.BarCountToolbarItem(this.toolbarGroup, this.barCountAction);
        
        this.barCountToolbarItem.setVisible(false);
    },
    
    load: function($super) {
        if(!this.isLoaded()) {
            new Ajax.Updater(this.id, '/source/InformationView/xql/bars.xql', {
                method:'get',
                onComplete: function(transport) {
                    $super();
                    this.init();
                }.bind(this)
            });
        }
    },
    
    init: function() {

        var source = this.view.getModule().getSource();
        var movements = source.getMovements();
        
        this.sortOrder = new Hash();
        
        movements.each(function(movement) {
            
            var headingTemplate = $('movementHeading_template');
            var heading = headingTemplate.cloneNode(true);
            heading.setAttribute('id', 'heading_' + movement.id);
            heading.update(movement.getName());
            heading.show();
            
            var tableTemplate = $('table_barsPerMov_template');
            var table = tableTemplate.cloneNode(true);
            
            table.setAttribute('id', 'table_' + movement.id);
            table.show();
                        
            var tbody = table.getElementsByClassName('bars_listBody')[0];
            tbody.setAttribute('id', 'bars_' + movement.id);
            
            $('barsTables').appendChild(heading);
            $('barsTables').appendChild(table);

            var bars = movement.getBars();
            bars.each(function(bar) {
                this.addBar(tbody, bar);
            }.bind(this));
            
        }.bind(this));

        this.scrollview = new de.edirom.server.Scrollview('barsTables', true);
        this.scrollview.setVerticalScrolling(true);

        movements.each(function(movement) {
            
            var tbody = $('bars_' + movement.id);
            this.buildSortableList(tbody);
            this.addMovementListeners(movement);

            var bars = movement.getBars();
            bars.each(function(bar) {
                this.addBarListeners(bar);
            }.bind(this));
            
        }.bind(this));

        if (this.scrollview)
            this.scrollview.refresh();
        
        this.addListeners();
        //this.buildSortableList();
        
        //new Draggable('barsToolbox');
    },
    
    addMovementListeners: function(movement) {
        movement.addListener(new de.edirom.server.data.DataListener(function(event, movementId) {
            
            if(event.type == de.edirom.server.data.DataEvent.TYPE_REMOVED && event.field == 'bar') {
                $('bars_' + movementId).removeChild($('row_' + event.getValue()));
                this.buildSortableList($('bars_' + movementId));
                if (this.scrollview)
                    this.scrollview.refresh();
                
            }else if(event.type == de.edirom.server.data.DataEvent.TYPE_ADDED && event.field == 'bar') {
                var bar = event.getSource().getBar(event.getValue());

                this.addBar($('bars_' + movementId), bar);
                this.addBarListeners(bar);

                this.buildSortableList($('bars_' + movementId));
                if (this.scrollview)
                    this.scrollview.refresh();
                
            }else if(event.type == de.edirom.server.data.DataEvent.TYPE_MODIFIED && event.field == 'bars') {
                var bar = $('row_' + event.getValue());
                
                $('bars_' + movementId).removeChild(bar);
                
                var node = event.getSource().getBarAfter(event.getValue()) == null?null:$('row_' + event.getSource().getBarAfter(event.getValue()).id);
                $('bars_' + movementId).insertBefore(bar, node);
                
                this.buildSortableList($('bars_' + movementId));
            }
            
        }.bindAsEventListener(this, movement.id)));
    },
    
    addBar: function(tbody, bar) {
        
        var source = this.view.getModule().getSource();

        var template = $('row_bars_template');
        var row = template.cloneNode(true);
        
        row.setAttribute('id', 'row_' + bar.id);
        
        row.getElementsByClassName('openButton')[0].setAttribute('id', 'open_' + bar.id);
        row.getElementsByClassName('openXMLButton')[0].setAttribute('id', 'openXML_' + bar.id);
        row.getElementsByClassName('deleteButton')[0].setAttribute('id', 'delete_' + bar.id);
        row.getElementsByClassName('bars_name_input')[0].setAttribute('id', bar.id);
        row.getElementsByClassName('bars_name_input')[0].setAttribute('value', bar.getName());
        
        //row.getElementsByClassName('movement')[0].innerHTML = bar.getPartId();
        row.getElementsByClassName('movement')[0].innerHTML = source.getMovement(bar.getPartId()).getName();
        
        //row.getElementsByClassName('page')[0].innerHTML = bar.getSurface();
        row.getElementsByClassName('page')[0].innerHTML = source.getPage(bar.getSurface()).getName();

        row.getElementsByClassName('upbeat')[0].checked = bar.getUpbeat();
        row.getElementsByClassName('upbeat')[0].setAttribute('id', 'upbeat_' + bar.id);
                
        var pause = bar.getRest();
        if(pause > 0) {
            row.getElementsByClassName('pause')[0].checked = true;
            row.getElementsByClassName('measureCount')[0].setAttribute('value', pause);
        }
        row.getElementsByClassName('pause')[0].setAttribute('id', 'pause_' + bar.id);
        row.getElementsByClassName('measureCount')[0].setAttribute('id', 'measureCount_' + bar.id);
                
        tbody.appendChild(row);
        
    },

    addBarListeners: function(bar) {

        var controller = this.view.getModule().getCommandController();
        var source = this.view.getModule().getSource();

        Event.observe($(bar.id), 'keyup', function(event, controller) {
            window.setTimeout(this.inputFieldChanged.bind(this, controller, bar, 'name', $(bar.id).value, bar.id), 600);
        }.bindAsEventListener(this, controller, source));

        Event.observe($('open_' + bar.id), 'click', function(event){
            module.showPage(bar.getSurface());
        });

        Event.observe($('openXML_' + bar.id), 'click', function(event){
            module.showXMLPage(bar.id);
        });

        Event.observe($('delete_' + bar.id), 'click', function(event, controller, barID) {

            var source = this;
            var bar = source.getBar(barID);
            var movement = source.getMovement(bar.getPartId());
            var page = source.getPage(bar.getSurface());

            //******
            var func = function() {
                controller.addCommand(new de.edirom.server.main.RemoveObjectCommand(movement, 'bars', bar));

                new Ajax.Request('../source/xql/deleteBarReferencesInWorks.xql', {
                    method: 'post',
                    parameters: {
                        sourceID: source.id,
                        measureID: bar.id
                    }
                });

            }.bind(this);
            var title = 'Takt löschen';
            var message = 'Wenn Sie Takt "' + bar.getName() + '" löschen, werden dadurch automatisch in allen Werken, die "' + source.getName() + '" referenzieren, die Verweise auf diesen Takt aufgehoben. Dies betrifft sowohl Taktkonkordanz als auch Anmerkungen.';
            var options = {firstButton: 'Abbrechen',
                            secondButton: 'Takt löschen',
                            secondFunc: func};

            (new de.edirom.server.main.Popup(message, options, title)).showPopup();
            //******


        }.bindAsEventListener(source, controller, bar.id));

        bar.addListener(new de.edirom.server.data.DataListener(function(event) {

            var bar = event.getSource();
            var row = $('row_' + bar.id);

            if(event.field == 'name')
                $(bar.id).value = event.getValue();

            else if(event.field == 'partId')
                row.getElementsByClassName('movement')[0].innerHTML = source.getMovement(bar.getPartId()).getName();

            else if(event.field == 'rest') {

                var pause = bar.getRest();
                if(pause > 0) {
                    row.getElementsByClassName('pause')[0].checked = true;
                    row.getElementsByClassName('measureCount')[0].setAttribute('value', pause);
                }

            } else if(event.field == 'upbeat')
                row.getElementsByClassName('upbeat')[0].checked = bar.getUpbeat();
        }));
    },
    
    addListeners: function() {
        //Event.observe($('import_bars'), 'click', this.importBars.bind(this));
        
        Event.observe($('selectAllBars'), 'click', this.selectAllBars.bind(this));
        
    },
    
    buildSortableList: function(tbody) {
        Sortable.create(tbody.identify(),
            {elements:$$('#'+ tbody.identify() +' tr'),
            handle:'moveButton',
            ghosting:true,
            tag:'tr',
            treetag:'tbody',
            format:/^row_(.*)$/,
            onUpdate:this.sortOrderUpdated.bind(this, tbody)
        });
        
        this.sortOrder.set(tbody.identify(), Sortable.sequence(tbody.identify()));
    },
    
    sortOrderUpdated: function(tbody) {
        var actSortOrder = Sortable.sequence(tbody.identify());
        
        if(de.edirom.areArraysEqual(actSortOrder, this.sortOrder.get(tbody.identify())))
            return;
        
        var barId = '';
        var movedAfter = '';
        
        for(var i=0; i<this.sortOrder.get(tbody.identify()).length; i++) {
            
            var j = actSortOrder.indexOf(this.sortOrder.get(tbody.identify())[i]);
            
            if(i != j && i != j+1 && i != j-1) {
                barId = this.sortOrder.get(tbody.identify())[i];
                movedAfter = (j == 0)?null:actSortOrder[j-1];
                
                break;
            }            
        }
        
        if(barId == '') {
            
            for(var i=0; i<this.sortOrder.get(tbody.identify()).length; i++) {
                
                var j = actSortOrder.indexOf(this.sortOrder.get(tbody.identify())[i]);
                
                if(i!=j) {
                    barId = this.sortOrder.get(tbody.identify())[i];
                    movedAfter = (j == 0)?null:actSortOrder[j-1];
                    
                    break;
                }
            }
        }
        
        this.sortOrder.set(tbody.identify(), actSortOrder);
        
        var source = this.view.getModule().getSource();
        var controller = this.view.getModule().getCommandController();
        
        
        var movement = source.getMovement(tbody.identify().substring(5));
        
        controller.addCommand(new de.edirom.server.main.MoveObjectCommand(movement, 'bars', barId, movedAfter));
    },
    
    importBars: function() {
        // window.status = 'edirom:de.edirom.server.source:openFilePicker?type=file&amp;filter=images,archives';
        alert('Evtl. zur Integration der automatischen Vertaktung…?');
    },
    
    inputFieldChanged: function(controller, subject, field, value, fieldID) {
        
        if(typeof this.inputFieldChanges == 'undefined')
            this.inputFieldChanges = new Array();
        
        if(typeof this.inputFieldChanges[field] == 'undefined')
            this.inputFieldChanges[field] = 'undefined';

        if(this.inputFieldChanges[field] != value && $(fieldID).value == value) {
            controller.addCommand(new de.edirom.server.main.ChangeFieldCommand(subject, field, value));
            this.inputFieldChanges[field] = value;
        }
    },
    
    selectAllBars: function() {
        var checkBoxes = $$('.selectBar');
        var allSelected = true;
        checkBoxes.each(function(checkbox) {
            if(!checkbox.checked) {
                allSelected = false;
                throw $break;
            }    
        });
        
        if(!allSelected) 
            checkBoxes.each(function(checkbox) {
                checkbox.checked = true;
            });
        else
            checkBoxes.each(function(checkbox) {
                checkbox.checked = false;
            });
    },
    
    changeBarNumbers: function(diff) {
        
        var source = this.view.getModule().getSource();
        
        var allBars = $$('.bars_listBody tr');
        
        var groupCommand = new de.edirom.server.main.GroupCommand();
        
        allBars.each(function(barRow) {
            if(barRow.getElementsByClassName('selectBar')[0].checked) {
                var bar = source.getBar(barRow.id.substring(4));
                
                var newValue = bar.changeBarNumber(diff);
                groupCommand.addGroupCommand(new de.edirom.server.main.ChangeFieldCommand(bar, 'name', newValue));
            }    
        });
        
        if(groupCommand.getLength() == 0)
            return;
                
        var controller = this.view.getModule().getCommandController();        
        controller.addCommand(groupCommand);
    },
    
    setVisible: function($super, visible) {
    
        $super(visible);
        
        this.barCountToolbarItem.setVisible(visible);
        
        if (this.scrollview)
            this.scrollview.refresh();
    }
});/*    
 *    toolbar control for working with bars in sources/infoview
 */
de.edirom.server.source.BarCountToolbarItem = Class.create(de.edirom.server.main.ToolbarItem, {
    
    initialize: function($super, toolbar, action) {
    
        $super(toolbar);
        
        this.action = action;
        
        $(this.id).insert({bottom: '<div class="toolbarSpacer"></div>'
                                          +'<div class="toolbarPressButton" id="toolbar_countBarsUp">+1</div>'
                                          +'<div class="toolbarPressButton" id="toolbar_countBarsDown">-1</div>'});

        Event.observe($('toolbar_countBarsUp'), 'click', action.countBarsUp.bindAsEventListener(action));
        Event.observe($('toolbar_countBarsDown'), 'click', action.countBarsDown.bindAsEventListener(action));
    }
    
});


/*
 * the actions for working with bars in sources/infoview
 */
de.edirom.server.source.BarCountAction = Class.create(de.edirom.server.main.Action, {
    initialize: function($super, toolbar, barsJS) {
        $super();
        
        this.barsJS = barsJS;
    },
    
    countBarsUp: function() {
        this.barsJS.changeBarNumbers(1);    
    },
    
    countBarsDown: function() {
        this.barsJS.changeBarNumbers(-1);
    }

});/**
 * @fileOverview A class for sources attached to a work
 *
 * @author: <a href="mailto:bohl@edirom.de">Benjamin Bohl</a>
 * @version 1.0
 */

de.edirom.server.source.Description = Class.create(de.edirom.server.main.Content, {
    initialize: function($super, view) {
        $super(view, 'content_source_informationView_description');
    },
    
    load: function($super) {
        if(!this.isLoaded()) {
            
        new Ajax.Updater(this.id, '/source/InformationView/xql/description.xql', {
                method:'get',
                onComplete: function(transport){
                    $super();
                    this.init();
                }.bind(this)
            });            
        }
    },
    
    init: function() {
        this.source = this.view.getModule().getSource();
        this.texts = this.source.getTexts();
        
        for(var i = 0; i < this.texts.length; i++)
            this.addText(this.texts[i]);        
        
        //TODO: scrolling
        this.addListeners();
        
        this.buildSortableList();
    },
    
    addText: function(text) {
        var row = $('row_text_template').cloneNode(true);
        row.setAttribute('id', 'row_' + text.id);
        
        row.getElementsByClassName('openButton')[0].setAttribute('id', 'open_' + text.id);
        row.getElementsByClassName('openXMLButton')[0].setAttribute('id', 'openXML_' + text.id);
        row.getElementsByClassName('deleteButton')[0].setAttribute('id', 'delete_' + text.id);
        row.getElementsByClassName('texts_name_input')[0].setAttribute('id', text.id);
        row.getElementsByClassName('texts_name_input')[0].value = text.getTitle();
        
        row.getElementsByClassName('texts_id_input')[0].setAttribute('id', 'textID_' + text.id);
        row.getElementsByClassName('texts_id_input')[0].setAttribute('value', text.id);

        var tbody = $('texts_listBody');
        tbody.appendChild(row);
        
        /**** LISTENERS *****/       
        
        Event.observe($('open_' + text.id), 'click', function(event){
            window.open('/text/index.xql?id=' +  text.id, 'text_' + (new Date()).getTime());
        });
        
        Event.observe($('openXML_' + text.id), 'click', function(event){
            window.open('/text/index.xql?id=' +  text.id + '&openXMLView', 'text_' + (new Date()).getTime());
        });
     
        var controller = this.view.getModule().getCommandController();
     
        Event.observe($('delete_' + text.id), 'click', function(event, controller, textID) {
            controller.addCommand(new de.edirom.server.main.RemoveObjectCommand(this, 'texts', textID));
        }.bindAsEventListener(source, controller, text.id));
        

//TODO: DeleteButton wieder einbauen, this.removeSource fehlt. Wichtig, um Warnhinweis einzubauen
        Event.observe($('delete_' + text.id), 'click', this.removeText.bindAsEventListener(this, this.source, text, controller));
        
        text.addListener(new de.edirom.server.data.DataListener(function(event) {
            
            var text = event.getText();
            var row = $('row_' + text.id);
            
            if(event.field == 'name')
                $(text.id).value = event.getValue();
                
            //TODO: Fill in further fields as needed
        }));
    },
    
    removeText: function(event, source, text, controller) {
  //      var mdivConcAffected = false;
    //    var measureConcAffected = false;
   //     var annotsAffected = false;
        
        var groupCommand = new de.edirom.server.main.GroupCommand();
        
        groupCommand.addGroupCommand(new de.edirom.server.main.RemoveObjectCommand(this.source, 'texts', text.id));
        controller.addCommand(groupCommand);
    },

    addListeners: function() {
        
        this.source.addListener(new de.edirom.server.data.DataListener(function(event) {
        
            if(event.type == de.edirom.server.data.DataEvent.TYPE_REMOVED && event.field == 'text') {
                this.texts = this.source.getTexts();
        
                $('texts_listBody').removeChild($('row_' + event.getValue()));                
                this.buildSortableList();
                
            }else if(event.type == de.edirom.server.data.DataEvent.TYPE_ADDED && event.field == 'text') {
                this.texts = this.source.getTexts();
        
                this.addText(event.getSource().getText(event.getValue()));
                this.buildSortableList();
            
            }else if(event.type == de.edirom.server.data.DataEvent.TYPE_MODIFIED && event.field == 'text') {
                var text = $('row_' + event.getValue());
                
                $('texts_listBody').removeChild(text);
                
                var node = event.getSource().getTextAfter(event.getValue()) == null?null:$('row_' + event.getSource().getPageAfter(event.getValue()).id);
                $('texts_listBody').insertBefore(text, node);
                
                this.buildSortableList();
            }                        
        }.bind(this)));
                 
        Event.observe($('import_description'), 'click', this.importTexts.bind(this));
        
    },
    
    buildSortableList: function() {
        Sortable.create('texts_listBody',
		        {elements:$$('#texts_listBody tr'),
		        handle:'moveButton',
		        ghosting:true,
                tag:'tr',
                treetag:'tbody',
                format:/^row_(.*)$/,
                onUpdate:this.sortOrderUpdated.bind(this)
        });
        
        this.sortOrder = Sortable.sequence('texts_listBody');
    },
    
    sortOrderUpdated: function() {
        var actSortOrder = Sortable.sequence('texts_listBody');
        
        var textId = '';
        var movedAfter = '';
        
        for(var i = 0; i < this.sortOrder.length; i++) {
            
            var j = actSortOrder.indexOf(this.sortOrder[i]);
        
            if(i != j && i != j + 1 && i != j - 1) {
                textId = this.sortOrder[i];
                movedAfter = (j == 0)?null:actSortOrder[j - 1];
                
                break;
            }
        }

        if(textId == '') {
            for(var i = 0; i < this.sortOrder.length; i++) {
                
                var j = actSortOrder.indexOf(this.sortOrder[i]);
            
                if(i != j) {
                    textId = this.sortOrder[i];
                    movedAfter = (j == 0)?null:actSortOrder[j - 1];
                
                    break;
                }
            }
        }
        
        
        var controller = this.view.getModule().getCommandController();
        
        controller.addCommand(new de.edirom.server.main.MoveObjectCommand(this.source, 'texts', textId, movedAfter));
    },
    
    importTexts: function() {
        
        var filter = ['texts'];
        var preselection = new Array();
        preselection.clear();
        
        var controller = this.view.getModule().getCommandController();
        this.texts.each(function(text) {
            preselection.push(text.id);
        });

        var func = function(items) {
            
            var textsToAdd = new Array();
            var textsToRemove = new Array();
            
            for(var i=0; i<items.length; i++) {
                if(!preselection.include(items[i]))
                    textsToAdd.push(items[i]);
            }
            
            for(var j=0; j<preselection.length; j++) {
                if(!items.include(preselection[j]))
                    textsToRemove.push(preselection[j]);
            }

            textsToAdd.each(function(textID) {
                var func2 = function(text) {
                    controller.addCommand(new de.edirom.server.main.AddObjectCommand(this.source, 'texts', text));
                }.bind(this);
            
                var text = new de.edirom.server.data.Text(textID, func2);
                
            }.bind(this));
           
            textsToRemove.each(function(textID) {
                
                this.removeText(null, this.source, this.source.getText(textID), controller);
                
            }.bind(this));
        }.bind(this);
        
        new de.edirom.server.main.ObjectPicker(filter, preselection, func, 'radio');
    },
    
    inputFieldChanged: function(controller, subject, field, value, fieldID) {
    
        if(typeof this.inputFieldChanges == 'undefined')
            this.inputFieldChanges = new Array();
        
        if(typeof this.inputFieldChanges[field] == 'undefined')
            this.inputFieldChanges[field] = 'undefined';

        if(this.inputFieldChanges[field] != value && $(fieldID).value == value && subject.getField(field) != value) {
            controller.addCommand(new de.edirom.server.main.ChangeFieldCommand(subject, field, value));
            this.inputFieldChanges[field] = value;
        }
    },
    
    setVisible: function($super, visible) {
    
        $super(visible);
        
        if(visible)
            this.view.module.getShortcutController().addShortcutListener('content', 'content.texts', function(event){ return false; });
        else
            this.view.module.getShortcutController().removeShortcutListener('content', 'content.texts');        
        
    }
    
});/**
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
de.edirom.server.source.Overview = Class.create(de.edirom.server.main.Content, {
    
    buttonEnabled: true,
    
    initialize: function ($super, view) {
        $super(view, 'content_source_informationView_overview');
    },
    
    load: function ($super) {
        if (! this.isLoaded()) {
            
            new Ajax.Updater(this.id, '/source/InformationView/xql/overview.xql', {
                method: 'get',
                onComplete: function (transport) {
                    $super();
                    this.init();
                }
                .bind(this)
            });
        }
    },
    
    init: function () {
        
        this.scrollview = new de.edirom.server.Scrollview('structure_container', true);
        this.scrollview.setVerticalScrolling(true);
                
        if ($('sourceId').value == '-1') {
            
            $('saveBox').show();
            
           /* Event.observe($('sourceDatingInput'), 'keyup', function(event) {
                // input validating checks
                var dateInput = Event.element(event).getValue().trim();
                var valF = Event.element(event).next('.inputValidationFeedbackContext');
                if (dateInput != "" && validateXQueryDate(dateInput) == false) {
                    var warning = "Ungültiges Datum. Bitte das Format JJJJ-MM-TT verwenden.";
                    if (!valF)
                        Event.element(event).insert({after: '<span class="inputValidationFeedbackContext">'+warning+'</span>'});
                    else
                        valF.innerHTML = warning;
                    this.buttonEnabled = false;
                } else if (valF) {
                    // input is correct
                    valF.innerHTML = "";
                    this.buttonEnabled = true;
                }
            }
            .bindAsEventListener(this));*/
            Event.observe($('sourceDatingInput'), 'keyup', function(event) { $('inputValidationFeedback').innerHTML = ""; });
            Event.observe($('workInput'), 'keyup', function(event) { $('inputValidationFeedback').innerHTML = ""; });
            Event.observe($('composerInput'), 'keyup', function(event) { $('inputValidationFeedback').innerHTML = ""; });
            Event.observe($('nameInput'), 'keyup', function(event) { $('inputValidationFeedback').innerHTML = ""; });
            Event.observe($('sourceSignatureInput'), 'keyup', function(event) { $('inputValidationFeedback').innerHTML = ""; });
            
            Event.observe($('cancelButton'), 'click', function (event) {
                if (this.buttonEnabled)
                window.status = 'edirom:de.edirom.server:closeWindow';
            }
            .bindAsEventListener(this));
            
            Event.observe($('saveButton'), 'click', function (event) {
                if (this.buttonEnabled) {
                    this.buttonEnabled = false;
                    this.createNewSource();
                }
            }
            .bindAsEventListener(this));
        } else {
            
            var source = this.view.getModule().getSource();
            
            $('workInput').value = source.getWorkName();
            $('composerInput').value = source.getComposer();
            $('nameInput').value = source.getName();
            $('sourceSignatureInput').value = source.getSignature();
            $('sourceDatingInput').value = source.getDating();
            
            for(var i = 0; i < $('sourceTypeInput').length; i++) {
                if($('sourceTypeInput').options[i].value == source.getType())
                    $('sourceTypeInput').selectedIndex = i;
            }
            
            //selectedIndex = der index, dessen value = source.getType();
            //$('sourceTypeInput').selectedIndex.value = source.getType();
            
            this.addListeners();
        }
    },
    
    addListeners: function () {
        var source = this.view.getModule().getSource();
        
        var controller = this.view.getModule().getCommandController();
        
        source.addListener(new de.edirom.server.data.DataListener(function (event) {
            
            if (event.field == 'name')
            $('nameInput').value = event.getValue(); else if (event.field == 'signature')
            $('sourceSignatureInput').value = event.getValue(); else if (event.field == 'composer')
            $('composerInput').value = event.getValue(); else if (event.field == 'workName')
            $('workInput').value = event.getValue(); else if (event.field == 'dating')
            $('sourceDatingInput').value = event.getValue(); else if (event.field == 'type')
            $('sourceTypeInput').selectedIndex.value = event.getValue();
        }));
        
        Event.observe($('sourceSignatureInput'), 'keyup', function (event, controller, source) {
            window.setTimeout(this.inputFieldChanged.bind(this, controller, source, 'signature', $('sourceSignatureInput').value, 'sourceSignatureInput'), 600);
        }
        .bindAsEventListener(this, controller, source));
        
        Event.observe($('nameInput'), 'keyup', function (event, controller, source) {
            window.setTimeout(this.inputFieldChanged.bind(this, controller, source, 'name', $('nameInput').value, 'nameInput'), 600);
        }
        .bindAsEventListener(this, controller, source));
        
        Event.observe($('composerInput'), 'keyup', function (event, controller, source) {
            window.setTimeout(this.inputFieldChanged.bind(this, controller, source, 'composer', $('composerInput').value, 'composerInput'), 600);
        }
        .bindAsEventListener(this, controller, source));
        
        Event.observe($('workInput'), 'keyup', function (event, controller, source) {
            window.setTimeout(this.inputFieldChanged.bind(this, controller, source, 'workname', $('workInput').value, 'workInput'), 600);
        }
        .bindAsEventListener(this, controller, source));
        
        Event.observe($('sourceDatingInput'), 'keyup', function (event, controller, source) {
            window.setTimeout(this.inputFieldChanged.bind(this, controller, source, 'dating', $('sourceDatingInput').value, 'sourceDatingInput'), 600);
        }
        .bindAsEventListener(this, controller, source));
        
        Event.observe($('sourceTypeInput'), 'change', function (event, controller, source) {
            controller.addCommand(new de.edirom.server.main.ChangeFieldCommand(source, "type", $('sourceTypeInput').options[$('sourceTypeInput').selectedIndex].value));
        }
        .bindAsEventListener(this, controller, source));
    },
    
    inputFieldChanged: function (controller, subject, field, value, fieldID) {
        
        if (typeof this.inputFieldChanges == 'undefined')
            this.inputFieldChanges = new Array();
        
        if (typeof this.inputFieldChanges[field] == 'undefined')
            this.inputFieldChanges[field] = 'undefined';
        
        if (this.inputFieldChanges[field] != value && $(fieldID).value == value && subject.getField(field) != value) {
            controller.addCommand(new de.edirom.server.main.ChangeFieldCommand(subject, field, value));
            this.inputFieldChanges[field] = value;        
        }
    },
    
    createNewSource: function () {
        var work = $('workInput').value.trim();
        var composer = $('composerInput').value.trim();
        var name = $('nameInput').value.trim();
        var signature = $('sourceSignatureInput').value.trim();
//        var dating = validateXQueryDate( $('sourceDatingInput').value.trim() );
//        if (dating == false) dating = "";
        var dating = $('sourceDatingInput').value.trim();
        var type = $('sourceTypeInput').options[$('sourceTypeInput').selectedIndex].value;
        
        if (work.blank() && composer.blank() && name.blank() && signature.blank()) {
            $('inputValidationFeedback').innerHTML = "Werk, Komponist, Bezeichnung oder Signatur erforderlich.";
            this.buttonEnabled = true;
            return;
        }
        
        new Ajax.Request('../data/xql/createSource.xql', {
            method: 'get',
            parameters: {
                fields: 'workInput' + '__%__' + 'composerInput' + '__%__' + 'nameInput' + '__%__' + 'sourceSignatureInput' + '__%__' + 'sourceDatingInput' + '__%__' + 'sourceTypeInput',
                values: work + '__%__' + composer + '__%__' + name + '__%__' + signature + '__%__' + dating + '__%__' + type
            },
            onSuccess: function (transport) {
                var id = transport.responseText;
                if (id.indexOf('ERROR') != - 1)
                alert('Quelle konnte nicht angelegt werden: \n\n' + transport.responseText); else
                window.location.href = '/source/index.xql?id=' + id;
            }
            .bind(this),
            onFailure: function (transport) {
                alert('Quelle konnte nicht angelegt werden: \n\n' + transport.responseText);
            }
        });
    },
    
    setVisible: function ($super, visible) {
        
        $super(visible);
        
        if (visible)
        this.view.module.getShortcutController().addShortcutListener('content', 'content.overview', function (event) {
            return false;
        }); else
        this.view.module.getShortcutController().removeShortcutListener('content', 'content.overview');
        
        if (this.scrollview)
        this.scrollview.refresh();
    }
});de.edirom.server.source.Pages = Class.create(de.edirom.server.main.Content, {
    initialize: function($super, view) {
        $super(view, 'content_source_informationView_pages');
        
        this.toolbarGroup = view.toolbarGroup;
        this.renamePagesAction = new de.edirom.server.source.RenamePagesAction(this.toolbarGroup, this);
        
        this.pagesToolbarItem = new de.edirom.server.source.RenamePagesToolbarItem(this.toolbarGroup, this.renamePagesAction);
        this.pagesToolbarItem.setVisible(false);
    },
    
    load: function($super) {
        if(!this.isLoaded()) {
		    
			new Ajax.Updater(this.id, '/source/InformationView/xql/pages.xql', {
        		method:'get',
        		onComplete: function(transport){
        			$super();
        			
        			this.init();
        		}.bind(this)
    		});
		}
    },
    
    init: function() {
        var source = this.view.getModule().getSource();
        var pages = source.getPages();

        for(var i = 0; i < pages.length; ++i)
            this.addPage(pages[i]);

        this.scrolltable = new de.edirom.server.Scrolltable('pages_list_container', 'pages_list', true);
        this.scrolltable.setVerticalScrolling(true);

        for(var i = 0; i < pages.length; ++i)
            this.addPageListeners(pages[i]);

        this.addListeners();
        this.buildSortableList();
    },
    
    addPage: function(page) {

        var tbody = $('pages_listBody');
        var template = $('row_page_template');

        var row = template.cloneNode(true);
        row.setAttribute('id', 'row_' + page.id);
        
        row.getElementsByClassName('openButton')[0].setAttribute('id', 'open_' + page.id);
        row.getElementsByClassName('openXMLButton')[0].setAttribute('id', 'openXML_' + page.id);
        row.getElementsByClassName('deleteButton')[0].setAttribute('id', 'delete_' + page.id);
        row.getElementsByClassName('pages_name_input')[0].setAttribute('id', page.id);
        row.getElementsByClassName('pages_name_input')[0].setAttribute('value', page.getName());

        row.getElementsByClassName('imageScale')[0].innerHTML = page.getWidth() + ' x ' + page.getHeight();
        row.getElementsByClassName('imageFileName')[0].innerHTML = page.getFileName();
        row.getElementsByClassName('imageDate')[0].innerHTML = page.getDate();
        
        row.getElementsByClassName('imageUri')[0].setAttribute('value', page.getPath());
        row.getElementsByClassName('imageUri')[0].setAttribute('id', 'imageUri_' + page.id);

        tbody.appendChild(row);
       
        if (this.scrolltable)
            this.scrolltable.refresh(0, 1000000);
    },

    addPageListeners: function(page) {

        var controller = this.view.getModule().getCommandController();

        Event.observe($(page.id), 'keyup', function(event, controller) {
            window.setTimeout(this.inputFieldChanged.bind(this, controller, page, 'name', $(page.id).value, page.id), 600);
        }.bindAsEventListener(this, controller, page.id));

        Event.observe($('open_' + page.id), 'click', function(event, pageID){
            module.showPage(pageID);
        }.bindAsEventListener(this, page.id));

        Event.observe($('openXML_' + page.id), 'click', function(event, pageID){
            module.showXMLPage(pageID);
        }.bindAsEventListener(this, page.id));

        Event.observe($('delete_' + page.id), 'click', this.deletePage.bindAsEventListener(this, source, page, controller));

        page.addListener(new de.edirom.server.data.DataListener(function(event) {

            var page = event.getSource();
            var row = $('row_' + page.id);

            if(event.field == 'name')
                $(page.id).value = event.getValue();

            else if(event.field == 'width' || event.field == 'height')
                row.getElementsByClassName('imageScale')[0].innerHTML = page.getWidth() + ' x ' + page.getHeight();

            else if(event.field == 'fileName')
                row.getElementsByClassName('imageFileName')[0].innerHTML = page.getFileName();

            else if(event.field == 'imageDate')
                row.getElementsByClassName('imageDate')[0].innerHTML = page.getDate();
        }));
    },
    
    inputFieldChanged: function(controller, subject, field, value, fieldID) {
    
        if(typeof this.inputFieldChanges == 'undefined')
            this.inputFieldChanges = new Array();
        
        if(typeof this.inputFieldChanges[fieldID + "_" + field] == 'undefined')
            this.inputFieldChanges[fieldID + "_" + field] = 'undefined';

        if(this.inputFieldChanges[fieldID + "_" + field] != value && $(fieldID).value == value && subject.getField(field) != value) {
            controller.addCommand(new de.edirom.server.main.ChangeFieldCommand(subject, field, value));
            this.inputFieldChanges[fieldID + "_" + field] = value;
        }
    },
     
    addListeners: function() {
    
        var source = this.view.getModule().getSource();
        source.addListener(new de.edirom.server.data.DataListener(function(event) {
                
            if(event.type == de.edirom.server.data.DataEvent.TYPE_REMOVED && event.field == 'page') {
                $('pages_listBody').removeChild($('row_' + event.getValue()));
                this.buildSortableList();
            
            }else if(event.type == de.edirom.server.data.DataEvent.TYPE_ADDED && event.field == 'page') {
                var page = event.getSource().getPage(event.getValue());
                this.addPage(page);
                this.addPageListeners(page)
                this.buildSortableList();
            
            }else if(event.type == de.edirom.server.data.DataEvent.TYPE_MODIFIED && event.field == 'page') {
                var page = $('row_' + event.getValue());
                
                $('pages_listBody').removeChild(page);
                
                var node = event.getSource().getPageAfter(event.getValue()) == null?null:$('row_' + event.getSource().getPageAfter(event.getValue()).id);
                $('pages_listBody').insertBefore(page, node);
                
                this.buildSortableList();
            
            }
        }.bind(this)));
        
        Event.observe($('import_pages'), 'click', this.importPages.bind(this));
    },
    
    buildSortableList: function() {
		Sortable.create('pages_listBody',
		        {elements:$$('#pages_listBody tr'),
		        handle:'moveButton',
		        ghosting:true,
                tag:'tr',
                treetag:'tbody',
                format:/^row_(.*)$/,
                onUpdate:this.sortOrderUpdated.bind(this)
        });
        
        this.sortOrder = Sortable.sequence('pages_listBody');
    },
    
    sortOrderUpdated: function() {
        var actSortOrder = Sortable.sequence('pages_listBody');
        
        if(de.edirom.areArraysEqual(actSortOrder, this.sortOrder))
            return;
        
        var pageId = '';
        var movedAfter = '';
        
        for(var i = 0; i < this.sortOrder.length; i++) {
            
            var j = actSortOrder.indexOf(this.sortOrder[i]);
        
            if(i != j && i != j + 1 && i != j - 1) {
                pageId = this.sortOrder[i];
                movedAfter = (j == 0)?null:actSortOrder[j - 1];
                
                break;
            }
        }

        if(pageId == '') {
            for(var i = 0; i < this.sortOrder.length; i++) {
                
                var j = actSortOrder.indexOf(this.sortOrder[i]);
            
                if(i != j) {
                    pageId = this.sortOrder[i];
                    movedAfter = (j == 0)?null:actSortOrder[j - 1];
                
                    break;
                }
            }
        }
        
        this.sortOrder = actSortOrder;
        
        var source = this.view.getModule().getSource();
        var controller = this.view.getModule().getCommandController();
        
        controller.addCommand(new de.edirom.server.main.MoveObjectCommand(source, 'pages', pageId, movedAfter));
    },
    
    importPages: function() {
        window.status = 'edirom:de.edirom.server.source:openFilePicker?type=file&amp;filter=images,archives';
    },
    
    deletePage: function(event, source, page, controller) {
        
        var barIDs = page.getBarIDs();
        if(barIDs.length > 0) {
            var groupCommand = new de.edirom.server.main.GroupCommand();
            var bars = source.getBarsSorted(barIDs);        
            
            for(var i = bars.length - 1; i >= 0; i--) {
                var movement = source.getMovement(bars[i].getPartId());
                groupCommand.addGroupCommand(new de.edirom.server.main.RemoveObjectCommand(movement, 'bars', bars[i]));
            }
            
            groupCommand.addGroupCommand(new de.edirom.server.main.RemoveObjectCommand(source, 'pages', page));
            
            
            var func = function() {
                controller.addCommand(groupCommand);
                
                new Ajax.Request('../source/xql/deletePageReferencesInWorks.xql', {
                    method: 'post',
                    parameters: {
                        sourceID: source.id,
                        pageID: page.id
                    }
                });       
                
            }.bind(this);

            var title = 'Seite löschen';
            //var details = 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum ';
            var message = 'Wenn Sie Seite "' + page.getName() + '" löschen, werden gleichzeitig ' + barIDs.length + ' darauf enthaltene Takte gelöscht.';
            var options = {firstButton: 'Abbrechen',
                            secondButton: 'Seite löschen',
                            secondFunc: func};
        
            (new de.edirom.server.main.Popup(message, options, title)).showPopup();
        } else 
            controller.addCommand(new de.edirom.server.main.RemoveObjectCommand(source, 'pages', page));
    },
    
    setVisible: function($super, visible) {
    
        $super(visible);
        
        this.pagesToolbarItem.setVisible(visible);
        
        if(visible)
            this.view.module.getShortcutController().addShortcutListener('content', 'content.pages', function(event){ return false; });
        else
            this.view.module.getShortcutController().removeShortcutListener('content', 'content.pages');        
        
        if (this.scrolltable)
            this.scrolltable.refresh();
    },
    
    renamePages: function() {
    	
    	var source = this.view.getModule().getSource();        
        var pages = source.getPages();
    	
        var controller = this.view.getModule().getCommandController();
        
        var groupCommand = new de.edirom.server.main.GroupCommand();

    	for(var i = 0; i < pages.length; i++) {
    		var newName = $$('#pages_listBody tr').indexOf($("row_" + pages[i].id)) + 1;
    		
    		if(pages[i].getName() != newName) {
    			groupCommand.addGroupCommand(new de.edirom.server.main.ChangeFieldCommand(pages[i], "name", newName));    			
    			
    			if(typeof this.inputFieldChanges == 'undefined')
    	            this.inputFieldChanges = new Array();
    	        
    	        if(typeof this.inputFieldChanges[pages[i].id + "_name"] == 'undefined')
    	            this.inputFieldChanges[pages[i].id + "_name"] = 'undefined';
    	        
    	        this.inputFieldChanges[pages[i].id + "_name"] = newName;
    		}
    	}

    	if(groupCommand.getLength() > 0)
    		controller.addCommand(groupCommand);
    }
    
});

/**
 * Imports an Image
 * 
 * @param {String} pathOrig The original filename
 * @param {String} path The unique filename in the system
 * @param {String} width The width of the image
 * @param {String} height The height of the image
 */
de.edirom.server.source.importImage = function(pathOrig, path, width, height) {

    var imageId = 'edirom_image_' + Math.uuid().toLowerCase();

    new Ajax.Request('../data/xql/createImage.xql', {
        method: 'get',
        parameters: {
            id: imageId,
            path: path,
            pathOrig: pathOrig,
            width: width,
            height: height
        },
        onSuccess: function(transport) {
        
        }.bind(this),
        onFailure: function(transport) {
            console.log('Bilddaten konnten nicht abgelegt werden: \n\n' + transport.responseText);
        }
    });

    var pageNo = de.edirom.server.source.generatePageNo();
    
    var id = 'edirom_surface_' + Math.uuid().toLowerCase();
    
    var object = new de.edirom.server.data.Page(id, pageNo, width, height, pathOrig, '', path, 'xmldb:exist:///db/contents/images/' + imageId + '.xml');
    var controller = window.module.getCommandController();
    var source = window.module.getSource();
    
    controller.addCommand(new de.edirom.server.main.AddObjectCommand(source, 'pages', object));
}

/**
 * Starts the import job
 */
de.edirom.server.source.startImageImportJob = function() {
    window.module.getIndicator().addJob('importImagesJob', 'Importiere Bilder…');
}

/**
 * Updates the import job description
 * 
 * @param {String} desc The new description
 */
de.edirom.server.source.updateImageImportJob = function(desc) {
    window.module.getIndicator().setJobDescription('importImagesJob', desc);
}

/**
 * Finishes the import job
 */
de.edirom.server.source.finishImageImportJob = function() {
    window.module.getIndicator().jobFinished('importImagesJob');
}

de.edirom.server.source.generatePageNo = function() {
    
    var inputs = $$('input.pages_name_input');
    var max = 0;
    
    for(var i = 0; i < inputs.length; i++) {
        if(!isNaN($(inputs[i]).value) && parseInt($(inputs[i]).value) > max)
            max = parseInt($(inputs[i]).value);
    }
    
    return (max + 1);
}
/*
 * a toolbar item to show or hide bars
 */
de.edirom.server.source.RenamePagesToolbarItem = Class.create(de.edirom.server.main.ToolbarItem, {
    initialize: function($super, toolbar, action) {
        
        $super(toolbar);
        this.action = action;
        $(this.getId()).insert({bottom: '<div class="toolbarSpacer"></div>'
                                          +'<div class="toolbarSwitchButton" style="" id="toolbar_renamePages" title="Benennt alle Seiten in der angezeigten Reihenfolge neu"> </div>'});
		
        
        Event.observe($('toolbar_renamePages'), 'click', action.renamePages.bind(action));
    }
});


/*
 * the actions for hiding or showing bars
 */
de.edirom.server.source.RenamePagesAction = Class.create(de.edirom.server.main.Action, {
    
    initialize: function($super, toolbar, facsimileContent) {
        $super();
        
        this.facsimileContent = facsimileContent;
        
        //this.toolbarItem = new de.edirom.server.source.RenamePagesToolbarItem(toolbar, this);
    },
    
    renamePages: function() {
        this.facsimileContent.renamePages();
    }
});
de.edirom.server.source.Structure = Class.create(de.edirom.server.main.Content, {
    initialize: function($super, view) {
        $super(view, 'content_source_informationView_structure');
    },
    
    load: function($super) {
        if(!this.isLoaded()) {
		
			new Ajax.Updater(this.id, '/source/InformationView/xql/structure.xql', {
        		method:'get',
        		onComplete: function(transport){
        			$super();
        			
        			this.init();
        		}.bind(this)
    		});
		}
    },
    
    init: function() {
        var source = this.view.getModule().getSource();
        var movements = source.getMovements();
                
        this.scrollview = new de.edirom.server.Scrollview('structure_list_container', true);
        this.scrollview.setVerticalScrolling(true);
        
        for(var i = 0; i < movements.length; ++i)
            this.addMovement(movements[i]);

        this.addListeners();
        this.buildSortableList();
    },
    
    addMovement: function(movement) {
        var source = this.view.getModule().getSource();    
        
        var box = $('sourceStructure'); 
        var template = $('sourceStructureTemplate');   
        
        var controller = this.view.getModule().getCommandController();
        
        var node = template.cloneNode(true);
        node.setAttribute('id', 'sourceStructure_mdiv_' + movement.id);
        
        node.setAttribute('onmouseover', '$(\'delete_sourceStructure_mdiv_' + movement.id + '\').show();');
        node.setAttribute('onmouseout', '$(\'delete_sourceStructure_mdiv_' + movement.id + '\').hide();');
        
        node.getElementsByClassName('deleteButton')[0].setAttribute('id', 'delete_sourceStructure_mdiv_' + movement.id);
        node.getElementsByClassName('mdivBox')[0].setAttribute('id', 'mdivBox_' + movement.id);
        node.getElementsByClassName('mdivName')[0].setAttribute('id', movement.id);
        node.getElementsByClassName('mdivName')[0].setAttribute('value', movement.getName());
        node.getElementsByClassName('mdivBars')[0].update(movement.countBars());
        
        box.appendChild(node);
        
        /**** LISTENERS *****/
        
        var movementID = movement.id;
        
        Event.observe($(movement.id), 'keyup', function(event, controller) { 
            window.setTimeout(this.inputFieldChanged.bind(this, controller, movement, 'name', $(movement.id).value, movement.id), 600);
        }.bindAsEventListener(this, controller, movement.id));
        
        Event.observe($('delete_sourceStructure_mdiv_' + movement.id), 'click', this.deleteMovement.bindAsEventListener(this, source, movement, controller)); 
        
        movement.addListener(new de.edirom.server.data.DataListener(function(event) {
        
            var movement = event.getSource();
            var node = $('sourceStructure_mdiv_' + movement.id);
            
            if(event.field == 'name')
                $(movement.id).value = event.getValue();
                
            else if(event.type == de.edirom.server.data.DataEvent.TYPE_ADDED && event.field == 'bar')
                node.getElementsByClassName('mdivBars')[0].update(movement.countBars());
                
            else if(event.type == de.edirom.server.data.DataEvent.TYPE_REMOVED && event.field == 'bar')
                node.getElementsByClassName('mdivBars')[0].update(movement.countBars());
        }));
        
        if (this.scrolltable)
            this.scrolltable.refresh();
    },
    
    addListeners: function() {
    
        var source = this.view.getModule().getSource();
        
        source.addListener(new de.edirom.server.data.DataListener(function(event) {
            
            if(event.type == de.edirom.server.data.DataEvent.TYPE_REMOVED && event.field == 'movement') {
                $('sourceStructure').removeChild($('sourceStructure_mdiv_' + event.getValue()));
                this.buildSortableList();
                
                if (this.scrollview)
                    this.scrollview.refresh();
                
            }else if(event.type == de.edirom.server.data.DataEvent.TYPE_ADDED && event.field == 'movement') {
                this.addMovement(event.getSource().getMovement(event.getValue()));
                this.buildSortableList();
            
                if (this.scrollview)
                    this.scrollview.refresh(0, 1000000);
            
            }else if(event.type == de.edirom.server.data.DataEvent.TYPE_MODIFIED && event.field == 'movement') {
                var movement = $('sourceStructure_mdiv_' + event.getValue());
                
                $('sourceStructure').removeChild(movement);
                
                var node = event.getSource().getMovementAfter(event.getValue()) == null?null:$('sourceStructure_mdiv_' + event.getSource().getMovementAfter(event.getValue()).id);
                $('sourceStructure').insertBefore(movement, node);
                
                this.buildSortableList();
            
            }
        }.bind(this)));
        
        Event.observe($('addMovement'), 'click', this.createMovement.bind(this));
        
        
    },

    buildSortableList: function() {
        Sortable.create('sourceStructure',
                {elements:$$('#sourceStructure .sourceStructure_mdiv'),
                ghosting:true,
                tag:'div',
                format:/^sourceStructure_mdiv_(.*)$/,
                onUpdate:this.sortOrderUpdated.bind(this)
        });
        
        this.sortOrder = Sortable.sequence('sourceStructure');
    },
    
    sortOrderUpdated: function() {
    
        var actSortOrder = Sortable.sequence('sourceStructure');
        
        if(de.edirom.areArraysEqual(actSortOrder, this.sortOrder))
            return;
        
        var movementId = '';
        var movedAfter = '';
        
        for(var i = 0; i < this.sortOrder.length; i++) {
            
            var j = actSortOrder.indexOf(this.sortOrder[i]);
        
            if(i != j && i != j + 1 && i != j - 1) {
                movementId = this.sortOrder[i];
                movedAfter = (j == 0)?null:actSortOrder[j - 1];
                
                break;
            }
        }

        if(movementId == '') {
            for(var i = 0; i < this.sortOrder.length; i++) {
                
                var j = actSortOrder.indexOf(this.sortOrder[i]);
            
                if(i != j) {
                    movementId = this.sortOrder[i];
                    movedAfter = (j == 0)?null:actSortOrder[j - 1];
                
                    break;
                }
            }
        }
        
        this.sortOrder = actSortOrder;
        
        var source = this.view.getModule().getSource();
        var controller = this.view.getModule().getCommandController();
        controller.addCommand(new de.edirom.server.main.MoveObjectCommand(source, 'movements', movementId , movedAfter));        
    },
    
    createMovement: function() {
        var id = 'edirom_mdiv_' + Math.uuid().toLowerCase();
        
        var source = this.view.getModule().getSource();
        var controller = this.view.getModule().getCommandController();
        
        var object = new de.edirom.server.data.Movement(id, 'unbenannt', source);
        
        controller.addCommand(new de.edirom.server.main.AddObjectCommand(source, 'movements', object));
        
    },
    
    deleteMovement: function(event, source, movement, controller) {
        
        var groupCommand = new de.edirom.server.main.GroupCommand();
        
        var bars = movement.getBars();
        var bar = movement.getLastBar();
        while(bar != null && bar !== false) {
            groupCommand.addGroupCommand(new de.edirom.server.main.RemoveObjectCommand(movement, 'bars', bar));
            bar = movement.getBarBefore(bar.id);
        }

        groupCommand.addGroupCommand(new de.edirom.server.main.RemoveObjectCommand(source, 'movements', movement));
        
        if(bars.length > 0) {
        
            var func = function() {
                controller.addCommand(groupCommand);
                
                new Ajax.Request('../source/xql/deleteMdivReferencesInWorks.xql', {
                    method: 'post',
                    parameters: {
                        sourceID: source.id,
                        mdivID: movement.id
                    }
                });       
                
            }.bind(this);
            
            var title = 'Satz löschen';
            var message = 'Wenn Sie den Satz "' + movement.getName() + '" löschen, werden gleichzeitig ' + bars.length + ' darin enthaltene Takte gelöscht.';
            var options = {firstButton: 'Abbrechen',
                            secondButton: 'Satz löschen',
                            secondFunc: func};
                            
            (new de.edirom.server.main.Popup(message, options, title)).showPopup();
        } else
            controller.addCommand(groupCommand);
        
    },
    
    inputFieldChanged: function(controller, subject, field, value, fieldID) {    
    
        if(typeof this.inputFieldChanges == 'undefined')
            this.inputFieldChanges = new Array();
        
        if(typeof this.inputFieldChanges[field] == 'undefined')
            this.inputFieldChanges[field] = 'undefined';

        if(this.inputFieldChanges[field] != value && $(fieldID).value == value && subject.name != value) {
            controller.addCommand(new de.edirom.server.main.ChangeFieldCommand(subject, field, value));
            this.inputFieldChanges[field] = value;
        }
    },
    
    setVisible: function($super, visible) {
    
        $super(visible);

        if (this.scrollview)
            this.scrollview.refresh();
    }
});

/**
 * @fileOverview Content for operating on facsimiles
 *
 * @author: <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
 * @version 1.0
 */

de.edirom.server.source.Facsimile = Class.create(de.edirom.server.main.Content, {
    
    // variable indicating which tool is active
    clickMode: '',
    
    // whether the bars are visible or not
    barsVisible: false,
    
    // whether the bars positions are dirty or correct
    barsPositionsDirty: true,
    
    // indicats whether the HTML for bars on current page has been already constructed
    barsRendered: false,
    
    marquee: null,
    
    initialize: function($super, view) {
        $super(view, 'content_source_facsimileView_facsimile');        
        this.source = view.module.source;
        
        this.shortcutController = view.module.getShortcutController();        
    },
    
    setVisible: function($super, visible) {
        
        $super(visible);
        
        if(visible) 
            this.shortcutController.addShortcutListener('content', 'content.facsimile', this.shortcutListener.bind(this));
        else
            this.shortcutController.removeShortcutListener('content', 'content.facsimile');
    },
    
    load: function($super) {
        if(!this.isLoaded()) {
		    new Ajax.Updater(this.id, '/source/FacsimileView/xql/facsimiles.xql', {
        		method:'get',
        		parameters: {id:$('sourceId').value},
        		onComplete: function(){
        			$super();
        			
        			this.sidebar = new de.edirom.server.main.Sidebar(this.id);
        			
        			this.init();
                    
                    this.facsimileMarkSidebarContent = new de.edirom.server.source.FacsimileMarkSidebarContent(this.sidebar.getContentContainerId(), this);
                    this.sidebar.addContent(this.facsimileMarkSidebarContent);
                    this.facsimileMarkAction = new de.edirom.server.source.FacsimileMarkAction(this.view.toolbarGroup, this.sidebar, this.facsimileMarkSidebarContent);
                    
                }.bind(this)
    		});
		}
    },
    
    init: function() {
    
        this.addListeners();

        this.viewer = new de.edirom.server.main.FacsimileViewer($('imageContainer'), this.source.getPagesAsMap());
        this.bindListeners();

        if(typeof this.facsimileToLoad != 'undefined' && this.facsimileToLoad != null) {
        	var facsimileToLoadTmp = this.facsimileToLoad;
        	this.facsimileToLoad = null;
        	this.loadFacsimile(facsimileToLoadTmp);
        	
        }else {
	        var source = this.view.getModule().getSource();
	        var facsimile = source.getFirstPage();
	        
	        if(facsimile != null)
	            this.loadFacsimile(facsimile);
        }
    },
    
    getCommandController: function(){
        return this.view.getModule().getCommandController();
    },
    
    addListeners: function() {
		Event.observe($('toolbar_zoomInput'), 'keyup', this.updateZoom.bind(this));
		Event.observe($('toolbar_zoomSmaller'), 'click', this.updateZoom.bindAsEventListener(this, -1));
		Event.observe($('toolbar_zoomLarger'), 'click', this.updateZoom.bindAsEventListener(this, 1));
		
		Event.observe($('toolbar_pageInput'), 'keyup', this.updateFacsimile.bind(this));
		Event.observe($('toolbar_prevPage'), 'click', this.prevDigilibImage.bind(this));
		Event.observe($('toolbar_nextPage'), 'click', this.nextDigilibImage.bind(this));
	},
    
    bindListeners: function() {
        this.viewer.addZoomListener(this.zoomChanged.bind(this));
        this.viewer.addOffsetListener(this.offsetChanged.bind(this));

        this.viewer.addMouseDownListener(this.mouseDownListener.bind(this));
    },
    
    loadFacsimile: function(facsimile) {
    
        this.preLoadFacsimile();
        this.viewer.loadFacsimile(facsimile.id);
        this.postLoadFacsimile(facsimile);
    },
           
    preLoadFacsimile: function() {
        if(typeof this.viewer != 'undefined' && typeof this.viewer.getFacsimileId() != 'undefined')
           this.source.getPage(this.viewer.getFacsimileId()).removeListeners('facsimileView_facsimile');

		var bars = this.barsVisible;

        //clears rectangles of highlighted bars when changing pages
        if(this.facsimileMarkSidebarContent)
            this.resetFacsimileMarkSidebar();
		
        this.removeBars();
    },
    
    resetFacsimileMarkSidebar: function() {
        if(this.facsimileMarkSidebarContent.activeBar != '' && this.facsimileMarkSidebarContent.focussed == 0) {
            if(this.marquee != null) {
    	        this.marquee.resetMarquee(this.facsimileMarkSidebarContent.activeBar);
                this.facsimileMarkSidebarContent.toggleClickMode(this, 'editBar');
            }			        
    	    else    
    	        this.facsimileMarkSidebarContent.hideBarDetails();
    	}
    },
                
    postLoadFacsimile: function(facsimile) {

        $('toolbar_pageInput').value = facsimile.getName();
        
        this.source.getPage(this.viewer.getFacsimileId()).addListener(new de.edirom.server.data.DataListener('facsimileView_facsimile', function(event) {
            
            if(event.field == 'bar' && event.type == de.edirom.server.data.DataEvent.TYPE_ADDED) {
            
                var measure = this.source.getBar(event.getValue());
                this.renderBar(measure, this.barsVisible);
                
            }else if(event.field == 'bar' && event.type == de.edirom.server.data.DataEvent.TYPE_REMOVED) {
                
                var measure = this.source.getBar(event.getValue());
                this.removeBar(measure);
            }
                
        }.bind(this)));
        
        var bars = this.barsVisible;
        if(bars) this.showBars();
        
        if(this.sidebar.checkVisible()) {
            this.sidebar.getActiveContent().reload();
        }
    },
    
    zoomChanged: function(zoom) {
    	
        // Sets the zoom toolbar item
        $('toolbar_zoomInput').value = Math.round(zoom * 100) + '%';
        
        if(this.barsVisible) {
            var measures = this.source.getPage(this.viewer.getFacsimileId()).getBarIDs();
            measures = this.source.getBars(measures);
        
            this.setBarsSizes(measures);
        
        }else {
            this.barsPositionsDirty = !this.barsVisible;
        }
        
        if(this.marquee != null) {
            this.marquee.updateMarqueePosition();
            this.marquee.recalculateMarqueeZoom();
        }
    },

    offsetChanged: function(offX, offY) {
    
        if(this.barsVisible)
            this.setBarsPositions(offX, offY);
        else
            this.barsPositionsDirty = !this.barsVisible;


        if(this.marquee != null)
            this.marquee.updateMarqueePosition();
    },

    updateZoom: function(e, zoomStep) {
		if(e.keyCode == Event.KEY_RETURN || typeof zoomStep != 'undefined') {
			var zoomInput = $('toolbar_zoomInput').value.replace('%', '').replace('.', '_').strip();
            this.viewer.updateZoom(zoomInput, zoomStep);
        }
	},

    mouseDownListener: function(e) {
        if(e.shiftKey && $('facsimileMarkSidebarContent').visible()) {
            this.facsimileMarkSidebarContent.createBar();

            this.facsimileMarkSidebarContent.toggleClickMode(this.facsimileMarkSidebarContent, 'editBar');

            this.marquee.initDragWithoutEvent(this.marquee.getId(), Event.pointerX(e), Event.pointerY(e));
        }
    },

	updateFacsimile: function(e) {
		if(e.keyCode == Event.KEY_RETURN) {
		
		    var source = this.view.getModule().getSource();
		    var facsimile = source.findPage($('toolbar_pageInput').value.strip());
		    
            if(facsimile != null)
                this.loadFacsimile(facsimile);
		}
	},

	nextDigilibImage: function(){
	    if(this.viewer.hasNextFacsimile()) {
    	    this.preLoadFacsimile();
            var facsimile = this.viewer.nextFacsimile();
            this.postLoadFacsimile(facsimile);
        }
    },
    
    prevDigilibImage: function(){
        if(this.viewer.hasPrevFacsimile()) {
            this.preLoadFacsimile();
	        var facsimile = this.viewer.prevFacsimile();
            this.postLoadFacsimile(facsimile);
        }
    },

    showPage: function(pageID){
        
	    var source = this.view.getModule().getSource();
	    var facsimile = source.getPage(pageID);
	    
        if(facsimile != null && this.isLoaded())
            this.loadFacsimile(facsimile);

        else if(facsimile != null)
        	this.facsimileToLoad = facsimile;
    },

    setBarsSizes: function(measures) {

        this.barsPositionsDirty = false;

        measures.each(function(measure){

            var top = Math.round(measure.top * this.viewer.getZoom());
            var left = Math.round(measure.left * this.viewer.getZoom());

            var width = Math.round(measure.width * this.viewer.getZoom());
            var height = Math.round(measure.height * this.viewer.getZoom());

            this.setBarPosAndSize(measure.id, left, top, width, height);

        }.bind(this));
    },

    setBarPosAndSize: function(id, x, y, w, h) {
        //console.log('facsimile(setBarPosAndSize(x: ' + x + ', y: ' + y + ', w: ' + w + ', h: ' + h + ')');

        if($('measure_hi_' + id)) {
            $('measure_hi_' + id).setStyle({
                top:y + 'px',
                left:x + 'px',
                width:w + 'px',
                height:h + 'px'});

            $('measureContentFrame_' + id).setStyle({
                top: (Math.round(h / 2) - 10 + y) + 'px',
                left: x + 'px',
                width:w + 'px'});

            if(!$('measureBox_' + id).visible() && y > -1 && x > -1 && w > 0 && h > 0)
                $('measureBox_' + id).show();
        }
    },

    setBarsPositions: function(offX, offY) {

        this.barsPositionsDirty = false;

        $('measures').setStyle({
            top:offY + "px",
            left:offX + "px"
        });
    },

    setBarsVisibility: function(visible) {
        this.barsVisible = visible;
        
        if(visible) {
            this.showBars();                          
        }else
            this.hideBars();
    },

    showBars: function() {
        
        var measures = this.source.getPage(this.viewer.getFacsimileId()).getBarIDs();
        measures = this.source.getBars(measures);
        
        if(this.barsRendered && this.barsPositionsDirty) {
            this.setBarsSizes(measures);
            this.setBarsPositions(this.viewer.getOffX(), this.viewer.getOffY());
        }
        
        if(this.barsRendered)
        
            measures.each(function(measure) {
                if(measure.getTop() > -1 && measure.getLeft() > -1 && measure.getWidth() > 0 && measure.getHeight() > 0)
                    $('measureBox_' + measure.id).show();            
            }.bind(this));
        
        else
            this.renderBars(measures, true);
        
    },
    
    hideBars: function() {
        
        var measures = this.source.getPage(this.viewer.getFacsimileId()).getBarIDs();
        
        measures.each(function(measureID) {
            $('measureBox_' + measureID).hide();            
        }.bind(this));
    },

    removeBars: function() {
        if(!this.barsRendered) return;
        
        this.barsRendered = false;
        $('measures').update();
        
        var measures = this.source.getPage(this.viewer.getFacsimileId()).getBarIDs();
        measures = this.source.getBars(measures);
        
        measures.each(function(measure) {
            measure.removeListeners('facsimileView_facsimile');
        });
    },
    
    removeBar: function(measure) {
        if(!this.barsRendered) return;
        
        measure.removeListeners('facsimileView_facsimile');
        
        $('measure_hi_' + measure.id).remove();
        $('measureContentFrame_' + measure.id).remove();
    },

    renderBars: function(measures, visible) {
        
        measures.each(function(visible, measure){
            this.renderBar(measure, visible);
        }.bind(this, visible)); 
               
        this.barsRendered = true;
    },
    
    renderBar: function(measure, visible) {
        
        var top = Math.round(measure.top * this.viewer.getZoom());
        var left = Math.round(measure.left * this.viewer.getZoom());
        
        var width = Math.round(measure.width * this.viewer.getZoom());
        var height = Math.round(measure.height * this.viewer.getZoom());
        

		$('measures').insert({bottom: '<div id="measure_hi_' + measure.id + '" class="measureHi" style="' +
            'display: none; ' +
            'top:' + top + 'px; ' +
            'left:' + left + 'px; ' +
            'width: ' + width + 'px; ' +
            'height: ' + height + 'px;"/>'});
          
        $('measures').insert({bottom: '<div id="measureContentFrame_' + measure.id + '" class="measureContentFrame" style="' +
            'top: ' + (Math.round(height / 2) - 10 + top) + 'px; ' +
            'left:' + left + 'px;' + 
            'width: ' + width + 'px;"/>'});
        
        $('measureContentFrame_' + measure.id).insert({bottom: '<div id="measureBox_' + measure.id + '" class="measureBox" style="' +
            'display: none;"/>'});
            
        $('measureBox_' + measure.id).insert({bottom: '<div id="measure_' + measure.id + '" class="measure"' +
            ' title="Takt ' + measure.name + ' (' + this.source.getMovement(measure.getPartId()).getName() + ')">' + measure.name + '</div>'});    
        
        $('measureContentFrame_' + measure.id).insert({bottom: '<div id="annotBox_' + measure.id + '" class="annotBox" style="' +
            'max-width: ' + width + 'px;' +
            'display: none;"/>'});
        
        this.setBarsPositions(this.viewer.getOffX(), this.viewer.getOffY());
        
        measure.addListener(new de.edirom.server.data.DataListener('facsimileView_facsimile', function(event) {
            
            if(event.field == 'name' && event.type == de.edirom.server.data.DataEvent.TYPE_MODIFIED) {
                $('measure_' + event.getSource().id).update(event.getValue());
                $('measure_' + event.getSource().id).title = 'Takt ' + event.getValue() + ' (' + this.source.getMovement(event.getSource().getPartId()).getName() + ')';
            
            }else if(event.field == 'partId' && event.type == de.edirom.server.data.DataEvent.TYPE_MODIFIED) {
                $('measure_' + event.getSource().id).title = 'Takt ' + event.getSource().getName() + ' (' + this.source.getMovement(event.getSource().getPartId()).getName() + ')';
            
            }else if((event.field == 'top' || event.field == 'left' || event.field == 'width' || event.field == 'height') && event.type == de.edirom.server.data.DataEvent.TYPE_MODIFIED) {
            
                var top = Math.round(event.getSource().top * this.viewer.getZoom());
                var left = Math.round(event.getSource().left * this.viewer.getZoom());
    
                var width = Math.round(event.getSource().width * this.viewer.getZoom());
                var height = Math.round(event.getSource().height * this.viewer.getZoom());
    
                this.setBarPosAndSize(event.getSource().id, left, top, width, height);
            }
                
        }.bind(this)));
        
        Event.observe($('measure_' + measure.id), 'mouseover', this.highlightBar.bindAsEventListener(this, measure));
        Event.observe($('measure_' + measure.id), 'mouseout', this.deHighlightBar.bindAsEventListener(this, measure));
        Event.observe($('measure_' + measure.id), 'click', this.barClicked.bindAsEventListener(this, measure));
        Event.observe($('measure_' + measure.id), 'dblclick', this.barDblClicked.bindAsEventListener(this, measure));
        
        if(visible && measure.getTop() > -1 && measure.getLeft() > -1 && measure.getWidth() > 0 && measure.getHeight() > 0)
            $('measureBox_' + measure.id).show();
    },
    
    highlightBar: function(e, measure) {
        $('measure_hi_' + measure.id).show();
    },

    deHighlightBar: function(e, measure) {
        if($('measure_hi_' + measure.id))
            $('measure_hi_' + measure.id).hide();
    },

    barClicked: function(e, measure) {
        if($('facsimileMarkSidebarContent').visible()) {
        
            if(this.clickMode == 'selectBars') {
                this.facsimileMarkSidebarContent.showBarDetails(e, measure);
                
                /*
                var left = $('measure_hi_' + measure.id).positionedOffset()[0];
                var top = $('measure_hi_' + measure.id).positionedOffset()[1];
                var width = $('measure_hi_' + measure.id).getWidth();
                var height = $('measure_hi_' + measure.id).getHeight();
                */
            }
        }
    },
    
    barDblClicked: function(e, measure) {
        if($('facsimileMarkSidebarContent').visible()) {
            
            this.facsimileMarkSidebarContent.showBarDetails(e, measure);
                
            if(this.facsimileMarkSidebarContent.activeBar != '')
                this.facsimileMarkSidebarContent.toggleClickMode(this.facsimileMarkSidebarContent, 'editBar');
            
            
            if(this.clickMode == 'selectBars') {
                
                /*
                var left = $('measure_hi_' + measure.id).positionedOffset()[0];
                var top = $('measure_hi_' + measure.id).positionedOffset()[1];
                var width = $('measure_hi_' + measure.id).getWidth();
                var height = $('measure_hi_' + measure.id).getHeight();
                */
            }
        }
    },
        
    setClickMode: function(mode) {
    
        if(this.clickMode == 'editBar' && mode != 'editBar')
            this.destroyMarquee();
    
        this.clickMode = mode;
    
        if(mode == 'editBar') {
            var bar = this.facsimileMarkSidebarContent.activeBar;
            this.createMarquee(bar);
        }
    },
    
     resetFacsimileView: function() {
         if(typeof this.viewer != 'undefined')
             this.viewer.resetFacsimileView();
     },

    shortcutListener: function() {
            return false;
    },
    
    createMarquee: function(bar) {
        this.marquee = new de.edirom.server.source.Marquee(this, bar);
        this.marquee.init();
    },
    
    destroyMarquee: function() {
        if(this.marquee != null)
            this.marquee.destroy();
        
        this.marquee = null;
        }
});/*
 * a toolbar item for selecting an area on a facsimile in facsimile view
 */
de.edirom.server.source.FacsimileMarkToolbarItem = Class.create(de.edirom.server.main.ToolbarItem, {
    
    initialize: function($super, toolbar, action) {
        $super(toolbar);

        this.action = action;

		$(toolbar.getId()).insert({bottom: '<div class="toolbarButton" id="toolbar_toggleMarking"></div>'});
        
        Event.observe($('toolbar_toggleMarking'), 'click', action.toggleVisibility.bindAsEventListener(action));        
    }
});


/*
 * the actions for showing a sidebar for selecting areas
 */
de.edirom.server.source.FacsimileMarkAction = Class.create(de.edirom.server.main.Action, {
    
    initialize: function($super, toolbar, sidebar, sidebarContent) {
        $super();
        
        this.sidebar = sidebar;
        this.sidebarContent = sidebarContent;
        
        this.toolbarItem = new de.edirom.server.source.FacsimileMarkToolbarItem(toolbar, this);
        
        this.sidebarContent.addVisibilityChangeRequestedListener(new de.edirom.server.main.VisibilityChangeRequestedListener(function(visible) {
            if(visible)
                $('toolbar_toggleMarking').addClassName('toggled');
            else
                $('toolbar_toggleMarking').removeClassName('toggled');
        }));
        
        // when called in toggleVisibility(), the sbc is loaded when needed. when called here, it is loaded on load of facsimileView
        //this.sidebarContent.load();
    },
            
    toggleVisibility: function() {
        
        this.sidebarContent.load();
        this.sidebarContent.loadBars();
        
    	var showBarsAction = this.sidebarContent.facsimile.view.showBarsAction;
    	var func = showBarsAction.changeBarVisibility.bind(showBarsAction);
    	
    	if(this.sidebar.activeContent == this.sidebarContent) {
    	    if(!showBarsAction.keepVisible && showBarsAction.barsVisible)
    	        func();
    	    else
    	        showBarsAction.keepVisible = false;
    	    Event.observe($('toolbar_showBars'), 'click', showBarsAction.changeBarVisibility.bind(showBarsAction));    	    
    	} else {
    	    if(showBarsAction.barsVisible)
    	        showBarsAction.keepVisible = true;
    	    else
    	        func();
    	    $('toolbar_showBars').stopObserving('click');    
    	}
    	
    	this.sidebar.toggleSidebarContent(this.sidebarContent);
    }
});
/*
 * the sidebarContent for selecting zones on Facsimiles 
 */
de.edirom.server.source.FacsimileMarkSidebarContent = Class.create(de.edirom.server.main.SidebarContent, {
    
    visibilityChangeRequestedListeners: new Array(),
    visibilityChangedListeners: new Array(),
    
    activeBar: '',
    
    initialize: function($super, sideBarId, facsimile) {
        $super(sideBarId, 'facsimileMarkSidebarContent');
        this.facsimile = facsimile;
        this.source = this.facsimile.source;
        this.controller = this.facsimile.getCommandController();
        
        //TODO: focusable fixen oder entfernen
        this.focusable = ['barZones', 'movementSelection', 'barNumber', 'barUpbeat', 'barRest', 'barRestNumber'];
        this.focussed = 0;
        
        // Remember the DataListener (Array: pageId: pageId, listener: listener)
        this.pageListener = null;
    },
      
    load: function($super) {
        if(!this.isLoaded()) {
        	$super();
        	
        	$('sidebarZones').hide();
        	
        	this.addVisibilityChangedListener(new de.edirom.server.main.VisibilityChangedListener(function(visible) {
                if(visible)
                {
                    if (!this.barZonesScrolltable) {
                        this.barZonesScrolltable = new de.edirom.server.Scrolltable('barZones_container', 'barZones', false);
                        this.barZonesScrolltable.setVerticalScrolling(true);
                    } else {
                        this.barZonesScrolltable.refresh();
                    }
                    this.setBarsInListListeners();
                }
            }.bind(this)));
        	
   	        var movementOptions = '';
            var movements = this.source.getMovements();
            for(var i = 0; i < movements.length; i++)
                movementOptions += '<option value="' + movements[i].id + '">' + movements[i].getName() + '</option>';
            
            $('movementSelection').insert({bottom: movementOptions});
            $('movementSelection').value = movements[0].id;

            this.toggleClickMode(null, 'selectBars');
            
        	this.setListeners();
		}
    },
    
    reload: function($super) {
        $super();
        
        this.loadBars();
        this.hideBarDetails();
    },
    
    show: function($super) {
        $super();
        
        this.toggleClickMode(null, 'selectBars');
        this.facsimile.shortcutController.addShortcutListener('sidebarContent', 'sidebarContent.facsimileMark', this.shortcutListener.bind(this));
    },

    hide: function($super) {
        $super();
        this.facsimile.shortcutController.removeShortcutListener('sidebarContent', 'sidebarContent.facsimileMark');
    },
    
    setListeners: function() {
        
        Event.observe($('tool_createBar'), 'click', function(event) {
            if(event.altKey)
                this.createBar(this.guessBarCoords());
            else
                this.createBar();
        }.bindAsEventListener(this));
        
        Event.observe($('tool_deleteBar'), 'click', this.deleteBar.bind(this));
        
        Event.observe($('tool_editBar'), 'click', this.toggleClickMode.bindAsEventListener(this, 'editBar'));
        
        Event.observe($('movementSelection'), 'change', this.updateBarObject.bindAsEventListener(this, 'movement'));
        
        Event.observe($('barNumber'), 'keyup', this.updateBarObject.bindAsEventListener(this, 'name'));
        Event.observe($('barNumber'), 'focus', this.setFocus.bind(this, 'barNumber'));
        Event.observe($('barNumber'), 'blur', this.setFocus.bind(this, 'barNumber'));
        
        Event.observe($('barRestNumber'), 'focus', this.setFocus.bind(this, 'barRestNumber'));
        Event.observe($('barRestNumber'), 'blur', this.setFocus.bind(this, 'barRestNumber'));
        
        Event.observe($('barUpbeat'), 'change', this.updateBarObject.bindAsEventListener(this, 'upbeat'));
        Event.observe($('barRest'), 'click', this.updateBarObject.bindAsEventListener(this, 'rest'));
        Event.observe($('barRestNumber'), 'keyup', this.updateBarObject.bindAsEventListener(this, 'restNumber'));

        Event.observe($('barRest'), 'click', function(){
            if($('barRest').checked)
                $('barRestNumber').enable();
            else {
                $('barRestNumber').disable();
                $('barRestNumber').value = '';
            }
        }.bindAsEventListener(this, 'rest'));
    },
    
    setFocus: function(param) {
        if(param == 'barNumber') 
           (this.focussed == 1) ? this.focussed = 0 : this.focussed = 1;
        if(param == 'barRestNumber')
           (this.focussed == 2) ? this.focussed = 0 : this.focussed = 2;
    },
    
    shortcutListener: function(event) {
		
        var isMac = (navigator.userAgent.indexOf('Macintosh') != -1);        
        var key = event.keyCode || event.which || event.button;

		switch (key) {
		
		    case 8: case 46:
		        // delete & backspace
		        if(this.activeBar != '' && this.focussed == 0) {
		            this.deleteBar();
		            return true;
		        }
		        break;		    
		    case 13:    
		        // enter
		        if(this.activeBar != '' &&
		               /*this.focussed == 0 &&*/ 
    		            ((this.activeBar.getWidth() != -1 && 
    		              this.activeBar.getHeight() != -1 && 
    		              this.activeBar.getLeft() != -1 && 
    		              this.activeBar.getTop() != -1) || 
    		            this.facsimile.marquee != null)) {
    		         
    		         var wasMarked = false;
		            if(this.facsimile.marquee != null)
		                wasMarked = true;
		            
		            this.toggleClickMode(this, 'editBar');
		            
		            if(wasMarked)
		                this.hideBarDetails();
		            
		            return true;
		        }
		        break;		        
			case 27:
				// escape
				if(this.activeBar != '' && this.focussed == 0) {
				    
				    			    
				    if(this.facsimile.marquee != null) {
				        
			           this.facsimile.marquee.resetMarquee(this.activeBar);
                    this.toggleClickMode(this, 'editBar');
                    return true;
                }			        
				    else    
				        this.hideBarDetails();
				        return true;
				}
				
				break;
			case 37:
				// left arrow
				
				
				if(this.facsimile.marquee != null) {
				//moving marquee on page
				    this.facsimile.marquee.moveLeft(event.shiftKey ? 10 : 1, event.ctrlKey);
				    return true;
				} else if(this.focussed == 0){
				//moving in the bars list
    				
    				var barsOnPage = this.source.getPage(this.facsimile.viewer.getFacsimileId()).getBarIDs()
    				if(barsOnPage.length > 0) {
    				
        				if(this.activeBar == '') {
        				    this.showBarDetails(event, this.source.getBar(barsOnPage.last()));
        				    return true;  
        				} else {
        				    var pos = barsOnPage.indexOf(this.activeBar.id);
        				    if(pos > 0) {
        				        this.showBarDetails(event, this.source.getBar(barsOnPage[pos-1]));
        				        return true;
        				    }    
        				}
        			}
        	    }
				
				break;
			case 38:
				// top arrow
				
				if(this.facsimile.marquee != null) {
				//moving marquee on page
				    this.facsimile.marquee.moveTop(event.shiftKey ? 10 : 1, event.ctrlKey);
				    return true;
				} else {
				//moving in the bars list
    				var barsOnPage = this.source.getPage(this.facsimile.viewer.getFacsimileId()).getBarIDs()
    				if(barsOnPage.length > 0) {
    				
        				if(this.activeBar == '') {
        				    this.showBarDetails(event, this.source.getBar(barsOnPage.last()));
        				    return true;
        				} else {
        				    var pos = barsOnPage.indexOf(this.activeBar.id);
        				    if(pos > 0) { 
        				        this.showBarDetails(event, this.source.getBar(barsOnPage[pos-1]));
        				        return true;
        				    }    
        				}
    				}
    			}
				//other case  
				
				break;
			case 39:
				// right arrow
                
                if(this.facsimile.marquee != null) {
				//moving marquee on page
				    this.facsimile.marquee.moveRight(event.shiftKey ? 10 : 1, event.ctrlKey);
				    return true;
				} else if(this.focussed == 0){
                //moving in the bars list
                    
    				var barsOnPage = this.source.getPage(this.facsimile.viewer.getFacsimileId()).getBarIDs()
    				if(barsOnPage.length > 0) {
    				
        				if(this.activeBar == '') {
        				    this.showBarDetails(event, this.source.getBar(barsOnPage.first()));
        				    return true;
        				} else {
        				    var pos = barsOnPage.indexOf(this.activeBar.id);
        				    if(pos >= 0 && pos + 1 < barsOnPage.length) {
        				        this.showBarDetails(event, this.source.getBar(barsOnPage[pos+1]));
        				        return true;
        				    }    
        				}
    				}
    			}
    			//other case  
                
				break;
			case 40:
				// down arrow
				
				if(this.facsimile.marquee != null) {
				//moving marquee on page
				    this.facsimile.marquee.moveBottom(event.shiftKey ? 10 : 1, event.ctrlKey);
				    return true;
				} else {
				//moving in the bars list
    				var barsOnPage = this.source.getPage(this.facsimile.viewer.getFacsimileId()).getBarIDs()
    				if(barsOnPage.length > 0) {
    				
        				if(this.activeBar == '')  {
        				    this.showBarDetails(event, this.source.getBar(barsOnPage.first()));
        				    return true;    
        				} else {
        				    var pos = barsOnPage.indexOf(this.activeBar.id);
        				    if(pos >= 0 && pos + 1 < barsOnPage.length) {
        				        this.showBarDetails(event, this.source.getBar(barsOnPage[pos+1]));
        				        return true;
                            }        			        
        				}
    				}
    			}
    			//other case    
				break;
			
			case 78:
			    // n - new bar
			    if(event.shiftKey && event.altKey) {
			        this.createBar(this.guessBarCoords());
			        return true;  
			    } else if(event.shiftKey) {
			        this.createBar();			    
			        return true;
			    }
			    
			    break;
			    
            case 83:
                // s - save
                
                if((isMac && event.metaKey) | (!isMac && event.ctrlKey)) {                
                    this.facsimile.view.module.doSave();
                    return true;
                }
                
                break;
			
		}	  
                
        
        return false;
        
    },
    
    loadBars: function() {
                
        $$('tr.listedBar').each(function(tr) {
                tr.remove();
            });
        
        if(this.pageListener != null) {
            var pageId = this.pageListener['pageId'];
            var listener = this.pageListener['listener'];
            
            this.source.getPage(pageId).removeListener(listener);
        }
        
        this.source.getPage(this.facsimile.viewer.getFacsimileId()).getBarIDs().each(function(barID) {
            this.addBarToList(barID);
            this.setBarInListListener(barID);
        }.bind(this));
        
        this.sortBarList();
        
        $('currentPage').update(this.source.getPage(this.facsimile.viewer.getFacsimileId()).name);
        
        this.pageListener = {pageId: this.facsimile.viewer.getFacsimileId(), listener: new de.edirom.server.data.DataListener(function(event) {
            
            if(event.field == 'bar' && event.type == de.edirom.server.data.DataEvent.TYPE_ADDED) {
                this.addBarToList(event.getValue());
                this.setBarInListListener(event.getValue());
                this.sortBarList();
            
            } else if(event.field == 'bar' && event.type == de.edirom.server.data.DataEvent.TYPE_REMOVED)
                this.removeBarFromList(event.getValue());
                
        }.bind(this))};
        
        this.source.getPage(this.facsimile.viewer.getFacsimileId()).addListener(this.pageListener['listener']);
        
        if (this.barZonesScrolltable)
            this.barZonesScrolltable.refreshTable();
    },
    
    createBar: function(positions) {
        
        var id = 'edirom_measure_' + Math.uuid().toLowerCase();
        var zoneId = 'edirom_zone_' + Math.uuid().toLowerCase();
        var pageID = this.facsimile.viewer.getFacsimileId();
        var partId = $('movementSelection').value;
        var preUsedMovement = this.getMovementID(pageID);
        if(partId != preUsedMovement) {
            partId = preUsedMovement;
            $('movementSelection').value = partId;
        }
        var barNum = this.getNextBarNumber(partId);
        
        var newBar = new de.edirom.server.data.Bar(id, barNum, -1, -1, -1, -1, partId, 0, false, pageID, zoneId);
        
        if(positions != null) {
            newBar.setTop(positions.top);
            newBar.setLeft(positions.left);
            newBar.setWidth(positions.width);
            newBar.setHeight(positions.height);
        }
        
        var groupCommand = new de.edirom.server.main.GroupCommand();
        groupCommand.addGroupCommand(new de.edirom.server.main.AddObjectCommand(this.source.getMovement(partId), 'bars', newBar));
        groupCommand.addGroupCommand(new de.edirom.server.main.AddObjectCommand(this.source.getPage(this.facsimile.viewer.getFacsimileId()), 'bars', newBar.id));

        this.controller.addCommand(groupCommand);
        
//        this.facsimile.renderBar(newBar, this.facsimile.barsVisible);
        this.showBarDetails(null, newBar);
        
        this.barZonesScrolltable.refreshTable();
        this.barZonesScrolltable.refresh(0, 1000000);
    },
    
    getMovementID: function(pageID) {
        /*
         *    Looks for the most likely movement for new bars
         */
        
        var movementID = $('movementSelection').value;
        
        var barIDs = this.source.getPage(pageID).getBarIDs();
        if(barIDs.length == 0) {
            var pageBefore = this.source.getPageBefore(pageID);
            if(pageBefore != null)
                movementID = this.getMovementID(pageBefore.id);                
        }    
        else
            movementID = this.source.getBar(barIDs.last()).getPartId();
        
        return movementID;
    },
    
    getNextBarNumber: function(partId) {
        
        var largest = 0;
        
        
        /* 
         *    Calculates the highest barnumber on the current page without respect to other bars in that movement 
         *
         
        var bars = this.source.getPage(this.facsimile.digilib.id).getBarIDs();
        for(var i = 0; i < bars.length; i++) {
            var bar = this.source.getBar(bars[i]);
            
            if(bar.getPartId() == partId && !isNaN(bar.getName()) && Number(bar.getName()) > largest)
                largest = Number(bar.getName());
            
        }
        */
        
        /*
         *    Calculates the highest barnumber in that movement
         */
        
        var lastBar = this.source.getMovement(partId).bars.getLast();
        if(lastBar != null) {
            var name = lastBar.getName();
            if(!isNaN(name))
                largest = Number(name);
            
            if(lastBar.getRest() > 1)
                return largest + Number(lastBar.getRest());
            else if(lastBar.getUpbeat())
                return largest;            
                            
        } 
        return largest + 1;
    },

    deleteBar: function() {
        
        if(this.activeBar == '')
            return false;

        var bar = this.activeBar;
        var id = bar.id;
        var name = bar.getName();
        var partId = bar.getPartId();
        
        var func = function() {
            
            this.hideBarDetails();
        
            //$('measures').removeChild($('measureContentFrame_' + id));
            //$('measures').removeChild($('measure_hi_' + id));
            
            var groupCommand = new de.edirom.server.main.GroupCommand();
            groupCommand.addGroupCommand(new de.edirom.server.main.RemoveObjectCommand(this.source.getPage(this.facsimile.viewer.getFacsimileId()), 'bars', bar.id));
            groupCommand.addGroupCommand(new de.edirom.server.main.RemoveObjectCommand(this.source.getMovement(partId), 'bars', bar));
            this.controller.addCommand(groupCommand);
            
            this.barZonesScrolltable.refreshTable();
            this.barZonesScrolltable.refresh();
            
            new Ajax.Request('../source/xql/deleteBarReferencesInWorks.xql', {
                method: 'post',
                parameters: {
                    sourceID: this.source.id,
                    measureID: id
                }
            });       
            
        }.bind(this);
        
        var title = 'Takt löschen';
        var message = 'Wenn Sie Takt "' + name + '" löschen, werden dadurch automatisch in allen Werken, die "' + this.source.getName() + '" referenzieren, die Verweise auf diesen Takt aufgehoben. Dies betrifft sowohl Taktkonkordanz als auch Anmerkungen.';
        var options = {firstButton: 'Abbrechen',
                        secondButton: 'Takt löschen',
                        secondFunc: func};
                        
        (new de.edirom.server.main.Popup(message, options, title)).showPopup();        
          
    },

    addBarToList: function(barID) {
        
        var bar = this.source.getBar(barID);

        var tr = '<tr id="tr_' + bar.id + '" class="listedBar">' + 
                '<td class="name">' + bar.getName() + '</td>' + 
                '<td class="offset">' + bar.getTop() + ' / ' + bar.getLeft() + '</td>' + 
                '<td class="width">' + bar.getWidth() + '</td>' + 
                '<td class="height">' + bar.getHeight() + '</td>' + 
                '</tr>';
        
        $('barZones_tbody').insert({bottom: tr});
    },
    
    sortBarList: function() {
        var barIds = this.source.getPage(this.facsimile.viewer.getFacsimileId()).getBarIDs();
        var sorted = this.source.getBarsSorted(barIds);
        for(var i = 0; i < sorted.length; i++) {
            $('barZones_tbody').insert({bottom: $('tr_' + sorted[i].id)});
        }
    },
    
    setBarInListListener: function(barID) {
        var bar = this.source.getBar(barID);
        
        var func = function(context, bar) {
            this.showBarDetails(context, bar);
            if(this.activeBar != '')
                this.toggleClickMode(this, 'editBar');
        }.bind(this);
        
        Event.observe($('tr_' + bar.id), 'mouseover', this.highlightBarList.bindAsEventListener(this, bar));
        Event.observe($('tr_' + bar.id), 'mouseout', this.deHighlightBarList.bindAsEventListener(this, bar));
        Event.observe($('tr_' + bar.id), 'click', this.showBarDetails.bindAsEventListener(this, bar));
        
        Event.observe($('tr_' + bar.id), 'dblclick', func.bindAsEventListener(this, bar));

        bar.addListener(new de.edirom.server.data.DataListener('facsimileView_facsimileMark', function(event) {
            
            switch(event.getField()) {
                case 'name': $$('#tr_' + event.getSource().id + ' .name').each(function(row) {
                        row.title = event.getValue();
                        row.update(event.getValue());
                    }); break;
                    
                case 'top': $$('#tr_' + event.getSource().id + ' .offset').each(function(row) {
                        row.update(event.getValue() + ' / ' + event.getSource().getLeft());
                    }); break;
                    
                case 'left': $$('#tr_' + event.getSource().id + ' .offset').each(function(row) {
                        row.update(event.getSource().getTop() + ' / ' + event.getValue());
                    }); break;
                    
                case 'width': $$('#tr_' + event.getSource().id + ' .width').each(function(row) {
                        row.update(event.getValue());
                    }); break;
                    
                case 'height': $$('#tr_' + event.getSource().id + ' .height').each(function(row) {
                        row.update(event.getValue());
                    }); break;
                    
                case 'partId': this.sortBarList(); break;
            }
        }.bind(this)));
    },
    
    setBarsInListListeners: function() {
        var barsInList = $('barZones_tbody').childElements();
        for (var i = 0; i < barsInList.length; i++)
            this.setBarInListListener(barsInList[i].readAttribute("id").substring(3));
    },
    
    removeBarFromList: function(barID) {
    
        if(this.activeBar == this.source.getBar(barID))
            this.hideBarDetails();

        var bar = $('tr_' + barID);
    
        $('barZones_tbody').removeChild(bar);
        
        this.source.getBar(barID).removeListeners('facsimileView_facsimileMark');
    },
    
    showBarDetails: function(e, bar) {
        
        this.hideBarDetails();

        if(!$('sidebarZones').visible()) $('sidebarZones').show();
        
        this.activeBar = bar;
        
        $('tr_' + bar.id).addClassName('marked');
        this.facsimile.highlightBar(e, bar);
        
        this.barZonesScrolltable.focusElement('tr_' + bar.id, 'center');
        
        $('movementSelection').value = bar.getPartId();
        
        $('barNumber').value = bar.getName();
        $('barUpbeat').checked = bar.getUpbeat();
        $('barRest').checked = bar.getRest() > 0;
        $('barRestNumber').value = (bar.getRest() > 0)?bar.getRest():'';
        if($('barRest').checked)
            $('barRestNumber').enable();
        else
            $('barRestNumber').disable();
        
        this.activeBarListener = new de.edirom.server.data.DataListener(function(event) {
            
            switch(event.field) {
                case 'name': $('barNumber').value = event.getValue(); break;
                case 'upbeat': $('barUpbeat').checked = event.getValue(); break;
                case 'rest': {
                    $('barRest').checked = event.getValue() > 0;
                    $('barRestNumber').value = (event.getValue() > 0)?event.getValue():'';
                    break;
                }
            }
        });
        
        bar.addListener(this.activeBarListener);

        if($('tr_' + bar.id)) $('tr_' + bar.id).addClassName('markedBar');
        
        this.facsimile.sidebar.scrollview.refresh();
    },
    
    hideBarDetails: function() {
        
        if($('sidebarZones').visible()) $('sidebarZones').hide();
        
        if(this.activeBar != '') {
            this.activeBar.removeListener(this.activeBarListener);
            $('tr_' + this.activeBar.id).removeClassName('marked');
            this.facsimile.deHighlightBar(null, this.activeBar);
        }
        
        this.activeBar = '';
        
        $('barNumber').value = '';
        $('barUpbeat').checked = false;
        $('barRest').checked = false;
        $('barRestNumber').value = '';

        $$('tr.markedBar').each(function(tr) {
            tr.removeClassName('markedBar');
        });
        
        this.toggleClickMode(null, 'selectBars');
        
        this.facsimile.sidebar.scrollview.refresh();
    },
    
    highlightBarList: function(e, bar) {
        $('tr_' + bar.id).addClassName('highlighted');
        if(bar.getWidth() != -1 && bar.getHeight() != -1 && bar.getLeft() != -1 && bar.getTop() != -1)
            this.facsimile.highlightBar(e, bar);
    },
    
    deHighlightBarList: function(e, bar) {
        $('tr_' + bar.id).removeClassName('highlighted');
        if(bar.getWidth() != -1 && bar.getHeight() != -1 && bar.getLeft() != -1 && bar.getTop() != -1)
            this.facsimile.deHighlightBar(e, bar);
    },
    
    toggleClickMode: function(e, mode) {
        
        //wenn das werkzeug bereits ausgewählt ist, auf Auswahlwerkzeug zurückschalten
        if(mode == this.facsimile.clickMode) {
            
            if(mode == 'editBar' && this.facsimile.marquee != null)
                this.updateBarCoords(this.facsimile.marquee.marqueeLeft,
                                    this.facsimile.marquee.marqueeTop,
                                    this.facsimile.marquee.marqueeWidth,
                                    this.facsimile.marquee.marqueeHeight);
            
            //ggf. Werkzeug demarkieren
            if(mode != 'selectBars')
                $('tool_' + mode).removeClassName('active');
            
            if(this.facsimile.clickMode != 'selectBars')
                this.toggleClickMode(null, 'selectBars');
            
            return false;
        }
        
        //ggf. Werkzeug markieren
        if(mode != 'selectBars')
            $('tool_' + mode).addClassName('active');
        
        //clickMode im Faksimile einstellen
        this.facsimile.setClickMode(mode);
    },
    
    guessBarCoords: function() {
        var pageID = this.facsimile.viewer.getFacsimileId();
        var barsOnPage = this.source.getPage(pageID).getBarIDs();
                
        var heightSum = 0;
        var widthSum = 0;
        var count = 0;
        
        var lastWorkingBarID;
        
        barsOnPage.each(function(barID) {
            if(this.source.getBar(barID).getHeight() > 0) {
                count++;
                heightSum += this.source.getBar(barID).getHeight();
                widthSum += this.source.getBar(barID).getWidth();
                lastWorkingBarID = barID;
            }
        });

        var facWidth = this.facsimile.viewer.getFacsimileWidth(0);
        var facHeight = this.facsimile.viewer.getFacsimileHeight(0);

        var probable = new Object;
        if(count != 0) {
            probable.height = Math.round(heightSum / count);
            probable.width = Math.round(widthSum / count);
            var precedingBar = this.source.getBar(lastWorkingBarID);
            
            var firstBar = this.source.getBar(barsOnPage.first());
            
            if(facWidth - (precedingBar.getLeft() + precedingBar.getWidth()) >= probable.width) {
                probable.left = precedingBar.getLeft() + precedingBar.getWidth() - Math.round(probable.width*0.05);
                probable.top = precedingBar.getTop();
            } else if(facHeight - (precedingBar.getTop() + precedingBar.getHeight()) >=probable.height){
                probable.left = firstBar.getLeft();
                probable.top = precedingBar.getTop() + precedingBar.getHeight();
            } else {
                probable.height = Math.round(facHeight*0.2);
                probable.width = Math.round(facWidth*0.2);
                probable.left = Math.round(facWidth*0.7);
                probable.top = Math.round(facHeight*0.7);
            }
            
        } else {
            probable.height = Math.round(facHeight*0.35);
            probable.width = Math.round(facWidth*0.2);
            probable.left = Math.round(facWidth*0.1);
            probable.top = Math.round(facHeight*0.1);
        }
        
        
        return probable;
    },
    
    updateBarCoords: function(x, y, width, height) {
        //console.log('facsimileMarkSBC/updateBarCoords(x: ' + x + ', y: ' + y +', w: ' + width + ', h: ' + height + ')');
        if(x == this.activeBar.getLeft()
            && y == this.activeBar.getTop()
            && width == this.activeBar.getWidth()
            && height == this.activeBar.getHeight())
            
            return;
            
        if(width <= 0 || height <= 0)
            return;
        
        var groupCommand = new de.edirom.server.main.GroupCommand();
        if(x != this.activeBar.getLeft())
            groupCommand.addGroupCommand(new de.edirom.server.main.ChangeFieldCommand(this.activeBar, 'left', x));
        if(y != this.activeBar.getTop())
            groupCommand.addGroupCommand(new de.edirom.server.main.ChangeFieldCommand(this.activeBar, 'top', y));
        if(width != this.activeBar.getWidth())
            groupCommand.addGroupCommand(new de.edirom.server.main.ChangeFieldCommand(this.activeBar, 'width', width));
        if(height != this.activeBar.getHeight())
            groupCommand.addGroupCommand(new de.edirom.server.main.ChangeFieldCommand(this.activeBar, 'height', height));

        this.controller.addCommand(groupCommand);
    },
    
    updateBarObject: function(e, property) {

        switch(property) {           
            case 'name': window.setTimeout(this.inputFieldChanged.bind(this, this.controller, this.activeBar, 'name', $('barNumber').value, 'barNumber'), 200); break;
            case 'upbeat': this.controller.addCommand(new de.edirom.server.main.ChangeFieldCommand(this.activeBar, 'upbeat', $('barUpbeat').checked)); break; 
            case 'rest': this.controller.addCommand(new de.edirom.server.main.ChangeFieldCommand(this.activeBar, 'rest', this.getBarRestNumber())); break; 
            case 'restNumber': this.controller.addCommand(new de.edirom.server.main.ChangeFieldCommand(this.activeBar, 'rest', this.getBarRestNumber())); break;
            case 'movement': {
            
                var oldMovement = this.activeBar.getPartId();
                var newMovement = $('movementSelection').value;
                var groupCommand = new de.edirom.server.main.GroupCommand();
                groupCommand.addGroupCommand(new de.edirom.server.main.RemoveObjectCommand(this.source.getMovement(oldMovement), 'bars', this.activeBar));
                groupCommand.addGroupCommand(new de.edirom.server.main.AddObjectCommand(this.source.getMovement(newMovement), 'bars', this.activeBar));
                            
                this.controller.addCommand(groupCommand);
                
            } break;
        }
    },
    
    getBarRestNumber: function() {
    
        if(!$('barRest').checked)
            return 0;
    
        var n = $('barRestNumber').value.trim();
        if(isNaN(n))
            $('barRestNumber').value = 1;
        else
            $('barRestNumber').value = Math.max(1, n);
        
        return $('barRestNumber').value;
    },
    
    inputFieldChanged: function(controller, subject, field, value, fieldID) {

        if(typeof this.inputFieldChanges == 'undefined')
            this.inputFieldChanges = new Array();
        
        if(typeof this.inputFieldChanges[field] == 'undefined')
            this.inputFieldChanges[field] = 'undefined';

        if(this.inputFieldChanges[field] != value && $(fieldID).value == value) {
            controller.addCommand(new de.edirom.server.main.ChangeFieldCommand(subject, field, value));
            this.inputFieldChanges[field] = value;
        }
    }
});

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


de.edirom.server.source.Marquee = Class.create({

    // the coords of the marquee (100%)
    marqueeTop: 0,
    marqueeLeft: 0,
    marqueeWidth: 0,
    marqueeHeight: 0,

    initialize: function(facsimileContent, bar) {

        this.facsimileContent = facsimileContent;
        this.bar = bar;
    },

    init: function() {
        this.marquee = new Marquee($('imageContainer'), this.facsimileContent);
        this.updateMarqueePosition();

        this.marquee.getMarquee().parentNode.setStyle({
            zIndex: 101
        });

        if(this.bar.getLeft() > -1 && this.bar.getTop() > -1 && this.bar.getWidth() > 0 && this.bar.getHeight() > 0) {

            this.marqueeTop = this.bar.getTop();
            this.marqueeLeft = this.bar.getLeft();
            this.marqueeWidth = this.bar.getWidth();
            this.marqueeHeight = this.bar.getHeight();

            this.marquee.setCoords(Math.round(this.marqueeLeft * this.facsimileContent.viewer.getZoom()),
                                Math.round(this.marqueeTop * this.facsimileContent.viewer.getZoom()),
                                Math.round(this.marqueeWidth * this.facsimileContent.viewer.getZoom()),
                                Math.round(this.marqueeHeight * this.facsimileContent.viewer.getZoom()));
        }
    },

    updateMarqueePosition: function() {

        this.marquee.getMarquee().parentNode.setStyle({
            top: this.facsimileContent.viewer.getOffY() + "px",
            left: this.facsimileContent.viewer.getOffX() + "px",
            zIndex: 101
        });

        this.marquee.getMarquee().parentNode.setStyle({
            width:Math.round(this.facsimileContent.viewer.getFacsimileWidth(0) * this.facsimileContent.viewer.getZoom()) + "px",
            height:Math.round(this.facsimileContent.viewer.getFacsimileHeight(0) * this.facsimileContent.viewer.getZoom()) + "px"
        });
    },

    recalculateMarqueeZoom: function() {

        this.marquee.setCoords(Math.round(this.marqueeLeft * this.facsimileContent.viewer.getZoom()),
                            Math.round(this.marqueeTop * this.facsimileContent.viewer.getZoom()),
                            Math.round(this.marqueeWidth * this.facsimileContent.viewer.getZoom()),
                            Math.round(this.marqueeHeight * this.facsimileContent.viewer.getZoom()));
    },

    setMarqueeCoords: function(x, y, w, h) {
        this.marqueeLeft = Math.round(x / this.facsimileContent.viewer.getZoom());
        this.marqueeTop = Math.round(y / this.facsimileContent.viewer.getZoom());
        this.marqueeWidth = Math.round(w / this.facsimileContent.viewer.getZoom());
        this.marqueeHeight = Math.round(h / this.facsimileContent.viewer.getZoom());

        this.facsimileContent.setBarPosAndSize(this.facsimileContent.facsimileMarkSidebarContent.activeBar.id,
                                            x, y, w, h);
    },

    resetMarquee: function(bar) {
    // resets a marquee to the last position of the bar

        this.marqueeTop = bar.getTop();
        this.marqueeLeft = bar.getLeft();
        this.marqueeWidth = bar.getWidth();
        this.marqueeHeight = bar.getHeight();

        this.marquee.setCoords(Math.round(this.marqueeLeft * this.facsimileContent.viewer.getZoom()),
                            Math.round(this.marqueeTop * this.facsimileContent.viewer.getZoom()),
                            Math.round(this.marqueeWidth * this.facsimileContent.viewer.getZoom()),
                            Math.round(this.marqueeHeight * this.facsimileContent.viewer.getZoom()));
    },

    destroy: function() {
        var marqueeNode = this.marquee.getMarquee().parentNode;
        marqueeNode.parentNode.removeChild(marqueeNode);
    },


    /* Some methods to tunnel through */

    getId: function() {
        return this.marquee.getId();    
    },

    initDragWithoutEvent: function(id, x, y) {
        this.marquee.initDragWithoutEvent(id, x, y);
    },

    moveLeft: function(amount, ctrlKey) {
        this.marquee.moveLeft(amount, ctrlKey);
    },

    moveTop: function(amount, ctrlKey) {
        this.marquee.moveTop(amount, ctrlKey);
    },

    moveBottom: function(amount, ctrlKey) {
        this.marquee.moveBottom(amount, ctrlKey);
    },

    moveRight: function(amount, ctrlKey) {
        this.marquee.moveRight(amount, ctrlKey);    
    }
});/*
 * a toolbar item for selecting a page in facsimile view
 */
de.edirom.server.source.PageToolbarItem = Class.create(de.edirom.server.main.ToolbarItem, {
    initialize: function($super, toolbar, action) {
        $super(toolbar);

        this.action = action;

        $(toolbar.getId()).insert({bottom: '<span class="label">Seite:</span>'});
		$(toolbar.getId()).insert({bottom: '<div class="toolbarTriangleLeft" id="toolbar_prevPage"></div>'});
		$(toolbar.getId()).insert({bottom: '<input id="toolbar_pageInput" class="toolbarInput" type="text" value="" />'});
		$(toolbar.getId()).insert({bottom: '<div class="toolbarTriangleRight" id="toolbar_nextPage"></div>'});
    }
});


/*
 * the actions for navigating through the pages
 */
de.edirom.server.source.PageAction = Class.create(de.edirom.server.main.Action, {
    
    initialize: function($super, toolbar) {
        $super();
        
        this.toolbarItem = new de.edirom.server.source.PageToolbarItem(toolbar, this);
    }
});
/*
 * a toolbar item to show or hide bars
 */
de.edirom.server.source.ResetFacsimileViewToolbarItem = Class.create(de.edirom.server.main.ToolbarItem, {
    initialize: function($super, toolbar, action) {
        $super(toolbar);

        this.action = action;

        $(toolbar.getId()).insert({bottom: '<div class="toolbarButton" id="toolbar_resetFacsimileView"></div>'});
		
        
        Event.observe($('toolbar_resetFacsimileView'), 'click', action.resetFacsimileView.bind(action));
    }
});


/*
 * the actions for hiding or showing bars
 */
de.edirom.server.source.ResetFacsimileViewAction = Class.create(de.edirom.server.main.Action, {
    
    initialize: function($super, toolbar, facsimileContent) {
        $super();
        
        this.facsimileContent = facsimileContent;
        
        this.toolbarItem = new de.edirom.server.source.ResetFacsimileViewToolbarItem(toolbar, this);
    },
    
    resetFacsimileView: function() {
        this.facsimileContent.resetFacsimileView();
    }
});
/*
 * a toolbar item to show or hide bars
 */
de.edirom.server.source.ShowBarsToolbarItem = Class.create(de.edirom.server.main.ToolbarItem, {
    initialize: function($super, toolbar, action) {
        $super(toolbar);

        this.action = action;

        $(toolbar.getId()).insert({bottom: '<div class="toolbarButton" id="toolbar_showBars"></div>'});
		
        
        Event.observe($('toolbar_showBars'), 'click', action.changeBarVisibility.bind(action));
    },
    
    refreshItemLabel: function(visible) {
        if(visible)
            $('toolbar_showBars').addClassName('toggled');
        else
            $('toolbar_showBars').removeClassName('toggled');
    }
});


/*
 * the actions for hiding or showing bars
 */
de.edirom.server.source.ShowBarsAction = Class.create(de.edirom.server.main.Action, {
    
    initialize: function($super, toolbar, facsimileContent) {
        $super();
        
        this.facsimileContent = facsimileContent;
        
        this.toolbarItem = new de.edirom.server.source.ShowBarsToolbarItem(toolbar, this);
        
        this.barsVisible = false;
        this.keepVisible = false;
    },
    
    changeBarVisibility: function() {
        
        if(this.keepVisible) return;
    
        this.barsVisible = !this.barsVisible;
        
        this.toolbarItem.refreshItemLabel(this.barsVisible);
        this.facsimileContent.setBarsVisibility(this.barsVisible);
    }
});
/*
 * a toolbar item for selecting a page in facsimile view
 */
de.edirom.server.source.ZoomToolbarItem = Class.create(de.edirom.server.main.ToolbarItem, {
    initialize: function($super, toolbar, action) {
        $super(toolbar);

        this.action = action;
        
        $(toolbar.getId()).insert({bottom: '<span class="label">Zoom:</span>'});
		$(toolbar.getId()).insert({bottom: '<div class="toolbarTriangleLeft" id="toolbar_zoomSmaller"></div>'});
		$(toolbar.getId()).insert({bottom: '<input id="toolbar_zoomInput" class="toolbarInput" type="text" value="" />'});
		$(toolbar.getId()).insert({bottom: '<div class="toolbarTriangleRight" id="toolbar_zoomLarger"></div>'});
    }
});


/*
 * the actions for navigating through the pages
 */
de.edirom.server.source.ZoomAction = Class.create(de.edirom.server.main.Action, {
    
    initialize: function($super, toolbar) {
        $super();
        
        this.toolbarItem = new de.edirom.server.source.ZoomToolbarItem(toolbar, this);
    }
});
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