/**
 * @fileOverview facsimileViewer
 *
 * @author: <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
 * @version 1.0
 */


de.edirom.server.main.FacsimileViewer = Class.create({

    TILE_SIZE: 512,
    
    ZOOM_MIN: 0.05,
    ZOOM_MAX: 4.0,


    zoom: -1,

    offX: -1,
    offY: -1,
    mouseOffX: 0,
    mouseOffY: 0,
    posX: 0,
    posY: 0,

    
    key: 1,

    maxKey: -1,

    initialize: function(container, facsimiles) {
        this.id = 'facsimileView_' + (new Date).getTime();
        this.facsimiles = facsimiles;

        this.container = container;

        container.insert({bottom: '<div id="canvas_' + this.id + '" style="position:absolute; top:0px; left:0px; bottom:0px; right:0px; -moz-user-select:none;"> </div>'});
        container.insert({bottom: '<div id="eventHandler_' + this.id + '" style="position:absolute; top:0px; left:0px; bottom:0px; right:0px; -moz-user-select:none;"> </div>'});

        this.zoomListeners = new Array();
        this.offsetListeners = new Array();

        this.mouseDownListeners = new Array();

        this.addListeners();
    },

    addListeners: function() {

        this.handleMouseDownFunc = this.handleMouseDown.bindAsEventListener(this);
        Event.observe($("eventHandler_" + this.id), 'mousedown', this.handleMouseDownFunc);

        this.handleImageZoomFunc = this.handleImageZoom.bindAsEventListener(this);
        Event.observe($("eventHandler_" + this.id), "mousewheel", this.handleImageZoomFunc);
        Event.observe($("eventHandler_" + this.id), "DOMMouseScroll", this.handleImageZoomFunc); //Firefox
    },

    loadFacsimile: function(facsimileId) {
        this.readFacsimile(facsimileId);

        this.startULX = 0;
        this.startULY = 0;

        this.startLRX = this.facsimileWidth[0];
        this.startLRY = this.facsimileHeight[0];

        var svgDoc = $("canvas_" + this.id).getElementsByTagNameNS("http://www.w3.org/2000/svg", "svg")[0];
        if(svgDoc) $("canvas_" + this.id).removeChild(svgDoc);

        this.digilib = new de.edirom.server.main.DigilibViewer(this, 'canvas_' + this.id, this.facsimileWidth[0], this.facsimileHeight[0]);
        this.digilib.buildInitialStructure();
        this.resetFacsimileView();
        this.digilib.loadImages();
    },

    readFacsimile: function(facsimileId) {

        this.facsimileId = facsimileId;

        var facsimile = this.facsimiles.get(facsimileId);

        this.facsimilePath = facsimile.getPath();

        this.facsimileWidth = new Array();
        this.facsimileHeight = new Array();

        this.facsimileWidth[0] = Number(facsimile.getWidth());
        this.facsimileHeight[0] = Number(facsimile.getHeight());

        for (var i = 1; i <= this.getMaxKey(); i++) {
            this.facsimileWidth[i] = Math.round(facsimile.getWidth() / Math.pow(2, i));
            this.facsimileHeight[i] = Math.round(facsimile.getHeight() / Math.pow(2, i));
        }

    },
    
    loadRect: function(ulx, uly, lrx, lry) {
        
            this.startULX = ulx;
            this.startULY = uly;
            this.startLRX = lrx;
            this.startLRY = lry;
            
            this.resetFacsimileView();
    },

    resetFacsimileView: function() {
        var divWidth = this.container.getWidth();
        var divHeight = this.container.getHeight();

        var width = this.startLRX - this.startULX;
        var height = this.startLRY - this.startULY;

        var offX;
        var offY;

        var diffWidth = 0;
        var diffHeight = 0;

        if ((divWidth / width) > (divHeight / height)) {
            this.setZoom(divHeight / height);

            offY = this.startULY * this.zoom;
            offX = this.startULX * this.zoom;

            diffWidth = Math.round((divWidth - (width * this.zoom)) / 2); //
        } else {
            this.setZoom(divWidth / width);

            offY = this.startULY * this.zoom;
            offX = this.startULX * this.zoom;

            diffHeight = Math.round((divHeight - (height * this.zoom)) / 2); //
        }

        this.setOffset(((offX * - 1) + diffWidth), ((offY * - 1) + diffHeight));
        this.digilib.loadImages();
    },

    getFacsimileId: function() {
        return this.facsimileId;
    },

    getFacsimileWidth: function(k) {
        return this.facsimileWidth[k];    
    },

    getFacsimileHeight: function(k) {
        return this.facsimileHeight[k];    
    },

    getFacsimilePath: function() {
        return this.facsimilePath;
    },

    getMaxKey: function() {

        if(this.maxKey == -1)
            this.maxKey = Math.max(this.getMaxKeyInt(Number(this.facsimileWidth[0]) / this.TILE_SIZE), this.getMaxKeyInt(Number(this.facsimileHeight[0]) / this.TILE_SIZE));

        return this.maxKey;
    },

    getMaxKeyInt: function(n) {
        if(n <= 1.0)
            return 0;
    	if(n <= 2.0)
            return 1;
    	if(n <= 4.0)
    	    return 2;
    	if(n <= 8.0)
    	    return 3;
    	if(n <= 16.0)
        	return 4;

    	return 5;
    },

    getNumCols: function(k) {
        return Math.ceil(this.facsimileWidth[k] / this.TILE_SIZE);
    },

    getNumRows: function(k) {
        return Math.ceil(this.facsimileHeight[k] / this.TILE_SIZE);
    },

    nextFacsimile: function() {
        var next = this.facsimiles.getNext(this.facsimileId);
        if(next != null)
            this.loadFacsimile(next.id);

        return next;
    },

    prevFacsimile: function() {
        var prev = this.facsimiles.getPrevious(this.facsimileId);
        if(prev != null)
            this.loadFacsimile(prev.id);

        return prev;
    },
    
    firstFacsimile: function() {
        var first = this.facsimiles.getFirst();
        if(first != null)
            this.loadFacsimile(first.id);

        return first;
    },

    showFacsimile: function(facsimileId) {
        var facsimile = this.facsimiles.get(facsimileId);
        if(facsimile != null)
            this.loadFacsimile(facsimile.id);

        return facsimile;
    },
    
    hasNextFacsimile: function() {
        var next = this.facsimiles.getNext(this.facsimileId);
        return next != null;
    },
    
    hasPrevFacsimile: function() {
        var prev = this.facsimiles.getPrevious(this.facsimileId);
        return prev != null;
    },

    handleMouseDown: function(e) {
        this.mouseOffX = this.offX;
        this.mouseOffY = this.offY;

        this.posX = e.screenX;
        this.posY = e.screenY;

        if(!e.shiftKey) {
            this.mouseMoveHandle = this.handleMouseMove.bindAsEventListener(this);
            this.mouseUpHandle = this.handleMouseUp.bindAsEventListener(this);

            Event.observe(window.document, 'mousemove', this.mouseMoveHandle);
            Event.observe(window.document, 'mouseup', this.mouseUpHandle);
        }

        this.mouseDownListeners.each(function(listener) {
            listener(e);
        });
    },

    handleMouseMove: function(e) {
        this.setOffset(this.mouseOffX - (this.posX - e.screenX), this.mouseOffY - (this.posY - e.screenY));

        this.digilib.loadImages();
    },

    handleMouseUp: function(e) {
        Event.stopObserving(window.document, 'mousemove', this.mouseMoveHandle);
        Event.stopObserving(window.document, 'mouseup', this.mouseUpHandle);

        this.setOffset(this.mouseOffX - (this.posX - e.screenX), this.mouseOffY - (this.posY - e.screenY));

        this.digilib.loadImages();
    },

    handleImageZoom: function(e) {
        this.lastZoomAction = new Date().getTime();
        var time = this.lastZoomAction;

        window.setTimeout(this.handleImageZoomThread.bind(this, e, time), "10");
    },

    handleImageZoomThread: function(e, time) {

        if(time < this.lastZoomAction) {
            return;
        }

        var lastZoom = this.zoom;

        var factor = 1;
        if(this.zoom < 0.5) factor = 1.0;
        else if(this.zoom < 1.0) factor = 1.5;
        else if(this.zoom < 2.0) factor = 1.8;
        else factor = 2.2;

        var newZoom = Math.round(this.zoom * 100 + (Event.wheel(e) * factor)) / 100.0; //
        this.setZoom(newZoom);


        var offSet = de.edirom.server.main.getPositionOnPage($("canvas_" + this.id));

        var mousePosX = e.pageX - offSet[0];
        var mousePosY = e.pageY - offSet[1];

        var centerX = Math.round((mousePosX - this.offX) / lastZoom); //
        var centerY = Math.round((mousePosY - this.offY) / lastZoom); //

        this.setOffset(mousePosX - Math.round(centerX * this.zoom), mousePosY - Math.round(centerY * this.zoom));

        this.digilib.loadImages();
    },

    setOffset: function(x, y) {
        this.offX = x;
        this.offY = y;

        this.digilib.setPosition(this.offX, this.offY);

        this.offsetListeners.each(function(listener) {
            listener(this.offX, this.offY);
        }.bind(this));
    },

    setZoom: function(zoom) {

        if(zoom > this.ZOOM_MAX) this.zoom = this.ZOOM_MAX;
        else if(zoom < this.ZOOM_MIN) this.zoom = this.ZOOM_MIN;
        else this.zoom = zoom;

        this.getKeyForZoom();

        if(typeof this.digilib != 'undefined')
        this.digilib.setSize(Math.round(this.getFacsimileWidth(0) * this.getZoom()), Math.round(this.getFacsimileHeight(0) * this.getZoom()));

        this.zoomListeners.each(function(listener) {
            listener(this.zoom);
        }.bind(this));
    },

    getZoom: function() {
        return this.zoom;
    },

    getOffX: function() {
        return this.offX;
    },

    getOffY: function() {
        return this.offY;
    },

    updateZoom: function(zoomInput, zoomStep) {
        var lastZoom = this.zoom;

		if (isNaN(zoomInput))
			this.setZoom(lastZoom);
		else {

		    if(typeof zoomStep != 'undefined')
		        zoomInput = Number(zoomInput) + (Number(zoomStep) * 10);

            this.setZoom(zoomInput / 100.0);

            var centerX = Math.round(((this.getContainerWidth() / 2.0) - this.offX) / lastZoom); //
            var centerY = Math.round(((this.getContainerHeight() / 2.0) - this.offY) / lastZoom); //

            this.setOffset(Math.round((this.getContainerWidth() / 2.0) - (centerX * this.zoom)),
                           Math.round((this.getContainerHeight() / 2.0) - (centerY * this.zoom)));

            this.digilib.loadImages();
		}
    },

    getContainerWidth: function() {
        return $("eventHandler_" + this.id).getWidth();
    },

    getContainerHeight: function() {
        return $("eventHandler_" + this.id).getHeight();
    },
    
    getKeyForZoom: function() {
        this.key = this.maxKey;
        for(var i = this.maxKey; i > 0;) {
            if(1 / Math.pow(2.0, i) > this.zoom) break;

            i = i - 1;
            this.key = i;
        }
    },

    getKey: function() {
        return this.key;    
    },

    addZoomListener: function(listener) {
        this.zoomListeners.push(listener);
    },

    addOffsetListener: function(listener) {
        this.offsetListeners.push(listener);
    },

    addMouseDownListener: function(listener) {
        this.mouseDownListeners.push(listener);
    },

    destroy: function() {

        Event.stopObserving($("eventHandler_" + this.id), 'mousedown', this.handleMouseDownFunc);

        Event.stopObserving($("eventHandler_" + this.id), "mousewheel", this.handleImageZoomFunc);
        Event.stopObserving($("eventHandler_" + this.id), "DOMMouseScroll", this.handleImageZoomFunc); //Firefox

        this.container.removeChild($('canvas_' + this.id));
        this.container.removeChild($('eventHandler_' + this.id));
    }
});