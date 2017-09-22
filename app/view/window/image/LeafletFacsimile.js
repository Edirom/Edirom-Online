/**
 * Creates class EdiromOnline.view.window.image.LeafletFacsimile that extend from Ext.Component.
 * @class
 * @classdesc EdiromOnline.view.window.image.LeafletFacsimile for create leaflet component.
 */
Ext.define('EdiromOnline.view.window.image.LeafletFacsimile', {
	extend: 'Ext.Component',
	
	/* requires: [
        'Ext.tip.*'
    ],*/
	
	alias: 'widget.leafletmapview',
	
	config: {
		map: null
	},
	
	zones: null,
	facsimileTile: null,
	imgHeight: null,
	imgWidth: null,
	imgId: null,
	imgPath: null,
	shapes: null,
	annotMap: null,
	
	/**
	 * Get data for initialize a map, data for show measures and ftaffs numbers,
	 * create leaflet
	 * @overrides
	 */
	afterRender: function (t, eOpts) {
		var me = this;
		this.callParent(arguments);
		
		var leafletRef = window.L;
		if (leafletRef == null) {
			this.update('No leaflet library loaded');
		}
		
	},
	
	/**
	 * Get called anytime the size is changed in the layout
	 * and call the ‘invalidateSize’ method on the map.
	 * @overrides
	 */
	onResize: function (w, h, oW, oH) {
		this.callParent(arguments);
		var map = this.getMap();
		if (map) {
			map.invalidateSize();
			//Ext.QuickTips.init();
		}
	},
	
	addMeasures: function (shapes) {
		var me = this;
		me.shapes.add('measures', shapes);
		//me.setShapes(shapes);
		//var plist = Ext.Array.toArray(annotation.get('plist'));
         //   Ext.Array.insert(me.shapes.get('annotations'), 0, plist);
		// me.shapes = shapes;
		for (i = 0; i < shapes.data.items.length; i++) {
			var name = shapes.data.items[i].data.name;
			var lrx = shapes.data.items[i].data.lrx;
			var lry = shapes.data.items[i].data.lry;
			var ulx = shapes.data.items[i].data.ulx;
			var uly = shapes.data.items[i].data.uly;
			this.facsimileTile.showRectangleCenter(ulx, uly, lrx, lry, name);
		}
	},
	
	/*setShapes: function (shapes) {
		this.shapes = shapes;
	},*/
	
	removeShapes: function (groupName) {
		if (this.facsimileTile !== null) {
			if (groupName === 'annotations') {			
				this.facsimileTile.removeAnnotations();
			} else {
				this.facsimileTile.removeMarkers();
				this.facsimileTile.disableRectangle();
			}
		}
	},
	
	removeDeselectedAnnotations: function (visibleCategories, visiblePriorities, annotations) {
		//this.facsimileTile.removeDeselectedAnnotations(visibleCategories, visiblePriorities);		
	},
	
	clear: function () {
		if (this.facsimileTile !== null) {
			this.facsimileTile.removeMarkers();
			this.facsimileTile.disableRectangle();
			var map = this.getMap();
			map.remove();
			this.pageId = null;
		}
	},
	
	showShapes: function () {
		/*		
		var me = this;
		if(me.shapesHidden) {
		me.shapesHidden = false;
		var shapeDiv = me.el.getById(me.id + '_facsContEvents');
		shapeDiv.removeCls('hiddenShapes');
		me.repositionShapes();
		}*/
	},
	
	
	showImage: function (path, width, height, pageId) {
		var me = this;
		me.shapes = new Ext.util.MixedCollection();
		
		var leaflet_path = null;
		if(pageId === 'annot'){
			var fields = path.split('.');
			leaflet_path = fields[0];
		}
		else{
			me.imgPath = path;
			var leaflet_prefix = getPreference('leaflet_prefix');
			var fields = path.split('.');
			var name = fields[0];
			leaflet_path = leaflet_prefix + name;
		}
		
		me.imgId = pageId;
		me.imgHeight = parseInt(height);
		me.imgWidth = parseInt(width);
		
		var originalMaxSize = null;
		
		if (me.imgHeight > me.imgWidth) {
			originalMaxSize = me.imgHeight;
		} else {
			originalMaxSize = me.imgWidth;
		}
		
		var maxZoomLevel = 0;
		while (originalMaxSize > 256) {
			originalMaxSize = originalMaxSize / 2;
			maxZoomLevel++;
		}
	
		/*var map = this.getMap();
		if(typeof map === 'undefined' || map === null){
			map = L.map(me.getId());
		}*/
		
		var map = null;
		if(pageId === 'annot'){
			map = this.getMap();
			if(typeof map === 'undefined' || map === null){
				map = L.map(me.getId());
			}
		}
		else{
			map = L.map(me.getId());
		}
			
		/*var corrd1 = me.imgWidth / 2;
		var corrd2 = me.imgHeight / 2;
		var centerPoint = L.point(corrd1, corrd2);
		var latLngCenterPoint = map.unproject(centerPoint, maxZoomLevel);
		map.setView([latLngCenterPoint.lat, latLngCenterPoint.lng], 0);
		*/
		
		map.setView([0,0], 0);
		
		me.setMap(map);
		
		me.facsimileTile =
		L.tileLayer.facsimileLayer(leaflet_path + '/{z}-{x}-{y}.jpg', {
			minZoom: 0,
			maxZoom: maxZoomLevel
		});
		
		me.facsimileTile.setWidth(me.imgWidth);
		
		me.facsimileTile.setHeight(me.imgHeight);
		
		me.facsimileTile.addTo(map);
		
		if(pageId !== 'annot'){
			me.facsimileTile.fitInImage();
		}
		
		/*var app = EdiromOnline.getApplication();
		var tools = app.getController('ToolsController');
		var isVisble = tools.areMeasuresVisible();
		if(isVisble === 'true'){
		//tools.setGlobalMeasureVisibility(true);
		//me.addMeasures(me.shapes);
		}*/
	},
	
	fitInImage: function () {
		this.facsimileTile.fitInImage();
	},
	
	addAnnotations: function (annotations) {
		var me = this;

		if(typeof annotations === 'undefined'){
			return;
	
		}
		
		me.shapes.add('annotations', annotations);
		if(typeof me.annotMap === 'undefined' || me.annotMap === null){
			me.annotMap = new Map();
		}

		var mapRotateData = new Map();
		
		/*annotations.each(function(annotation) {
			var plist_1 = Ext.Array.toArray(annotation.get('plist'));
        	Ext.Array.insert(me.shapes.get('annotations'), 0, plist_1);
		});*/
		
		for (i = 0; i < annotations.data.items.length; i++) {
			var plist = annotations.data.items[i].data.plist;
			var annotURI = annotations.data.items[i].data.uri;
			var idInner = annotations.data.items[i].data.id;
			var name = annotations.data.items[i].data.title;
			var args_fn = annotations.data.items[i].data.fn;
			var priority = annotations.data.items[i].data.priority;
			var category = annotations.data.items[i].data.categories;
			//Ext.Array.insert(me.shapes.get('annotations'), 0, plist);
			for (j = 0; j < plist.length; j++) {
				var lrx = plist[j].lrx;
				var lry = plist[j].lry;
				var ulx = plist[j].ulx;
				var uly = plist[j].uly;

				var mapRotateKey  = lrx+'_'+lry+'_'+ulx+'_'+uly;
				var aktuelrotate = null;

				if(mapRotateData.has(mapRotateKey)){
					var arrayValue = mapRotateData.get(mapRotateKey);
					aktuelrotate = arrayValue+1;
					mapRotateData.set(mapRotateKey, aktuelrotate);
				}
				else{
					mapRotateData.set(mapRotateKey, 1);
					aktuelrotate =  1;
				}

				var annotKey = null;
				/*if(priority.length > 1 && category.length > 1 ){
					annotKey = priority+category;
				}*/
				var iconPath = null;
				if(typeof priority !== 'undefined' || priority !== null){
					annotKey = priority;
					me.addToMap(annotKey, plist[j]);
					if(priority.match('Prio1')){
						iconPath = 'resources/images/icon_all_prio1.png';
					}
					else if(priority.match('Prio2')){
						iconPath = 'resources/images/icon_all_prio2.png';
					}
					else{
						iconPath = 'resources/images/icon_all_prio3.png';
					}

				}
				if(typeof category !== 'undefined' || category !== null){
					//annotKey = category;
					me.addToMap(annotKey, plist[j]);
				}
				var rectangleCenter = me.facsimileTile.enableAnnotationRectangle(ulx, uly, lrx, lry, annotKey, iconPath, aktuelrotate);
				var tooltip = L.tooltip({
          						target: rectangleCenter,
	     					 	map: me.getMap()
	      						//html: response.responseText
      						});
				me.addAnnotationsListener(rectangleCenter, ulx, uly, lrx, lry, annotURI, idInner, name, args_fn, tooltip);
			}
		}
	
	},
	
	addToMap: function(annotKey, el){
		if(this.annotMap.has(annotKey)){
					var arrayValue = this.annotMap.get(annotKey)
					arrayValue.push(el);					
				}
				else{
					var arrayValue = new Array();
					arrayValue.push(el);
					this.annotMap.set(annotKey, arrayValue);
				}
	},
	
	  addAnnotationsListener: function(rectangleCenter, ulx, uly, lrx, lry, annotURI, idInner, name, args_fn, tooltip){
		var me = this;
		
		rectangleCenter.on('mouseover', function (e) {
               Ext.Ajax.request({
                        url: 'data/xql/getAnnotation.xql',
                        method: 'GET',
                        params: {
                            uri: annotURI,
                            target: 'tip',
                            edition: EdiromOnline.getApplication().activeEdition
                        },
                        success: function(response){
                            //this.update(response.responseText);
                            me.facsimileTile.disableRectangle();
							me.facsimileTile.enableRectangle(ulx, uly, lrx, lry, true);
                          	//rect_tmp = me.facsimileTile.createPupup(ulx, uly, lrx, lry, rectangleCenter , response.responseText);
                             var overview = response.responseText;       
                            var test = $(overview).html();
                            tooltip.setHtml(test);
					/*var tooltip = L.tooltip({
          						target: rectangleCenter,
	     					 	map: me.getMap(),
	      						html: response.responseText
      						});*/
                            
                           
                        }
                       // scope: this
                    });
        
                });

				rectangleCenter.on('click', function (e) { 
         						eval(args_fn);
      						});

				rectangleCenter.on('mouseout', function (e) {
						me.facsimileTile.disableRectangle();
						//me.rectangleCenter.closePopup();						
                });
 
	},
	
	getShapeElem: function (shapeId) {
		var me = this;
		
		var shapes_Objectlist = me.shapes.items[0].data;
		var shape = null;
		for (i = 0; i < shapes_Objectlist.items.length; i++) {
			if (shapes_Objectlist.items[i].id === shapeId) {
				shape = shapes_Objectlist.items[i];
				break;
			}
		}
		
		return shape;
	},
	
	getShapes: function (groupName) {
		
		var me = this;

		return me.shapes.get(groupName);
	},
	
	showRect: function (ulx, uly, width, height, highlight) {
		this.facsimileTile.disableRectangle();
		var rectangle = this.facsimileTile.enableRectangle(ulx, uly, ulx + width, uly + height, false);
		return rectangle;
	},

	showMeasure: function (selectedObject) {
		//this.addMeasures(selectedObject);
		/*	var measureNr = 'measure'+selectedObject.data.measurenr+'_s'+selectedObject.data.staff;
		for (i = 0; i < zones.length; i++) {
		if(zones[i].id.indexOf(measureNr) > -1){
		var lrx = zones[i].lrx;
		var lry = zones[i].lry;
		var ulx = zones[i].ulx;
		var uly = zones[i].uly;
		this.facsimileTile.disableRectangle();
		this.facsimileTile.enableRectangle(ulx, uly, lrx, lry);
		break;
		}
		}*/
	},
	
	getActualRect: function () {		
		var me = this;
		return {
			x: 0,
			y: 0,
			width: me.imgWidth,
			height: me.imgHeight
		};
	},
	
	hideOverlay: function (overlayId) {
		this.facsimileTile.removeLayerMarkers(overlayId);
	},
	
	showOverlay: function (overlayId, overlay) {
		
		var svgURL = "data:image/svg+xml;base64," + btoa(overlay);
		
		var xmlFile = jQuery.parseXML(overlay);
		
		var svg_name = xmlFile.getElementsByTagName('svg');
		var element = svg_name[0];
		var svg_width = parseInt(element.getAttribute('width'));
		var svg_height = parseInt(element.getAttribute('height'));
		
		this.facsimileTile.showOverlay(overlayId, svg_width, svg_height, svgURL);
	}
});