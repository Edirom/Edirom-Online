de.edirom.server.source.Bars = Class.create(de.edirom.server.main.Content, {
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
});