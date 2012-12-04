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

