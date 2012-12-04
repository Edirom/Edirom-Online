de.edirom.areArraysEqual = function(array1, array2) {
    if(typeof(array1) != typeof(array2))
        return false;
        
    if(!array1[0] || !array2[0])
        return false;
        
    if(array1.length != array2.length)
        return false;
        
    var length = array1.length;
    for(var i = 0; i < length; i++) {
        if(array1[i] !== array2[i])
            return false;
    }
    
    return true;
}

de.edirom.closeWindow = function() {
    window.status = 'edirom:de.edirom.server:closeWindow';
}

de.edirom.checkChanged = function(elemId) {
    
    if(!$(elemId) || !$('old_' + elemId))
        return false;
    
//	console.log($(elemId).value + ' eq ' + $('old_' + elemId).value + '?');

    if($(elemId).value == $('old_' + elemId).value)
        return false;
        
    return true;
}

de.edirom.getPositionOnPage = function(obj) {
    var left = obj.offsetLeft;
    var top = obj.offsetTop;
    
    if(obj.offsetParent) {
        while(obj = obj.offsetParent) {
            left += obj.offsetLeft;
            top += obj.offsetTop;
        }
    }
    
    return [left, top];
}

de.edirom.changeActiveTab = function(tabId, contentId) {
	var tabs = document.getElementById(tabId).parentNode.childNodes;
	for(var i = 0; i < tabs.length; i++) {
		if(typeof tabs[i].removeClassName != 'undefined')
		    tabs[i].removeClassName('activeTab');
    }
		
	var contents = document.getElementById("ediromDetail").childNodes;
	for(var i = 0; i < contents.length; i++) {
		if(contents[i].className && contents[i].className.indexOf("ediromDetailContent") != -1)
			contents[i].style.display = "none";
	}
		
	document.getElementById(contentId).style.display = "block";
	
	document.getElementById(tabId).addClassName('activeTab');
}


de.edirom.ImportListener = function(script, func) {
    var self = this;
    var scriptLoaded = false;
    var unique = 'scriptLoaded_' + (new Date()).getTime();
    
    this.scriptLoaded = function() {
    
        if(scriptLoaded)
            return;
        
        scriptLoaded = true;
        Ajile.RemoveImportListener(eval(unique));

        func();
    }
    
    window[unique] = self.scriptLoaded;
    Ajile.AddImportListener(eval(unique));
}

de.edirom.WindowResize = function() {
    var self = this;
    
    var width;
    var height;
    
    var listeners = new Array();
    
    window.onresize = resize;
    width = getWidth();
    height = getHeight();
    
    function resize() {
        
        if(width != getWidth() || height != getHeight()) {
            width = getWidth();
            height = getHeight();

            for(var i = 0; i < listeners.length; i++)
                listeners[i]();
        }
    }
    
    function getWidth() {
        if(window.innerWidth)
            return window.innerWidth;
        
        else if (document.body && document.body.offsetWidth)
            return document.body.offsetWidth;
        
        return 0;
    }
    
    function getHeight() {
        if(window.innerHeight)
            return window.innerHeight;
        
        else if (document.body && document.body.offsetHeight)
            return document.body.offsetHeight;
        
        return 0;
    }
    
    this.addListener = function(func) {
        if(listeners.indexOf(func) == -1)
            listeners.push(func);
    }
    
    this.removeListener = function(func) {
        if(listeners.indexOf(func) != -1)
            listeners = listeners.without(func);
    }
}

var windowResize = new de.edirom.WindowResize();

/*
* Orginal: http://adomas.org/javascript-mouse-wheel/
* prototype extension by "Frank Monnerjahn" <themonnie@gmail.com>
*/
Object.extend(Event, {
    wheel: function (event) {
        var delta = 0;
        if (! event) event = window.event;
        if (event.wheelDelta) {
            delta = event.wheelDelta / 120;
            if (window.opera) delta = - delta;
        } else if (event.detail) {
            delta = - event.detail / 3;
        }
        return Math.round(delta);
        //Safari Round
    }
});






// TODO: aufräumen



function checkContentNotEmpty(elem) {

	if(elem.value.strip().length == 0) 
		return false;
	
	else
	    return true;
}

function requestFocus(elem) {
	$(elem).focus();
	$(elem).select();
}


var popup;

function openPopup(_message, _okButton, _cancelButton, _okFunc) {
    popup = new Popup(_message, _okButton, _cancelButton, _okFunc);
    popup.showPopup();
}

function Popup(_message, _okButton, _cancelButton, _okFunc) {
    var self = this;
    
    var width = 350;
    var height = 130;
    
    var message = _message;
    
    var okButton = _okButton;
    var cancelButton = _cancelButton;
    
    var okFunc = _okFunc + ';';
    
    this.showPopup = function() {
        Event.observe(window, 'keyup', handleKeys);
    
    	if(!$('popup_background')) {
    		var popup_background = document.createElement('div');
    		popup_background.id = 'popup_background';
    		popup_background.style.position = 'fixed';
    		
    		popup_background.style.top = '0px';
    		popup_background.style.left = '0px';
    		popup_background.style.bottom = '0px';
    		popup_background.style.right = '0px';
    		
    		popup_background.style.backgroundColor = '#000000';
    		popup_background.style.opacity = '0.5';
    		
    		popup_background.style.zIndex = '9000';
    		
    		document.getElementsByTagName('body')[0].appendChild(popup_background);
    	}
    	
    	if(!$('popup')) {
    		var popup = document.createElement('div');
    		popup.id = 'popup';
    		popup.style.position = 'fixed';
    		
    		popup.style.width = width + 'px';
    		popup.style.height = height + 'px';
    		
    		popup.style.top = '50%';
    		popup.style.left = '50%';
    		
    		popup.style.marginLeft = '-' + Math.round(width / 2) + 'px';
    		popup.style.marginTop = '-' + Math.round(height / 2) + 'px';
    		
    		popup.style.backgroundColor = '#eeeeee';
    		
    		popup.style.zIndex = '9001';
    
            var text = '<div style="position:absolute; top:20px; left:20px; right:20px; bottom:50px;">'
                        + message
                     + '</div>';
                     
    		var buttons = '<div style="position:absolute; bottom:10px; right:10px;" class="saveBox">'
    		                + '<span class="saveBoxButton" onclick="popup.closePopup();">' + cancelButton + '</span>'
    		                + '<span class="saveBoxButton" onclick="popup.closePopup();' + okFunc + '">' + okButton + '</span>'
    		            + '</div>';
    		popup.innerHTML = text + buttons;
    		
    		document.getElementsByTagName('body')[0].appendChild(popup);
    	}
    }
    
    this.closePopup = function() {
        Event.stopObserving(window, 'keyup', handleKeys);
    
        var parent = $('popup').parentNode;
        parent.removeChild($('popup'));
        parent.removeChild($('popup_background'));
    }
    
    var handleKeys = function(e) {
        if(e.keyCode == Event.KEY_RETURN) {
            self.closePopup();
            eval(okFunc);
        }
        
        if(e.keyCode == Event.KEY_ESC)
            self.closePopup();
    }
}
