/**
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
    
});