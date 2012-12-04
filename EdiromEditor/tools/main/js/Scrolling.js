/* 
 *	Scrollview, Scrolltable and Scrollbar Implementation
 * 	(Scrollview uses Scrollbar; Scrolltable inherits from Scrollview)
 *	Author: Markus Haupt
 *
 * Dependencies: Prototype (javascript framework from prototypejs.org), Util2.js
 * The current version works only with Firefox.
 */


//document.write('<link rel="stylesheet" type="text/css" href="scrolling.css"></link>');

if ( typeof de == 'undefined' ) de = {};
if ( typeof de.edirom == 'undefined' ) de.edirom = {};
if ( typeof de.edirom.server == 'undefined' ) de.edirom.server = {};

/*
 * The Scrollview class makes a div scrollable
 *
 * 'viewId' is the id of the parent div which has to be scrollable
 * The other params are related to the scrollbars (see also Scrollbar class) and
 *		can either be stated as single values or arrays of 2 values each
 *		for differentiation of vertical (Array Pos. 0) and horizontal (Array Pos. 1) scrollbar.
 *
 * First instantiate a new object from this class and give it the div's Id
 * Then:
 * Invoke 'setVerticalScrolling(boolean yesNo)' for enabling/disabling vertical scrolling
 * Invoke 'setHorizontalScrolling(boolean yesNo)' for enabling/disabling horizontal scrolling
 *
 * Invoke 'refresh()' i.e. if the size of the view has changed
 * Invoke 'refresh(x,y)' to jump directly to a position in the view's content
 * Invoke 'focusElement(elementId)' to jump directly to an element in the view's content
 *
 * Notice: this class adds new divs nested around the content of the view's div
 *
 * The ids of the scrollbar divs will be the following:
 * 	"<viewId>_vScrollbar" AND "<viewId>_hScrollbar" AND "<viewId>_cornerRect"
 * The ids of the corresponding dragbar divs will be the following:
 *    "<viewId>_vScrollbar_vDragbar" AND "<viewId>_hScrollbar_hDragbar"
 * (Notice: you are allowed to customize several CSS style attributes, but don't change the positioning and size!)
 */
de.edirom.server.Scrollview = Class.create({
	initialize: function(viewId, refreshOnDocumentResize, minDrawbarLengthPx) {
		this.viewId = viewId;
		this.view = $(viewId);
		
		if (typeof(minDrawbarLengthPx) == "object") { // is array?
			this.minDrawbarLengthV = minDrawbarLengthPx[0];
			this.minDrawbarLengtH = minDrawbarLengthPx[1];
		} else {
			this.minDrawbarLengthV = minDrawbarLengthPx;
			this.minDrawbarLengthH = minDrawbarLengthPx;
		}
		
		// adapt the required attribute values of the VIEW, position-mode has to be non-static!
		this.view.setStyle({overflow:"hidden"});
		if (this.view.getStyle("position") == "static")
			this.view.setStyle({position:"relative"});
		
		// create a FRAME div with a fix size which is set to the inner size of the VIEW
		// the FRAME defines the area where the content is visible
		var frameId = this.viewId+"_scrollViewFrame";
		var frame = new Element("div", {id: frameId});
		this.frameWidth = getBoxModelWidth(this.view, 'inner');
		this.frameHeight = getBoxModelHeight(this.view, 'inner');
		frame.setStyle({width: this.frameWidth+"px", height: this.frameHeight+"px", overflow: "hidden", whiteSpace: "normal"});
		
		// create an INNER-FRAME within the FRAME which covers the whole content
		var frameInnerId = this.viewId+"_scrollViewInnerFrame";
		var frameInner = new Element("div", {id: frameInnerId});
		frameInner.setStyle({width:"auto", height:"auto", overflow:"hidden", display: "inline"});
		
		// nest the divs so that VIEW contains FRAME and FRAME contains INNER-FRAME
		frameInner.update(this.view.innerHTML);
		frame.update(frameInner);
		this.view.update(frame);
		
		// differ between FRAME and INNER-FRAME for vertical and horizontal notion (important for table scrolling mode)
		this.vFrame = frame; // frame to get vertical axis values from (e.g. height)
		this.hFrame = frame; // frame to get horizontal axis values from (e.g. width)
		this.vFrameId = frameId;
		this.hFrameId = frameId;
		this.vFrameInner = frameInner; // frameInner to get vertical axis values from (e.g. height)
		this.hFrameInner = frameInner; // frameInner to get horizontal axis values from (e.g. width)
		this.vFrameInnerId = frameInnerId;
		this.hFrameInnerId = frameInnerId;
		
		// init Scrollbar related vars
		this.vScrollbar = null;
		this.hScrollbar = null;
		this.vThickness = 0;
		this.hThickness = 0;
		
		// init vars related to table scrolling
		this.scrollbarTopOffset = 0;
		this.scrollbarBottomOffset = 0;
		
		// init corner rectangle
		this.cornerRectId = this.viewId+"_cornerRect";
		this.cornerRect = new Element("div", {id: this.cornerRectId});
		this.cornerRect.setStyle({position:"absolute", bottom:"0px", right:"0px", display:"none"});
		this.cornerRect.addClassName("cornerRect");
		this.view.insert({top: this.cornerRect});
		
		if (refreshOnDocumentResize) {
			Event.observe(document.onresize ? document : window, 'resize', function(event) {
			    if (this.calcOwnTableWidths && this.refreshTableWidths)
	                this.refreshTableWidths();
		        this.refresh();
		    }.bindAsEventListener(this));
		}
	},
	setTableScrolling: function(headTableId, footTableId, bodyTableId, bodyTableWrapperId) { // activates table scrolling mode
		this.vFrame = $(bodyTableWrapperId);
		this.vFrameId = bodyTableWrapperId;
		this.vFrameInner = $(bodyTableId);
		this.vFrameInnerId = bodyTableId;
		this.scrollbarTopOffset = getBoxModelHeight($(headTableId), 'outer');
		if (footTableId != null)
		    this.scrollbarBottomOffset = getBoxModelHeight($(footTableId), 'outer');
		this.refresh();
	},
	setVerticalScrolling: function(yesNo) {
	    if (this.deactivated) return;
	    
		if (!yesNo && this.vScrollbar) { // remove vertical scrolling
			// remove scrollbar
			var tmp = this.vScrollbar.getScrollbar();
			this.vScrollbar = null;
			tmp.remove();
			
			// resize frame dimensions
			this.hFrame.setStyle({width: "auto"});
			
			// update related vars
			this.frameWidth = getBoxModelWidth(this.hFrame, 'inner');
			this.vThickness = 0;
			
			this.updateCornerRect();
			
		} else if (yesNo && !this.vScrollbar) { // create vertical scrolling
			// create and insert the scrollbar container
			var scrollbarId = this.viewId+"_vScrollbar";
			var scrollbarContainer = new Element("div", {id: scrollbarId});
			var topPadding;
			if (this.scrollbarTopOffset > 0) topPadding = this.scrollbarTopOffset;
			else topPadding = this.vFrame.getStyle("padding-top");
			scrollbarContainer.setStyle({position:"absolute", right:"0px", height: this.frameHeight+"px", top: topPadding+"px"});
			scrollbarContainer.addClassName("scrollbarV");
			this.view.insert({top: scrollbarContainer});
			this.vThickness = getBoxModelWidth(scrollbarContainer, "native");
			
			// update frame dimensions which will correspond to the scrollbar dimensions
			this.frameWidth = getBoxModelWidth(this.hFrame, 'inner') - this.vThickness;
			this.hFrame.setStyle({width: this.frameWidth+"px"});
			
			if (this.hScrollbar) {
				// update width of horizontal scrollbar
				this.hScrollbar.getScrollbar().setStyle({width: this.frameWidth+"px"});
				this.hScrollbar.updateDragbar();
			}
			
			// create and insert the scrollbar
			this.vScrollbar = new de.edirom.server.Scrollbar(scrollbarId, this.vFrameId, this.vFrameInnerId, "vertical", this.minDrawbarLengthV);
			this.vScrollbar.getDragbar().addClassName("dragbarV");
			
			this.updateCornerRect();
		}
	},
	setHorizontalScrolling: function(yesNo) {
	    if (this.deactivated) return;
	    
		if (!yesNo && this.hScrollbar) { // remove horizontal scrolling
			// remove scrollbar
			var tmp = this.hScrollbar.getScrollbar();
			this.hScrollbar = null;
			tmp.remove();
			
			// resize frame dimensions
			this.vFrame.setStyle({height: "auto"});
			
			// turn on auto line-breaks
			this.vFrame.setStyle({whiteSpace: "normal"});
			
			// update related vars
			this.frameHeight = getBoxModelHeight(this.vFrame, 'inner');
			this.hThickness = 0;
			
			this.updateCornerRect();
			
		} else if (yesNo && !this.hScrollbar) { // create horizontal scrolling
			// create and insert the scrollbar container
			var scrollbarId = this.viewId+"_hScrollbar";
			var scrollbarContainer = new Element("div", {id: scrollbarId});
			scrollbarContainer.setStyle({position:"absolute", bottom:"0px", width: this.frameWidth+"px", left: "0px"});
			scrollbarContainer.addClassName("scrollbarH");
			this.view.insert({top: scrollbarContainer});
			
			this.hThickness = getBoxModelHeight(scrollbarContainer, "native");
			
			// update frame dimensions which will correspond to the scrollbar dimensions
			this.frameHeight = getBoxModelHeight(this.vFrame, 'inner') - this.hThickness;
			this.vFrame.setStyle({height: this.frameHeight+"px"});
			
			// turn off auto line-breaks
			this.vFrame.setStyle({whiteSpace: "nowrap"});
			
			if (this.vScrollbar) {
				// update height of vertical scrollbar
				this.vScrollbar.getScrollbar().setStyle({height: this.frameHeight+"px"});
				this.vScrollbar.updateDragbar();
			}
			
			// create and insert the scrollbar
			this.hScrollbar = new de.edirom.server.Scrollbar(scrollbarId, this.hFrameId, this.hFrameInnerId, "horizontal", this.minDrawbarLengthH);
			this.hScrollbar.getDragbar().addClassName("dragbarH");
			
			this.updateCornerRect();
		}
	},
	refresh: function(xJump, yJump) { // to do a simple refresh omit the jump-coordinate params
	    if (this.deactivated) return;
	    
	    // don't refresh if the frame/view is not visible
	    var anc = this.vFrame.ancestors();
	    for (var i = 0; i < anc.length; i++) if (!anc[i].visible()) return;
	    
		// resize frame div and update related vars
		this.hFrame.setStyle({ height: "auto" });
		this.vFrame.setStyle({ width: "auto" });
		this.vFrame.setStyle({ height: "auto", maxHeight: "none" });
		
		this.frameWidth = getBoxModelWidth(this.view, 'inner') - this.vThickness;
		this.frameHeight = getBoxModelHeight(this.view, 'inner') - this.hThickness;
		this.hFrame.setStyle({width: this.frameWidth+"px", height: this.frameHeight+"px"});
		if (this.hFrame != this.vFrame)
		    this.vFrame.setStyle({width: this.frameWidth+"px", height: this.frameHeight+"px"});

		this.frameHeight -= this.scrollbarTopOffset + this.scrollbarBottomOffset;
        
		this.vFrame.setStyle({height: this.frameHeight+"px", maxHeight: getBoxModelHeight(this.hFrameInner, 'outer')+"px"});
        
		// apply jump coords, resize scrollbar containers and update dragbars
		if (this.vScrollbar) {
			this.vScrollbar.getScrollbar().setStyle({height: this.frameHeight+"px"});
			if (!yJump)
				this.vScrollbar.updateDragbar();
			else {
				if (yJump < 0) yJump = 0;
				this.vScrollbar.scrollToOffset(-yJump);
			}
		}
		if (this.hScrollbar) {
			this.hScrollbar.getScrollbar().setStyle({width: this.frameWidth+"px"});
			if (!xJump)
				this.hScrollbar.updateDragbar();
			else {
				if (xJump < 0) xJump = 0;
				this.hScrollbar.scrollToOffset(-xJump);
			}
		}
	},
	focusElement: function(elementId, leftTopOffsetPx) {
	    if (this.deactivated) return;
	    
		var leftOffset = 0;
		var topOffset = 0;
		if (typeof(leftTopOffsetPx) == "object") { // is array?
			leftOffset = leftTopOffsetPx[0];
			topOffset = leftTopOffsetPx[1];
		} else if (leftTopOffsetPx) {
			leftOffset = leftTopOffsetPx;
			topOffset = leftTopOffsetPx;
		}
		
		if (leftOffset == 'center')
		    leftOffset = this.frameWidth*0.5 - $(elementId).getWidth()*0.5;
		if (topOffset == 'center')
		    topOffset = this.frameHeight*0.5 - $(elementId).getHeight()*0.5;
		
		this.refresh( ($(elementId).viewportOffset()[0] - this.hFrameInner.viewportOffset()[0]) - leftOffset,
							($(elementId).viewportOffset()[1] - this.vFrameInner.viewportOffset()[1]) - topOffset);
	},
	updateCornerRect: function() {
		if (this.vScrollbar && this.hScrollbar) { // show corner rectangle
			// update and show cornerRect
			this.cornerRect.setStyle({width: this.vThickness+"px", height: this.hThickness+"px"});
			this.cornerRect.show();
		} else { // hide corner rectangle
			this.cornerRect.hide();
		}
	},
	deactivate: function() {
	    if (this.deactivated) return;
	    
	    this.backupFrameStyle = this.vFrame.readAttribute("style");
	    this.vFrame.writeAttribute({style: ""});
	    this.backupFrameInnerStyle = this.vFrameInner.readAttribute("style");
	    this.vFrameInner.writeAttribute({style: ""});
	    if (this.vScrollbar) $(this.viewId+"_vScrollbar").hide();
	    if (this.hScrollbar) $(this.viewId+"_hScrollbar").hide();
	    this.deactivated = true;
	},
	reactivate: function() {
	    if (!this.deactivated) return;
	    
	    if (this.backupFrameStyle != null) {
    	    this.vFrame.writeAttribute({style: this.backupFrameStyle});
    	    this.backupFrameStyle = null;
	    }
	    if (this.backupFrameInnerStyle != null) {
    	    this.vFrameInner.writeAttribute({style: this.backupFrameInnerStyle});
    	    this.backupFrameInnerStyle = null;
	    }
	    if (this.vScrollbar) $(this.viewId+"_vScrollbar").show();
	    if (this.hScrollbar) $(this.viewId+"_hScrollbar").show();
	    this.deactivated = false;
	}
});

/*
 * The Scrolltable is a special case of Scrollview
 *
 * It will be distinguished between the head and the body of the table.
 *		While scrolling vertically the head of the table remains in position.
 *
 * Notice: this class divides the table into two separate tables.
 *
 * The ids of the tables will be the following:
 *		"<tableId>_scrollHeadTable" AND "<tableId>_scrollBodyTable"
 */
de.edirom.server.Scrolltable = Class.create(de.edirom.server.Scrollview, {
		initialize: function($super, viewId, tableId, refreshOnDocumentResize, minDrawbarLengthPx) {
			// get the widths of the columns to be able to reconstruct the dimensions of the table later
		    tableFirstRow = firstDisplayed($(tableId), "tr").select("td, th");
		    this.syncWidthsArray = new Array(tableFirstRow.length);
		    for (var i = 0; i < tableFirstRow.length; i++)
		        this.syncWidthsArray[i] = getBoxModelWidth(tableFirstRow[i], "inner");
		    
			// separation into three tables
			var headTable = $(tableId).cloneNode(false); // clone table without innerHTML
			this.headTableId = $(tableId).identify()+"_scrollHeadTable";
			headTable.writeAttribute({id: this.headTableId});
			headTable.setStyle({whiteSpace: "nowrap", width: "auto", paddingBottom:"0px", marginBottom:"0px"});
			
			var footTable = $(tableId).cloneNode(false); // clone table without innerHTML
			this.footTableId = $(tableId).identify()+"_scrollFootTable";
			footTable.writeAttribute({id: this.footTableId});
			footTable.setStyle({whiteSpace: "nowrap", width: "auto", paddingTop:"0px", marginTop:"0px", borderTop:"0px hidden"});
			
			var bodyTable = $(tableId);
			this.bodyTableId = $(tableId).identify()+"_scrollBodyTable";
			bodyTable.writeAttribute({id: this.bodyTableId});
			bodyTable.setStyle({whiteSpace: "nowrap", width: "auto", paddingTop:"0px", marginTop:"0px", borderTop:"0px hidden"});
			
			// re-allocate tfoot and thead
			var tableParts = bodyTable.childElements();
			for (var i = 0; i < tableParts.length; i++) {
				if (tableParts[i].match("thead"))
				    headTable.insert({ bottom: tableParts[i].remove() });
				else if (tableParts[i].match("tfoot"))
				    footTable.insert({ bottom: tableParts[i].remove() });
		    }
		    
		    // insert new tables
		    bodyTable.insert({ before: headTable });
		    if (footTable.childElements().length > 0) {
		        bodyTable.insert({ after: footTable });
		        bodyTable.setStyle({paddingBottom:"0px", marginBottom:"0px"});
		    } else {
		        // delete footTable if tfoot didn't existed
		        footTable = null;
		        this.footTableId = null;
		    }
			
			// create bodyTable wrapper div (represents the frame div for vertical scrolling)
			this.bodyTableWrapperId = this.bodyTableId+"_scrollBodyWrapper";
			var bodyTableWrapper = new Element("div", {id: this.bodyTableWrapperId});
			var bodyWrapperWidth = getBoxModelWidth($(viewId), 'inner');
			var bodyWrapperHeight = getBoxModelHeight($(viewId), 'inner') - headTable.getHeight();
			if (footTable != null) bodyWrapperHeight -= footTable.getHeight();
			var bodyWrapperMaxHeight = getBoxModelHeight(bodyTable, 'outer');
			bodyTableWrapper.setStyle({width: bodyWrapperWidth+"px", height: bodyWrapperHeight+"px", maxHeight: bodyWrapperMaxHeight+"px", overflow:"hidden", whiteSpace:"normal"});
			Element.wrap(bodyTable, bodyTableWrapper);
			
			// create Scrollview and set table scrolling mode
			$super(viewId, refreshOnDocumentResize, minDrawbarLengthPx);
			this.setTableScrolling(this.headTableId, this.footTableId, this.bodyTableId, this.bodyTableWrapperId);
			
			// synchronize column widths of the tables
			this.isHeadSynced = false;
			this.isBodySynced = false;
			this.isFootSynced = false;
			this.synchronizeColumnWidths();
			
		},
		// private. assigns the fix widths stored in this.syncWidthArray and optionally updates the percentual widths (user-assigned with 'setTableWidth()')
		//   to the first columns in the first row of each new table (head, body, foot)
		synchronizeColumnWidths: function() {
		
		    // note: currently works under the assumption that the first row of either the head and foot table is always the same
		    
		    if (!this.isHeadSynced && displayedExists($(this.headTableId), "tr")) {
			    this.headFirstRow = firstDisplayed($(this.headTableId), "tr").select("td, th");
			    for (var col = 0; col < this.headFirstRow.length; col++)
				    this.headFirstRow[col].setStyle( {width: this.syncWidthsArray[col]+"px", minWidth: this.syncWidthsArray[col]+"px"} );
				this.isHeadSynced = true;
			}
            
            if (!this.isBodySynced && displayedExists($(this.bodyTableId), "tr")) {
			    currentFirstRow = firstDisplayed($(this.bodyTableId), "tr").select("td, th");
			    if (this.bodyFirstRow && currentFirstRow != this.bodyFirstRow) {
			        // row order has changed: remove widths of the old first row
			        for (var col = 0; col < this.bodyFirstRow.length; col++)
	                    this.bodyFirstRow[col].setStyle( {width: "auto", minWidth: "0", maxWidth: "none"} );
			    }
			    this.bodyFirstRow = currentFirstRow;
			    for (var col = 0; col < this.bodyFirstRow.length; col++)
	                this.bodyFirstRow[col].setStyle( {width: this.syncWidthsArray[col]+"px", minWidth: this.syncWidthsArray[col]+"px"} );
				this.isBodySynced = true;
			}
			
			if (!this.isFootSynced && this.footTableId != null && displayedExists($(this.footTableId), "tr")) {
			    this.footFirstRow = firstDisplayed($(this.footTableId), "tr").select("td, th");
			    for (var col = 0; col < this.footFirstRow.length; col++)
				    this.footFirstRow[col].setStyle( {width: this.syncWidthsArray[col]+"px", minWidth: this.syncWidthsArray[col]+"px"} );
				this.isFootSynced = true;
			}
			
			if (this.calcOwnTableWidths)
		        this.refreshTableWidths();
		},
		// public. call if the content of the tables has changed in order to adjust errors in the view that could have been arised
		refreshTable: function() {
		    if (this.deactivated) return;
		    
		    this.isHeadSynced = false;
		    this.isBodySynced = false;
		    this.isFootSynced = false;
		    this.synchronizeColumnWidths();
		},
		// public. replaces the original table widths by own values either given by fix and/or percentual widths
		//  (this method updates this.syncWidthArray and does a refresh of the view accordingly, this.calcOwnTableWidths will be set to 'true')
		setTableWidths: function(fixWidths, percentualWidths) {
		    if (this.deactivated) return;
		    
		    // set all fix widths completely
		    if (fixWidths) {
    		    for (var i = 0; i < fixWidths.length; i++) {
    		        var index = fixWidths[i][0];
    		        var widthPx = fixWidths[i][1];
    		        this.syncWidthsArray[index] = widthPx;
    		        if (displayedExists($(this.headTableId), "tr"))
    		            this.headFirstRow[index].setStyle( {width: widthPx+"px", minWidth: widthPx+"px"} );
    		        if (displayedExists($(this.bodyTableId), "tr"))
    		            this.bodyFirstRow[index].setStyle( {width: widthPx+"px", minWidth: widthPx+"px"} );
    		        if (this.footTableId != null && displayedExists($(this.footTableId), "tr"))
    		            this.footFirstRow[index].setStyle( {width: widthPx+"px", minWidth: widthPx+"px"} );
    		    }
		    }
		    
		    if (!percentualWidths)
		        return;
		    
		    // get the width available for the percentual division
		    for (var i = 0; i < percentualWidths.length; i++)
		        this.syncWidthsArray[percentualWidths[i][0]] = 0;
		    var fixArea = 0;
		    for (var i = 0; i < this.syncWidthsArray.length; i++) {
		        if (this.syncWidthsArray[i] > 0)
		            fixArea += getBoxModelWidth(this.headFirstRow[i], 'outer');
		    }
		    this.percentualWidths = percentualWidths;
		    this.initPercArea = getBoxModelWidth(this.hFrame, 'inner') - fixArea - window.innerWidth;
		    
		    // set all percentual widths completely
		    this.refreshTableWidths();
		    
		    this.calcOwnTableWidths = true; // causes the (percentual) table widths to refresh on document-resize
		},
		// private. (re-)calculates the percentual widths (previously set with 'setTableWidths()') and updates the view accordingly,
		//   i.e. after the width of the whole table has changed
		refreshTableWidths: function() {
		    if (this.deactivated) return;
		    
		    var percArea = this.initPercArea + window.innerWidth;
		    
		    // calculate and assign the percentual widths
		    for (var i = 0; i < this.percentualWidths.length; i++) {
		        var index = this.percentualWidths[i][0];
		        var padding = getBoxModelWidth(this.headFirstRow[index], 'outer') - getBoxModelWidth(this.headFirstRow[index], 'inner');
    		    var widthPx = this.percentualWidths[i][1] * percArea / 100 - padding;
    		    if (displayedExists($(this.headTableId), "tr"))
    	            this.headFirstRow[index].setStyle( {width: widthPx+"px", minWidth: widthPx+"px", maxWidth: widthPx+"px"} );
    	        if (displayedExists($(this.bodyTableId), "tr"))
    	            this.bodyFirstRow[index].setStyle( {width: widthPx+"px", minWidth: widthPx+"px", maxWidth: widthPx+"px"} );
    	        if (this.footTableId != null && displayedExists($(this.footTableId), "tr"))
    	            this.footFirstRow[index].setStyle( {width: widthPx+"px", minWidth: widthPx+"px", maxWidth: widthPx+"px"} );
		    }
		},
		setVerticalScrolling: function($super, yesNo) {
		    if (this.deactivated) return;
		    
		    var addSb = yesNo && !this.vScrollbar;
		    var subtractSb = !yesNo && this.vScrollbar;
		    
			$super(yesNo);
			
			// Subtract or re-add the thickness of the vertical scrollbar from the width of the last column of the tables
			if (addSb || subtractSb) {
			    var newWidth = this.syncWidthsArray.last();
			    if (addSb)
    			    newWidth -= this.vThickness;
    			else
    			    newWidth += this.vThickness;
    			
    			this.syncWidthsArray[this.syncWidthsArray.length-1] = newWidth;
    			
    			// refresh view
    			if (this.bodyFirstRow != null && this.bodyFirstRow.last() != null)
    			    this.bodyFirstRow.last().setStyle( {width: newWidth+"px", minWidth: newWidth+"px"});
    			if (this.headFirstRow != null && this.headFirstRow.last() != null)
    			    this.headFirstRow.last().setStyle( {width: newWidth+"px", minWidth: newWidth+"px"});
    			if (this.footFirstRow != null && this.footFirstRow.last() != null)
    			    this.footFirstRow.last().setStyle( {width: newWidth+"px", minWidth: newWidth+"px"});
			}
		},/*
		setHorizontalScrolling: function($super, yesNo) {
		    if (this.deactivated) return;
		    
			var flag = yesNo && !this.hScrollbar;
		   
			if(flag)
				$(this.bodyTableWrapperId).setStyle({width: $(this.bodyTableId).getWidth()+"px"});
			
			$super(yesNo);
		},*/
		refresh: function($super, xJump, yJump) {
		    if (this.deactivated) return;
		    this.synchronizeColumnWidths();
		    $super(xJump, yJump);
		}
});




/*
 * The Scrollbar class makes a scrollbar out of a given scrollbar container div by inserting a dragbar
 *
 * 'frameId' identifies a content div which acts as a frame with fix width and height values
 * 'frameInnerId' identifies a div which is the only child of the frame and wraps the whole content (with CSS overflow="hidden")
 * 'axis' is either 'vertical' or 'horizontal'
 * 'minDrawbarHeightPx' (optional) is to avoid the dragbar to get tiny if the content grows very large
 *
 * Invoke 'updateDragbar' to update the dragbar
 * Invoke 'getDragbar' or 'getScrollbar' to get the dragbar or the scrollbar (as Prototype elements)
 * Invoke 'scroll(px)' or 'scrollToOffset(-px)' to either scroll an amount or to scroll to an absolute position
 * Inkove 'setMousewheelScrolling(true/false)' to change the standard configuration for enabled/disabled mousewheel scrolling
 *             (standard: true for vertical scrolling, false for horizontal scrolling)
 *
 * The ids of the dragbar divs will be the following:
 *		"<scrollbarContainerId>_vDragbar" OR "<scrollbarContainerId>_hDragbar"
 * (Notice: you are allowed to customize several CSS style attributes, but don't change the positioning and size!)
 *
 * Even though both vertical and horizontal scrolling are supported,
 * variable naming in the code of the class conforms to vertical scrolling.
 */
de.edirom.server.Scrollbar = Class.create({
	initialize: function(scrollbarContainerId, frameId, frameInnerId, axis, minDrawbarLengthPx) {
		this.scrollbar = $(scrollbarContainerId);
		this.contentView = $(frameId);
		this.content = $(frameInnerId);
		
		axis = axis.toLowerCase();
		if (axis == "horizontal" || axis == "h" || axis == "x") {
			this.vScroll = false;
			this.mousewheelScrolling = false;
		} else {
			this.vScroll = true;
			this.mousewheelScrolling = true;
		}
		
		if (this.vScroll)
			this.content.setStyle({position: "relative", top: "0px"});
		else
			this.content.setStyle({position: "relative", left: "0px"});
		
		if (this.vScroll)
			this.drawbarPaddingLongitudinal = getCssIntAttr(this.scrollbar, "padding-top") + getCssIntAttr(this.scrollbar, "padding-bottom");
		else
			this.drawbarPaddingLongitudinal = getCssIntAttr(this.scrollbar, "padding-left") + getCssIntAttr(this.scrollbar, "padding-right");
			
		if (!minDrawbarLengthPx)
			this.minDbHeight = 12;
		else
			this.minDbHeight = Math.max(2, minDrawbarLengthPx);
		
		this.r; // length of dragbar (px)
		this.p = 0; // scroll position (px, top/left side of dragbar)
		this.contentFits;
		
		// create the dragbar
		var dragbarId = scrollbarContainerId;
		if (this.vScroll)
			dragbarId += "_vDragbar";
 		else
 			dragbarId += "_hDragbar";
		this.dragbar = new Element("div", {id: dragbarId});
		this.scrollbar.insert({top: this.dragbar});		
		
		// EVENT HANDLING
		
		this.eventMouseDown = this.startDrag.bindAsEventListener(this);
		this.eventMouseUp = this.endDrag.bindAsEventListener(this);
		this.eventMouseMove = this.updateDrag.bindAsEventListener(this);
		this.eventMouseWheel = this.updateWheel.bindAsEventListener(this);
		
		this.observe = false;
		
		this.dragging = false;
		
		this.updateDragbar();
	},
	getScrollbar: function() {
		return this.scrollbar;
	},
	getDragbar: function() {
		return this.dragbar;
	},
	updateDragbar: function() {
		this.dragbar.setStyle({position:"absolute"});
		
		this.refreshScrollTargetValues();
		
		if (this.vScroll)
			this.dragbar.setStyle({width: getBoxModelWidth(this.scrollbar, "inner")+"px", height: this.r+"px", top: this.p+"px"});
		else
			this.dragbar.setStyle({height: getBoxModelHeight(this.scrollbar, "inner")+"px", width: this.r+"px", left: this.p+"px"});
 		
		this.startObserving();
		if (this.contentFits) {
 			this.scrollbar.setStyle({visibility:"hidden"});
 			this.stopObserving();
 			
 			if (this.vScroll)
			    this.content.setStyle({top: "0px"});
    		else
    			this.content.setStyle({left: "0px"});
    	    
		} else {
 			this.scrollbar.setStyle({visibility:"visible"});
		}
	},
	refreshScrollTargetValues: function() {	
		if (this.vScroll) {
			this.contentViewHeight = this.contentView.getHeight();
			this.contentHeight = this.content.getHeight();
		} else {
			this.contentViewHeight = this.contentView.getWidth();
			this.contentHeight = this.content.getWidth();
		}

		if (this.vScroll)
			this.scrollbarHeight = this.scrollbar.getHeight();
		else
			this.scrollbarHeight = this.scrollbar.getWidth();
		this.scrollbarHeight -= this.drawbarPaddingLongitudinal*2;
		
		// start with max. height for no-scrolling
		this.r = this.scrollbarHeight
		// now downsize for enabled scrolling
		if (this.contentHeight > this.contentViewHeight) {
			var idealR = Math.ceil((this.contentViewHeight / this.contentHeight) * this.r);
			this.r = Math.max(this.minDbHeight, idealR);
			var overlap = this.r - idealR;
			this.contentFits = false;
		} else {
			this.contentFits = true;
		}
		
		var contentOffset;
		if (this.vScroll)
			contentOffset = parseInt(this.content.getStyle("top"));
		else
			contentOffset = parseInt(this.content.getStyle("left"));
		
		// get scroll position
		var normalizedPosition;
		if (this.contentHeight > this.contentViewHeight)
			normalizedPosition = Math.min(0.0, contentOffset / this.contentHeight);
		else
			normalizedPosition = 0.0;
		
		this.p = Math.floor(-normalizedPosition * (this.scrollbarHeight-overlap))+this.drawbarPaddingLongitudinal;
	},
	setMousewheelScrolling: function(onOff) { // for external/public use
	    if (onOff && this.observe && !this.mousewheelScrolling) {
            this.contentView.observe("mousewheel", this.eventMouseWheel);
    		this.contentView.observe("DOMMouseScroll", this.eventMouseWheel); // mousewheel for Firefox
    		this.scrollbar.observe("mousewheel", this.eventMouseWheel);
    		this.scrollbar.observe("DOMMouseScroll", this.eventMouseWheel); // mousewheel for Firefox
        } else if (!onOff && this.observe && this.mousewheelScrolling) {
            this.contentView.stopObserving("mousewheel", this.eventMouseWheel);
    		this.contentView.stopObserving("DOMMouseScroll", this.eventMouseWheel);
    		this.scrollbar.stopObserving("mousewheel", this.eventMouseWheel);
    		this.scrollbar.stopObserving("DOMMouseScroll", this.eventMouseWheel);
	    }
	    this.mousewheelScrolling = onOff;
	},
	startObserving: function() {
		if (this.observe) return;
		this.scrollbar.observe("mousedown", this.eventMouseDown);
		document.observe("mouseup", this.eventMouseUp);
		document.observe("mousemove", this.eventMouseMove);
		if (this.mousewheelScrolling) {
			this.contentView.observe("mousewheel", this.eventMouseWheel);
			this.contentView.observe("DOMMouseScroll", this.eventMouseWheel); // mousewheel for Firefox
			this.scrollbar.observe("mousewheel", this.eventMouseWheel);
			this.scrollbar.observe("DOMMouseScroll", this.eventMouseWheel); // mousewheel for Firefox
		}
		this.observe = true;
	},
	stopObserving: function() {
		if (!this.observe) return;
		this.scrollbar.stopObserving("mousedown", this.eventMouseDown);
		document.stopObserving("mouseup", this.eventMouseUp);
		document.stopObserving("mousemove", this.eventMouseMove);
		if (this.mousewheelScrolling) {
			this.contentView.stopObserving("mousewheel", this.eventMouseWheel);
			this.contentView.stopObserving("DOMMouseScroll", this.eventMouseWheel);
			this.scrollbar.stopObserving("mousewheel", this.eventMouseWheel);
			this.scrollbar.stopObserving("DOMMouseScroll", this.eventMouseWheel);
		}
		this.observe = false;
	},
	startDrag: function(event) {
		if (Event.isLeftClick(event) && !this.dragging) {
			// check if event is a click on the scrollbar besides the dragbar
			if (event.findElement() == this.scrollbar) {
				var clickPosition;
				if (this.vScroll)
					clickPosition = (Event.pointerY(event)-this.scrollbar.cumulativeOffset()[1]-(this.dragbar.getHeight()/2)) / this.scrollbar.getHeight();
				else
					clickPosition = (Event.pointerX(event)-this.scrollbar.cumulativeOffset()[0]-(this.dragbar.getWidth()/2)) / this.scrollbar.getWidth();
				
				this.scrollToNormalizedOffset(clickPosition);
			} else {
				this.dragging = true;
				if (this.vScroll) {
					this.startPointer = Event.pointerY(event);
					this.startScrollingAt = parseInt(this.content.getStyle("top"));
				} else {
					this.startPointer = Event.pointerX(event);
					this.startScrollingAt = parseInt(this.content.getStyle("left"));
				}
			}
		}
		Event.stop(event);
	},
	endDrag: function(event) {
		this.dragging = false;
		Event.stop(event);
	},
	updateDrag: function(event) {
		if (this.dragging) {
			if (this.vScroll)
				distance = this.startPointer - Event.pointerY(event);
			else
				distance = this.startPointer - Event.pointerX(event);
			
			var normalizedDistance = distance / this.scrollbarHeight;
			if (normalizedDistance > 1.0 || normalizedDistance < -1.0) return;
			
			this.scrollToOffset(this.startScrollingAt + (normalizedDistance * this.contentHeight));

			Event.stop(event);
		}
	},
	updateWheel: function(event) {
		if (this.vScroll)
			this.scroll(Event.wheel(event)*10);
		else
			this.scroll(Event.wheel(event)*10);
		Event.stop(event);
	},
	scroll: function(amount) { // expects a relative pixel distance of the content area, defining the view's top/left corner
		var contentOffset;
		if (this.vScroll)
			contentOffset = parseInt(this.content.getStyle("top"));
		else
			contentOffset = parseInt(this.content.getStyle("left"));
		
		contentOffset += amount;
		
		this.scrollToOffset(contentOffset);
	},
	scrollToOffset: function(contentOffset) { // expects an absolute negative pixel distance of the content area, defining the view's top/left corner
		if (this.vScroll) {
			this.contentViewHeight = this.contentView.getHeight();
			this.contentHeight = this.content.getHeight();
		} else {
			this.contentViewHeight = this.contentView.getWidth();
			this.contentHeight = this.content.getWidth();
		}
		
		if (this.contentViewHeight >= this.contentHeight)
		    contentOffset = 0;
		else
		    contentOffset = Math.max(Math.min(0, contentOffset), -(this.contentHeight - this.contentViewHeight));
		
		if (this.vScroll)
			this.content.setStyle({top: contentOffset+"px"});
		else
			this.content.setStyle({left: contentOffset+"px"});
		
		this.updateDragbar();
	},
	scrollToNormalizedOffset: function(contentOffset) { // expects a value between 0.0 and 1.0, defining the view's top/left corner
		if (this.vScroll)
			this.scrollToOffset(-(contentOffset*this.content.getHeight()));
		else
			this.scrollToOffset(-(contentOffset*this.content.getWidth()));
	}
});
