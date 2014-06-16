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
Ext.define('EdiromOnline.controller.desktop.TopBar', {

    extend: 'Ext.app.Controller',

    views: [
        'desktop.TopBar'
    ],

    init: function() {

        this.topbar = null;

        this.control({
            'topbar': {
                afterrender: this.onTopbarRendered
            }
        });
    },

    onTopbarRendered: function(topbar) {

        this.topbar = topbar;

        this.works = Ext.getStore('Works');
        this.works.on('load', function() {
            this.createWorkMenu();
        }, this);

        if(!this.works.isLoading())
            this.createWorkMenu();

    },

    createWorkMenu: function() {

        var me = this;

        Ext.getStore('Works').each(function(work) {
            var me = this;
            var workId = work.get('id');
            var active = (me.application.activeWork == workId);

            me.topbar.workCombo.menu.add({
                xtype: 'menucheckitem',
                id: 'workMenu_' + workId,
                group: 'works',
                checked: active,
                text: work.get('title'),
                checkHandler: Ext.bind(me.setSelectedWork, me, [me.topbar, workId], true)
            });
            
            if(active) me.topbar.workCombo.setText(work.get('title'));
        }, me);
    },

    setSelectedWork: function(menuItem, checked, topbar, workId) {

        if(!checked) return;

        var work = Ext.getStore('Works').getById(workId);
        topbar.workCombo.setText(work.get('title'));

        this.application.selectWork(workId);
    }
});

