/**
 * Creates a new class FacsimileLayer that extend from L.TileLayer.
 * @class
 * @classdesc FacsimileLayer is for show not square tile layers.
 */
L.TileLayer.FacsimileLayer = L.TileLayer.extend({
	
	/**
	 * Global variable to define bounds of the rectangle.
	 * @type {LatLngBounds}
	 */
	bounds: null,
	
	/**
	 * Global variable to define a rectangle.
	 * @type {Rectangle}
	 */
	rectangle: null,
	rectangleCenter: null,	
	popup: null,
	
	/**
	 * Global variable to define the rectangle center.
	 * @type {Circle}
	 */
	rectangleCenter: null,
	
	facsimileWidth: null,
	
	facsimileHeight: null,
	
	markersArray: null,
	annotArray: null,
	layerArray: null,
	
	colorMap: new Map(),
	
	/**
	 * Initialite a facsimile layer.
	 * @overrides
	 * @param {string} url - path.
	 * @param {object} options - optionally options for layer.
	 */
	initialize: function (url, options) {
		L.TileLayer.prototype.initialize.call(this, url, options);
	},
	
	setWidth: function (facsimileWidth) {
		this.facsimileWidth = facsimileWidth;
	},
	
	setHeight: function (facsimileHeight) {
		this.facsimileHeight = facsimileHeight;
	},

	/*createPupup: function(ulx, uly, lrx, lry, rectangleCenter, content){
		

	tooltip = L.tooltip({
          target: rectangleCenter,
	      map: this._map,
	      html: content,
          padding: '4px 8px'
      });*/


		/*ulx = parseInt(ulx);
		uly = parseInt(uly);
		lrx = parseInt(lrx);
		lry = parseInt(lry);
		
		var corrd1 = ((lrx - ulx) / 2 + ulx);
		var corrd2 = ((lry - uly) / 2) + uly;
		var centerPoint = L.point(corrd1, corrd2);
		
		// convert coordinates in degrees
		var latLngCenterPoint = this._map.unproject(centerPoint, this._map.getMaxZoom());

		this.popup = L.popup({maxHeight : 200}).setLatLng(latLngCenterPoint).openOn(this._map);                           
       	this.rectangleCenter.bindPopup(this.popup);
		this.popup.setContent(content);*/

	//},
	
	
	enableAnnotationRectangle: function (ulx, uly, lrx, lry, annotKey, iconPath, aktuelrotate) {
		var me = this;  
		if (typeof this.annotArray === 'undefined' || this.annotArray === null) {
			this.annotArray = new Map();
		}

		ulx = parseInt(ulx);
		uly = parseInt(uly);
		lrx = parseInt(lrx);
		lry = parseInt(lry);
		
		var corrd1 = ((lrx - ulx) / 2) + ulx ;
		var corrd2 = ((lry - uly) / 2) + uly;
		
		var centerPoint = null;

		if(aktuelrotate === 1){			
			centerPoint = L.point(corrd1, corrd2);
			
		}
		else if(aktuelrotate === 2){
			// y-ach rotate
			var new_x = corrd1 - 22;
			centerPoint = L.point(new_x, corrd2);
						
		}
		else if(aktuelrotate === 3){
			// x-ach rotate
			var new_y = corrd2 - 18;
			centerPoint = L.point(corrd1, new_y);
			
		}
		else if(aktuelrotate === 4){
			// spiegeln
			var new_x = corrd1 - 22;
			var new_y = corrd2 - 18;
			centerPoint = L.point(new_x, new_y);
		}
		else{
			// TODO: 
			// aktuelrotate/4 ->
			// vor komma: 1 bis <= 2,0 usw: # drehungen
 			// nach komma(rest) 25: vreschieben, 5: um y-achse, 75: um x-achse; ohne rest: spiegeln
		}

		// convert coordinates in degrees
		var latLngCenterPoint = this._map.unproject(centerPoint, this._map.getMaxZoom());
		
		var myIcon = L.icon({
			iconUrl: iconPath
		});

		
		this.rectangleCenter = L.marker([latLngCenterPoint.lat, latLngCenterPoint.lng], {
			icon: myIcon
		});
		this.rectangleCenter.addTo(this._map);

		if(this.annotArray.has(annotKey)){
			var arrayValue = this.annotArray.get(annotKey)
			arrayValue.push(this.rectangleCenter);					
		}
		else{
			var arrayValue = new Array(this.rectangleCenter);
			this.annotArray.set(annotKey, arrayValue);
		}

		return this.rectangleCenter;

				
		/*ulx = parseInt(ulx);
		uly = parseInt(uly);
		lrx = parseInt(lrx);
		lry = parseInt(lry);
		
		var pointLeft = L.point(((lrx - ulx) / 2 + ulx)-50, ((lry - uly) / 2 + uly)-50);
		var pointRight = L.point(((lrx - ulx) / 2 + ulx)+50, ((lry - uly) / 2 + uly)+50);
		
		// convert coordinates in degrees
		var latLngLeft = this._map.unproject(pointLeft, this._map.getMaxZoom());
		var latLngRight = this._map.unproject(pointRight, this._map.getMaxZoom());
		
		// create bounds for a rectangle
		var bounds = L.latLngBounds(latLngLeft, latLngRight);
		
		var colorNumber = null;
		if(this.colorMap.has(annotKey)){
			colorNumber = this.colorMap.get(annotKey);
		}
		else{
			colorNumber =  this.colorMap.size+1;
			this.colorMap.set(annotKey, colorNumber);
		}
		
		var current_color = this.calculateColor(colorNumber-1, colorNumber);
		console.log(current_color);
		console.log(current_color.length);
		
		// create rectangle
		this.rectangleCenter = L.rectangle(bounds, {
			color: current_color[current_color.length-1], weight: 1, opacity: 0.9
		}).addTo(this._map);
				
		//this.annotArray.push(this.rectangleCenter);
		
		if(this.annotArray.has(annotKey)){
			var arrayValue = this.annotArray.get(annotKey)
			arrayValue.push(this.rectangleCenter);					
		}
		else{
			var arrayValue = [];
			arrayValue.push(this.rectangleCenter);
			this.annotArray.set(annotKey, arrayValue);
			console.log('set in Map');
			console.log(this.annotArray.get(annotKey));
		}
								
		return this.rectangleCenter;*/
	},
	
	 calculateColor: function(startIndex, colorCount) {
  		var newPalette = [];
  		var hueStep = Math.floor ( 330 / colorCount ) ;
  		var hue = 0 ;
  		var saturation = 95 ;
  		var luminosity =  55 ;
  		var greenJump  = false ;
  		var dummyContext = document.createElement('canvas').getContext('2d');
  		
  		for ( var colorIndex=0; colorIndex < colorCount; colorIndex++ ) {
    		saturation = (colorIndex & 1) ? 90 : 65;
    		luminosity = (colorIndex & 1) ? 80 : 55;
    		newPalette.push( this.hslToRgbString (hue ,saturation, luminosity, dummyContext));
    		hue += hueStep ;
    		if (!greenJump && hue >100) {
      			hue+=30;
      		greenJump = true;
    		}
  		} 
  		return newPalette ;   
	},
	
	// dummy context2d used for hsl -> rgb conversion
 	hslToRgbString: function(h,s,l, dummyContext) {
   		dummyContext.fillStyle = 'hsl(' + h +',' + s + '%,' + l +'% )' ; 
  		return dummyContext.fillStyle ;
	},
	

	getInnerAnnot: function(){
	if (typeof this.annotArray === 'undefined' || this.annotArray === null) {
			this.annotArray;
		}		
	},
	
	removeAnnotations: function () {
		var me = this;
		if (typeof this.annotArray !== 'undefined' && this.annotArray !== null) {
		this.annotArray.forEach(function (value, key) {
			for(j = 0; j < value.length; j++){
		 		layerToDelete = value[j];
		 		me._map.removeLayer(layerToDelete);
		 	}
    		
		});
		
			this.annotArray = null;
		}
		if (typeof this.rectangle !== 'undefined' && this.rectangle !== null) {
					this.disableRectangle();
				}
	},
		
	removeDeselectedAnnotations: function (visibleCategories, visiblePriorities) {
		if (typeof this.annotArray !== 'undefined' && this.annotArray !== null) {
		var keysToDelete = [];
		this.annotArray.forEach(function(value, key) {
			var idx_2 = visiblePriorities.indexOf(key);
			console.log(idx_2);
		  	if(idx_2 === -1){
		  		keysToDelete.push(key);		  		
		  }			
		}, this.annotArray);
		
		for(i = 0; i < keysToDelete.length; i++){
			var test = keysToDelete[i];
			var annotToDelete = this.annotArray.get(test);
			if(typeof annotToDelete !== 'undefined'){
				for(j = 0; j < annotToDelete.length; j++){
				this._map.removeLayer(annotToDelete[j]);
			}
			}
			this.annotArray.delete(test);
		}
	
		}
		if (typeof this.rectangle !== 'undefined' && this.rectangle !== null) {
			this.disableRectangle();
		}
	},
	
	
	/**
	 * Create and show a rectangle with given coordinates in pixel
	 * @param {number} ulx - left x coordinate.
	 * @param {number} uly - left y coordinte.
	 * @param {number} lrx - right x coordinate.
	 * @param {number} lry - right y coordinste.
	 */
	enableRectangle: function (ulx, uly, lrx, lry, isPopupCreate) {
		// if(typeof this.rectangle === 'undefined' || this.rectangle === null){
		// define points in coordinates system
		var pointLeft = L.point(ulx, uly);
		var pointRight = L.point(lrx, lry);
		
		// convert coordinates in degrees
		var latLngLeft = this._map.unproject(pointLeft, this._map.getMaxZoom());
		var latLngRight = this._map.unproject(pointRight, this._map.getMaxZoom());
		
		// var latLngLeft = L.latLng(ulx, uly);
		// var latLngRight = L.latLng(lrx, lry);
		
		// create bounds for a rectangle
		this.bounds = L.latLngBounds(latLngLeft, latLngRight);
		
		// create rectangle
		// console.log(Ext.getCmp('leafletfacsimile').getMap());
		this.rectangle = L.rectangle(this.bounds, {
			color: 'black', weight: 1, opacity: 0.8
		}).addTo(this._map);
		
		// zoom rectangle in windows center
		if(!isPopupCreate){
			this._map.fitBounds(this.bounds);
		}
		
		
		return this.rectangle;
		
		
		//   }
	},


	/**
	 * Remove rectanle and center from map.
	 */
	disableRectangle: function () {
		if (typeof this.rectangle !== 'undefined' && typeof this._map !== 'undefined' && this._map.hasLayer(this.rectangle)) {
			this._map.removeLayer(this.rectangle);
			this.rectangle = null;
		}
		/* if(typeof rectangleCenter !== 'undefined' && this._map.hasLayer(rectangleCenter)){
		this._map.removeLayer(rectangleCenter);
		rectangleCenter = null;
		}  */
	},
	
	/**
	 * Show and zoom rectangle in windows center.
	 */
	zoomRectangle: function () {
		if (typeof this.bounds !== 'undefined' && this.bounds !== null) {
			this._map.fitBounds(this.bounds);
		}
	},
	
	fitInImage: function () {
		
		var coord3 = L.point(0, 0);
		var coord4 = L.point(this.facsimileWidth, this.facsimileHeight);
		
		var latLngLeft = this._map.unproject(coord3, this._map.getMaxZoom());
		var latLngRight = this._map.unproject(coord4, this._map.getMaxZoom());
		
		var bounds = L.latLngBounds(latLngLeft, latLngRight);
		
		this._map.fitBounds(bounds);
	},
	
	/**
	 * Compute and show center for given bounds.
	 * @param {number} ulx - left x coordinate.
	 * @param {number} uly - left y coordinte.
	 * @param {number} lrx - right x coordinate.
	 * @param {number} lry - right y coordinste.
	 */
	showRectangleCenter: function (ulx, uly, lrx, lry, nr) {
		var me = this;
		//if(typeof rectangleCenter === 'undefined' || rectangleCenter === null){
		if (typeof this.markersArray === 'undefined' || this.markersArray === null) {
			this.markersArray =[];
		}
				
		ulx = parseInt(ulx);
		uly = parseInt(uly);
		lrx = parseInt(lrx);
		lry = parseInt(lry);
		
		var corrd1 = ((lrx - ulx) / 2 + ulx);
		var corrd2 = ((lry - uly) / 2) + uly;
		var centerPoint = L.point(corrd1, corrd2);
		
		// convert coordinates in degrees
		var latLngCenterPoint = this._map.unproject(centerPoint, this._map.getMaxZoom());
		// create circle in center
		/* var rectangleCenter = L.circle([latLngCenterPoint.lat, latLngCenterPoint.lng], 100, {
		color: 'red',
		fillColor: '#f03',
		fillOpacity: 0.5
		}).addTo(this._map);*/
		
		var myIcon = L.divIcon({
			iconSize: new L.Point(17, 17),
			html: '<center>' + nr + '</center>'
		});
		
		var marker = L.marker([latLngCenterPoint.lat, latLngCenterPoint.lng], {
			icon: myIcon
		});
		marker.addTo(this._map);
		marker.on('mouseover', function (e) {
			if (typeof me.rectangle !== 'undefined' && me.rectangle !== null) {
				me.disableRectangle();
			}
			me.enableRectangle(ulx, uly, lrx, lry);
			/*console.log(e.latlng);
			console.log(e.layerPoint);
			console.log(e.containerPoint);
			console.log(e.originalEvent);*/
		});
		
		this.markersArray.push(marker);
	},
	
	/**
	 * Remove markers from the map.
	 */
	removeMarkers: function () {
		if (typeof this.markersArray !== 'undefined' && this.markersArray !== null) {
			for (i = 0; i < this.markersArray.length; i++) {
				this._map.removeLayer(this.markersArray[i]);
			}
			this.markersArray = null;
		}
	},
	
	/**
	 * Remove layer markers from the map.
	 */
	removeLayerMarkers: function (overlayId) {
		if (typeof this.layerArray !== 'undefined' && this.layerArray !== null) {
		var keysToDelete = [];
		this.layerArray.forEach(function (value, key) {
			if(key === overlayId){
				keysToDelete.push(key);
			}
		});
		for(i = 0; i < keysToDelete.length; i++){
			var test = keysToDelete[i];
			var annotToDelete = this.layerArray.get(test);
			for(j = 0; j < annotToDelete.length; j++){
				this._map.removeLayer(annotToDelete[j]);
			}
			this.layerArray.delete(test);
		}
		}
	},
	
	showOverlay: function (overlayId, svg_width, svg_height, svgURL) {
		
		if (typeof this.layerArray === 'undefined' || this.layerArray === null) {
			this.layerArray = new Map();
		}
		
         var southWest = this._map.unproject([0, svg_height], this._map.getMaxZoom());
		var northEast = this._map.unproject([svg_width, 0], this._map.getMaxZoom());

		var imageBounds = L.latLngBounds(southWest, northEast);


			var imOv = L.imageOverlay(svgURL, imageBounds).addTo(this._map);
	
			imOv.bringToFront();
			
			if(this.layerArray.has(overlayId)){
			var arrayValue = this.layerArray.get(overlayId)
			arrayValue.push(imOv);					
		}
		else{
			var arrayValue = [];
			arrayValue.push(imOv);
			this.layerArray.set(overlayId, arrayValue);
			
		}
	
		//this.layerArray.push(imOv);
	},
	
	/**
	 * Add tiles that contain to image only.
	 * @override
	 * @param {Point} coords.
	 * @param {Object} container.
	 */
	_addTile: function (coords, container) {
		
		var originalMaxWidth = this.facsimileWidth;//3991;
		var originalMaxHeight = this.facsimileHeight;//2992;
		
		var maxZoom = this._map.getMaxZoom();
		var currZoom = this._map.getZoom();
		
		var numberCol = originalMaxWidth /(256 *(Math.pow(2, maxZoom - currZoom)));
		var numberRow = originalMaxHeight /(256 *(Math.pow(2, maxZoom - currZoom)));
		
		if ((currZoom === 0 && coords.x === 0 && coords.y === 0)) {
			L.TileLayer.prototype._addTile.call(this, coords, container);
		} else if (coords.y < numberRow && coords.x < numberCol && coords.x >= 0 && coords.y >= 0 && currZoom > 0) {
			L.TileLayer.prototype._addTile.call(this, coords, container);
		}
	},
	
	/**
	 * Create a canvas element to override tileSize of Tilelayer.
	 * @override
	 */
	_tileOnLoad: function () {
		var canvasTiles = document.createElement("canvas");
		canvasTiles.width = canvasTiles.height = this._layer.options.tileSize;
		this.canvasContext = canvasTiles.getContext("2d");
		var ctx = this.canvasContext;
		if (ctx) {
			this.onload = null;
			ctx.drawImage(this, 0, 0);
			var imgData = ctx.getImageData(0, 0, this._layer.options.tileSize, this._layer.options.tileSize);
			ctx.putImageData(imgData, 0, 0);
			this.src = ctx.canvas.toDataURL();
		}
		
		L.TileLayer.prototype._tileOnLoad.call(this);
	}
});

/**
 * create instance of FacsimileLayer, passing url and options to the constructor
 * @override
 * @param {string} url - path.
 * @param {object} options - optionally options for layer.
 */
L.tileLayer.facsimileLayer = function (url, options) {
	return new L.TileLayer.FacsimileLayer(url, options);
};