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
Ext.define('EdiromOnline.view.utils.EnhancedSlider', {
    extend: 'Ext.slider.Single',

    requires: [
    ],

    value: 50,
    increment: 1,
    minValue: 0,
    maxValue: 100,
    useTips: false,
    data: [],

    initComponent: function () {

        var me = this;
        me.callParent();
    },

    setData: function(data, labelField) {
        var me = this;
        me.data = data;
        me.labelField = labelField;
        me.setMaxValue(me.data.length - 1);
        me.setValue(0);
    },

    getEnhancedValue: function() {
        var me = this;
        var item = me.getRawValue();
        return item[me.labelField];
    },

    setEnhancedValue: function(value) {
        var me = this;
        var array = Ext.Array.filter(me.data, function(item) {
            return item[this.labelField] == value;
        }, me);

        if(array.length > 0) {
            var index = Ext.Array.indexOf(me.data, array[0]);
            me.setValue(index);
            return true;
        }

        return false;
    },

    getRawValue: function() {
        var me = this;
        var index = me.getValue();
        return me.data[index];
    },

    prev: function() {
        var index = this.getValue();

        if(index <= 0) return false;

        this.setValue(index - 1);
        return true;
    },

    next: function() {
        var index = this.getValue();

        if(index >= this.maxValue) return false;

        this.setValue(index + 1);
        return true;
    }
});