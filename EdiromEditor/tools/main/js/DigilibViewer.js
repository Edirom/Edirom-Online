/**
 * @fileOverview digilibViewer
 *
 * @author: <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
 * @version 1.0
 */

de.edirom.server.main.DigilibViewer = Class.create({

    OVERLAP: 12,


    initialize: function(facsimileViewer, canvasId, width, height) {

        this.facsimileViewer = facsimileViewer;

        this.instance = Raphael(canvasId, width, height);
        this.svgDoc = $(canvasId).getElementsByTagNameNS("http://www.w3.org/2000/svg", "svg")[0];
        this.svgDoc.setAttribute("viewBox", "0 0 " + width + " " + height);

        this.images = new Array();
    },

    buildInitialStructure: function() {

        for(var k = this.facsimileViewer.getMaxKey(); k >= 0; k--) {

            this.images[k] = new Array();

            for(var col = 0; col < this.facsimileViewer.getNumCols(k); col++) {

                this.images[k][col] = new Array();

                for(var row = 0; row < this.facsimileViewer.getNumRows(k); row++) {

                    this.images[k][col][row] = this.instance.image("", col * this.facsimileViewer.TILE_SIZE * Math.pow(2.0, k), row * this.facsimileViewer.TILE_SIZE * Math.pow(2.0, k));
                }
            }
        }
    },

    loadImages: function() {

//        var sec = (new Date).getTime();

        var TILE_SIZE = this.facsimileViewer.TILE_SIZE;
        var k = this.facsimileViewer.getKey();

        var divWidth = this.facsimileViewer.getContainerWidth();
        var divHeight = this.facsimileViewer.getContainerHeight();

        var x = this.facsimileViewer.getOffX();
        var y = this.facsimileViewer.getOffY();

        var zoom = this.facsimileViewer.getZoom();

        var firstRow = 0;
        var firstCol = 0;

        if (x < 0)
            firstCol = Math.floor(Math.round((x * - 1.0) / zoom / Math.pow(2.0, k)) / TILE_SIZE);

        if (y < 0)
            firstRow = Math.floor(Math.round((y * - 1.0) / zoom / Math.pow(2.0, k)) / TILE_SIZE);

        var lastCol = Math.floor(((divWidth - x) / Math.pow(2.0, k)) / zoom / TILE_SIZE);
        var lastRow = Math.floor(((divHeight - y) / Math.pow(2.0, k)) / zoom / TILE_SIZE);

        if (firstCol < 0) firstCol = 0;
        if (firstRow < 0) firstRow = 0;

        if (lastCol > this.facsimileViewer.getNumCols(k) - 1) lastCol = this.facsimileViewer.getNumCols(k) - 1;
        if (lastRow > this.facsimileViewer.getNumRows(k) - 1) lastRow = this.facsimileViewer.getNumRows(k) - 1;

//        console.log('key: ' + k + '  #cols: ' + this.facsimileViewer.getNumCols(k) + '  #rows: ' + this.facsimileViewer.getNumRows(k));
//        console.log('firstCol: ' + firstCol + '  lastCol: ' + lastCol + '  firstRow: ' + firstRow + '  lastRow: ' + lastRow);

    	for (var col = firstCol; col <= lastCol; col++) {
    	    for (var row = firstRow; row <= lastRow; row++) {
//    	        console.log('loadImage(' + col + ',' + row + ',' + k + ')');
                this.loadImage(col, row, k);
            }
        }

//        console.log((((new Date).getTime() - sec) / 1000) + " sec. needed");
    },

    loadImage: function(col, row, k) {

        if (this.images[k][col][row].attrs.src != "about:blank") return;

        var TILE_SIZE = this.facsimileViewer.TILE_SIZE;

        var width = this.facsimileViewer.getFacsimileWidth(k);
        var height = this.facsimileViewer.getFacsimileHeight(k);

        var dw = TILE_SIZE;
        var dh = TILE_SIZE;

        var wx = col * (TILE_SIZE / width);
        var wy = row * (TILE_SIZE / height);

        if (col == this.facsimileViewer.getNumCols(k) - 1) {
            dw = width % TILE_SIZE;
            if (dw == 0) dw = TILE_SIZE;

            ww = dw / width;
        }else if(col == this.facsimileViewer.getNumCols(k) - 2) {
            var lastWidth = width % TILE_SIZE;
            lastWidth = (lastWidth == 0?TILE_SIZE:lastWidth);

            dw += Math.min(lastWidth, this.OVERLAP);

        }else {
            dw += this.OVERLAP;
        }


        if (row == this.facsimileViewer.getNumRows(k) - 1) {
            dh = height % TILE_SIZE;
            if (dh == 0) dh = TILE_SIZE;

            wh = dh / height;
        }else if(row == this.facsimileViewer.getNumRows(k) - 2) {
            var lastHeight = height % TILE_SIZE;
            lastHeight = (lastHeight == 0?TILE_SIZE:lastHeight);

            dh += Math.min(lastHeight, this.OVERLAP);

        }else {
            dh += this.OVERLAP;
        }

        var ww = dw / width;
        var wh = dh / height;

        dw = Math.round(dw * 100) / 100;
        dh = Math.round(dh * 100) / 100;

        wx = Math.round(wx * 100) / 100;
        wy = Math.round(wy * 100) / 100;

        ww = Math.round(ww * 100) / 100;
        wh = Math.round(wh * 100) / 100;

        var path;
        if (this.key != 0)
            path = '/digilib/Scaler/' + this.facsimileViewer.getFacsimilePath() + '?dw=' + dw + '&amp;dh=' + dh + '&amp;wx=' + wx + '&amp;wy=' + wy + '&amp;ww=' + ww + '&amp;wh=' + wh + '&amp;mo=fit&amp;key=' + k;
        else
            path = '/digilib/Scaler/' + this.facsimileViewer.getFacsimilePath() + '?dw=' + dw + '&amp;dh=' + dh + '&amp;wx=' + wx + '&amp;wy=' + wy + '&amp;mo=clip&amp;key=' + k;

        this.images[k][col][row].attr({"src": path, "width": Math.round(dw * Math.pow(2.0, k)), "height": Math.round(dh * Math.pow(2.0, k))});
    },

    setSize: function(width, height) {

        this.svgDoc.setAttribute("width", width);
        this.svgDoc.setAttribute("height", height);
    },

    setPosition: function(x, y) {

        this.svgDoc.setAttribute("style", "top:" +  y + "px; left:" +  x + "px; position: absolute;");
    }

});