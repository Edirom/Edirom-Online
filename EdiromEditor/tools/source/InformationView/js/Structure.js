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

