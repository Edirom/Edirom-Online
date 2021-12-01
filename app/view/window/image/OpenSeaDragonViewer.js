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
Ext.define('EdiromOnline.view.window.image.OpenSeaDragonViewer', {
    extend: 'Ext.panel.Panel',

    mixins: {
        observable: 'Ext.util.Observable'
    },

    layout: 'fit',
    
    border: 0,
    
    viewer: null,
    
    imageWidth: 0,
    imageHeight: 0,
    
    imagePrefix: null,
    
    shapes: null,
    
    annotTipWidth: 220,
    annotTipMaxWidth: 300,
    annotTipHeight: 140,
    annotTipMaxHeight: 200,

    initComponent: function () {

        var me = this;
        
        me.imagePrefix = getPreference('image_prefix');
        
        me.addEvents('zoomChanged',
                    'imageChanged');

        me.html = '<div id="' + me.id + '_openseadragon" style="background-color: black; top:0px; bottom: 0px; left: 0px; right: 0px; position:absolute;"></div>';

        me.shapes = new Ext.util.MixedCollection();

        me.callParent();
        
        me.on('afterrender', me.initSurface, me, {single: true});
    },

    initSurface: function() {
        var me = this;
        
        me.viewer = OpenSeadragon({
            id: me.id + '_openseadragon',
            showNavigator:  false,
            showNavigationControl: false,
            tileSources:   []
        });
        me.viewer.addHandler('zoom', function(event){ me.fireEvent('zoomChanged', event.zoom);});
        me.viewer.gestureSettingsMouse.clickToZoom = false;
    },
            
    clear: function() {
        var me = this;
        me.rect = null;
    },
    
    showImage: function(path, width, height, pageId) {
        var me = this;
        
        me.imageHeight = height;
        me.imageWidth = width;
        me.imgPath = path;
        
        var iiifPath = path;
        if(!path.startsWith("http")) {
            iiifPath = me.imagePrefix + path.replace(new RegExp('\/', 'g'), '!');
        }
        
        me.viewer.open({
            "@context": "http://iiif.io/api/image/2/context.json",
            "@id": iiifPath,
            "height": Number(height),
            "width": Number(width),
            "profile": [ "http://iiif.io/api/image/2/level2.json" ],
            "protocol": "http://iiif.io/api/image",
            "tiles": [{
                "scaleFactors": [ 1, 2, 4, 8, 16, 32 ],
                "width": 1024
            }]
        });
        me.viewer.addOnceHandler('tile-drawn', function() { 
            if(me.rect && me.rect != null) me.showRect(me.rect.x, me.rect.y, me.rect.width, me.rect.height, me.rect.highlight);
        });        
        me.fireEvent('imageChanged', me, path, pageId);
    },
        
    removeShapes: function() {
        
    },
    
    fitInImage: function() {
    
        var me = this;
        me.viewer.viewport.goHome();
    },
    
    setZoomAndCenter: function(z) {
    
        var me = this;
        me.viewer.viewport.zoomTo(z);
    },
    
    getActualRect: function() {
    
        var me = this;
        
        var viewportBounds = me.viewer.viewport.getBounds();
        var imageBounds = me.viewer.viewport.viewportToImageRectangle(viewportBounds.x, viewportBounds.y, viewportBounds.width, viewportBounds.height);
        var x = (imageBounds.x < 0?0:imageBounds.x);
        var y = (imageBounds.y < 0?0:imageBounds.y);
        var width = (imageBounds.width > me.imageWidth?me.imageWidth:imageBounds.width);
        var height = (imageBounds.height > me.imageHeight?me.imageHeight:imageBounds.height);
        
        return {
            x: x,
            y: y,
            width: width,
            height: height
        };
    },
    
    showRect: function(x, y, width, height, highlight) {
    
        var me = this;
        me.rect = {
            x:x,
            y:y,
            width:width,
            height:height,
            highlight:highlight
        };

        var rect = me.viewer.viewport.imageToViewportRectangle(x, y, width, height);
        me.viewer.viewport.fitBoundsWithConstraints(rect);
    },
    
    addMeasures: function(shapes) {
   
        var me = this;

        me.shapes.add('measures', shapes);

        me.shapes.get('measures').each(function(shape) {

            var id = shape.get('id');
            var name = shape.get('name');
            var x = shape.get('ulx');
            var y = shape.get('uly');
            var width = shape.get('lrx') - shape.get('ulx');
            var height = shape.get('lry') - shape.get('uly');

            var measure = document.createElement("div");
            measure.id = me.id + '_' + id;
            measure.className = "measure";
            measure.innerHTML = '<span class="' + (name === ''?'measureInnerEmpty':'measureInner') + '" id="' + me.id + '_' + id + '_inner">' + name + '</span>';
            
            var point = me.viewer.viewport.imageToViewportCoordinates(x, y);
            var rect = me.viewer.viewport.imageToViewportRectangle(x, y, width, height);
            
            me.viewer.addOverlay({
                element: measure,
                location: new OpenSeadragon.Rect(point.x, point.y, rect.width, rect.height)
            });

            var text = me.el.getById(me.id + '_' + id + '_inner');
            text.on('mouseenter', me.highlightShape, me, measure, true);
            text.on('mouseleave', me.deHighlightShape, me, measure, true);
            text.setStyle({
                position: 'relative'
            });
        });
    },
    
    removeShapes: function(groupName) {
   
        var me = this;
        if(!me.shapes.containsKey(groupName)) return;

        var fn = function(shape) {

            var id;

            try {
                id = shape.get('id');
            }catch(e) {
                id = shape.id;
            }

            me.viewer.removeOverlay(me.id + '_' + id);
        };

        if(me.shapes.get(groupName).each)
            me.shapes.get(groupName).each(fn);
        else
            Ext.Array.each(me.shapes.get(groupName), fn);

        me.shapes.add(groupName, []);
    },
    
    highlightShape: function(event, owner, shape) {
    
        var elem = Ext.get(shape);
        elem.addCls('highlighted');
        
        var annotId = elem.getAttribute('data-edirom-annot-id');
        Ext.select('div[data-edirom-annot-id=' + annotId + ']', this.el).addCls('combinedHighlight');
        Ext.select('span[data-edirom-annot-id=' + annotId + ']', this.el).addCls('combinedHighlight');
    },

    deHighlightShape: function(event, owner, shape) {
    
        var elem = Ext.get(shape);
        elem.removeCls('highlighted');
        
        var annotId = elem.getAttribute('data-edirom-annot-id');
        Ext.select('div[data-edirom-annot-id=' + annotId + ']', this.el).removeCls('combinedHighlight');
        Ext.select('span[data-edirom-annot-id=' + annotId + ']', this.el).removeCls('combinedHighlight');
    },
    
    addAnnotations: function(annotations) {
    	
        var me = this;

        me.shapes.add('annotations', []);

        annotations.each(function(annotation) {

            var name = annotation.get('title');
            var uri = annotation.get('uri');
            var categories = annotation.get('categories');
            var priority = annotation.get('priority');
            var fn = annotation.get('fn');          
            var plist = Ext.Array.toArray(annotation.get('plist'));
            
            Ext.Array.insert(me.shapes.get('annotations'), 0, plist);

            Ext.Array.each(plist, function(shape) {

                var id = shape.id;
                var x = shape.ulx;
                var y = shape.uly;
                var width = shape.lrx - shape.ulx;
                var height = shape.lry - shape.uly;
                
                var anno = document.createElement("div");
                anno.id = me.id + '_' + id;
                anno.className = "annotation " + categories + ' ' + priority;
                
                var annoIcon = document.createElement("div");
                annoIcon.id = anno.id + '_inner';
                annoIcon.className = "annotIcon";
                anno.append(annoIcon);
                
                var point = me.viewer.viewport.imageToViewportCoordinates(x, y);
                var rect = me.viewer.viewport.imageToViewportRectangle(x, y, width, height);
                
                me.viewer.addOverlay({
                    element: anno,
                    location: new OpenSeadragon.Rect(point.x, point.y, rect.width, rect.height)
                });

                /*var anno = me.el.getById(me.id + '_' + id);

                anno.on('click', me.openShapeLink, me, {
                    single: true,
                    stopEvent : true,
                    fn: fn
                });*/

                var tip = Ext.create('Ext.tip.ToolTip', {
                    target: me.id + '_' + id,
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
                            edition: EdiromOnline.getApplication().activeEdition
                        },
                        Ext.bind(function(response){
                            this.update(response.responseText);
                        }, this)
                    );
                }, tip);
            });
        });
    },
    
    getShapes: function(groupName) {
    
        var me = this;
        var shapes = me.shapes.get(groupName);
        return (shapes == null || typeof shapes === 'undefined'?[]:shapes);
    },
    
    getShapeElem: function(shapeId) {
   
        var me = this;
        return me.el.getById(me.id + '_' + shapeId);
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
    }
});