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
Ext.define('EdiromOnline.controller.desktop.Desktop', {

    extend: 'Ext.app.Controller',

    views: [
        'desktop.Desktop'
    ],

    init: function() {
        this.desktop = null;

        this.control({
            'desktop': {
                afterrender: this.onDesktopRendered
            },
            'topbar button[action=openSearchWindow]': {
                click: this.onOpenSearchWindow
            },
            'topbar #searchTextFieldTop': {
                specialkey: this.onSpecialKey
            }
        });
    },

    onDesktopRendered: function(desktop) {
        this.desktop = desktop;
        this.desktop.taskbar.addListener('switchDesktop', this.switchDesktop, this);

        this.desktop.taskbar.addListener('openConcordanceNavigator', this.openConcordanceNavigator, this);
        
        var concNavOnStart = window.getPreference('concordance_navigator_open_on_start', true);
        if(concNavOnStart != null && concNavOnStart) {
            this.desktop.taskbar.setConcordanceNavigatorButtonToggleState(true, true);
            Ext.defer(this.openConcordanceNavigator, 1000, this);
        }
        
        this.desktop.taskbar.addListener('openHelp', this.openHelp, this);
        //TODO: Suchfenster einbauen
        /*this.desktop.taskbar.addListener('openSearchWindow', this.openSearchWindow, this);*/

        this.desktop.taskbar.addListener('sortGrid', this.sortGrid, this);
        this.desktop.taskbar.addListener('sortHorizontally', this.sortHorizontally, this);
        this.desktop.taskbar.addListener('sortVertically', this.sortVertically, this);
    },

    addWindowToActiveDesktop: function(window) {
        this.desktop.addWindow(window);
    },

    getActiveDesktop: function() {
        return this.desktop;
    },

    openConcordanceNavigator: function() {
        var me = this;
        me.desktop.openConcordanceNavigator();
    },

    openHelp: function() {
        var me = this;
        me.desktop.openHelp();
    },
    
    onSpecialKey: function(field, e) {
        var me = this;
        
        if (e.getKey() == e.ENTER) {
            var term = field.getValue();
            me.desktop.openSearchWindow(term);
        }
    },

    onOpenSearchWindow: function(button, event, args) {
        var me = this;
        var term = button.textField.getValue();
        me.desktop.openSearchWindow(term);
    },

    switchDesktop: function(desk) {
        this.desktop.switchDesktop(desk);
    },

    cloneWinsCollectionWithoutMinimized: function(wins) {
        var set = new Ext.util.MixedCollection();

        wins.each(function(win) {
            if(!win.minimized) set.add(win);
        });

        return set;
    },

    sortHorizontally: function() {
        var desktop = this.desktop;
        var wins = desktop.getActiveWindowsSet(true);
        wins = this.cloneWinsCollectionWithoutMinimized(wins);

        if(wins == null || wins.length == 0)
	        return;

        var size = desktop.getUsableSize();

        var left = 0;
        var n = wins.length;
		var w = size.width/n;

		wins.each(function(win) {
            
            var contentConfig = win.getContentConfig();
            
            var to = {
                y: desktop.getTopBarHeight() + 2,
                x: left + 3,
                width: w - 6,
                height: size.height - 4
            };

            win.animate(Ext.apply({
                duration: 1000,
                listeners: {
                    afteranimate: Ext.Function.bind(win.setContentConfig, win, [contentConfig])
                },
                to: to
            }, true));

			left = left + w;
		});
    },

    sortVertically: function() {
        var desktop = this.desktop;
        var wins = desktop.getActiveWindowsSet(true);
        wins = this.cloneWinsCollectionWithoutMinimized(wins);

        if(wins == null || wins.length == 0)
	        return;

        var size = desktop.getUsableSize();

        var top = desktop.getTopBarHeight();
        var n = wins.length;
		var h = size.height/n;

		wins.each(function(win) {
		  
		  var contentConfig = win.getContentConfig();
		
            var to = {
                y: top + 2,
                x: 3,
                width: size.width - 6,
                height: h - 4
            };

            win.animate(Ext.apply({
                duration: 1000,
                listeners: {
                    afteranimate: Ext.Function.bind(win.setContentConfig, win, [contentConfig])
                },
                to: to
            }, true));

			top = top + h;
		});
    },

    sortGrid: function() {
        var desktop = this.desktop;
        var wins = desktop.getActiveWindowsSet(true);
        wins = this.cloneWinsCollectionWithoutMinimized(wins);

        if(wins == null || wins.length == 0)
            return;

        var size = desktop.getUsableSize();

        var left = 0;
        var top = desktop.getTopBarHeight();

        var optArray = this.findOptimalLenBrt(wins.length);

        wins.each(function(win) {
            if (!win.isVisible() || win.maximized)
                return;

            var contentConfig = win.getContentConfig();

            if((left + (size.width / optArray[0])) > size.width) {
			    top = top + (size.height / optArray[1]);
				left = 0;
			}

            var to = {
                y: top + 2,
                x: left + 3,
                width: size.width / optArray[0] - 6,
                height: size.height / optArray[1] - 4
            };

            win.animate(Ext.apply({
                duration: 1000,
                listeners: {
                    afteranimate: Ext.Function.bind(win.setContentConfig, win, [contentConfig])
                },
                to: to
            }, true));

            left = left + (size.width / optArray[0]);
        });
    },
    getGridPositioning: function(numWins) {
        var desktop = this.desktop;
        var size = desktop.getUsableSize();

        var positions = {};

        var left = 0;
        var top = desktop.getTopBarHeight();

        var optArray = this.findOptimalLenBrt(numWins);

        for(var i = 0; i < numWins; i++) {

            if((left + (size.width / optArray[0])) > size.width) {
			    top = top + (size.height / optArray[1]);
				left = 0;
			}

            positions['win_' + i] = {
                y: top + 2,
                x: left + 3,
                width: size.width / optArray[0] - 6,
                height: size.height / optArray[1] - 4
            };

            left = left + (size.width / optArray[0]);
        }

        return positions;
    },

    findOptimalLenBrt: function(number){
    	//finds optimal length breadth for each window [number = total windows]
		if(number == 1)
			return [1,1];

		else if(number == 2)
			return [2,1];

		//number should be non prime
		var isPrime = this.isPrime(number);

		if(isPrime)
			number = number+1;

		//Length should be greater than breadth
		var diff = number;
		var j = 1;
		var opti;
		var optj;

        for(var i = 1; i <= number/2; i++) {
			if(number % i != 0)
				continue;

			j = number/i;

			var tmpDiff = j - i;

			if(tmpDiff < diff && tmpDiff>=0) {
				diff = tmpDiff;
				opti = i;
				optj = j;
			}
		}

        if(optj < opti)
			return [opti,optj];

		return [optj,opti];
	 },

    isPrime:function(number){
    	for(var i = 2; i <= number / 2 + 1; i++) {
			if(number % i == 0) {
				return false;
			}

		}
    	return true;
    }
});

