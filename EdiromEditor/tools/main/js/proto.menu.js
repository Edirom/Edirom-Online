/** 
 * @description		Prototype.js based simple context menu
 * @author        Juriy Zaytsev; kangax [at] gmail [dot] com; http://thinkweb2.com/projects/prototype/
 * @version       0.71
 * @date          4/17/09
 * @requires      prototype.js 1.6+
*/

if (Object.isUndefined(Proto)) { var Proto = { } }

Proto.Menu = Class.create((function(){
  
  var e = Prototype.emptyFunction;
  var isIE = Prototype.Browser.IE;
  
  var defaultOptions = {
		selector: '.contextmenu',
		className: 'protoMenu',
		pageOffset: 25,
		fade: false,
		zIndex: 100,
		beforeShow: e,
		beforeHide: e,
		beforeSelect: e
	};
	
	var isContextMenuSupported = (function(el){
	  el.setAttribute('oncontextmenu', '');
	  var result = typeof el.oncontextmenu == 'function';
	  el = null;
	  return result;
	})(document.createElement('div'));
	
  return {
    initialize: function() {
  		this.options = Object.extend(Object.clone(defaultOptions), arguments[0] || { });
  		this.shim = new Element('iframe', {
  			style: 'position:absolute;filter:progid:DXImageTransform.Microsoft.Alpha(opacity=0);display:none',
  			src: 'javascript:false;',
  			frameborder: 0
  		});
  		this.options.fade = this.options.fade && !Object.isUndefined(Effect);
  		this.container = new Element('div', {
  		  className: this.options.className, 
  		  style: 'display:none'
  		})
  		.observe('contextmenu', Event.stop)
  		.observe('click', this.onClick.bind(this));
  		var list = new Element('ul');
  		this.options.menuItems.each(function(item) {
  			list.insert(
  				new Element('li', {className: item.separator ? 'separator' : ''}).insert(
  					item.separator 
  						? '' 
  						: Object.extend(new Element('a', {
  							href: '#',
  							title: item.name,
  							className: (item.className || '') + (item.disabled ? ' disabled' : ' enabled')
  						}), { _callback: item.callback })
  						.update(item.name)
  				)
  			)
  		}.bind(this));
  		$(document.body).insert(this.container.insert(list).observe('contextmenu', Event.stop));
  		isIE && $(document.body).insert(this.shim);
  		document.observe('click', function(e) {
  			this.hide(e);
  		}.bind(this));


        $$(this.options.selector).invoke('observe', isContextMenuSupported ? 'contextmenu' : 'click', function(e){
  			if (!isContextMenuSupported && !e.ctrlKey) {
  				return;
  			}
  			this.show(e);
  		}.bind(this));
  	},
  	show: function(e) {
  		e.stop();
  		
  		if(typeof window.contextmenu != 'undefined' && window.contextmenu != null)
  		    window.contextmenu.hide(e);
  		
  		window.contextmenu = this;
  		
  		this.options.beforeShow(e);
  		var x = Event.pointer(e).x,
  			y = Event.pointer(e).y,
  			vpDim = document.viewport.getDimensions(),
  			vpOff = document.viewport.getScrollOffsets(),
  			elDim = this.container.getDimensions(),
  			elOff = {
  				left: ((x + elDim.width + this.options.pageOffset) > vpDim.width 
  					? (vpDim.width - elDim.width - this.options.pageOffset) : x) + 'px',
  				top: ((y - vpOff.top + elDim.height) > vpDim.height && (y - vpOff.top) > elDim.height 
  					? (y - elDim.height) : y) + 'px'
  			};
  		this.container.setStyle(elOff).setStyle({zIndex: this.options.zIndex});
  		if (isIE) { 
  			this.shim.setStyle(Object.extend(Object.extend(elDim, elOff), {zIndex: this.options.zIndex - 1})).show();
  		}
  		this.options.fade ? Effect.Appear(this.container, {duration: 0.25}) : this.container.show();
  		this.event = e;
  	},
  	hide: function(e) {
  	    if (this.container.visible()) {// && !e.isRightClick()) {
  			this.options.beforeHide(e);
  			if (isIE) this.shim.hide();
  			this.container.hide();
  			
  			window.contextmenu = null;
		}
  	},
  	onClick: function(e, el) {
  	  if ((el = e.findElement('li a')) && el.descendantOf(this.container)) {
  	    e.stop();
  	    if (el._callback && !el.hasClassName('disabled')) {
    			this.options.beforeSelect(e, el);
    			if (isIE) this.shim.hide();
    			this.container.hide();
    			el._callback(this.event);
    		}
  	  }
  	}
  }
})());