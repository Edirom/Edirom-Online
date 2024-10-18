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

    extend: 'EdiromOnline.view.window.View',

    requires: [
    ],

    alias: 'widget.imageViewer',

    layout: 'fit',

    cls: 'imageViewer',

    initComponent: function () {

        var me = this;
        me.imagePrefix = getPreference('image_prefix');
        me.imageViewerURL = getPreference('edirom-image-viewer-url');

        me.addEvents('zoomChanged',
                    'imageChanged');

        window.loadComponent(me.imageViewerURL);

        me.html = `<edirom-openseadragon id="${me.id}-edirom-image-viewer" 
            preserveviewport='true'
            visibilityratio='1'
            minzoomLevel='1'
            maxzoomLevel='1'
            showNavigationcontrol='false'
            sequencemode='true'
            tileSources='[]'
        ></edirom-openseadragon>`;

        me.callParent();
    },

    clear: function() {

    },

    showImage: function(path, width, height, pageId) {
        var me = this;

        var iiifPath = path;
        if(!path.startsWith("http")) {
            iiifPath = me.imagePrefix + path.replace(new RegExp('\/', 'g'), '!');
        }

        var contEl = me.el.getById(me.id + '-edirom-image-viewer');
        contEl.set({'tileSources': JSON.stringify([ iiifPath ])});
    },

    fitInImage: function() {
    },

    setZoomAndCenter: function(z) {
    },

    getActualRect: function() {
    },

    showRect: function(x, y, width, height, highlight) {
    },

    addMeasures: function(shapes) {
    },

    addSVGOverlay: function(overlayId, overlay, name, uri, fn) {
    },

    removeSVGOverlay: function(overlayId) {
    },

    removeShapes: function(groupName) {
    },


    highlightShape: function(event, owner, shape) {
    },

    deHighlightShape: function(event, owner, shape) {
    },

    addAnnotations: function(annotations) {
    },

    getShapes: function(groupName) {
    },

    getShapeElem: function(shapeId) {
    },

    listenForShapeLink: function(e, dom, args) {
    },

    openShapeLink: function(e, dom, args) {
    },

    loadInternalId: function (id, type) {
    }
});