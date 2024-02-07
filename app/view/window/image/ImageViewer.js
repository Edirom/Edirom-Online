/**
 *  Edirom Online
 *  Copyright (C) 2014 The Edirom Project
 *  http://www.edirom.de
 *
 *  Edirom Online is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  Edirom Online is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with Edirom Online.  If not, see <http://www.gnu.org/licenses/>.
 */
Ext.define('EdiromOnline.view.window.image.ImageViewer', {
    extend: 'Ext.panel.Panel',

    mixins: {
        observable: 'Ext.util.Observable'
    },

    layout: 'fit',

    offX: 0,
    offY: 0,

    mouseOffX: 0,
    mouseOffY: 0,

    posX: 0,
    posY: 0,

    zoom: 1,
    maxZoom: 4,
    minZoom: 0.1,
    lastZoom: 0,

    imgWidth: 0,
    imgHeight: 0,

    imgPrefix: null,
    
    shapes: null,
    shapesHidden: false,
    partLabel: null,

    svgOverlays: null,
    annotSVGOverlays: null,
    
    annotTipWidth: 500,
    annotTipMaxWidth: 500,
    annotTipHeight: 300,
    annotTipMaxHeight: 300,
    
    border: 0,

    initComponent: function () {

        var me = this;
        
        me.imgPrefix = getPreference('image_prefix');
        
        me.addEvents('zoomChanged',
                    'imageChanged');
       
/*       from OPERA*/
       var facsContEvents;

        if (me.partLabel != null) {
         facsContEvents = '<div id="' + me.id + '_facsContEvents" class="facsContEvents">' +
            '<div  id="' + me.id + '_' + me.partLabel + '" class="part">' +
              '<span class="partInner" id="' + me.id + '_' + me.partLabel + '_inner">' +
              me.partLabel + '</span>' +
            '</div>' +
         '</div>';
        }
        else {
          facsContEvents = '<div id="' + me.id + '_facsContEvents" class="facsContEvents"></div>';
         };
         
        me.html = '<div id="' + me.id + '_facsCont" style="background-color: black; top:0px; bottom: 0px; left: 0px; right: 0px; position:absolute;"></div>' + facsContEvents;

/*       from OPERA END*/
                    
/*                    */
/*        me.html = '<div id="' + me.id + '_facsCont" style="overflow: hidden; background-color: black; top:0px; bottom: 0px; left: 0px; right: 0px; position:absolute;"></div>' +*/
/*                  '<div id="' + me.id + '_facsContEvents" class="facsContEvents"></div>';*/
/*                    */
        me.imageLoader = new EdiromOnline.view.window.image.ImageLoader({
            viewer: me
        });

        me.shapes = new Ext.util.MixedCollection();
        me.svgOverlays = new Ext.util.MixedCollection();
        me.annotSVGOverlays = [];

        me.callParent();

        me.on('afterrender', me.initSurface, me, {single: true});
        me.on('resize', me.calculateHiResImg, me);
    },

    initSurface: function() {
        var me = this;

        var eventEl = me.el.getById(me.id + '_facsContEvents');
        eventEl.unselectable();
        eventEl.on('mousedown', me.onMouseDown, me);
        eventEl.on('mousewheel', me.onScroll, me);
    },

    showImage: function(path, width, height, pageId) {
    
        var me = this;

        me.imgWidth = width;
        me.imgHeight = height;
        me.imgPath = path;
        me.imgId = pageId;

        me.svg = Raphael(me.id + '_facsCont', me.imgWidth, me.imgHeight);
        me.svg.setViewBox(0, 0, me.imgWidth, me.imgHeight, false);
        me.svgEl = me.svg.canvas;

        me.baseImg = me.svg.image(me.imgPrefix + me.imgPath + '?dw=' + me.getWidth() + '&amp;mo=fit', 0, 0, me.imgWidth, me.imgHeight);
        me.baseImgZoom = me.getWidth() / me.imgWidth;

        me.hiResImg = me.svg.image('', 0, 0, 0, 0);
        me.hiResImg.attr({'stroke-width': 0});
        me.hiResImg.hide();

        me.fitInImage();
        
        me.fireEvent('imageChanged', me, path, pageId);
    },

    clear: function() {
    
        var me = this;
        //console.log("clear");
        //console.log(me.shapes);

        // remove all shapes
        var keys = [];
        me.shapes.eachKey(function(key) {
	       keys.push(key); 
        });
        
        for(var i = 0; i < keys.length; i++) {
	        var groupName = keys[i];
	        //console.log(groupName);
            me.removeShapes(groupName);
        };

        me.svgOverlays.each(function(svg) {
           svg.destroy();
        });
        me.svgOverlays.removeAll();

        me.el.getById(me.id + '_facsCont').update('');

        me.offX = 0;
        me.offY = 0;

        me.zoom = 1;
        me.lastZoom = 0;

        me.imgWidth = 0;
        me.imgHeight = 0;

    },

    addAnnotations: function(annotations) {
    	
        var me = this;

        me.shapes.add('annotations', []);

        var shapeDiv = me.el.getById(me.id + '_facsContEvents');
        var dh = Ext.DomHelper;
        var tpl = dh.createTemplate('<div id="{0}" class="annotation {2} {3} {4}" data-edirom-annot-id="{4}"><div id="{0}_inner" class="annotIcon" title="{1}"></div></div>');
        tpl.compile();

        annotations.each(function(annotation) {

            var name = annotation.get('title');
            var uri = annotation.get('uri');
            var categories = annotation.get('categories');
            var priority = annotation.get('priority');
            var fn = annotation.get('fn');          
            var plist = Ext.Array.toArray(annotation.get('plist'));
            
            Ext.Array.each(annotation.get('svgList'), function(svg) {
                this.addSVGOverlay(svg.id, svg.svg, name, uri, fn);
                Ext.Array.push(this.annotSVGOverlays, svg.id);
            }, me);
            
            Ext.Array.insert(me.shapes.get('annotations'), 0, plist);

            Ext.Array.each(plist, function(shape) {

                var id = shape.id;
                var x = shape.ulx;
                var y = shape.uly;
                var width = shape.lrx - shape.ulx;
                var height = shape.lry - shape.uly;

                //TODO: Korrektes Bild anhängen
                var shape = tpl.append(shapeDiv, [me.id + '_' + id, name, categories, priority, annotation.get('id')], true);

                shape.setStyle({
                    position: 'absolute'
                });

                var innerShape = shape.getById(me.id + '_' + id + '_inner');
                innerShape.on('mouseenter', me.highlightShape, me, shape, true);
                innerShape.on('mouseleave', me.deHighlightShape, me, shape, true);
                innerShape.on('mousedown', me.listenForShapeLink, me, {
                    stopEvent : true,
                    elem: innerShape,
                    fn: fn
                });
                innerShape.setStyle({
                    position: 'relative'
                });

                var tip = Ext.create('Ext.tip.ToolTip', {
                    target: me.id + '_' + id + '_inner',
                    cls: 'annotationTip',
                    width: me.annotTipWidth,
                    maxWidth: me.annotTipMaxWidth,
                    height: me.annotTipHeight,
                    maxHeight: me.annotTipMaxHeight,
                    dismissDelay: 0,
                    anchor: 'left',
                    html: getLangString('Annotation_plus_Title', name)
                });

                tip.on('afterrender', function() {
                    window.doAJAXRequest('data/xql/getAnnotation.xql',
                        'GET', 
                        {
                            uri: uri,
                            target: 'tip',
                            lang: getPreference('application_language'),
                            edition: EdiromOnline.getApplication().activeEdition
                        },
                        Ext.bind(function(response){
                            this.update(response.responseText);
                        }, this)
                    );
                }, tip);
            });
        });

        me.repositionShapes();
    },

    listenForShapeLink: function(e, dom, args) {
    
        var me = this;

        if(e.button != 0) return;

        args.elem.on('mouseup', me.openShapeLink, me, {
            single: true,
            stopEvent : true,
            fn: args.fn
        });
    },

    openShapeLink: function(e, dom, args) {
    	
        eval(args.fn);
    },

    addMeasures: function(shapes) {
   
        var me = this;

        me.shapes.add('measures', shapes);

        var shapeDiv = me.el.getById(me.id + '_facsContEvents');

        var dh = Ext.DomHelper;
        var tpl = dh.createTemplate({tag:'div', id: '{0}', cls: 'measure', html:'<span class="{2}" id="{0}_inner">{1}</span>'});
        tpl.compile();

        me.shapes.get('measures').each(function(shape) {

            var id = shape.get('id');
            var name = shape.get('name');
            var x = shape.get('ulx');
            var y = shape.get('uly');
            var width = shape.get('lrx') - shape.get('ulx');
            var height = shape.get('lry') - shape.get('uly');

            var measure = tpl.append(shapeDiv, [me.id + '_' + id, name, (name === ''?'measureInnerEmpty':'measureInner')], true);

            measure.setStyle({
                position: 'absolute'
            });
            var text = measure.getById(me.id + '_' + id + '_inner');
            text.on('mouseenter', me.highlightShape, me, measure, true);
            text.on('mouseleave', me.deHighlightShape, me, measure, true);
            text.setStyle({
                position: 'relative'
            });
        });

        me.repositionShapes();
    },

    highlightShape: function(event, owner, shape) {
    
        shape.addCls('highlighted');
        
        var annotId = shape.getAttribute('data-edirom-annot-id');
        Ext.select('div[data-edirom-annot-id=' + annotId + ']', this.el).addCls('combinedHighlight');
        Ext.select('span[data-edirom-annot-id=' + annotId + ']', this.el).addCls('combinedHighlight');
    },

    deHighlightShape: function(event, owner, shape) {
    
        shape.removeCls('highlighted');
        
        var annotId = shape.getAttribute('data-edirom-annot-id');
        Ext.select('div[data-edirom-annot-id=' + annotId + ']', this.el).removeCls('combinedHighlight');
        Ext.select('span[data-edirom-annot-id=' + annotId + ']', this.el).removeCls('combinedHighlight');
    },

    repositionShapes: function() {
    
        var me = this;

        if(me.shapesHidden) return;

        var shapeDiv = me.el.getById(me.id + '_facsContEvents');

        var shapeRects = new Ext.util.MixedCollection();

        me.shapes.eachKey(function(groupName) {

            var fn = function(shape) {

                var id, x, y, width, height;

                try {
                    id = shape.get('id');
                    x = shape.get('ulx');
                    y = shape.get('uly');
                    width = shape.get('lrx') - shape.get('ulx');
                    height = shape.get('lry') - shape.get('uly');
                }catch (e) {
                    id = shape.id;
                    x = shape.ulx;
                    y = shape.uly;
                    width = shape.lrx - shape.ulx;
                    height = shape.lry - shape.uly;
                }

                var shapeEl = shapeDiv.getById(me.id + '_' + id);
                shapeEl.setStyle({
                    top: Math.round((y * me.zoom) + me.offY) + "px",
                    left: Math.round((x * me.zoom) + me.offX) + "px",
                    width: Math.round(width * me.zoom) + "px",
                    height: Math.round(height * me.zoom) + "px"
                });

                var rectKey = x + "_" + y + "_" + width + "_" + height + "_" + Math.round(width * me.zoom) + "_" + Math.round(height * me.zoom);

                var innerShapeEl = shapeEl.getById(me.id + '_' + id + '_inner');

                if(innerShapeEl) {
                    if(shapeEl.hasCls("measure")) {

                        innerShapeEl.setStyle({
                            top: Math.round((shapeEl.getHeight() / 2.0) - (innerShapeEl.getHeight() / 2.0)) - 10 + "px",
                            left: Math.round((shapeEl.getWidth() / 2.0) - (innerShapeEl.getWidth() / 2.0)) + "px"
                        });

                    }else {

                        if(!shapeRects.containsKey(rectKey))
                            shapeRects.add(rectKey, []);

                        Ext.Array.include(shapeRects.get(rectKey), innerShapeEl);
                    }
                }
            };

            if(me.shapes.get(groupName).each)
                me.shapes.get(groupName).each(fn);
            else
                Ext.Array.each(me.shapes.get(groupName), fn);
        });

        var re = /(\d+)_(\d+)_(\d+)_(\d+)_(\d+)_(\d+)/;

        shapeRects.eachKey(function(rectKey) {
            var shapes = shapeRects.get(rectKey);

            var result = re.exec(rectKey);
            var shapeWidth = result[5];
            var shapeHeight = result[6];

            //TODO: Taktzahlen an Ausschnitt ausrichten
            if(shapes.length == 1) {
                shapes[0].setStyle({
                    top: Math.round((shapeHeight / 2.0) - (shapes[0].getHeight() / 2.0)) + "px",
                    left: Math.round((shapeWidth / 2.0) - (shapes[0].getWidth() / 2.0)) + "px"
                });
            }else{
                //TODO: Anmerkungsicons verteilen
                var num = shapes.length;
                var cols = Math.ceil(Math.sqrt(num));
                var rows = Math.ceil(num / cols);

                for(var i = 0; i < cols; i++) {
                    for(var j = 0; j < rows; j++) {

                        var index = (i * rows) + j;

                        if(index >= num) continue;

                        shapes[index].setStyle({
                            top: Math.round((shapeHeight / 2.0) - (shapes[index].getHeight() / 2.0) - ((rows - 1)* 10) + (j * 20)) + "px",
                            left: Math.round((shapeWidth / 2.0) - (shapes[index].getWidth() / 2.0) - ((cols - 1) * 12) + (i * 24)) + "px"
                        });
                    }
                }
            }
        });
    },

    getShapes: function(groupName) {
    
        var me = this;
        return me.shapes.get(groupName);
    },

    getShapeElem: function(shapeId) {
   
        var me = this;
        var shapeDiv = me.el.getById(me.id + '_facsContEvents');
        return shapeDiv.getById(me.id + '_' + shapeId);
    },

    removeShapes: function(groupName) {
        var me = this;
        var shapeDiv = me.el.getById(me.id + '_facsContEvents');

        if(!me.shapes.containsKey(groupName)) return;

        var fn = function(shape) {

            var id;

            try {
                id = shape.get('id');
            }catch(e) {
                id = shape.id;
            }
			//console.log(shapeDiv.getById(me.id + '_' + id));
            Ext.removeNode(shapeDiv.getById(me.id + '_' + id).dom);
        };

        if(me.shapes.get(groupName).each)
            me.shapes.get(groupName).each(fn);
        else
            Ext.Array.each(me.shapes.get(groupName), fn);

        me.shapes.add(groupName, []);
        
        Ext.Array.each(me.annotSVGOverlays, function(svg) {
            this.removeSVGOverlay(svg);
        }, me);
        me.annotSVGOverlays = [];
    },

    hideShapes: function() {
    
        var me = this;
        if(!me.shapesHidden) {
            me.shapesHidden = true;
            var shapeDiv = me.el.getById(me.id + '_facsContEvents');
            shapeDiv.addCls('hiddenShapes');
        }
    },

    showShapes: function() {
    
        var me = this;
        if(me.shapesHidden) {
            me.shapesHidden = false;
            var shapeDiv = me.el.getById(me.id + '_facsContEvents');
            shapeDiv.removeCls('hiddenShapes');
            me.repositionShapes();
        }
    },

    addSVGOverlay: function(overlayId, overlay, name, uri, fn) {
    
        var me = this;
        var sibling = me.el.getById(me.id + '_facsContEvents');

        var dh = Ext.DomHelper;
        var id = Ext.id({});
        var svg = dh.append(sibling, {
            id: me.id + '_' + id,
            tag: 'div',
            cls: 'overlay',
            html: overlay
        }, true);

        svg.child('svg', true).setAttribute("width", me.imgWidth * me.zoom);
        svg.child('svg', true).setAttribute("height", me.imgHeight * me.zoom);
        svg.child('svg', true).setAttribute("style", "top:" +  me.offY + "px; left:" +  me.offX + "px; position: absolute;");

        if(typeof uri != 'undefined' || typeof fn != 'undefined') {
            var children = svg.child('svg', true).children;
            for(var i = 0; i < children.length; i++) {
                var elem = children[i];
                elem.setAttribute("id", me.id + '_' + Ext.id({}));
                
                if(typeof fn != 'undefined')
                    elem.setAttribute('onmousedown', fn);
                
                if(typeof uri != 'undefined') {
                    var tip = Ext.create('Ext.tip.ToolTip', {
                        target: elem.id,
                        cls: 'annotationTip',
                        width: me.annotTipWidth,
                        maxWidth: me.annotTipMaxWidth,
                        height: me.annotTipHeight,
                        maxHeight: me.annotTipMaxHeight,
                        dismissDelay: 0,
                        anchor: 'left',
                        html: getLangString('Annotation_plus_Title', name)
                    });
                    tip.on('afterrender', function() {
                        window.doAJAXRequest('data/xql/getAnnotation.xql', 'GET', {
                            uri: uri,
                            target: 'tip',
                            edition: EdiromOnline.getApplication().activeEdition
                        }, Ext.bind(function(response) {
                            this.update(response.responseText);
                        }, this));
                    }, tip);
                }
            }
        }

        me.svgOverlays.add(overlayId, svg);
    },

    removeSVGOverlay: function(overlayId) {
    
        var me = this;
        me.svgOverlays.get(overlayId).destroy();
        me.svgOverlays.removeAtKey(overlayId);
    },

    onMouseDown: function(e) {
   
        var me = this;

        me.hiResImg.hide();
        me.hideShapes();

        me.mouseOffX = me.offX;
        me.mouseOffY = me.offY;

        me.posX = e.getPageX();
        me.posY = e.getPageY();

        Ext.getDoc().on('mousemove', me.onMouseMove, me);
        Ext.getDoc().on('mouseup', me.onMouseUp, me);
    },

    onMouseMove: function(e) {
    
        var me = this;

        var offX = me.mouseOffX - (me.posX - e.getPageX());
        var offY = me.mouseOffY - (me.posY - e.getPageY());

        me.setSVGOffset(offX, offY);
    },

    onMouseUp: function(e) {
   
        var me = this;

        Ext.getDoc().un('mousemove', me.onMouseMove, me);
        Ext.getDoc().un('mouseup', me.onMouseUp, me);

        var offX = me.mouseOffX - (me.posX - e.getPageX());
        var offY = me.mouseOffY - (me.posY - e.getPageY());

        me.setSVGOffset(offX, offY);

        me.calculateHiResImg();
        me.showShapes();
    },

    onScroll: function(e) {
    
        var me = this, delta;

        me.hiResImg.hide();
        me.hideShapes();

        delta = e.getWheelDelta();

        var factor = 5;
        if(me.zoom < 0.5) factor = 6;

        var newZoom = me.zoom + (delta * factor / 100);

        newZoom = Math.min(newZoom, me.maxZoom);
        newZoom = Math.max(newZoom, me.minZoom);

        var mousePosX = e.getPageX() - me.el.getX();
        var mousePosY = e.getPageY() - me.el.getY();

        var centerX = Math.round((mousePosX - me.offX) / me.zoom); //
        var centerY = Math.round((mousePosY - me.offY) / me.zoom); //

        me.setSVGOffset(mousePosX - Math.round(centerX * newZoom), mousePosY - Math.round(centerY * newZoom));

        me.setSVGZoom(newZoom);

        e.stopEvent();

        me.lastZoom = (new Date()).getTime();
        Ext.defer(me.hiResAfterScroll, 300, me, [me.lastZoom]);
    },

    hiResAfterScroll: function(zoomTime) {
    
        var me = this;

        if(me.lastZoom == zoomTime) {
            me.calculateHiResImg();
            me.showShapes();
        }
    },

    fitInImage: function() {
    
        var me = this;

        me.showRect(0, 0, me.imgWidth, me.imgHeight);
    },

    showRect: function(x, y, width, height, highlight) {
    
        var me = this;

        me.hiResImg.hide();

        var contWidth = me.getWidth();
        var contHeight = me.getHeight();

        var offX;
        var offY;

        var diffWidth = 0;
        var diffHeight = 0;

        if((contWidth / width) > (contHeight / height)) {
            me.setSVGZoom((contHeight / height));
            diffWidth = Math.round((contWidth - (width * me.zoom)) / 2);
        }else {
            me.setSVGZoom((contWidth / width));
            diffHeight = Math.round((contHeight - (height * me.zoom)) / 2);
        }

        offY = y * me.zoom;
        offX = x * me.zoom;

        me.setSVGOffset(((offX * - 1) + diffWidth), ((offY * - 1) + diffHeight));

        if(highlight)
            Ext.defer(me.createTempRect, 1000, me, [x, y, width, height], false);

        me.calculateHiResImg();
        
        Ext.defer(me.calculateHiResImg, 500, me);
    },
    
    getActualRect: function() {
    
        var me = this;
        return {
            x: Math.max(Math.round(- me.offX / me.zoom), 0),
            y: Math.max(Math.round(- me.offY / me.zoom), 0),
            width: Math.min(Math.round(me.getWidth() / me.zoom), me.imgWidth),
            height: Math.min(Math.round(me.getHeight() / me.zoom), me.imgHeight)
        };
    },

    createTempRect: function(x, y, width, height) {
    
        var me = this;

        if(!me.shapes.containsKey('temp'))
            me.shapes.add('temp', []);

        var shapeDiv = me.el.getById(me.id + '_facsContEvents');

        var dh = Ext.DomHelper;
        var id = Ext.id({});
        var zone = dh.append(shapeDiv, {
            id: me.id + '_' + id,
            tag: 'div',
            cls: 'measure'
        }, true);

        zone.setStyle({
            position: 'absolute'
        });

        var shape = {
            id: id,
            ulx: x,
            uly: y,
            lrx: x + width,
            lry: y + height
        };

        me.shapes.get('temp').push(shape);

        me.highlightShape(null, null, zone);

        Ext.defer(me.destroyTempRect, 3000, me, [shape], false);

        me.repositionShapes();
    },

    destroyTempRect: function(shape) {
    
        var me = this;
        
        if(typeof me.el == 'undefined') return;
        
        var shapeDiv = me.el.getById(me.id + '_facsContEvents');
        var id;

        try {
            id = shape.get('id');
        }catch(e) {
            id = shape.id;
        }

        if(shapeDiv.getById(me.id + '_' + id) != null) 
            Ext.removeNode(shapeDiv.getById(me.id + '_' + id).dom);
            
        Ext.Array.remove(me.shapes.get('temp'), shape);
    },

    setZoomAndCenter: function(z) {
    
        var me = this;

        me.hiResImg.hide();

        var centerX = Math.round(((me.getWidth() / 2.0) - me.offX) / me.zoom);
        var centerY = Math.round(((me.getHeight() / 2.0) - me.offY) / me.zoom);

        me.setSVGZoom(z);

        me.setSVGOffset(Math.round((me.getWidth() / 2.0) - (centerX * me.zoom)),
                        Math.round((me.getHeight() / 2.0) - (centerY * me.zoom)));

        me.lastZoom = (new Date()).getTime();
        Ext.defer(me.hiResAfterScroll, 300, me, [me.lastZoom]);
    },

    setSVGZoom: function(z) {
    
        var me = this;

        me.zoom = z;
        me.svgEl.setAttribute("width", me.imgWidth * z);
        me.svgEl.setAttribute("height", me.imgHeight * z);

        me.svgOverlays.each(function(svg) {
            svg.child('svg', true).setAttribute("width", me.imgWidth * z);
            svg.child('svg', true).setAttribute("height", me.imgHeight * z);
        });

        me.repositionShapes();
        me.fireEvent('zoomChanged', me.zoom);
    },

    setSVGOffset: function(x, y) {
    
        var me = this;

        me.offX = x;
        me.offY = y;

        me.svgEl.setAttribute("style", "top:" +  y + "px; left:" +  x + "px; position: absolute;");

        me.svgOverlays.each(function(svg) {
            svg.child('svg', true).setAttribute("style", "top:" +  y + "px; left:" +  x + "px; position: absolute;");
        });

        me.repositionShapes();
    },

    calculateHiResImg: function() {
    
        var me = this;

        if(me.zoom < me.baseImgZoom || typeof me.hiResImg == 'undefined') return;

        var imgX = (-me.offX / me.zoom);
        var imgY = (-me.offY / me.zoom);
        var imgWidth = (me.getWidth() / me.zoom);
        var imgHeight = (me.getHeight() / me.zoom);

        if(imgWidth > me.imgWidth - imgX) imgWidth = me.imgWidth - imgX;
        if(imgHeight > me.imgHeight - imgY) imgHeight = me.imgHeight - imgY;

        if(imgX < 0) {
            imgWidth = imgWidth + imgX;
            imgX = 0;
        }

        if(imgY < 0) {
            imgHeight = imgHeight + imgY;
            imgY = 0;
        }

        //Ext.log("imgX: " + imgX + ", imgY: " + imgY + ", imgWidth: " + imgWidth + ", imgHeight: " + imgHeight);

        if(imgWidth < 0 || imgHeight < 0) return;

        var dw = Math.round(imgWidth * me.zoom);
        var dh = Math.round(imgHeight * me.zoom);
        var wx = imgX / me.imgWidth;
        var wy = imgY / me.imgHeight;
        var ww = imgWidth / me.imgWidth;
        var wh = imgHeight / me.imgHeight;

        //Ext.log("dw: " + dw + ", dh: " + dh + ", wx: " + wx + ", wy: " + wy + ", ww: " + ww + ", wh: " + wh);

        me.imageLoader.addJob({
            img: me.hiResImg,
            path: me.imgPrefix + me.imgPath + '?dw=' + dw + '&amp;dh=' + dh + '&amp;wx=' + wx + '&amp;wy=' + wy + '&amp;ww=' + ww + '&amp;wh=' + wh + '&amp;mo=fit',
            width: dw / me.zoom,
            height: dh / me.zoom,
            x: imgX,
            y: imgY
        });
    }
});

Ext.define('EdiromOnline.view.window.image.ImageLoader', {

    queue: [],
    img: null,

    constructor: function(config) {
        var me = this;

        Ext.apply(me, config);
        me.img = new Image();
        
    },

    addJob: function(job) {
   
        var me = this;

        me.queue.push(job);

        me.img.onload = function() {
            me.runJob(me, job);
        };
        me.img.src = job.path;
    },

    runJob: function(me, job) {
    
        if(Ext.Array.indexOf(me.queue, job) != me.queue.length - 1) {
            return;
        }

        me.queue = [];

        job.img.attr({
            src: job.path,
            width: job.width,
            height: job.height,
            x: job.x,
            y: job.y
        });
        job.img.show();
    }
});
