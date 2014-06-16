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
Ext.define('EdiromOnline.model.Edition', {

    requires: [],

    extend: 'Ext.data.Model',
    fields: ['id', 'doc', 'name'],

    proxy: {
        type: 'ajax',
        url: 'data/xql/getEdition.xql'
    },

    /**
     * Concordances
     */
    concordances: null,

    getConcordances: function(fn, args) {

        var me = this;

        if(me.concordances == null)
            me.concordances = new Ext.util.MixedCollection();

        if(!me.concordances.containsKey(args.workId))
            me.fetchConcordances(args.workId, fn);
        else
            fn(me.concordances.get(args.workId));
    },

    fetchConcordances: function(workId, fn) {

        var me = this;

        window.doAJAXRequest('data/xql/getConcordances.xql',
            'GET', 
            {
                id: me.get('doc'),
                workId: workId
            },
            function(response){
                var data = response.responseText;
                
                try {
                    data = Ext.JSON.decode(data);
                }catch(e) {
                    throw e;
                    return;
                }

                me.concordances.add(workId, Ext.create('Ext.data.Store', {
                    fields: ['name', 'groups', 'connections'],
                    data: data
                }));

                fn(me.concordances.get(workId));
            }
        );
    }
});
