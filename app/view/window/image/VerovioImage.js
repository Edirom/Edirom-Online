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
Ext.define('EdiromOnline.view.window.image.VerovioImage', {
	extend: 'Ext.panel.Panel',
	
	layout: 'fit',
		
	currId: null,
	renderer: null,
	text: null,
	imageSet: null,
	bodyDoc: null,
	pageSpinner: null,
	pageHeight: null,
	pageWidth: null,
	
	initComponent: function () {
		
		var me = this;
		me.currId = me.id;
		
		me.html = '<div id="' + me.id + '_audioCont" class="audioViewContent"><iframe id="' + me.id + '_audioContIFrame" style="width:100%; height:100%; border:none; background-color:white;"></iframe></div>';
		
		me.callParent();
	},
	
	setBody: function (bodyDoc) {
		var me = this;
		me.bodyDoc = bodyDoc;
	},
		
	setImageSet: function (imageSet) {
		var me = this;
		me.imageSet = imageSet;
		
		var contEl = me.el.getById(me.id + '_audioContIFrame');
		contEl.set({'src': imageSet});
		
		me.pageSpinner.setStore(6);		
		 var iframe = document.getElementById(me.id + '_audioContIFrame');
		var doc = iframe.contentWindow.document;
	},
	
	getContentConfig: function() {
        var me = this;
        return {
            id: this.id
        };
    },
	
	showContinuousWidth: function (path) {
	
		var me = this;
		
		var contEl = me.el.getById(me.id + '_audioContIFrame');
		contEl.set({'src': path});
	},
	
	showContinuousHight: function (path) {
		
		var me = this;
		
		var contEl = me.el.getById(me.id + '_audioContIFrame');
		contEl.set({'src': path});
		
	},
	
	setPageSpinner: function (pageSpinner) {
		this.pageSpinner = pageSpinner;
	}
});
/*vrvToolkit = new verovio.toolkit();
            	$.ajax({{
                	url: '$newUri', 
                	dataType: "text", 
                	success: function(data) {{
                	
                	if('$action:' === 'load'){{              	
                		var pageHeight = $(document).height()* 100 / 33;
						var pageWidth = $(document).width()* 100 / 33;
                		var options = JSON.stringify({{
                			scale: 33,
							noLayout: 0,
							pageHeight: pageHeight,
							pageWidth: pageWidth,
							adjustPageHeight: 1
                		}});
                		vrvToolkit.setOptions( options );
                		vrvToolkit.loadData(data);
                		var svg = vrvToolkit.renderPage(1, "");
                		$("#output").html(svg);                  
               		}}
               		if ('$action' === 'strechWidth'){{
            			var options = JSON.stringify({{
							scale: 33,
							noLayout: 1
						}});
						vrvToolkit.setOptions(options);
						vrvToolkit.loadData(data);
						var svg = vrvToolkit.renderPage(1, options);
				
						$("#output").html(svg);
					}}
					if ('$action' === 'continuousHight'){{
            			var pageHeight_1 = $(document).height();
						var pageWidth_1 = $(document).width();
						var options = JSON.stringify({{
							scale: 33,
							pageHeight: pageHeight_1,
							pageWidth: pageWidth_1,
							noLayout: 0
						}});
						vrvToolkit.setOptions(options);
						vrvToolkit.redoLayout();
		
						var svg = vrvToolkit.renderPage(1, options);
		
						$("#output").html(svg);
					}}
               		}}
            	}});*/