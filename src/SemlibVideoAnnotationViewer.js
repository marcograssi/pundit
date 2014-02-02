dojo.provide("pundit.SemlibVideoAnnotationViewer");
dojo.declare("pundit.SemlibVideoAnnotationViewer", pundit.BaseComponent, {

//This library should implement the timeline

    constructor: function(options) {
        var self = this;
        self.mediaFragments = {};
        self.annotations = {};
        self.properties = {};
        self.other = {};
        self.panelXpointers = [];
        self.videoFragments = {};
        self.srcMarker = "../semtube/playerico/Marker";
        self.srcMarkerL = "../semtube/playerico/MarkerL";
        self.srcSelected = "../semtube/playerico/selected";
        
        //Parameters
        self.rows = 2;
        self.layers = [];
        self.rowHeight = 25;
        self.resizeTimeout = null;

        //refresh all
        self.refreshPageItems = false;

        self.jobId = null;
        // Add callback here
        self.createCallback([
            // TODO Do we need any?
        ]);

        self.reader = new pundit.AnnotationReader();
        self.writer = new pundit.AnnotationWriter();
        self.initReader();
        self.initWriter();

        // This has been remove
        // this.reader = new pundit.AnnotationReader();
        // this.init();
        self.initBehaviour();
        self.initContextualMenu();

        //pundit.onSave(function() {
        tripleComposer.onSave(function() {
            dojo.destroy('semtube-timeline-fragment-marker');
            self.refreshAnnotations();
        });

        //TODO This should be move elsewhere and do not use DOM level 1 event
        window.onresize = function() {
            if (typeof(self.resizeTimeout) !== "undefined"){
                clearTimeout(self.resizeTimeout)
            }
            self.resizeTimeout = setTimeout(function(){
                self.resizeTimeline();
                semlibVideoPlayer.resizeVideo();
            }, 1000);
        }

        // self.wipe();
        _PUNDIT.init.onInitDone(function() {
            _PUNDIT['commentTag'].onSaveItems(function(){
                self.refreshAnnotations();    
            });
            self.refreshAnnotations();
            self.myScroll = new iScroll('wrapper', {vScroll:false});
        });

        semlibVideoPlayer.onVideoPlayerReady(function(){
            self.addTimelineScale();
        })

        self.notebooks = {};

        self.log("VideoAnnotationViewer Up and running");
    },

    initWriter: function() {
        var self = this;
        
        // DEBUG What is this for?????
        self.writer.onSetNotebookActive(function(id, flag) { 
            semlibWindow.closeAllPanels();
            self.refreshAnnotations();
            self.fireOnNotebookActivationChanged();
        });

        self.writer.onSaveItems(function(id){
        });
    },

    initReader: function() {
        var self = this;
        
        ////////////////////////////////////////////////////////
        // // First step: get metadata for thcuris on this page
        // self.reader.onAnnotationMetadata(function(g) { 
        //     // Already in progress?
        //     if (!self.jobId) {
        //         //When deleting one annotation I need to resfresh all page items
        //         if (self.refreshPageItems){
        //             //TODO use function for this
        //             semlibItems.itemsDnD.forInItems(function(item){
        //             if (item.data.rdftype[0] != ns.rdf_property)
        //                     semlibItems.removeItemFromUri(item.data.value);
        //             });
        //             self.refreshPageItems = false;
        //         }
                
        //         self.jobId = _PUNDIT.loadingBox.addJob('Downloading annotation content');
        //         self.addAnnotations(g);
        //         for (var notebook_id in self.notebooks) { //ok object
        //             self.reader.checkNotebook(notebook_id); 
        //         }
                
        //         self.consolidate();
        //         dojo.behavior.apply();
        //     } else {
        //         console.log('DEBUG: two refresh() Too fast?!?');
        //     }
            
        // });////////////////////////////////////////////////

        self.reader.onAnnotationMetadata(function(g) {
            if (g === null){
                return;
            }
            
            if (!self.jobId) {
                //When deleting one annotation I need to resfresh all page items
                if (self.refreshPageItems){
                    //TODO use function for this
                    semlibItems.itemsDnD.forInItems(function(item){
                    if (item.data.rdftype[0] != ns.rdf_property)
                            semlibItems.removeItemFromUri(item.data.value);
                    });
                    self.refreshPageItems = false;
                }
                self.jobId = _PUNDIT.loadingBox.addJob('Downloading annotation content');
                self.addAnnotations(g);
                // DEBUG What is for???
                for (var notebook_id in self.notebooks) { //ok object
                    self.reader.checkNotebook(notebook_id); 
                }

                //self.consolidate(); //SEMTUBE For semtube I don't need consolidation
                dojo.behavior.apply();
            } else {
                console.log('DEBUG: two refresh() Too fast?!?');
            }
        });
        
        // Second step: addAnnotations is calling AnnotationContent
        // on every valid annotation
        self.reader.onAnnotationContent(function(g, id) {
            self.log('Annotation content for '+id+' received');
            self.addAnnotationContent(id, g);
            self.reader.getAnnotationItemsFromId(id);
        });
        
        self.reader.onAnnotationItems(function(g, id) {
            self.log('Annotation items for '+id+' received');
            self.addAnnotationItems(id, g);
            if (--self.annToDownload === 0) {
                // DEBUG Sure that we don't need it
                // self.consolidate();
                _PUNDIT.loadingBox.setJobOk(self.jobId);
                self.isRefreshingAnnotations = false;
                self.jobId = null;
            }
        });
        
        self.reader.onNotebookChecked(function(id, flag) {
            self.log('Notebook ' + id + ' cheked: active = ' + flag);
            self.notebooks[id] = flag;
        });

        self.reader.onError(function(e) {
            // TODO: add a callback for each call, and handle the errors
            console.log('TODO: Reader got an error, deal with it!', e);
            return false;
        });
        
    }, // initReader()


    initBehaviour:function(){
        var self = this;
        dojo.behavior.add({
            // Custom hover functions on items (eg: xpointers)
            '#annotationWindow div.subStatement': {
                'onmouseenter': function (e) {
                    
                    //Show the selected video fragment and regions
                    var liAbout = dojo.query(this).children('span:nth-child(2)').children().children();
                    if (liAbout.length > 0){
                        if (dojo.hasAttr(liAbout[0], 'about')){
                            var mediaFragment = dojo.attr(liAbout[0], 'about');
                            var fTimes = self.getAnnotationTime(mediaFragment);
                            if (typeof(fTimes) !== 'undefined'){
                                semlibVideoPlayer.insertMarker(fTimes.startTime, fTimes.endTime, 'shownFragment', 'yellow');
                                if (dojo.query(this).children('span:nth-child(1)').html().indexOf('VFR') === 0){
                                   semlibItems.itemsDnD.forInItems(function(item){
                                    if (item.data.value == mediaFragment)
                                        drawShapes(item.data.shapes,'gcanvas');
                                    });
                                }
                            }  
                        }
                    }
                },
                'onmouseleave': function(e) {
                    //Hide the selected video fragment and regions
                    dojo.query('.mark').forEach(function(item){
                        if (dojo.hasClass(item, 'unsaved') || dojo.hasClass(item, 'playing')){
                            
                        }else{
                            dojo.destroy(item);
                        }    
                    });
                }
            },
            '.timelineFragment': {
                'onclick': function (e) {
                    var mfUri = dojo.attr(dojo.query(e.target)[0], 'about');
                    anns =  self.mediaFragments[mfUri].anns;
                    self.showAnnotationPanelTimeline(anns, dojo.style(e.target, 'left') + e.offsetX, dojo.style(e.target, 'top') + e.offsetY)
                }
            },
            '#pundit-timeline-scale div span.markLeft': {
                'onmousedown': function(e){
                    self.fmarkerLeftMouseDown(e);
                }
            },
            '#pundit-timeline-scale div span.markRight': {
                'onmousedown': function(e){
                    self.fmarkerMouseDown(e);
                }
            },
            //TODO The click event are added by tooltip annotation viewer so here we just update the annoation panel...
            //Find a better way to do this
            '#pundit-fp-timelineAnnotationPanel div.pundit-statement span.pundit-moreinfo': {
                'onclick': function(e) {
                    setTimeout(function() {
                        annotationPanel.update();
                        },100);
                }
            }
        });
        dojo.behavior.apply();
        
        self.timelineMarginLeft = 10;
        
        dojo.connect(dojo.byId('pundit-timeline-zoom'), 'onmouseup',function(e){
            self.zoomTimeline();
        });
        dojo.connect(dojo.byId('pundit-timeline-pan'), 'onmouseup',function(e){
            self.panTimeline();
        });
        dojo.connect(dojo.byId('pundit-timeline-scale'), 'onmousedown',function(e){
            dojo.stopEvent(e);
        }),
        dojo.connect(dojo.byId('pundit-timeline-scale'), 'onmouseup',function(e){
            var x = e.pageX - dojo.position('pundit-timeline-scale',false).x,
                w = dojo.position("pundit-timeline-container").w,
                time = (x/w * ytPlayer.getDuration()) | 0;
            ytPlayer.seekTo(time, true);
            semlibVideoPlayer.realOffsetLoaded = x;
        });

        dojo.connect(window, 'onmousemove',function(e){
            self.WindowMouseMove(e);
        });
        
        dojo.connect(window, 'onmouseup',function(e){
            self.WindowMouseUp(e);
        });

    },
    
    initContextualMenu:function(){
        var self = this;
        // Semlibitem: open its webpage if item is not a textfragment
        cMenu.addAction({
            type: ['videofragmenttooltip'],
            name: 'tooltipPlayVideoFragmentItem',
            label: 'Play this video fragment',
            showIf: function(mediaFrag) {
                return true;
            },
            onclick: function(mediaFrag) {
                //dojo.attr(ann_id,'about');
                semlibVideoPlayer.playFragment(mediaFrag);
                return true;
            }
        });
        cMenu.addAction({
            type: ['videofragmenttooltip'],
            name: 'tooltipShowVideoFragmentAnnotations',
            label: 'Open annotations',
            showIf: function(mediaFrag) {
                var ann = self.mediaFragments[mediaFrag].anns.length,
                    open = semlibWindow.getOpenedPanelsByXpointer(mediaFrag).length;
                return open < ann;
            },
            onclick: function(mediaFrag) {
                for (var i in self.mediaFragments[mediaFrag].anns)
                    self.showAnnotationPanel(self.mediaFragments[mediaFrag].anns[i],mediaFrag);
                return true;
            }
        });
        cMenu.addAction({
            type: ['videofragmenttooltip'],
            name: 'tooltipCloseVideoFragmentAnnotations',
            label: 'Close annotations',
            showIf: function(mediaFrag) {
                return semlibWindow.getOpenedPanelsByXpointer(mediaFrag).length > 0;
            },
            onclick: function(mediaFrag) {
                for (var i in self.mediaFragments[mediaFrag].anns)
                    semlibWindow.closePanelById(self.mediaFragments[mediaFrag].anns[i]);
                return true;
            }
        });
        cMenu.addAction({
            type: ['videofragmenttooltip'],
            name: 'tooltipVideoAddCommentTag',
            label: 'Add Comment/Tags',
            showIf: function(mediaFrag) {
                return true;
            },
            onclick: function(mediaFrag) {
                _PUNDIT['commentTag'].initDialog(mediaFrag);
                return true;
            }
        });
    },
    
    addAnnotations:function(graph){
        var self = this,
        i=0;
        for (var ann_uri in graph) {
            var a = graph[ann_uri],
            
            ann_targets = a['http://www.openannotation.org/ns/hasTarget'],
            //ann_id = a['http://purl.org/swickynotes/ao/v1#id'][0].value;
            ann_id = a['http://purl.org/pundit/ont/ao#id'][0].value;
            

            // TODO: Add a check for the type, it must be annotation
            // Is the check needed? Or we are 100% sure we are only getting annotations here?
            for (i in ann_targets) {
                var val = ann_targets[i].value;
                
                //DEBUG This check could be unnecessary using the new query for retrieving the annotations
                if (val.indexOf('http://www.youtube.com/v/' + semlibVideoPlayer.videoId) !== -1) {

                    // Save the fragment
                    var newFragment = true;
                    for (var j in self.mediaFragments){
                        if (j === val){
                            //check if the annotation is already there
                            newFragment = false;
                            var newAnn = true;
                            if (typeof(self.mediaFragments[j]['anns']) != "undefined"){
                                for (var k in self.mediaFragments[j]['anns']){
                                if (self.mediaFragments[j][k] === ann_id)
                                    newAnn = false;
                                break;
                                }
                                if (newAnn)
                                    self.mediaFragments[j]['anns'].push(ann_id)
                                break;
                            }
                        }
                    }
                    if (newFragment){
                        self.mediaFragments[val] = {};
                        self.mediaFragments[val]['anns'] = [ann_id] ;
                        self.mediaFragments[val]['times'] = self.getAnnotationTime(val);
                        self.mediaFragments[val]['uri'] = val;
                        self.addFragmentToTimeline(val);
                    }
                    
                    self.annotations[ann_id] = {
                        metadata: a,
                        id: ann_id
                    };
                    
                    
                    
                    //SEMTUBE This should be moved somewhereelse!
                    //Insert annotation tooltipbutton in annotationbar
                    var times = self.getAnnotationTime(val);
                    
                    
                    if (typeof(times) !== "undefined"){
                        dojo.removeClass('annotationBar', 'hidden');
                        if (typeof(dojo.query('#annotationBar a[about="' + val + '"]')[0]) === 'undefined'){
                            var left=semlibVideoPlayer.time2pos(times.startTime) - 6 +3; //TODO make this configurable
                            dojo.place('<a class="video_annotation_icon" about="'+val+'" style="position:absolute; left:'+ left +'px"></a>','annotationBar');
                            dojo.connect(dojo.query('#annotationBar a[about="' + val + '"]')[0], 'onmouseenter', (function(_val,_ann_id) { 
                                return function (e) {
                                    //                                self.fireOnAnnotationIconMouseEnter(_x);
                                    //                                dojo.query('span.active').removeClass('active');
                                    //                                dojo.query('span.'+_c).addClass('active');
                                    //                                cMenu.show(e.pageX - window.pageXOffset, e.pageY - window.pageYOffset, _x, 'textfragment');
                                    self.highlightVideoFragmentByUri(_val);
                                    if (typeof self.annotations[_ann_id].content[_val][ns.items.shapes] !== 'undefined'){
                                        var shapes = dojo.fromJson(self.annotations[_ann_id].content[_val][ns.items.shapes][0].value)
                                        drawShapes(shapes, 'gcanvas');
                                    }
                                };
                            })(val,ann_id));
                            dojo.connect(dojo.query('#annotationBar a[about="' + val + '"]')[0], 'onmouseleave', (function(_ann_id) { 
                                return function (e) {
                                    self.removeHighlightVideoFragmentByUri(_ann_id);
                                    // DEBUG Removed canvas
                                    // clearCanvasAnnotation('gcanvas');
                                //                                self.fireOnAnnotationIconMouseLeave(_x);
                                //var sp = dojo.query('span.'+_c);
                                //sp.removeClass('active');
                                };
                            })(ann_id));
                            dojo.connect(dojo.query('#annotationBar a[about="' + val + '"]')[0], 'onclick', (function(_val) { 
                                return function (e) {
                                    e.preventDefault();
                                    //                               self.fireOnAnnotationIconMouseClick(_x);
                                    cMenu.show(e.pageX - window.pageXOffset, e.pageY - window.pageYOffset, _val, 'videofragmenttooltip');
                                
                                    //                                if (dojo.hasClass(e.currentTarget, 'close')) {
                                    //                                    semlibWindow.closePanelByXpointer(_x);
                                    //                                    return false;
                                    //                                }
                                
                                    //                                for (var i = self.xpointersAnnotationsId[_x].length - 1; i >= 0; i--){
                                    //                                    self.log('RDF Icon click: asking more information for annotation '+self.xpointersAnnotationsId[_x][i]);
                                    //                                    self.reader.getAnnotationContentFromId(self.xpointersAnnotationsId[_x][i], _x);
                                    //                                }
                                    return false;
                                };
                            })(val));
                        }
                    }else{
                        if (!dojo.exists('videoTooltip'))
                            dojo.place('<a class="annotation_icon" id="videoTooltip" about="'+val+'" style="position:absolute;top:0px; left:'+ 640 +'px"></a>','containerPlayer');
                        dojo.connect(dojo.byId('videoTooltip'), 'onmouseenter', (function(_val) { 
                                return function (e) {
                                    //                                self.fireOnAnnotationIconMouseEnter(_x);
                                    //                                dojo.query('span.active').removeClass('active');
                                    //                                dojo.query('span.'+_c).addClass('active');
                                    //                                cMenu.show(e.pageX - window.pageXOffset, e.pageY - window.pageYOffset, _x, 'textfragment');
                                    //TODO Highligth whole video
                                };
                            })(val));
                            dojo.connect(dojo.byId('videoTooltip'), 'onmouseleave', (function(_ann_id) { 
                                return function (e) {
                                    //self.removeHighlightVideoFragmentByUri(_ann_id);
                                //                                self.fireOnAnnotationIconMouseLeave(_x);
                                //var sp = dojo.query('span.'+_c);
                                //sp.removeClass('active');
                                };
                            })(ann_id));
                            dojo.connect(dojo.byId('videoTooltip'), 'onclick', (function(_val) { 
                                return function (e) {
                                    e.preventDefault();
                                    //                               self.fireOnAnnotationIconMouseClick(_x);
                                    cMenu.show(e.pageX - window.pageXOffset, e.pageY - window.pageYOffset, _val, 'videofragmenttooltip');
                                
                                    //                                if (dojo.hasClass(e.currentTarget, 'close')) {
                                    //                                    semlibWindow.closePanelByXpointer(_x);
                                    //                                    return false;
                                    //                                }
                                
                                    //                                for (var i = self.xpointersAnnotationsId[_x].length - 1; i >= 0; i--){
                                    //                                    self.log('RDF Icon click: asking more information for annotation '+self.xpointersAnnotationsId[_x][i]);
                                    //                                    self.reader.getAnnotationContentFromId(self.xpointersAnnotationsId[_x][i], _x);
                                    //                                }
                                    return false;
                                };
                            })(val));
                    }
                        
                    
                    
                }
            }
        }
        //self.reader.getAnnotationContentFromId(ann_id);
        var n = 0
        for (i in self.annotations){
            n +=1;
            self.reader.getAnnotationContentFromId(i);
        }
        self.annToDownload = n;
        if (self.annToDownload === 0){
            _PUNDIT.loadingBox.setJobOk(self.jobId);
            self.jobId = null;
            self.log('No annotations added: nothing to display on this page.');
            self.isRefreshingAnnotations = false;
        }else {
            self.log('Added '+self.annToDownload+' annotations ready to be downloaded');
        }

    },

    updateCurrentAnnotations:function(currentTime){
        var self = this;
        // DEBUG Removed canvas
        // clearCanvasAnnotation();
        for (var i in self.annotations){
            var target;
            for (var k in self.annotations[i].metadata[ns.oac_hasTarget]){
                if (typeof self.annotations[i].metadata[ns.oac_hasTarget][k] !== 'undefined'){
                    if (typeof(self.annotations[i].content)=== 'undefined')
                        continue;
                    if (self.annotations[i].content[self.annotations[i].metadata[ns.oac_hasTarget][k]] !== 'undefined'){
                        target = self.annotations[i].metadata[ns.oac_hasTarget][k].value;
                        break;                            
                    }
                }
            }
            if (typeof target != 'undefined') {
                if (typeof self.annotations[i].items !== 'undefined'){
                    if (typeof self.annotations[i].items[target] !== 'undefined'){
                        if (typeof self.annotations[i].items[target][ns.items.shapes] !== 'undefined'){
                            //var shapes = self.getAnnotationShapes(target);
                            var shapes = dojo.fromJson(self.annotations[i].items[target][ns.items.shapes][0].value);
                            var annTime = self.getAnnotationTime(target);

                            //DEBUG In same cases annTime can be undefined 
                            //(the target can in fact be the whole video)
                            if (typeof(annTime) !== 'undefined'){
                                if(annTime.endTime < currentTime || annTime.startTime > currentTime){
                                //dojo.style('dialog_' + self.annotations[i].id + '_content', 'display', 'none');
                                }
                                if(annTime.startTime < currentTime && annTime.endTime > currentTime){
                                    //dojo.style('dialog_' + self.annotations[i].id + '_content', 'display', 'block');
                                    // DEBUG Removed canvas
                                    // if (typeof(shapes) !== 'undefined') 
                                    //     drawShapes(shapes,'canvasAnnotation');
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    //TODO refector this function to not duply the code
    //Just one function for parsing all parameters
    getAnnotationTime:function(a){
        if (a.indexOf('#') !== -1){
            var frag = a.substring(a.indexOf('#') + 1);
            var pars = frag.split('&');
            if (pars.length > 0){
                for (i=0; i<pars.length; i++){
                    if (pars[i].indexOf('t=') !== -1){
                        var timeString = pars[i].substring(2);
                        var j = timeString.indexOf(',')
                        if (j !== -1){
                            var t = {};
                            t.startTime = timeString.substring(0, j);
                            t.endTime = timeString.substring(j+1);
                            return t;
                        }
                    }
                }
            }else
                return undefined;
        }else
            return undefined;
    },
    
    getAnnotationShapes:function(a){
        if (a.indexOf('#') !== -1){
            var frag = a.substring(a.indexOf('#') + 1);
            var pars = frag.split('&');
            if (pars.length > 0){
                for (var i=0; i<pars.length; i++){
                    if (pars[i].indexOf('shapes=') !== -1){
                        var shapeString = pars[i].substring(7);
                            return shapes = dojo.fromJson(shapeString);
                    }
                }
            }else
                return undefined;
        }else
            return undefined;
    },

    getVideoId:function(mfrag){
        var baseUri = mfrag.split('#')[0];
        return videoUri = baseUri.substring(baseUri.lastIndexOf('/') + 1);
    },

    addAnnotationContent: function(ann_id, content) {
        var self = this;

        // DEBUG: /content/ json-specific cleanup
        // If type of the object is a property, move it into the .properties
        // field. For all the other types, which are not textfragments, move
        // it into the .other field
        // 

        //if (typeof(self.annotations[ann_id]) !== 'undefined'){
        self.annotations[ann_id].content = content;
        self.log("Added content to annotation "+ann_id);
        //console.log(content);
        //}

    }, // addAnnotationContent()
    
    addAnnotationItems: function(ann_id, items) {
        var self = this,
            c = self.annotations[ann_id].content;

        self.annotations[ann_id].items = items;
		for (var subject in c) {
	        self.log('Adding SUBJECT item: '+ subject.substr(0, 41)+'..');
            self.extractItemFromAnnContent(subject, items);

	        for (var predicate in c[subject]) {
    	        self.log('Adding PREDICATE item: ('+subject.substr(0,20)+') :'+ predicate.substr(0, 41)+'..');
                
                for (var k = c[subject][predicate].length - 1; k >= 0; k--) {

                    var object = c[subject][predicate][k];
                    if (object.type === 'literal') {
							//FIXME: literal items are not to be created at all!!
	                        //self.extractLiteralItem(object.value);
					} else 
                        self.extractItemFromAnnContent(object.value, items);

                } // for k
	        } // for predicate
		} // for subject

    }, // addAnnotationItems()
    
    extractLiteralItem: function(value) {
        var self = this,
            item = semlibLiterals.createLiteralItem(value);
            
        semlibItems.addItem(item);
        self.log('Created LITERAL item for '+value.substr(0, 30)+'..');
    },

    extractItemFromAnnContent: function(uri, it) {
        var self = this,
            item = {value: uri};

        self.log('Extracting item from content: '+uri.substr(0,40));

        if (typeof(it) === 'undefined' || it === null) {
            self.log('No items to extract from.')
            return;
        }
        
        if (typeof(it[uri]) === 'undefined') {
            self.log("Cant extract item for this uri!!");
            console.log('TODO: Error? Literallone?', it, uri);
            return;
        }

        // Add each field declared in ns.items
        // DEBUG TODO: they could be arrays? 
        for (var field in ns.items) {
            var fieldUri = ns.items[field];
            if (typeof(it[uri][fieldUri]) !== 'undefined') {
                if (field === 'selector') {
                    var selector = it[uri][fieldUri][0].value;
                    var selectorValue = it[selector][ns.rdf_value][0].value;
                    if (typeof(item['selectors']) === 'undefined') {
                        item['selectors'] = [];
                    }
                    item['selectors'].push(dojo.fromJson(selectorValue))
                } else {
                   item[field] = it[uri][fieldUri][0].value;
                }
            }
        }

        // Add every type
        item['rdftype'] = [];
        for (var i=it[uri][ns.items.type].length; i--;) 
            item['rdftype'].push(it[uri][ns.items.type][i].value);
        

        // It is a text fragment
        // TODO: check every type, not just the first
        if (it[uri][ns.items.type][0].value ===  ns.text_fragment) {

            // Overwrite type, add other stuff
            item['type'] = ['subject'];

            // Create the needed bucket and init the preview for this item
            item.rdfData = semlibItems.createBucketForTextFragment(item).bucket;
            previewer.buildPreviewForItem(item);
                        
            semlibItems.addItem(item);
            self.log('Created and added a TEXT item '+item.value.substr(0, 30)+'..');
            return;
        } // if type == ns.text_fragment
        
        
        // TODO: x marco siam sicuri che e' sempre il primo tipo? 
        // It is an item coming from a vocabulary
        if (it[uri][ns.items.type][0].value ===  ns.rdfs_resource) {
            item['type'] = ['subject']; 

            // Create the needed bucket and init the preview for this item
            item.rdfData = semlibItems.createBucketForVocabItem(item).bucket;
            previewer.buildPreviewForItem(item);
            semlibItems.addItem(item);
            self.log('Created and added VOCAB item '+item.value.substr(0, 30)+'..');
            return;
        }
        
        // default fallback: assuming it's a proper item, use createBucketForItem
        // and  hope for the best
        self.log('Assuming proper item for '+item.value.substr(0, 30)+'..');
        
        item['type'] = ['subject']; 
        item.rdfData = semlibItems.createBucketForItem(item).bucket;
        previewer.buildPreviewForItem(item);
        semlibItems.addItem(item);
        self.log('Created and added DEFAULT item '+item.value.substr(0, 30)+'..');    
            
    }, // extractItemFromAnnContent()

    showAnnotationPanel: function(ann_id,mediaFrag) {
        //console.log('show annotation panel');
                
        var r = document.createRange();
        r.selectNode(document.getElementById('containerPlayer'));
        var xpPlayer = fragmentHandler.range2xpointer(r);
                
        var self = this,
        panel_id = 'dialog_'+ann_id+'_content';
        
        //SEMTUBE DEBUG Improve positioning
        // Is the panel already there?
        if (dojo.query('#'+panel_id).length > 0) {
            // TODO: flash the panel window?
            semlibWindow.showPanel(panel_id);
            semlibWindow.setYOffset(panel_id, 100);
            //semlibWindow.setPositioningXpointer(panel_id, xpPlayer);
            self.log("Panel for annotation id "+ann_id+" is already open!");
            return;
        }

        //DUBUG Marco Add check on annotation existance
        if (typeof(self.annotations[ann_id]) === 'undefined')
            return;

        var ann = self.annotations[ann_id],
            panel_content = '',
            panel_buttons = '',
            c = ann.content,
            m = ann.metadata,
            items = ann.items,
            panelXpointers = [],
            author_name,
            author_uri = m[ns.pundit_authorURI][0].value,
            annotation_date = m[ns.pundit_annotationDate][0].value;
        
        self.log("Showing annotation panel for "+ann_id);
        
        // console.log(m);
        var author = 'http://purl.org/swickynotes/ao/v1#authorName';
        if (typeof m[author] === 'undefined')
            author = 'http://purl.org/dc/terms/creator';
        
        self.log("Showing annotation panel for "+ann_id);

        // Header with metadata
        //panel_content += "<div class='metadata''><span class='author'>Created by: <b>"+m[author][0].value+"</b></;></span>";
        //panel_content += "<span class='date'>on date: <b>"+m['http://purl.org/dc/terms/created'][0].value+"</b><br/></span></div>";

        // TODO: ACL on the annotation? On the notebook?
        // TODO: add again the EDIT button
        // panel_buttons += "<span class='swButton edit' about='"+ann_id+"'>Edit</span>";
        if (author_uri === myPundit.user.uri)
            panel_buttons += "<span class='pundit-gui-button delete' about='"+ann_id+"'>Delete</span>";
            
		if (typeof(m[ns.pundit_authorName]) !== 'undefined' && m[ns.pundit_authorName][0].value !== '') 
			author_name = m[ns.pundit_authorName][0].value;
		else 
			author_name = "User: " + author_uri.substr(author_uri.lastIndexOf('/')+1, author_uri.length);

        // Header with metadata
        panel_content += "<div class='pundit-metadata'>";
        // DEBUG: if we remove a line here, the min-height of the whole annotation box gets in the
        // way and messes it up a bit .......
        // TODO: this is the right place to insert notebook or other infos
        panel_content += "<span class='author'><em>Created by</em> : "+author_name+"</span>";
        panel_content += "<span class='date'><em>On</em> : "+ annotation_date.split('T')[0] +", "+annotation_date.split('T')[1]+"</span>"
        panel_content += "</div>";

        // Content has all the xpointers associated to this annotation
        for (var uri in c) {

            // If it's an xpointer
            // DEBUG: they should all be xpointer, since we check at add time
            // DEBUG SEMTUBE 
            //var uriType = c[uri][ns.rdf_type][0].value;
            //if ((uriType === ns.video) || (uriType === ns.video_fragment) || (uriType === ns.video_fragment_region)) {
                // Finally produce the HTML for each statement
                //panel_content += self.getStatementHTML(c, uri);

                panel_content += tooltip_viewer.getStatementsHTML(c, items);
            //} // if type == text fragment
        } // for uri in c

        dojo.behavior.apply();

        if (!semlibWindow.isAnnotationWindowOpen())
            semlibWindow.toggleAnnotationWindow();

    }, // showAnnotationPanel()
    getStatementHTML: function(c, uri) {
        var self = this,
        show_props = [],
        statement = '';

        self.log('Getting statement for '+uri.substr(0, 30));
        // TODO: Which properties to show??!
        for (var p in self.properties)
            show_props.push(p);

        for (property in c[uri])
            if (dojo.indexOf(show_props, property) !== -1)
                for (var k = c[uri][property].length - 1; k >= 0; k--){
                    statement += '<div class="statement">';
                    statement += '<div class="subStatement">';
                    statement += self.getTriplePartHTML(c, uri);
                    statement += '</div>';
                    statement += '<div class="subStatement">';
                    statement += self.getTriplePartHTML(c, property);
                    statement += '</div>';
                    statement += '<div class="subStatement">';
                    statement += self.getTriplePartHTML(c, c[uri][property][k].value, c[uri][property][k].type);
                    statement += '</div>';
                    statement += '</div>';
                } // for triple's objects in c[uri][property]

        self.log('Produced statement for '+uri.substr(0, 30))
        return statement;

    }, // getStatementHTML()

    getTriplePartHTML: function(c, uri, type) {
        var self = this,
        tp = '',
        label, classes,
        content = '',
        extra = '';
        
        // This in an object for sure ..
        if (typeof(type) === 'string')
            if (type !== 'uri') {
                if (uri.length > 15){
                    label = uri.substring(0, 15) + '...';
                }else{
                    label = uri;
                }
                content = uri;
            }

        // Where is this uri stored? Content? Properties? Other?
        if (c[uri]) {

            label = c[uri]["http://www.w3.org/2000/01/rdf-schema#label"][0].value;
            if (typeof(c[uri]["http://purl.org/swickynotes/ao/v1#hasContent"]) !== 'undefined')
                content = '<li><em>Full content</em>: ' + c[uri]["http://purl.org/swickynotes/ao/v1#hasContent"][0].value+'</li>';

            //If its a video fragment allow to place
            if (c[uri][ns.rdf_type][0].value === ns.video_fragment){
                extra = '<li about="'+ uri + '"><a href="javascript:semlibVideoPlayer.playFragment2(\''+uri+'\');">Play this video fragment</a></li>';
                extra += '<li><a href="'+uri+' target="_blank");">Play this video on YouTube</a></li>';
            }
            if (c[uri][ns.rdf_type][0].value === ns.video_fragment_region){
                extra = '<li about="'+ uri + '"><a href="javascript:semlibVideoPlayer.playFragment2(\''+uri+'\');">Play this video fragment</a></li>';
                extra += '<li><a href="'+uri+' target="_blank");">Play this video on YouTube</a></li>';
            }
            if (c[uri][ns.rdf_type][0].value === ns.video){
                extra = '<li about="'+ uri + '"><a href="javascript:semlibVideoPlayer.playFragment2(\''+uri+'\');">Play this video</a></li>';
                extra += '<li><a href="'+uri+' target="_blank");">Play this video on YouTube</a></li>';
            }

        } else if (self.properties[uri]) {
            label = self.properties[uri]["http://www.w3.org/2000/01/rdf-schema#label"][0].value;
            extra += '<li>This item is a "relation"</li>';
            extra += '<li><a target="_blank" href="' + uri + '">Go to web page for more info</a></li>';
        //extra += '<li>See where this predicate is used...</li>'
        } else if (self.other[uri]) {
            label = self.other[uri]["http://www.w3.org/2000/01/rdf-schema#label"][0].value;
            content = '<li><a target="_blank" href="' + uri + '">Go to web page for more info</a></li>';
			
            content += '<li>This item is of type:</li>';
            for (var i = self.other[uri]['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'].length - 1; i >= 0; i--) {
                var type_url = self.other[uri]['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'][i].value;
                var type_label = type_url.substring(type_url.lastIndexOf("/")+1,type_url.length);
                content += '<li>' + type_label + '</li>';
            }      
        }

        //classes = self.xpointersColors[uri] || '';

        tp += '<span class="more '+classes+'">'+label+'</span>';
        tp += '<span class="more_subpanel hidden"><ul>';
        tp += content + extra;
        tp += '</ul></span>';

        return tp;
    }, // getTriplePartHTML()

    refreshAnnotations:function(){
        var self = this;
        dojo.query('.video_annotation_icon').forEach(function(item){
            dojo.destroy(item);
        });
        //console.log('http://www.youtube.com/v/' + semlibVideoPlayer.videoId);
        
        self.reader.getAnnotationMetadataFromUri(['http://www.youtube.com/v/' + semlibVideoPlayer.videoId]);
    },
    highlightVideoFragmentByUri:function(uri){
        var self = this;
        var fTimes = self.getAnnotationTime(uri);
        if (typeof(fTimes) !== 'undefined'){
            semlibVideoPlayer.insertMarker(fTimes.startTime, fTimes.endTime, 'shownFragment', 'yellow');
        //                                if (dojo.query(this).children('span:nth-child(1)').html().indexOf('VFR') === 0){
        //                                   semlibItems.itemsDnD.forInItems(function(item){
        //                                    if (item.data.value == mediaFragment)
        //                                        drawShapes(item.data.shapes,'gcanvas');
        //                                    });
        //                                }
        } 
    },
    removeHighlightVideoFragmentByUri:function(){
        var self = this;
        dojo.query('#progressBar div.mark').forEach(function(item){
            if (dojo.hasClass(item,'unsaved') || dojo.hasClass(item,'playing')){
                
            }else{
                dojo.destroy(item);
            }
        });
    },
    
    //TIMELINE EXPERIMENT
    addFragmentToTimeline:function(uri){
        var self = this,
            t = self.getAnnotationTime(uri),
            duration = semlibVideoPlayer.videoInfo.entry.media$group.media$content[0].duration,
            timelineWidth =dojo.style(dojo.byId('pundit-timeline-container'), 'width'),
            left = t.startTime*(timelineWidth/duration),
            width = (t.endTime -t.startTime)*(timelineWidth/duration);
        //console.log("Add annotation to timeline. URI: " + uri);
        dojo.place('<div about="'+uri+'" class="timelineFragment" style="position:absolute;background:black;height:22px;left:'+ left +'px; width:'+ width +'px;"></div>','pundit-timeline-container');
        self.repositionAnnotations();
        dojo.behavior.apply();
    },
    
    removeFragmentFromTimeline:function(uri){
        var self = this;
        if (uri in self.mediaFragments){
            dojo.destroy(dojo.query('#pundit-timeline-container > div[about="'+uri+'"]'[0]));
            delete self.mediaFragments['uri'];
        }else{
            console.log("Trying to delete a fragment that does not existi")
        }
        dojo.behavior.apply();
    },
    
    repositionAnnotations:function(){
        var self = this;
        self.layers = [];
        self.sortedMediaFragments = [];
        for (var i in self.mediaFragments){
            self.sortedMediaFragments.push([self.mediaFragments[i], self.mediaFragments[i].times.startTime]);
            self.sortedMediaFragments.sort(function(a, b) {return a[1] - b[1]});
        }
        //console.log(self.sortedMediaFragments);
        
        //M**** Ottimizza
        for (var k=0; k < self.sortedMediaFragments.length; k++){
            if (self.layers.length === 0){
                self.layers.push([self.sortedMediaFragments[k][0]]);
            }else{
                var j = 0;
                var added = false;
                while (typeof(self.layers[j]) !== "undefined"){
                    if (self.collision(self.layers[j], self.sortedMediaFragments[k][0].times) == false){
                        self.layers[j].push(self.sortedMediaFragments[k][0]);
                        added = true;
                        break;
                    }
                    j++;
                }
                if (added === false){
                    self.layers.push([self.sortedMediaFragments[k][0]]);
                }
            }
        }
        if (self.layers.length < 1)
            return
        for (var l=0; l< self.layers.length; l++){
            for (var e = 0; e < self.layers[l].length; e++){
                dojo.style(dojo.query('#pundit-timeline-container > div[about="'+self.layers[l][e].uri+'"]')[0],{
                    // marginTop: parseFloat(self.rowHeight * (l)) + 3 + 'px'
                    top: parseFloat(self.rowHeight * (l)) + 3 + 'px'
                });
            }
        }
    },
    
    collision:function(fragments, times){
        for (var i = 0; i< fragments.length; i++){
            if (parseFloat(times.startTime) < parseFloat(fragments[i].times.startTime)){
                if (parseFloat(times.endTime) >= parseFloat(fragments[i].times.startTime)){
                    return true;
                }
            }
            
            if (parseFloat(times.startTime) >= parseFloat(fragments[i].times.startTime)){
                //Start in the middle of the fragment
                if (parseFloat(times.startTime) <= parseFloat(fragments[i].times.endTime)){
                    return true;
                }
            }
        }
        return false;
    },
    
    resizeTimeline:function(w){
        var self = this,
            duration = semlibVideoPlayer.videoInfo.entry.media$group.media$content[0].duration,
            timelineWidth = dojo.style(dojo.byId('pundit-timeline-container'), 'width'),
            lAnnPanel = dojo.style('pundit-fp-timelineAnnotationPanel', 'left'),
            delta = 200,
            t, 
            left,
            width;

        //Repositionate the fragment
        for (var i in self.mediaFragments){
            t = self.mediaFragments[i].times,
            left = t.startTime*(timelineWidth/duration),
            width = (t.endTime -t.startTime)*(timelineWidth/duration);
            dojo.style(dojo.query('#pundit-timeline-container > div[about="'+i+'"]')[0],{
                left: left + 'px',
                width: width + 'px'
            });
        } 
        
        if (dojo.exists('semtube-timeline-fragment-marker')){
            var times = semlibVideoPlayer.getFragmentTime();


            var markerPosition = w * (times[0] / duration); //dovrebbe andare indietro di 10
            // var w = w * (timeEnd - timeStart) / duration;
            
            
            //Positionate the div and the image
            dojo.style(dojo.query('#' + name)[0],'left', markerPosition + 'px');
            
            
            w = w * (times[1]- times[0]) / duration;
            // var ls = mleftX +10;
            // var lr = ls + w;
            
            dojo.style('semtube-timeline-fragment-marker',{
                left: markerPosition + 'px',
                width: w + 'px'
            });    
        }
            
        //Repositionate the panel
        annotationPanel.repositionatePanel();        
    },

    zoomTimeline:function(){
        var self = this,
            w = dojo.position("pundit-timeline-scroller").w +200;//TODO FIX THIS IS HARDCODED

        //self.originalTimelineWidth = dojo.style(dojo.byId('pundit-timeline-container'), 'width');
        dojo.style("pundit-timeline-scroller", "width", w + "px");
        self.timelineAction = "zoom";
        self.addTimelineScale();
        self.myScroll.refresh();
        self.resizeTimeline(w, 'zoom');
    },

    panTimeline:function(){
        var self = this,
            w = dojo.position("pundit-timeline-scroller").w - 200,//TODO FIX THIS IS HARDCODED
            ww = dojo.window.getBox().w;

        //self.originalTimelineWidth = dojo.style(dojo.byId('pundit-timeline-container'), 'width');
        if (w < ww){
            w = ww;
        }
        dojo.style("pundit-timeline-scroller", "width", w + "px");
        // TODO Fix position of timeline to avoid blank space on the left
        // Something is wrong here!
        self.addTimelineScale();
        self.myScroll.refresh();
        self.timelineAction = "pan";
        self.resizeTimeline(w,'pan');
    },

    showAnnotationPanelTimeline: function(ann_id,x,y) {
        var r = document.createRange();
        r.selectNode(document.getElementById('containerPlayer'));
        var xpPlayer = fragmentHandler.range2xpointer(r);
                
        var self = this,
            finalContent = "";
            

        if (typeof ann_id === "string"){
            ann_id = [ann_id]
        }

        //DUBUG Marco Add check on annotation existance
        for (var i=0; i<ann_id.length; i++){
            if (typeof(self.annotations[ann_id[i]]) === 'undefined')
                return;

            var ann = self.annotations[ann_id[i]],
                panel_id = 'dialog_'+ann_id[0]+'_content',
                panel_buttons = '',
                panel_content = '',
                c = ann.content,
                m = ann.metadata,
                items = ann.items,
                panelXpointers = [],
                author_name,
                author_uri = m[ns.pundit_authorURI][0].value,
                annotation_date = m[ns.pundit_annotationDate][0].value;
            
            self.log("Showing annotation panel for "+ann_id[i]);
            
            // console.log(m);
            var author = 'http://purl.org/swickynotes/ao/v1#authorName';
            if (typeof m[author] === 'undefined')
                author = 'http://purl.org/dc/terms/creator';
            
            self.log("Showing annotation panel for "+ann_id[i]);
            // Header with metadata
            //panel_content += "<div class='metadata''><span class='author'>Created by: <b>"+m[author][0].value+"</b></;></span>";
            //panel_content += "<span class='date'>on date: <b>"+m['http://purl.org/dc/terms/created'][0].value+"</b><br/></span></div>";

            // TODO: ACL on the annotation? On the notebook?
            // TODO: add again the EDIT button

            if (author_uri === myPundit.user.uri)
                panel_buttons += "<span class='pundit-gui-button delete' about='"+ann_id+"'>Delete</span>";
                
            if (typeof(m[ns.pundit_authorName]) !== 'undefined' && m[ns.pundit_authorName][0].value !== '') 
                author_name = m[ns.pundit_authorName][0].value;
            else 
                author_name = "User: " + author_uri.substr(author_uri.lastIndexOf('/')+1, author_uri.length);

            // Header with metadata
            panel_content += "<div class='pundit-metadata'>";
            // DEBUG: if we remove a line here, the min-height of the whole annotation box gets in the
            // way and messes it up a bit .......
            // TODO: this is the right place to insert notebook or other infos
            panel_content += "<span class='author'><em>Created by</em> : "+author_name+"</span>";
            panel_content += "<span class='date'><em>On</em> : "+ annotation_date.split('T')[0] +", "+annotation_date.split('T')[1]+"</span>"
            panel_content += "</div>";

            // Content has all the xpointers associated to this annotation
            for (var uri in c) {

                // DEBUG SEMTUBE 
                //var uriType = c[uri][ns.rdf_type][0].value;
                //if ((uriType === ns.video) || (uriType === ns.video_fragment) || (uriType === ns.video_fragment_region)) {
                    // Finally produce the HTML for each statement
                
                // TODO Why this doesn't work
                //panel_content += self.getStatementHTML(c, uri);
                panel_content += tooltip_viewer.getStatementsHTML(c, items);
            } // for uri in c
            panel_content="<div class='semtube-annotation'>"+ panel_content + "</div>";
            finalContent += panel_content;
        }
        console.log(finalContent);

        //TODO Why this variable is global???
        annotationPanel.addHTMLContent(finalContent);
        annotationPanel.show(x,y);

        dojo.behavior.apply();
        setTimeout(function() {
            dojo.addClass(annotationPanel._id, 'pundit-smooth');
        }, 1000);
    }, // showAnnotationPanel()
    addTimelineTime:function(){
        
    },
    addTimelineScale:function(){
        //dojo.empty('pundit-timeline-scale');
        dojo.query(".semtube-scale-marker").forEach(dojo.destroy);
        var self = this,
            minDistance = 1,
            minTextDistance = 50,
            w = dojo.position("pundit-timeline-container").w,
            ww = dojo.window.getBox().w,
            duration = semlibVideoPlayer.videoInfo.entry.media$group.media$content[0].duration,
            secondSpace = w / duration,
            timelineWidth =dojo.style(dojo.byId('pundit-timeline-container'), 'width'),
            timeWindow = (duration / w) * ww,
            times = [1, 5, 10, 30, 60],
            spaces = [secondSpace, secondSpace * 5, secondSpace * 10, secondSpace *30, secondSpace *60];

        var l = 0;
        for (var i = 0; i < spaces.length -1; i++){
            if (duration > times[i]){
                if (spaces[i] > minDistance){
                    position = spaces[i];
                    var t = 0;
                    while (position < w){
                        // STYLE MUST CHANGE ACCORDING TO THE ORDER
                        var marker = '<span class="semtube-scale-marker semtube-timeline-scale-level-' + l + '" style="left:' + position +'px"></span>';
                        dojo.query("#pundit-timeline-scale").append(marker);
                        if (spaces[i] > minTextDistance){
                            var time = '<span class="semtube-scale-marker semtube-timeline-time-level-' + l + '" style="left:' + (position - 5) +'px;">' + self._secToTime((t +1)*times[i]) + '</span>';
                            dojo.query("#pundit-timeline-scale").append(time);
                        }
                        position += spaces[i];
                        t += 1;
                    }
                }else{
                    continue;
                }
            }else{
                break;
            }
            l += 1;
        }
    },
    _secToTime:function(s){
        if (s === 0)
           return "0";
        var r = "";
        var hours, minutes, seconds;
        hours = Math.floor(s / 3600);
        if (hours >= 1){
            r += hours + ":";
            s -= hours * 3600;
        }
        minutes = Math.floor(s / 60);
        if (minutes >= 1){
            r += minutes + ":";
            s -= minutes * 60;
        }
        seconds = s;
        if (seconds >= 10){
            r += seconds;
        }else if (seconds < 10){
            r += "0" + seconds;
        }else{
            r += "00";
        }
        if (r.indexOf("0") === 0){
            r = r.substring(1);
        }
        return r;
    },
    insertTimelineMarker:function(timeStart,timeEnd, name, color, classname){
        var self = this,
            tempMarkDiv,
            zin = 10000000000000000000,
            name = "semtube-timeline-fragment-marker",
            w = dojo.position("pundit-timeline-container").w;
            
        //TODO move this in a css
        var srcMarker, srcMarkerL, srcSelected;
        if (typeof(color) === 'undefined'){
            srcMarker = this.srcMarker + '.png';
            srcMarkerL = this.srcMarkerL + '.png';
            srcSelected = this.srcSelected + '.png';
        }else{
            srcMarker = this.srcMarker + '_' + color + '.png';
            srcMarkerL = this.srcMarkerL +  '_'  + color + '.png';
            srcSelected = this.srcSelected + '_' + color + '.png';
        }
        
        dojo.destroy('semtube-timeline-fragment-marker');

        tempMarkDiv  = '<div id="semtube-timeline-fragment-marker" class="mark" style="position:absolute; z-index:'+zin+'">';
        tempMarkDiv += '<div style="position:relative;width:100%">';
        tempMarkDiv += '<span class="markLeft"></span>';
        tempMarkDiv += '<span class="markRight"></span>';
        tempMarkDiv += '</div></div>';
        
        var duration = ytPlayer.getDuration();
        var markerPosition = w * (timeStart / duration); //dovrebbe andare indietro di 10
        // var w = w * (timeEnd - timeStart) / duration;
        dojo.place(tempMarkDiv, dojo.byId('pundit-timeline-scale'), 'first');
        
        //Positionate the div and the image
        dojo.style(dojo.query('#' + name)[0],'left', markerPosition + 'px');
        
        var mleftX = dojo.position(dojo.query('#' + name)[0],false).x - dojo.position(dojo.query('#' + name)[0],false).x - 10;
        
        var w = w * (timeEnd - timeStart) / duration;
        // var ls = mleftX +10;
        // var lr = ls + w;
        
        dojo.style(dojo.query('#' + name)[0],{
            left: markerPosition + 'px',
            width: w + 'px'
        });


        dojo.behavior.apply();
    },
    fmarkerMouseDown:function(e){
        this.markerMouseDown = true;
        this.isMovingRightMarker = true;
        this.startMouseDown = e.pageX;
        this.movingMarkLeft = dojo.query('#semtube-timeline-fragment-marker span.markLeft')[0];
        this.movingMarkRight = dojo.query('#semtube-timeline-fragment-marker span.markRight')[0];
        this.movingSegment = dojo.query('#semtube-timeline-fragment-marker span.segment')[0];
    },
    
    fmarkerLeftMouseDown:function(e){
        this.markerMouseDown = true;
        this.startMouseDown = e.pageX;
        this.isMovingLeftMarker = true;
        this.movingMarkLeft = dojo.query('#semtube-timeline-fragment-marker span.markLeft')[0];
        this.movingMarkRight = dojo.query('#semtube-timeline-fragment-marker span.markRight')[0];
        this.movingSegment = dojo.query('#semtube-timeline-fragment-marker span.segment')[0];
        
    },
    WindowMouseMove:function(e){
        if (this.markerMouseDown==true){
            var self = this,
            direction = 1,
            deltaX,
            w = dojo.position("pundit-timeline-container").w,
            mrLeft = dojo.position("semtube-timeline-fragment-marker",true).x + dojo.position("semtube-timeline-fragment-marker",true).w,
            mlLeft = dojo.position("semtube-timeline-fragment-marker",true).x,
            divLeft = dojo.position(dojo.query('#semtube-timeline-fragment-marker')[0]).x,   
            pbLeft = dojo.position(dojo.query('#pundit-timeline-scale')[0]).x;
            this.currMouseDown = e.pageX,
            deltaX = Math.abs(this.startMouseDown - this.currMouseDown);

            if (this.isMovingRightMarker == true){
                if (this.currMouseDown < this.startMouseDown){
                    direction = -1;
                }
                if ((mrLeft + deltaX*direction < pbLeft + w) && (mrLeft + deltaX*direction > mlLeft + 10)){
                    dojo.style("semtube-timeline-fragment-marker", {
                        width: dojo.position("semtube-timeline-fragment-marker").w + deltaX*direction + 'px'
                    });
                }
                this.startMouseDown = this.currMouseDown;
                semlibVideoPlayer.updateSelectedFragment(self.getFragmentTime());
            }
            if (this.isMovingLeftMarker == true){
                if (this.currMouseDown < this.startMouseDown){
                    direction = -1;
                }
                if ((mlLeft + deltaX*direction + 10 > pbLeft) && (mlLeft + deltaX*direction + 10 < mrLeft)){
                    dojo.style('semtube-timeline-fragment-marker', {
                        left: dojo.position('semtube-timeline-fragment-marker').x + deltaX * direction + 'px',
                        width: dojo.position('semtube-timeline-fragment-marker').w - deltaX * direction + 'px'
                    });
                }
                this.startMouseDown = this.currMouseDown;
                semlibVideoPlayer.updateSelectedFragment(self.getFragmentTime());
            }
        }
    },
    
    WindowMouseUp:function(e){
        //e.preventDefault();
        this.markerMouseDown=false;
        this.isMovingLeftMarker = false;
        this.isMovingRightMarker = false;
    },
    updateSelectedFragment:function(times){
        var self = this;
        dojo.destroy('semtube-timeline-fragment-marker');
        self.insertTimelineMarker(times[0], times[1]);
    },
    resizeSelectedFragment:function(times){
        var self = this,
            tempMarkDiv,
            zin = 10000000000000000000,
            name = "semtube-timeline-fragment-marker",
            w = dojo.position("pundit-timeline-container").w;
            
        //TODO move this in a css
        var srcMarker, srcMarkerL, srcSelected;
        if (typeof(color) === 'undefined'){
            srcMarker = this.srcMarker + '.png';
            srcMarkerL = this.srcMarkerL + '.png';
            srcSelected = this.srcSelected + '.png';
        }else{
            srcMarker = this.srcMarker + '_' + color + '.png';
            srcMarkerL = this.srcMarkerL +  '_'  + color + '.png';
            srcSelected = this.srcSelected + '_' + color + '.png';
        }

        tempMarkDiv  = '<div id="semtube-timeline-fragment-marker" class="mark" style="position:absolute; z-index:'+zin+'">';
        tempMarkDiv += '<div style="position:relative;width:100%">';
        tempMarkDiv += '<span class="markLeft"></span>';
        // tempMarkDiv += '<span class="segment"></span>';
        tempMarkDiv += '<span class="markRight"></span>';
        tempMarkDiv += '</div></div>';
        
        var duration = ytPlayer.getDuration();
        var markerPosition = w * (timeStart / duration); //dovrebbe andare indietro di 10
        // var w = w * (timeEnd - timeStart) / duration;
        dojo.place(tempMarkDiv, dojo.byId('pundit-timeline-scale'), 'first');
        
        //Positionate the div and the image
        dojo.style(dojo.query('#' + name)[0],'left', markerPosition + 'px');
        
        var mleftX = dojo.position(dojo.query('#' + name)[0],false).x - dojo.position(dojo.query('#' + name)[0],false).x - 10;
        
        var w = w * (timeEnd - timeStart) / duration;
        // var ls = mleftX +10;
        // var lr = ls + w;
        
        dojo.style(dojo.query('#' + name)[0],{
            left: markerPosition + 'px',
            width: w + 'px'
        });


        dojo.behavior.apply();
    },
    getFragmentTime:function(){
        var self = this;
        if(dojo.query("#semtube-timeline-fragment-marker").length>0){
            var fragmentInfo = {},
            ml = dojo.query('#semtube-timeline-fragment-marker span.markLeft')[0],
            mr = dojo.query('#semtube-timeline-fragment-marker span.markRight')[0],
            pb = dojo.byId('pundit-timeline-scroller'),
            l = Math.round(dojo.position(ml, false).x - dojo.position(pb,false).x + 9),
            c = Math.round(dojo.position(mr, false).x - dojo.position(pb,false).x);
            var st = parseInt(self.pos2time(l) * 100),
                st = st / 100,
                et = parseInt(self.pos2time(c) * 100),
                et = et / 100;
            return [st,et]
        }else{
            return []
        }
    },
    pos2time:function(pos){
        var w = dojo.style('pundit-timeline-scroller', 'width');
        var time = (pos/w * ytPlayer.getDuration());
        return time;
    },
});

