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
Ext.define('EdiromOnline.controller.window.about.AboutWindow', {

    extend: 'Ext.app.Controller',

    views: [
        'window.about.AboutWindow'
    ],

    init: function() {
        this.control({
            'aboutWindow': {
               afterlayout : this.onAfterLayout
            }
        });
    },

    onAfterLayout: function(view) {

        var me = this;

        if(view.initialized) return;
        view.initialized = true;

        window.doAJAXRequest('resources/CITATION.cff',
            'GET', {}, 
            Ext.bind(function(response){
                
                const citation = response.responseText;

                // find keys in citation
                const version = citation.match(/^version: (.*)/m)[1];
                const title = citation.match(/^title: (.*)/m)[1];
                const license = citation.match(/^license: (.*)/m)[1];
                const repoUrl = citation.match(/^repository\-code: '(.*)'/m)[1];
                const releaseDate = citation.match(/^date\-released: '(.*)'/m)[1];
                const doi = citation.match(/value: ([0-9]+\.[0-9]+\/zenodo\.[0-9]+)/)[1];

                view.setResult(`
                    <div class="tei_body">
                        <h1>About ${title}</h1>
                        <section class="teidiv0">
                            <p>Version: ${version}</p>
                            <p>Release date: ${releaseDate}</p>
                            <p>DOI: <a href="https://doi.org/${doi}">${doi}</a></p>
                            <p>${getLangString('view.window.about.AboutWindow_License')}: ${license}</p>
                            <p>GitHub: <a href="${repoUrl}">${repoUrl}</a></p>
                            <p>Contributors: <br/>
                                <a href="${repoUrl}/graphs/contributors" title="See contributors to ${title} GitHub project">
                                <img height="50px" id="github-contributors" src="https://contrib.rocks/image?repo=${repoUrl.replace(/^https?:\/\/github.com\//, '')}" alt="Avatars of contributors to ${title} in GitHub" />
                                </a>
                            </p>
                        </section>
                    </div>
                    `);

            }, this)
        );
    }
});
