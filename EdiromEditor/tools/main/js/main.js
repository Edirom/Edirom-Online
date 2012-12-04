if(typeof(console) == 'undefined' || typeof(console.log) == 'undefined') {
    
    console = {}
    
    console.log = function(message){
        alert(message);
    }
}


/**
 * calculates the objects position on the browser window
 * 
 * @param {Element} obj The element
 */
de.edirom.server.main.getPositionOnPage = function(obj) {
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

/**
 * Opens an ajax request to the comet servlet, to get actual data modifications
 * 
 * @param {Function} success The function to execute on success
 * @param {Function} failure The function to execute on failure
 */
de.edirom.server.main.registerCometListener = function(success, failure, lastEvent) {
    
    new Ajax.Request('/comet/', {
    	method:'get',
    	parameters: {lastEvent:lastEvent},
    	onSuccess: function(transport) {
    	    
    	    var resp = transport.responseText;
            
            resp = resp.strip();
            
            var tokens = resp.split(':');
            var lastEvent = -1;
            if(tokens[0] == "lastEvent") {
                lastEvent = tokens[1];
                resp = resp.substring("lastEvent:".length + tokens[1].length + ":".length);
            }

            de.edirom.server.main.registerCometListener(success, failure, (lastEvent == -1?null:lastEvent));

            de.edirom.server.main.logger.debug('new comet registered');

            success(resp);
            
            de.edirom.server.main.logger.debug('comet success function finished');
    	},
    	onFailure: function(transport) {
    	    failure();
            
            //TODO: Hier sollten u.U. noch zwei weitere Versuche unternommen werden
            // der Benutzer muss dann die Möglichkeit bekommen, manuell weitere Versuche zu starten
            //de.edirom.server.main.registerCometListener(success, failure, lastEvent);
    	}
    });
}

de.edirom.server.main.Logger = function(module, level) {
        
    this.TRACE = 0;
    this.DEBUG = 1;
    this.INFO = 2;
    this.WARN = 3;
    this.ERROR = 4;
    this.FATAL = 5;
    
    this.module = module;
    
    this.level = level ? level : this.TRACE;
        
    var log = function(level, message) {
    
        new Ajax.Request('/logger/', {
    	    method:'get',
    	    parameters: {level:level,
    	                 module:this.module,
    	                 message:message}
    	});
    }
        
    this.trace = function(message) {
        if(this.level <= this.TRACE)
            log('trace', message);
    }
    
    this.debug = function(message) {
        if(this.level <= this.DEBUG)
            log('debug', message);
    }
    
    this.info = function(message) {
        if(this.level <= this.INFO)
            log('info', message);
    }
    
    this.warn = function(message) {
        if(this.level <= this.WARN)
            log('warn', message);
    }
    
    this.error = function(message) {
        if(this.level <= this.ERROR)
            log('error', message);
    }
    
    this.fatal = function(message) {
        if(this.level <= this.FATAL)
            log('fatal', message);
    }
}

de.edirom.server.main.logger = new de.edirom.server.main.Logger('main');

/**
 * Opens a dialog with predefined button labels for a "delete"-question
 * 
 * @param {String} message The question the dialog should display
 * @param {Array} options An array of options. Possible options are:
 * cancelFunc: the function to call, if the cancel button is hit (ESC) and
 * deleteFunc: the function to call, if the delete button is hit (RETURN)
 */
de.edirom.server.main.deleteItem = function(message, options) {
    options['firstButton'] = 'Nein';
    options['secondButton'] = 'Ja';
    options['firstFunc'] = options['cancelFunc'];
    options['secondFunc'] = options['deleteFunc'];
    
    (new de.edirom.server.main.Popup(message, options)).showPopup();
}


/**
 * A Popup with two buttons
 * @class A popup dialog
 * 
 * @param {String} _message The message the dialog should display
 * @param {Array} _options An array of options. Possible options are:
 * firstButton: the text for the first button,
 * firstFunc: the function to call, if the first button is hit (ESC),
 * secondButton: the text for the first button and
 * secondFunc: the function to call, if the second button is hit (RETURN)
 */
de.edirom.server.main.Popup = function(_message, _options, _title, _detailedMessage) {

    var self = this;
        
    var message = _message;
    var options = _options;
    var title = _title;
    var detailedMessage = _detailedMessage;
    
    var firstButton = options['firstButton']?options['firstButton']:'Abbrechen';
    var firstFunc = options['firstFunc']?options['firstFunc']:';';
    var secondButton = options['secondButton']?options['secondButton']:'Bestätigen';
    var secondFunc = options['secondFunc']?options['secondFunc']:';';
    
    var firstButtonVisible = options['firstButtonVisible']?options['firstButtonVisible']:'true';
    var secondButtonVisible = options['secondButtonVisible']?options['secondButtonVisible']:'true';
    
    
    /**
     * Creates a popup if needed and sets it's visibility to visible 
     */
    this.showPopup = function() {
    
    	if(!$('popup_background')) {
    		var popup_background = document.createElement('div');
    		popup_background.id = 'popup_background';
    		    		
    		document.getElementsByTagName('body')[0].appendChild(popup_background);
    	}
    	
    	if(!$('popup')) {
    		var popup = document.createElement('div');
    		popup.id = 'popup';
    		
            var header = (typeof(title) != 'undefined')?'<h1>' + title + '</h1>':'<h1>Hinweis</h1>';
            
            var text = '<div id="popupMessage">'
                        + message
                     + '</div>';
                     
            var details = (typeof(detailedMessage) != 'undefined')?'<div id="popupDetails">' + detailedMessage + '</div>':'';                 
            
    		var buttons = '<div id="popupButtons" class="saveBox">'
    		                + '<span id="Popup_firstButton" class="saveBoxButton">' + firstButton + '</span>'
    		                + '<span id="Popup_secondButton" class="saveBoxButton">' + secondButton + '</span>'
    		            + '</div>';
    		popup.innerHTML = header + text + details + buttons;
    		
    		document.getElementsByTagName('body')[0].appendChild(popup);
    	}
    	
    	if(firstButtonVisible == 'true') $('Popup_firstButton').show();
    	else $('Popup_firstButton').hide();

        if(secondButtonVisible == 'true') $('Popup_secondButton').show();
    	else $('Popup_secondButton').hide();
    	
        Event.observe(window, 'keyup', handleKeys);
        Event.observe($('Popup_firstButton'), 'click', firstButtonClick);
        Event.observe($('Popup_secondButton'), 'click', secondButtonClick);
    }
    
    /**
     * Closes an existing popup and unregisters listeners
     * @function
     */
    var closePopup = function() {
        Event.stopObserving(window, 'keyup', handleKeys);
        Event.stopObserving($('Popup_firstButton'), 'click', firstButtonClick);
        Event.stopObserving($('Popup_secondButton'), 'click', secondButtonClick);
    
        var parent = $('popup').parentNode;
        parent.removeChild($('popup'));
        parent.removeChild($('popup_background'));
    }
    
    /**
     * Handles ESC and RETURN keys
     * @function
     *
     * @param {Object} e The event which invoked this method
     */
    var handleKeys = function(e) {
        if(e.keyCode == Event.KEY_RETURN)
            secondButtonClick();
        
        if(e.keyCode == Event.KEY_ESC)
            firstButtonClick();
    }
    
    /**
     * Code to run, when first button is clicked
     * @function
     */
    var firstButtonClick = function() {
        closePopup();
        
        if(typeof(firstFunc) == 'function')
            firstFunc();
        else
            eval(firstFunc);
    }
    
    /**
     * Code to run, when second button is clicked
     * @function
     */
    var secondButtonClick = function() {
        closePopup();
        
        if(typeof(secondFunc) == 'function')
            secondFunc();
        else
            eval(secondFunc);
    }
    
    return self;
}
