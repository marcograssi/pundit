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
*//**
  * @class pundit.selectors.FreebaseSelector
  * @extends pundit.selectors.SelectorBase
  * @description 
  * TODO TODO TODO TODO 
  */
dojo.provide("pundit.selectors.FreebaseSelector");
dojo.declare("pundit.selectors.FreebaseSelector", pundit.selectors.SelectorBase, {

    opts: {
        // Number of items to display in the suggestion list
        limit: 30,

        // Ms to wait after a keystroke before querying the service
        keyInputTimerLength: 500,
        keywordMinimumLength: 3,
        
        freebaseReconURL: 'http://data.labs.freebase.com/recon/query',
        freebaseSchemaBaseURL: 'http://www.freebase.com/schema',
        freebaseImagesBaseURL: 'http://api.freebase.com/api/trans/image_thumb',
        freebaseMQLReadURL: 'https://api.freebase.com/api/service/mqlread',
        freebaseBlurbURL: 'http://api.freebase.com/api/trans/blurb/guid/',
        freebaseItemsBaseURL: 'http://rdf.freebase.com/ns/',

        // Artificial timeout for atypical 404 freebase answers
        blurbTimeoutMS: 5000,
        
        // TODO: let the user configure the freebase query somehow? 
        
        layouts: ['list', 'tile']
    },

    constructor: function(options) {
        var self = this;
        
        self.requests = {};
        self.log('Selector '+self.name+' up and running.');
    }, // constructor()
    
    // (async) Return a list of items for the given term, calling the callback func
    getItemsForTerm: function(term, func, errorFunc) {
        var self = this;
        
        // TODO: cache the results? 
        self.requests[term] = {
            f: func, 
            items: [], 
            done: 0,
            blurbTimers: {}
        };
        
        // Add function for error
        if (typeof(errorFunc) !== 'undefined')
            self.requests[term].ef = errorFunc;
        
        self.requests[term].jobId = _PUNDIT.loadingBox.addJob('Freebase query: '+term);

        dojo.io.script.get({
            callbackParamName: "jsonp",
            url: self.opts.freebaseReconURL,
            content: {
                q: dojo.toJson({ "/type/object/name": term}),
                limit: self.opts.limit
            },
            load: function(r) {
                self.requests[term].len = r.length;
                if (r.length === 0) {
                    _PUNDIT.loadingBox.setJobOk(self.requests[term].jobId);
                    self._itemRequestDone(term);
                } else {
                    self._getItemsFromFreebaseResults(r, term);
                }
            },
            error: function(response, ioArgs) {
                self.log(self.name+' getItemsForTerm got an error :(');
                // TODO: what to do with passed function??
                if (typeof self.requests[term].ef !== 'undefined')
                    self.requests[term].ef();
                func([]);
                _PUNDIT.loadingBox.setJobKo(req.jobId);
            }
        });
        
    }, // getItemsForTerm()
    
    _getItemsFromFreebaseResults: function (r, term) {
        var self = this, 
            len = r.length,
            result = [];
            
        // Request has been canceled    
        if (typeof(self.requests[term]) === 'undefined')
            return;
        
        for (var i=0; i<len; i++) {

            var rdf_types = [], 
                item;
            
            for (var j = r[i].type.length; j--;)
                rdf_types.push(self.opts.freebaseSchemaBaseURL + r[i].type[j])

            item = {
                type: ['subject'],
                rdftype: rdf_types,
                label: r[i].name[0], 
                value: r[i].id.replace("/guid/", ""),
                description: '',
                desc_types: r[i].type,
                desc_guid: r[i].id.replace("/guid/", ""),
                altLabel: r[i].name.join(', '),
                image: self.opts.freebaseImagesBaseURL + r[i].id
            };

            self.requests[term].items.push(item);
            self._getItemDescription(item, term);
        };

        return result;
        
    }, // _getItemsFromFreebaseResults(r, func)
    
    _getItemDescription: function(item, term) {
        var self = this;
        
        dojo.io.script.get({
            callbackParamName: "callback",
            url: self.opts.freebaseMQLReadURL,
            content: {
                query : dojo.toJson({
                    'query': { 
                        "guid": '#'+ item.desc_guid,
                        "id": null,
                        "mid": null ,
                        "name": null
                    }
                }),
                limit: self.opts.limit 
            },
            load: function(r) {
                item.value = self.opts.freebaseItemsBaseURL + r.result.id.substring(1).replace(/\//g,'.');

                // Description is not '': this call is the last one, we're done
                if (item.description !== '') {
                    item.rdfData = semlibItems.createBucketForItem(item).bucket;
                    self._itemRequestDone(term);
                }
            }
        }); // dojo.io.script.get()

        // Freebase allows an onfail guid to display in case the requested one
        // doesnt have a blurb. Instead of a 404, it sends a Location Header.
        // Redirect it and supply a callback to be called.
        dojo.io.script.get({
            callbackParamName: "callback",
            url: self.opts.freebaseBlurbURL + item.desc_guid,
            content: {onfail: '9202a8c04000641f8000000000e6bc61?callback=_notfound'+item.desc_guid},
            failOk: false,
            load: function(r) { 
                clearTimeout(self.requests[term].blurbTimers[item.desc_guid]);
                item.description = r.result.body;

                // Value != desc_guid: this call is the last one, we're done
                if (item.value !== item.desc_guid) {
                    item.rdfData = semlibItems.createBucketForItem(item).bucket;
                    self._itemRequestDone(term);
                }
            },
            error: function(e) {
                clearTimeout(self.requests[term].blurbTimers[item.desc_guid]);
                item.description = item.label;

                // Value != desc_guid: this call is the last one, we're done
                if (item.value !== item.desc_guid) {
                    item.rdfData = semlibItems.createBucketForItem(item).bucket;
                    self._itemRequestDone(term);
                }
                return false;
            }

        });

        // If this gets called, no description was found
        window['_notfound'+item.desc_guid] = function() {
            clearTimeout(self.requests[term].blurbTimers[item.desc_guid]);
            item.description = item.label;
            // Value != desc_guid: this call is the last one, we're done
            if (item.value !== item.desc_guid) {
                item.rdfData = semlibItems.createBucketForItem(item).bucket;
                self._itemRequestDone(term);
            }
        };
        
        // Bizarre case: some guid returns a different 404, not the one we're
        // handling with the onfail parameter
        // (eg: http://api.freebase.com/api/trans/blurb/guid/9202a8c04000641f800000000ab11253)
        self.requests[term].blurbTimers[item.desc_guid] = setTimeout(function() {
            self.log('Atypical 404 timed out for guid ' + item.desc_guid);
            window['_notfound'+item.desc_guid]();
        }, self.opts.blurbTimeoutMS)
        
    }, // _getItemDescription()
    
    _itemRequestDone: function(term) {
        var self = this,
            req = self.requests[term];
        
        // Request has been canceled
        if (typeof(req.canceled) !== 'undefined')
            return;

        req.done += 1;
        self.log('Query: '+term+', done: '+req.done+'/'+req.len);

        if (req.done < req.len)
            return;

        self.log('Done loading items for term '+term+'.. calling the function.');
        req.f(req.items,term);

        _PUNDIT.loadingBox.setJobOk(req.jobId);

    },
    
    cancelRequests: function(){
        var self = this,
            reqs = self.requests;
        
        for (var i in reqs) {
            reqs[i].len = 0;
            self._itemRequestDone(i);
            reqs[i].canceled = true;
        }
    }

});