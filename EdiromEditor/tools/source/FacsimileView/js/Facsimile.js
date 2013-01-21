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
		    new Ajax.Updater(this.id, 'FacsimileView/xql/facsimiles.xql', {
        		method:'get',
        		parameters: {id:$('sourceId').value},
        		onComplete: function(){
        			$super();
        			
        			this.sidebar = new de.edirom.server.main.Sidebar(this.id);
        			
        			this.init();
                    
                    this.facsimileMarkSidebarContent = new de.edirom.server.source.FacsimileMarkSidebarContent(this.sidebar.getContentContainerId(), this);
                    this.sidebar.addContent(this.facsimileMarkSidebarContent);
                    this.facsimileMarkAction = new de.edirom.server.source.FacsimileMarkAction(this.view.toolbarGroup, this.sidebar, this.facsimileMarkSidebarContent);
                    
                    this.facsimileMarkAction.toggleVisibility();
                    
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
});