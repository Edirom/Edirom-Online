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
 *
 */
Ext.define("EdiromOnline.view.window.text.FacsimileView", {
    extend: "EdiromOnline.view.window.View",

    requires: [
        "EdiromOnline.view.window.image.ImageViewer",
        "EdiromOnline.view.window.image.OpenSeaDragonViewer"
    ],

    alias: "widget.facsimileView",

    layout: "border",

    border: 0,

    imageSet: null,
    imageToShow: null,

    measuresVisible: false,
    annotationsVisible: false,

    image_server: null,

    cls: "facsimileView",

    initComponent: function () {
        var me = this;

        me.addEvents();

        var image_server = getPreference("image_server");

        if (image_server === "openseadragon") {
            me.imageViewer = Ext.create(
                "EdiromOnline.view.window.image.OpenSeaDragonViewer"
            );
        } else {
            /*TODO: test agains 'digilib'? -> what should be the fallback? */
            me.imageViewer = Ext.create(
                "EdiromOnline.view.window.image.ImageViewer"
            );
        }

        me.imageViewer.region = "center";

        me.bottomBar = new EdiromOnline.view.window.BottomBar({
            owner: me,
            region: "south",
            enableOverflow: false
        });

        me.items = [me.imageViewer, me.bottomBar];

        me.callParent();

        me.on("afterrender", me.createMenuEntries, me, { single: true });
        me.on("afterrender", me.createToolbarEntries, me, { single: true });
        me.imageViewer.on("zoomChanged", me.updateZoom, me);

        me.window.on("loadInternalLink", me.loadInternalId, me);
    },

    getWeightForInternalLink: function (uri, type, id) {
        var me = this;

        if (me.uri != uri) return 0;

        if (type == "graphic" || type == "surface" || type == "zone") return 70;

        return 0;
    },

    loadInternalId: function () {
        var me = this;

        if (
            me.window.internalIdType == "surface" ||
            me.window.internalIdType == "graphic"
        ) {
            me.window.requestForActiveView(me);
            me.showPage(me.window.internalId);
        }
    },

    setImageSet: function (imageSet) {
        var me = this;
        me.imageSet = imageSet;

        me.pageSpinner.setStore(me.imageSet);

        if (me.imageToShow != null) {
            me.pageSpinner.setPage(me.imageSet.getById(me.imageToShow));
            me.imageToShow = null;
        } else if (me.imageSet.getCount() > 0)
            me.pageSpinner.setPage(me.imageSet.getAt(0));

        me.fireEvent("afterImagesLoaded", me, imageSet);
    },

    setPage: function (combo, store) {
        var me = this;

        // Remove old stuff
        me.imageViewer.clear();

        var id = combo.getValue();
        var imgIndex = me.imageSet.findExact("id", id);
        me.activePage = me.imageSet.getAt(imgIndex);

        me.imageViewer.showImage(
            me.activePage.get("path"),
            me.activePage.get("width"),
            me.activePage.get("height")
        );
    },

    showPage: function (pageId) {
        var me = this;

        if (me.imageSet == null) {
            me.imageToShow = pageId;
            return;
        }

        me.pageSpinner.setPage(me.imageSet.getById(pageId));
    },

    getActivePage: function () {
        return this.activePage;
    },

    createMenuEntries: function () {
        var me = this;

        var image_server = getPreference("image_server");

        if (image_server === "digilib") {
            me.zoomSlider = Ext.create("Ext.slider.Single", {
                width: 140,
                value: 100,
                increment: 5,
                minValue: 10,
                maxValue: 400,
                checkChangeBuffer: 100,
                useTips: true,
                cls: "zoomSlider",
                tipText: function (thumb) {
                    return Ext.String.format("{0}%", thumb.value);
                },
                listeners: {
                    change: Ext.bind(me.zoomChanged, me, [], 0),
                }
            });
        }
        if (image_server === "openseadragon") {
            me.zoomSlider = Ext.create("Ext.slider.Single", {
                width: 140,
                value: 100,
                increment: 5,
                minValue: 90,
                maxValue: 700,
                checkChangeBuffer: 100,
                useTips: true,
                cls: "zoomSlider",
                tipText: function (thumb) {
                    return Ext.String.format("{0}%", thumb.value);
                },
                listeners: {
                    change: Ext.bind(me.zoomChanged, me, [], 0),
                }
            });
        }

        /*TODO
            pageSppinner
            separator
        */

        if (image_server === "digilib" || image_server === "openseadragon") {
            return [me.zoomSlider, me.separator, me.pageSpinner];
        } else {
            return [me.pageSpinner];
        }

        me.viewMenu = Ext.create("Ext.button.Button", {
            text: getLangString("view.window.source.SourceView_viewMenu"),
            indent: false,
            cls: "menuButton",
            menu: {
                items: [
                    {
                        id: me.id + "_fitFacsimile",
                        text: getLangString(
                            "view.window.source.SourceView_fitView"
                        ),
                        handler: Ext.bind(me.fitFacsimile, me, [], 0)
                    }
                ]
            }
        });
        me.window.getTopbar().addViewSpecificItem(me.viewMenu, me.id);
    },

    createToolbarEntries: function () {
        var me = this;

        var image_server = getPreference("image_server");

        if (image_server === "digilib") {
            me.zoomSlider = Ext.create("Ext.slider.Single", {
                width: 140,
                value: 100,
                increment: 5,
                minValue: 10,
                maxValue: 400,
                checkChangeBuffer: 100,
                useTips: true,
                cls: "zoomSlider",
                tipText: function (thumb) {
                    return Ext.String.format("{0}%", thumb.value);
                },
                listeners: {
                    change: Ext.bind(me.zoomChanged, me, [], 0),
                }
            });
        }
        if (image_server === "openseadragon") {
            me.zoomSlider = Ext.create("Ext.slider.Single", {
                width: 140,
                value: 100,
                increment: 5,
                minValue: 90,
                maxValue: 700,
                checkChangeBuffer: 100,
                useTips: true,
                cls: "zoomSlider",
                tipText: function (thumb) {
                    return Ext.String.format("{0}%", thumb.value);
                },
                listeners: {
                    change: Ext.bind(me.zoomChanged, me, [], 0),
                }
            });
        }

        me.pageSpinner = Ext.create(
            "EdiromOnline.view.window.util.PageSpinner",
            {
                width: 121,
                cls: "pageSpinner",
                owner: me,
            }
        );

        me.separator = Ext.create("Ext.toolbar.Separator");

        var entries = [];

        if (image_server === "digilib" || image_server === "openseadragon") {
            entries = [me.zoomSlider, me.separator, me.pageSpinner];
        } else {
            entries = [me.pageSpinner];
        }

        Ext.Array.each(entries, function (entry) {
            if (
                image_server === "digilib" ||
                image_server === "openseadragon"
            ) {
                me.bottomBar.add(entry);
            } else if (
                entry.initialCls !== "zoomSlider" &&
                entry.xtype !== "tbseparator"
            ) {
                me.bottomBar.add(entry);
            }
        });
    },

    hideToolbarEntries: function () {
        var me = this;
        if (typeof me.zoomSlider !== "undefined") {
            me.zoomSlider.hide();
        }
        me.pageSpinner.hide();
        if (typeof me.separator !== "undefined") {
            me.separator.hide();
        }
    },

    showToolbarEntries: function () {
        var me = this;
        if (typeof me.zoomSlider !== "undefined") {
            me.zoomSlider.show();
        }
        me.pageSpinner.show();
        if (typeof me.separator !== "undefined") {
            me.separator.show();
        }
    },

    fitFacsimile: function () {
        this.imageViewer.fitInImage();
    },

    updateZoom: function (zoom) {
        if (typeof this.zoomSlider !== "undefined") {
            this.zoomSlider.suspendEvents();
            this.zoomSlider.setValue(Math.round(zoom * 100));
            this.zoomSlider.resumeEvents();
        }
    },

    zoomChanged: function (slider) {
        this.imageViewer.setZoomAndCenter(slider.getValue() / 100);
    },

    setChapters: function (chapters) {
        var me = this;

        if (chapters.getTotalCount() == 0) return;

        me.gotoMenu = Ext.create("Ext.button.Button", {
            text: getLangString("view.window.text.TextView_gotoMenu"),
            indent: false,
            cls: "menuButton",
            menu: {
                items: []
            }
        });
        me.window.getTopbar().addViewSpecificItem(me.gotoMenu, me.id);

        me.chapters = chapters;

        var chapterItems = [];
        chapters.each(function (chapter) {
            chapterItems.push({
                text: chapter.get("name"),
                handler: Ext.bind(
                    me.gotoChapter,
                    me,
                    chapter.get("pageId"),
                    true
                )
            });
        });

        me.gotoMenu.menu.add(chapterItems);
        me.gotoMenu.show();
    },

    gotoChapter: function (menuItem, event, pageId) {
        this.fireEvent("gotoChapter", this, pageId);
    },

    gotoPage: function (pageId) {
        var me = this;
        me.pageSpinner.setPage(me.imageSet.getById(pageId));
    }
});
