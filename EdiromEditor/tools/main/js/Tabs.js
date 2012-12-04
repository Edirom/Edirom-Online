/* 
 *	Tabs Implementation
 *		uses Yetii tabs (see below), which is not based on Prototype
 *	Author: Markus Haupt
 *
 * Dependencies: Prototype (javascript framework from prototypejs.org), Util2.js
 * The current version works only with Firefox.
 */
 

//document.write('<link rel="stylesheet" type="text/css" href="tabs.css"></link>');


/*
 * The Tabs class creates a tab structure
 *
 * 'menuDivId' is the id of the tabs-menu
 * 'containerDivId' is the id of the container for the content-divs of the tabs
 *
 * All divs in the containerDiv are taken as initial tabs, where the title-attributes will be the names of the tabs.
 * You can add tabs dynamically with the "addTab"-function.
 *
 */
de.edirom.server.Tabs = Class.create({
	initialize: function(menuDivId, containerDivId, refreshOnDocumentResize) {
		this.contentContainerId = containerDivId;
		this.tabsBarContainerId = menuDivId;
		this.tabsBarId = menuDivId+'-nav';
		this.moveBackId = menuDivId+'-back';
		this.moveForId = menuDivId+'-for';
		
		this.tabContentClassName = "tabContent";
		this.tabLinkClassName = "tabLink";
		this.tabActiveLinkClassName = "tabActiveLink";
		
		$(this.tabsBarContainerId).insert({top: '\
<div id="'+this.moveBackId+'" class="tabBackButton" style="display:inline-block; float:left;"></div>\
<div style="display:inline-block; float:left; overflow:hidden">\
	<div id="'+this.tabsBarId+'" style="white-space:nowrap">\
	</div>\
</div>\
<div id="'+this.moveForId+'" class="tabForButton" style="display:inline-block; float: left;"></div>\
		'});
		
		$(this.moveBackId).observe('click', this.moveBack.bindAsEventListener(this));
		$(this.moveForId).observe('click', this.moveFor.bindAsEventListener(this));
		
		this.yetiiTabs = new Yetii({id: this.contentContainerId, tabsId: this.tabsBarId, tabclass: this.tabContentClassName, activeclass: this.tabActiveLinkClassName, callback: this.showTabLink.bind(this)});
		

		this.stdMoveOverhead = 10; // defines how much pixels a scroll action goes beyond showing only the (automatically) targeted tab
		this.overlapTolerance = 20; // defines how much pixels a tab can be outside of the view so that a scroll action targets the next tab yet (instead of only making making this slightly overlapped tab fully visible)
		this.stdMoveDuration = 0.5; // defines how much seconds one scrolling animation will take for 100 pixels
		this.moveDurationBounds = [0.3, 2.0]; //defines a lower and an upper bound of how much seconds one scrolling animation will take
		
		this.position = 0;

        if (refreshOnDocumentResize)
		    Event.observe(document.onresize ? document : window, 'resize', this.refreshMenu.bindAsEventListener(this));
		
		var existentTabContainers = $(this.contentContainerId).childElements();
		for (var i = 0; i < existentTabContainers.length; i++)
			this.addTab(existentTabContainers[i], false, true);
		
		this.unlocked = true;
	},
	refreshMenu: function() {
		this.navWidthPx = $(this.tabsBarContainerId).getWidth();

		if (this.getOffsetPositionOfTab(-1,"right") > this.navWidthPx) { // set scrolling on
			this.navWidthPx -= (getBoxModelWidth($(this.moveBackId), 'outer') + getBoxModelWidth($(this.moveForId), 'outer') + 2);
			$(this.moveBackId).show();
			$(this.moveForId).show();
		} else { // set scrolling off
			$(this.moveBackId).hide();
			$(this.moveForId).hide();
		}
		$(this.tabsBarId).ancestors()[0].setStyle({width: this.navWidthPx+"px"});
	},
	addTab: function(newTabContentDiv, label, alreadyInserted) {
	    
	    if (!label) {
	        var label;
	        if (newTabContentDiv.readAttribute("title"))
				label = newTabContentDiv.readAttribute("title");
			else
				label = "Tab " + ($(this.tabsBarId).childElements().length + 1);
		}
				
		newTabContentDiv.setStyle( { display: "none" } );
		newTabContentDiv.addClassName(this.tabContentClassName);
		
		if (!alreadyInserted)
		    $(this.contentContainerId).insert({bottom: newTabContentDiv});
		
		// tab link
		var newTabLink = new Element("div");
		newTabLink.setStyle( { display: "inline-block", cursor: "pointer" } );
		newTabLink.addClassName(this.tabLinkClassName);
		newTabLink.innerHTML = label;
		
		$(this.tabsBarId).insert({bottom: newTabLink});
		
		this.yetiiTabs.refresh();
		this.refreshMenu();
	},
	moveBack: function(event, distance) {
		if (!this.unlocked) return;
		
		if (!distance) {
		    var maxIndex = $(this.tabsBarId).childElements().length - 1;
            var i = 1;
    		while (i <= maxIndex && this.getOffsetPositionOfTab(i, 'left') < (this.position - this.overlapTolerance) ) i++;
		    this.showTabLink(i);
		    return;
		}
		
		duration = Math.min(this.moveDurationBounds[1], Math.max(this.moveDurationBounds[0], distance/100 * this.stdMoveDuration));
		
		var tooMuch = -Math.min(0, this.position - distance);
		var actualMoveDistance = distance - tooMuch;
		new Effect.Move(this.tabsBarId, { x: actualMoveDistance, y: 0, duration: duration, transition: Effect.Transitions.sinoidal, afterFinish: this.unlock.bind(this) });
		this.unlocked = false;
		this.position -= actualMoveDistance;
	},
	moveFor: function(event, distance) {
		if (!this.unlocked) return;
        
		if (!distance) {
		    var maxIndex = $(this.tabsBarId).childElements().length - 1;
            var i = 1;
    		while (i <= maxIndex && this.getOffsetPositionOfTab(i, 'right') < (this.position + $(this.tabsBarId).getWidth() + this.overlapTolerance) ) i++;
    		i++;
		    this.showTabLink(i);
		    return;
		}
		
		duration = Math.min(this.moveDurationBounds[1], Math.max(this.moveDurationBounds[0], distance/100 * this.stdMoveDuration));
		
		var upperBound = this.getOffsetPositionOfTab(-1) - $(this.tabsBarId).getWidth();
		var tooMuch = Math.max(upperBound, this.position + distance) - upperBound;
		var actualMoveDistance = distance - tooMuch;
		new Effect.Move(this.tabsBarId, { x: -actualMoveDistance, y: 0, duration: duration, transition: Effect.Transitions.sinoidal, afterFinish: this.unlock.bind(this) });
		this.unlocked = false;
		this.position += actualMoveDistance;
	},
	showTabLink: function(number) {
		var absPosition;
		if ( (absPosition = this.getOffsetPositionOfTab(number-1, "left")) < this.position ) {
			// move because left border of tab is not visible
			this.moveBack(false, -(absPosition - this.position) + this.stdMoveOverhead);
		} else if ( (absPosition = this.getOffsetPositionOfTab(number-1, "right")) > (this.position + $(this.tabsBarId).getWidth()) ) {
			// move because right border of tab is not visible
			this.moveFor(false, absPosition - $(this.tabsBarId).getWidth() - this.position + this.stdMoveOverhead);
		}
	},
	gotoTabNumber: function(number) {
	    this.yetiiTabs.show(number);
	},
	gotoTab: function(tabContentDiv) {
	    tabs = $(this.contentContainerId).childElements();
		for (var i = 0; i < tabs.length; i++) {
		    if (tabs[i] == tabContentDiv) {
		        this.gotoTabNumber(i+1);
		        break;
		    }
		}
	},
	getOffsetPositionOfTab: function(index, rightLeft) {
		tabs = $(this.tabsBarId).childElements();
		
		if (index < 0 || index > tabs.length-1)
			index = tabs.length-1;
		
		sum = 0;
		// first assume rightLeft is "right"
		for (var i = 0; i <= index; i++) {
			sum += getBoxModelWidth(tabs[i], "outer");
		}
		
		// now subtract the last tabs width if rightLeft is "left"
		if (rightLeft == "left")
			sum -= getBoxModelWidth(tabs[index], "outer");
		return sum;
	},
	unlock: function() {
		this.unlocked = true;
	}
});




/*
Yetii - Yet (E)Another Tab Interface Implementation
version 1.6
http://www.kminek.pl/lab/yetii/
Copyright (c) Grzegorz Wojcik
Code licensed under the BSD License:
http://www.kminek.pl/bsdlicense.txt
*/

function Yetii() {

	this.defaults = {
		
		id: null,
		tabsId: null,
		active: 1,
		interval: null,
		wait: null,
		persist: null,
		tabclass: 'tab',
		activeclass: 'active',
		callback: null,
		leavecallback: null
	
	};
	
	this.activebackup = null;
	
	for (var n in arguments[0]) { this.defaults[n]=arguments[0][n]; };	
	
	this.getTabs = function() {
        	
        var retnode = [];
        var elem = document.getElementById(this.defaults.id).getElementsByTagName('*');
		
        var regexp = new RegExp("(^|\\s)" + this.defaults.tabclass.replace(/\-/g, "\\-") + "(\\s|$)");
	
        for (var i = 0; i < elem.length; i++) {
        	  if (regexp.test(elem[i].className)) retnode.push(elem[i]);
        }
    
        return retnode;
    
    };

	this.show = function(number) {
      
		if (number < 1 || number > this.tabs.length) return;
		
      for (var i = 0; i < this.tabs.length; i++) {
			
			this.tabs[i].style.display = ((i+1)==number) ? 'block' : 'none';
				
			if ((i+1)==number) {
				this.addClass(this.links[i], this.defaults.activeclass);
			} else {
				this.removeClass(this.links[i], this.defaults.activeclass);
			}
		
		}
		
		
		if (this.defaults.leavecallback && (number != this.activebackup)) this.defaults.leavecallback(this.defaults.active);
		
		this.activebackup = number;
		
		
		this.defaults.active = number;
		
		if (this.defaults.callback) this.defaults.callback(number);
		
    
    };
	
	this.rotate = function(interval) {
    
        this.show(this.defaults.active);
        this.defaults.active++;
    
        if (this.defaults.active > this.tabs.length) this.defaults.active = 1;
    
	
        var self = this;
		
		if (this.defaults.wait) clearTimeout(this.timer2);
		 
        this.timer1 = setTimeout(function(){self.rotate(interval);}, interval*1000);
    
    };
	
	this.next = function() {

        var _target = (this.defaults.active + 1 > this.tabs.length) ? 1 : this.defaults.active + 1;
        this.show(_target);
        this.defaults.active = _target;

    };
	
	this.previous = function() {

        var _target = ((this.defaults.active - 1) == 0) ? this.tabs.length : this.defaults.active - 1;
        this.show(_target);
        this.defaults.active = _target; 

    };
	
	this.previous = function() {
		
		this.defaults.active--;
    	if(!this.defaults.active) this.defaults.active = this.tabs.length;
		this.show(this.defaults.active);
	
	};
	
	this.gup = function(name) {
		name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
		var regexS = "[\\?&]"+name+"=([^&#]*)";
		var regex = new RegExp( regexS );
		var results = regex.exec( window.location.href );
		if (results == null) return null;
		else return results[1];
	};
	
	this.parseurl = function(tabinterfaceid) {
		
		var result = this.gup(tabinterfaceid);
		
		if (result==null) return null;
		if (parseInt(result)) return parseInt(result); 
		if (document.getElementById(result)) {	
			for (var i=0;i<this.tabs.length;i++) {
				if (this.tabs[i].id == result) return (i+1);
			}
		}
		
		return null;
		
	};

	this.createCookie = function(name,value,days) {
		if (days) {
			var date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000));
			var expires = "; expires="+date.toGMTString();
		}
		else var expires = "";
		document.cookie = name+"="+value+expires+"; path=/";
	};
	
	this.readCookie = function(name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		}
		return null;
	};
	
	this.contains = function(el, item, from) {
		return el.indexOf(item, from) != -1;
	};
	
	this.hasClass = function(el, className){
		return this.contains(el.className, className, ' ');
	};
	
	this.addClass = function(el, className){
		if (!this.hasClass(el, className)) el.className = (el.className + ' ' + className).replace(/\s{2,}/g, ' ').replace(/^\s+|\s+$/g, '');
	};
	
	this.removeClass = function(el, className){
		el.className = el.className.replace(new RegExp('(^|\\s)' + className + '(?:\\s|$)'), '$1');
		el.className.replace(/\s{2,}/g, ' ').replace(/^\s+|\s+$/g, '');
	};

	this.refresh = function() {
    	this.links = document.getElementById(this.defaults.tabsId).getElementsByTagName('div');
    	this.tabs = this.getTabs();
    	
    	this.defaults.active = (this.parseurl(this.defaults.id)) ? this.parseurl(this.defaults.id) : this.defaults.active;
		if (this.defaults.persist && this.readCookie(this.defaults.id)) this.defaults.active = this.readCookie(this.defaults.id);  
		this.activebackup = this.defaults.active;
		this.show(this.defaults.active);
		
    	var self = this;
		for (var i = 0; i < this.links.length; i++) {
			if (this.links[i].customindex) continue;
			this.links[i].customindex = i+1;
			this.links[i].onclick = function(){
				if (self.timer1) clearTimeout(self.timer1);
				if (self.timer2) clearTimeout(self.timer2); 
				
				self.show(this.customindex);
				if (self.defaults.persist) self.createCookie(self.defaults.id, this.customindex, 0);
				
				if (self.defaults.wait) self.timer2 = setTimeout(function(){self.rotate(self.defaults.interval);}, self.defaults.wait*1000);
				
				return false;
			};
		 }
		 
		 if (this.defaults.interval) this.rotate(this.defaults.interval);
   };
   
   if (this.getTabs().length > 0)
       this.refresh();
	
};