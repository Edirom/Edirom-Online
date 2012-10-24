/**
 *  Edirom Online
 *  Copyright (C) 2011 The Edirom Project
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
 *
 *  ID: $Id: Work.js 1273 2012-03-09 16:27:21Z daniel $
 */
Ext.define('de.edirom.online.model.Work', {

    requires: [
        'Ext.data.reader.Xml'
    ],

    extend: 'Ext.data.Model',
    fields: ['id', 'doc', 'title'],

    proxy: {
        type: 'ajax',
        url: 'data/xql/getWorks.xql'
    }
});
