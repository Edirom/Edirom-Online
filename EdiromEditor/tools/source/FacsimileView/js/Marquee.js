

de.edirom.server.source.Marquee = Class.create({

    // the coords of the marquee (100%)
    marqueeTop: 0,
    marqueeLeft: 0,
    marqueeWidth: 0,
    marqueeHeight: 0,

    initialize: function(facsimileContent, bar) {

        this.facsimileContent = facsimileContent;
        this.bar = bar;
    },

    init: function() {
        this.marquee = new Marquee($('imageContainer'), this.facsimileContent);
        this.updateMarqueePosition();

        this.marquee.getMarquee().parentNode.setStyle({
            zIndex: 101
        });

        if(this.bar.getLeft() > -1 && this.bar.getTop() > -1 && this.bar.getWidth() > 0 && this.bar.getHeight() > 0) {

            this.marqueeTop = this.bar.getTop();
            this.marqueeLeft = this.bar.getLeft();
            this.marqueeWidth = this.bar.getWidth();
            this.marqueeHeight = this.bar.getHeight();

            this.marquee.setCoords(Math.round(this.marqueeLeft * this.facsimileContent.viewer.getZoom()),
                                Math.round(this.marqueeTop * this.facsimileContent.viewer.getZoom()),
                                Math.round(this.marqueeWidth * this.facsimileContent.viewer.getZoom()),
                                Math.round(this.marqueeHeight * this.facsimileContent.viewer.getZoom()));
        }
    },

    updateMarqueePosition: function() {

        this.marquee.getMarquee().parentNode.setStyle({
            top: this.facsimileContent.viewer.getOffY() + "px",
            left: this.facsimileContent.viewer.getOffX() + "px",
            zIndex: 101
        });

        this.marquee.getMarquee().parentNode.setStyle({
            width:Math.round(this.facsimileContent.viewer.getFacsimileWidth(0) * this.facsimileContent.viewer.getZoom()) + "px",
            height:Math.round(this.facsimileContent.viewer.getFacsimileHeight(0) * this.facsimileContent.viewer.getZoom()) + "px"
        });
    },

    recalculateMarqueeZoom: function() {

        this.marquee.setCoords(Math.round(this.marqueeLeft * this.facsimileContent.viewer.getZoom()),
                            Math.round(this.marqueeTop * this.facsimileContent.viewer.getZoom()),
                            Math.round(this.marqueeWidth * this.facsimileContent.viewer.getZoom()),
                            Math.round(this.marqueeHeight * this.facsimileContent.viewer.getZoom()));
    },

    setMarqueeCoords: function(x, y, w, h) {
        this.marqueeLeft = Math.round(x / this.facsimileContent.viewer.getZoom());
        this.marqueeTop = Math.round(y / this.facsimileContent.viewer.getZoom());
        this.marqueeWidth = Math.round(w / this.facsimileContent.viewer.getZoom());
        this.marqueeHeight = Math.round(h / this.facsimileContent.viewer.getZoom());

        this.facsimileContent.setBarPosAndSize(this.facsimileContent.facsimileMarkSidebarContent.activeBar.id,
                                            x, y, w, h);
    },

    resetMarquee: function(bar) {
    // resets a marquee to the last position of the bar

        this.marqueeTop = bar.getTop();
        this.marqueeLeft = bar.getLeft();
        this.marqueeWidth = bar.getWidth();
        this.marqueeHeight = bar.getHeight();

        this.marquee.setCoords(Math.round(this.marqueeLeft * this.facsimileContent.viewer.getZoom()),
                            Math.round(this.marqueeTop * this.facsimileContent.viewer.getZoom()),
                            Math.round(this.marqueeWidth * this.facsimileContent.viewer.getZoom()),
                            Math.round(this.marqueeHeight * this.facsimileContent.viewer.getZoom()));
    },

    destroy: function() {
        var marqueeNode = this.marquee.getMarquee().parentNode;
        marqueeNode.parentNode.removeChild(marqueeNode);
    },


    /* Some methods to tunnel through */

    getId: function() {
        return this.marquee.getId();    
    },

    initDragWithoutEvent: function(id, x, y) {
        this.marquee.initDragWithoutEvent(id, x, y);
    },

    moveLeft: function(amount, ctrlKey) {
        this.marquee.moveLeft(amount, ctrlKey);
    },

    moveTop: function(amount, ctrlKey) {
        this.marquee.moveTop(amount, ctrlKey);
    },

    moveBottom: function(amount, ctrlKey) {
        this.marquee.moveBottom(amount, ctrlKey);
    },

    moveRight: function(amount, ctrlKey) {
        this.marquee.moveRight(amount, ctrlKey);    
    }
});