/* 
    Pundit: a novel semantic web annotation tool
    Copyright (c) 2013 Net7 SRL, <http://www.netseven.it/>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

    See LICENSE.TXT or visit http://thepund.it for the full text of the license.
*/
(function() {
    var h = document.getElementsByTagName('head')[0],
        d = document.createElement('script'),
        l = document.createElement('link');

    l.rel = 'stylesheet';
    l.href = 'http://www.marcograssi.info/dev/pundit/css/pundit.css';
    l.type = 'text/css';
    l.media = 'screen';
    l.charset = 'utf-8';
    h.appendChild(l);

    // Important: without var !!
    punditConfig = {

        debugAllModules: false,

        annotationServerBaseURL : 'http://as.thepund.it:8080/annotationserver/',

        vocabularies: [

            'http://metasound.dibet.univpm.it/timelinejs/pundit_conf/timeline_demo_relations.jsonp',
            'http://metasound.dibet.univpm.it/timelinejs/pundit_conf/timeline_demo_taxonomy.jsonp'

        ],

        useBasicRelations: false,

        modules: {
        
            'pundit.Help': {
                introductionFile: 'http://metasound.dibet.univpm.it/timelinejs/pundit_conf/timeline-introduction.html',
                introductionWindowTitle: 'Welcome to Pundit! :)',
                showIntroductionAtLogin: true
            },
            'pundit.NotebookManager': { 
                active: true, 
                notebookSharing: false,
                notebookActivation: false,
                showFilteringOptions: false,
                askBaseURL: 'http://ask.as.thepund.it/#/myNotebooks/'
            },
        
            'selectors': {},
            'annotators': {}
        }

    };
    

    djConfig = {
        afterOnLoad: true,
        useXDomain: true,
        baseUrl: "http://www.marcograssi.info/dev/pundit/bookmarklet_build/dojo/",
        require: ["dojo.Bookmarklet"]
    };
    d.type = 'text/javascript';
    d.src = 'http://www.marcograssi.info/dev/pundit/bookmarklet_build/dojo/dojo.xd.js';
    h.appendChild(d);

})();