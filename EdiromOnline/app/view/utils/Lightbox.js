/**
 *  Edirom Online
 *  Copyright (C) 2011 The Edirom Project
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
 *
 *  ID: $Id$
 */

Ext.define('de.edirom.online.view.utils.Lightbox', {

    els: {},
    selectors: [],

    overlayOpacity: 0.65,
    resizeSpeed: 8,
    borderSize: 10,
    labelImage: "Image",
    labelOf: "of",
    ids: ['overlay', 'outerImageContainer', 'imageContainer', 'image', 'loading', 'loadingLink',
        'outerDataContainer', 'dataContainer', 'data', 'details', 'caption', 'bottomNav', 'navClose'],

    init: function(imgElem) {
        this.resizeDuration = (11 - this.resizeSpeed) * 0.15;
        this.overlayDuration = 0.2;

        this.img = imgElem;

        if(Ext.get('ux-lightbox-outerImageContainer') === null)
            this.initMarkup();

        Ext.each(this.ids, function(id){
            this.els[id] = Ext.get('ux-lightbox-' + id);
        }, this);

        this.els.lightbox = Ext.get('ux-lightbox');

        this.initEvents();

        this.setViewSize();
        this.els.overlay.show();

        this.els.lightbox.setStyle({
            top: (Ext.Element.getViewportHeight() / 10) + 'px',
            left: '0px'
        }).show();

        this.setImage(imgElem);
    },

    initMarkup: function() {
        var overlay = Ext.core.DomHelper.append(document.body, {
            id: 'ux-lightbox-overlay',
            style: 'opacity:'+this.overlayOpacity+';filter:alpha(opacity='+(this.overlayOpacity*100)+')'
        }, true);

        var lightboxTpl = new Ext.Template(this.getTemplate());
        lightboxTpl.append(document.body, {}, true);

        Ext.get('ux-lightbox-overlay').setVisibilityMode(Ext.Element.DISPLAY);
        Ext.get('ux-lightbox').setVisibilityMode(Ext.Element.DISPLAY);
        Ext.get('ux-lightbox-image').setVisibilityMode(Ext.Element.DISPLAY);

        Ext.get('ux-lightbox-outerImageContainer').setStyle({
            width: '250px',
            height: '250px'
        });
    },

    getTemplate : function() {
        return [
            '<div id="ux-lightbox">',
            '<div id="ux-lightbox-outerImageContainer">',
            '<div id="ux-lightbox-imageContainer">',
            '<img id="ux-lightbox-image">',
            '<div id="ux-lightbox-loading">',
            '<a id="ux-lightbox-loadingLink"></a>',
            '</div>',
            '</div>',
            '</div>',
            '<div id="ux-lightbox-outerDataContainer">',
            '<div id="ux-lightbox-dataContainer">',
            '<div id="ux-lightbox-data">',
            '<div id="ux-lightbox-details">',
            '<span id="ux-lightbox-caption"></span>',
            '</div>',
            '<div id="ux-lightbox-bottomNav">',
            '<a href="#" id="ux-lightbox-navClose"></a>',
            '</div>',
            '</div>',
            '</div>',
            '</div>',
            '</div>'
        ];
    },

    initEvents: function() {
        var me = this;

        var close = function(ev) {
            ev.preventDefault();
            me.close();
        };

        me.els.overlay.on('click', close, me);
        me.els.loadingLink.on('click', close, this);
        me.els.navClose.on('click', close, this);

        me.els.lightbox.on('click', function(ev) {
            if(ev.getTarget().id == 'ux-lightbox') {
                this.close();
            }
        }, this);
    },

    setViewSize: function(){
        var viewSize = this.getViewSize();
        this.els.overlay.setStyle({
            width: viewSize[0] + 'px',
            height: viewSize[1] + 'px'
        });
    },

    setImage: function(){
        var me = this;

        me.els.loading.show();

        me.els.image.hide();
        me.els.dataContainer.setOpacity(0.0001);

        var href = me.img.src + "";
        href = href.replace(/dw=[0-9]+/, 'dw=600');

        var preload = new Image();
        preload.onload = Ext.bind(function(){
            me.els.image.dom.src = href;
            this.resizeImage(preload.width, preload.height);
        }, me);
        preload.src = href;
    },

    resizeImage: function(w, h){
        var me = this;

        var wCur = me.els.outerImageContainer.getWidth();
        var hCur = me.els.outerImageContainer.getHeight();

        var wNew = (w + this.borderSize * 2);
        var hNew = (h + this.borderSize * 2);

        var wDiff = wCur - wNew;
        var hDiff = hCur - hNew;

        var afterResize = function(){

            me.els.outerDataContainer.setWidth(wNew + 'px');

            me.showImage();
        };

        if (hDiff != 0 || wDiff != 0) {
            me.els.outerImageContainer.shift({
                height: hNew,
                width: wNew,
                duration: this.resizeDuration,
                scope: this,
                callback: afterResize,
                delay: 50
            });
        }
        else {
            afterResize.call(me);
        }
    },

    showImage: function(){
        var me = this;
        me.els.loading.hide();
        me.els.image.show({
            duration: this.resizeDuration,
            easing: 'easeIn'
        });
        this.updateDetails();
    },

    updateDetails: function(){
        var me = this;
        var detailsWidth = me.els.data.getWidth(true) - me.els.navClose.getWidth() - 10;
        me.els.details.setWidth((detailsWidth > 0 ? detailsWidth : 0) + 'px');

        me.els.caption.update(me.img.title);

        me.els.caption.show();
        me.els.dataContainer.fadeIn({
            duration: this.resizeDuration/2,
            scope: this,
            callback: function() {
                var viewSize = this.getViewSize();
                me.els.overlay.setHeight(viewSize[1] + 'px');
            }
        });
    },

    close: function(){
        this.els.lightbox.hide();
        this.els.overlay.hide();
    },

    getViewSize: function() {
        return [Ext.Element.getViewWidth(), Ext.Element.getViewHeight()];
    }
});