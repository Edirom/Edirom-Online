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
        
        var iiifPath = path.replace(new RegExp('\/', 'g'), '!');//.replace(new RegExp('\.[a-z0-9]+$', 'g'), '');
        me.viewer.open({
            "@context": "http://iiif.io/api/image/2/context.json",
            "@id": me.imagePrefix + iiifPath,
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
        
        Ext.Function.defer(me.checkBachBand3, 1000, me, [path]);
    },
    
    checkBachBand3: function(path) {
        
        var me = this;
        
        switch(path) {
            case 'band3-work-02-source-0203-bwv542frueh-1.jp2': me.addBachBand3Annots(1); break;
            case 'band3-work-02-source-0203-bwv542frueh-2.jp2': me.addBachBand3Annots(2); break;
            case 'band3-work-02-source-0203-bwv542frueh-3.jp2': me.addBachBand3Annots(3); break;
            case 'band3-work-02-source-0203-bwv542frueh-4.jp2': me.addBachBand3Annots(4); break;
            case 'band3-work-02-source-0203-bwv542frueh-5.jp2': me.addBachBand3Annots(5); break;
            case 'band3-work-02-source-0203-bwv542frueh-6.jp2': me.addBachBand3Annots(6); break;
            case 'band3-work-02-source-0203-bwv542frueh-7.jp2': me.addBachBand3Annots(7); break;
            default: return;
        }
    },
    
    addBachBand3Annots: function(pageNr) {
        var me = this;
    
        console.log('addBachBand3Annots pageNr: ' + pageNr);
    
        if(pageNr === 1) {
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T009', 'x': 750, 'y': 1578, 'width': 198, 'height': 226, 'tipImagePath': 'band3-work-02-source-0204-T009.jp2', 'tipImageWidth': 559, 'tipImageHeight': 197});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T015', 'x': 2138, 'y': 2343, 'width': 222, 'height': 161, 'tipImagePath': 'band3-work-02-source-0204-T015.jp2', 'tipImageWidth': 512, 'tipImageHeight': 114});

        } else if(pageNr === 2) {    
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T017', 'x': 726, 'y': 213, 'width': 146, 'height': 203, 'tipImagePath': 'band3-work-02-source-0204-T017.jp2', 'tipImageWidth': 919, 'tipImageHeight': 193});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T022', 'x': 1364, 'y': 841, 'width': 193, 'height': 231, 'tipImagePath': 'band3-work-02-source-0204-T022.jp2', 'tipImageWidth': 536, 'tipImageHeight': 244});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T024-1', 'x': 3149, 'y': 1082, 'width': 411, 'height': 184, 'tipImagePath': 'band3-work-02-source-0204-T024-1.jp2', 'tipImageWidth': 1504, 'tipImageHeight': 351});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T024-2', 'x': 3149, 'y': 1280, 'width': 421, 'height': 147, 'tipImagePath': 'band3-work-02-source-0204-T024-2.jp2', 'tipImageWidth': 1421, 'tipImageHeight': 516});
            
        } else if(pageNr === 3) {    
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T033', 'x': 542, 'y': 340, 'width': 198, 'height': 147, 'tipImagePath': 'band3-work-02-source-0204-T033.jp2', 'tipImageWidth': 801, 'tipImageHeight': 192});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T036', 'x': 2800, 'y': 170, 'width': 765, 'height': 250, 'tipImagePath': 'band3-work-02-source-0204-T036.jp2', 'tipImageWidth': 1356, 'tipImageHeight': 476});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T037', 'x': 315, 'y': 794, 'width': 430, 'height': 255, 'tipImagePath': 'band3-work-02-source-0204-T037.jp2', 'tipImageWidth': 1126, 'tipImageHeight': 233});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T038', 'x': 1142, 'y': 831, 'width': 165, 'height': 222, 'tipImagePath': 'band3-work-02-source-0204-T038.jp2', 'tipImageWidth': 1156, 'tipImageHeight': 217});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T042', 'x': 1151, 'y': 1672, 'width': 373, 'height': 218, 'tipImagePath': 'band3-work-02-source-0204-T042.jp2', 'tipImageWidth': 1587, 'tipImageHeight': 375});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T043', 'x': 2342, 'y': 1431, 'width': 406, 'height': 298, 'tipImagePath': 'band3-work-02-source-0204-T043.jp2', 'tipImageWidth': 1132, 'tipImageHeight': 287});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T044', 'x': 3159, 'y': 1658, 'width': 222, 'height': 189, 'tipImagePath': 'band3-work-02-source-0204-T044.jp2', 'tipImageWidth': 849, 'tipImageHeight': 181});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T049', 'x': 910, 'y': 2376, 'width': 189, 'height': 180, 'tipImagePath': 'band3-work-02-source-0204-T049.jp2', 'tipImageWidth': 790, 'tipImageHeight': 370});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T050-1', 'x': 1761, 'y': 2371, 'width': 203, 'height': 373, 'tipImagePath': 'band3-work-02-source-0204-T050-1.jp2', 'tipImageWidth': 1185, 'tipImageHeight': 315});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T050-2', 'x': 1562, 'y': 2560, 'width': 194, 'height': 166, 'tipImagePath': 'band3-work-02-source-0204-T050-2.jp2', 'tipImageWidth': 671, 'tipImageHeight': 169});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T051', 'x': 2186, 'y': 2367, 'width': 193, 'height': 189, 'tipImagePath': 'band3-work-02-source-0204-T051.jp2', 'tipImageWidth': 908, 'tipImageHeight': 157});
            
        } else if(pageNr === 4) {    
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T055FF', 'x': 2540, 'y': 194, 'width': 1025, 'height': 217, 'tipImagePath': 'band3-work-02-source-0204-T055FF.jp2', 'tipImageWidth': 1894, 'tipImageHeight': 824});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T057', 'x': 339, 'y': 831, 'width': 496, 'height': 170, 'tipImagePath': 'band3-work-02-source-0204-T057.jp2', 'tipImageWidth': 1669, 'tipImageHeight': 399});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T058', 'x': 1288, 'y': 1044, 'width': 208, 'height': 151, 'tipImagePath': 'band3-work-02-source-0204-T058.jp2', 'tipImageWidth': 512, 'tipImageHeight': 162});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T059', 'x': 1954, 'y': 855, 'width': 156, 'height': 156, 'tipImagePath': 'band3-work-02-source-0204-T059.jp2', 'tipImageWidth': 795, 'tipImageHeight': 150});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T059F', 'x': 2417, 'y': 808, 'width': 1134, 'height': 387, 'tipImagePath': 'band3-work-02-source-0204-T059F.jp2', 'tipImageWidth': 1929, 'tipImageHeight': 1201});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T060', 'x': 3178, 'y': 1200, 'width': 198, 'height': 170, 'tipImagePath': 'band3-work-02-source-0204-T060.jp2', 'tipImageWidth': 536, 'tipImageHeight': 150});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T061-1', 'x': 315, 'y': 1460, 'width': 208, 'height': 368, 'tipImagePath': 'band3-work-02-source-0204-T061-1.jp2', 'tipImageWidth': 1144, 'tipImageHeight': 724});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T061-2', 'x': 735, 'y': 1842, 'width': 374, 'height': 151, 'tipImagePath': 'band3-work-02-source-0204-T061-2.jp2', 'tipImageWidth': 713, 'tipImageHeight': 138});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T063', 'x': 2554, 'y': 1653, 'width': 198, 'height': 166, 'tipImagePath': 'band3-work-02-source-0204-T063.jp2', 'tipImageWidth': 536, 'tipImageHeight': 150});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T064', 'x': 2984, 'y': 1460, 'width': 194, 'height': 184, 'tipImagePath': 'band3-work-02-source-0204-T064.jp2', 'tipImageWidth': 536, 'tipImageHeight': 162});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T065F', 'x': 934, 'y': 2069, 'width': 449, 'height': 449, 'tipImagePath': 'band3-work-02-source-0204-T065F.jp2', 'tipImageWidth': 1445, 'tipImageHeight': 469});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T068', 'x': 2781, 'y': 2083, 'width': 775, 'height': 241, 'tipImagePath': 'band3-work-02-source-0204-T068.jp2', 'tipImageWidth': 1646, 'tipImageHeight': 504});
            
        } else if(pageNr === 5) {    
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T069FF', 'x': 315, 'y': 156, 'width': 1606, 'height': 255, 'tipImagePath': 'band3-work-02-source-0204-T069FF.jp2', 'tipImageWidth': 2473, 'tipImageHeight': 528});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T071', 'x': 1964, 'y': 161, 'width': 368, 'height': 250, 'tipImagePath': 'band3-work-02-source-0204-T071.jp2', 'tipImageWidth': 1250, 'tipImageHeight': 476});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T075', 'x': 2507, 'y': 1247, 'width': 222, 'height': 222, 'tipImagePath': 'band3-work-02-source-0204-T075.jp2', 'tipImageWidth': 559, 'tipImageHeight': 210});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T080-1', 'x': 542, 'y': 2140, 'width': 241, 'height': 250, 'tipImagePath': 'band3-work-02-source-0204-T080-1.jp2', 'tipImageWidth': 1410, 'tipImageHeight': 257});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T080-2', 'x': 561, 'y': 2409, 'width': 160, 'height': 165, 'tipImagePath': 'band3-work-02-source-0204-T080-2.jp2', 'tipImageWidth': 559, 'tipImageHeight': 150});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T082', 'x': 1954, 'y': 2163, 'width': 421, 'height': 265, 'tipImagePath': 'band3-work-02-source-0204-T082.jp2', 'tipImageWidth': 760, 'tipImageHeight': 256});
            
        } else if(pageNr === 6) {    
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T085', 'x': 1553, 'y': 260, 'width': 193, 'height': 165, 'tipImagePath': 'band3-work-02-source-0204-T085.jp2', 'tipImageWidth': 707, 'tipImageHeight': 145});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T086-1', 'x': 1954, 'y': 250, 'width': 203, 'height': 175, 'tipImagePath': 'band3-work-02-source-0204-T086-1.jp2', 'tipImageWidth': 849, 'tipImageHeight': 133});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T086-2', 'x': 1954, 'y': 453, 'width': 340, 'height': 175, 'tipImagePath': 'band3-work-02-source-0204-T086-2.jp2', 'tipImageWidth': 1026, 'tipImageHeight': 145});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T086-3', 'x': 1968, 'y': 647, 'width': 364, 'height': 156, 'tipImagePath': 'band3-work-02-source-0204-T086-3.jp2', 'tipImageWidth': 725, 'tipImageHeight': 162});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T087-1', 'x': 2762, 'y': 184, 'width': 189, 'height': 246, 'tipImagePath': 'band3-work-02-source-0204-T087.jp2', 'tipImageWidth': 488, 'tipImageHeight': 221});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T087-2', 'x': 2776, 'y': 642, 'width': 548, 'height': 170, 'tipImagePath': 'band3-work-02-source-0204-T087-2.jp2', 'tipImageWidth': 866, 'tipImageHeight': 162});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T087F', 'x': 3135, 'y': 194, 'width': 449, 'height': 241, 'tipImagePath': 'band3-work-02-source-0204-T087F.jp2', 'tipImageWidth': 914, 'tipImageHeight': 209});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T088', 'x': 291, 'y': 907, 'width': 846, 'height': 217, 'tipImagePath': 'band3-work-02-source-0204-T088.jp2', 'tipImageWidth': 1327, 'tipImageHeight': 221});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T092', 'x': 717, 'y': 1771, 'width': 382, 'height': 251, 'tipImagePath': 'band3-work-02-source-0204-T092.jp2', 'tipImageWidth': 1026, 'tipImageHeight': 477});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T096', 'x': 334, 'y': 2522, 'width': 213, 'height': 180, 'tipImagePath': 'band3-work-02-source-0204-T096.jp2', 'tipImageWidth': 1073, 'tipImageHeight': 181});
            
        } else if(pageNr === 7) {    
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T100-1', 'x': 726, 'y': 472, 'width': 213, 'height': 166, 'tipImagePath': 'band3-work-02-source-0204-T100-1.jp2', 'tipImageWidth': 1055, 'tipImageHeight': 162});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T100-2', 'x': 939, 'y': 213, 'width': 193, 'height': 193, 'tipImagePath': 'band3-work-02-source-0204-T100-2.jp2', 'tipImageWidth': 1008, 'tipImageHeight': 315});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T103', 'x': 2762, 'y': 246, 'width': 208, 'height': 184, 'tipImagePath': 'band3-work-02-source-0204-T103.jp2', 'tipImageWidth': 825, 'tipImageHeight': 169});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T105', 'x': 1680, 'y': 978, 'width': 218, 'height': 208, 'tipImagePath': 'band3-work-02-source-0204-T105.jp2', 'tipImageWidth': 1067, 'tipImageHeight': 245});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T106', 'x': 1926, 'y': 987, 'width': 803, 'height': 213, 'tipImagePath': 'band3-work-02-source-0204-T106.jp2', 'tipImageWidth': 2330, 'tipImageHeight': 1319});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T110', 'x': 2034, 'y': 1507, 'width': 534, 'height': 264, 'tipImagePath': 'band3-work-02-source-0204-T110.jp2', 'tipImageWidth': 1652, 'tipImageHeight': 961});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T113F', 'x': 1737, 'y': 2329, 'width': 916, 'height': 179, 'tipImagePath': 'band3-work-02-source-0204-T113F.jp2', 'tipImageWidth': 1486, 'tipImageHeight': 145});
            me.addBachBand3Annot({'id': 'band3-work-02-source-0204-T114F', 'x': 2667, 'y': 2045, 'width': 959, 'height': 459, 'tipImagePath': 'band3-work-02-source-0204-T114F.jp2', 'tipImageWidth': 3059, 'tipImageHeight': 1396});
        }
    },
    addBachBand3Annot: function(shape) {
        var me = this;
        
        var id = shape.id;
        var anno = document.createElement("div");
        anno.id = me.id + '_' + id;
        anno.className = "annotation";
        var point = me.viewer.viewport.imageToViewportCoordinates(shape.x, shape.y);
        var rect = me.viewer.viewport.imageToViewportRectangle(shape.x, shape.y, shape.width, shape.height);
        me.viewer.addOverlay({
            element: anno,
            location: new OpenSeadragon.Rect(point.x, point.y, rect.width, rect.height)
        });
        
        var width = Math.round(shape.tipImageWidth / 3.0);
        var height = Math.round(shape.tipImageHeight / 3.0);
        if(width > 488) {
            width = 488;
            height = Math.round(shape.tipImageHeight * 488 / shape.tipImageWidth);
        }
        
        var tip = Ext.create('Ext.tip.ToolTip', {
            target: me.id + '_' + id,
            cls: 'annotationTip',
            width: width + 12,
            height: height + 12,
            dismissDelay: 0,
            anchor: 'bottom',
            html: '<img src="' + me.imagePrefix + shape.tipImagePath + '/full/' + width + ',/0/default.jpg" alt=""/>'
        });
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