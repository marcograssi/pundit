dojo.provide( "pundit.SemlibVideoPlayer");
dojo.declare("pundit.SemlibVideoPlayer", pundit.BaseComponent, {

    debug: false,

    constructor: function(options) {
        var self = this;
        self.videoInfo={};
        this.initContextMenu();
        this.initBehaviors();
        
        //TODO Pass this parameters as options
        this.videoId = 'm3dV8a0MZ7g';
        this.videoWidth = dojo.style('progressBar','width');
        this.videoHeight = 360;
        
        //TODO Fix name?
        this.offsetLoad = 0;//DEBUG Check if needed as class variable or just as local variable
        this.realOffsetLoaded = 0;
        
        this.time = 0;
        
        this.markerMouseDown = false;
        this.movingMarkLeft;
        this.movingMarkRight;
        this.movingSegment;

        this.timelineHeight = 250;

        //TODO Is this fired somewhere
        self.createCallback([
            'VideoPlayerReady'
        ]);

        this.ann = {};

        _PUNDIT['commentTag'].onSaveItems(function(){
            dojo.destroy('tempMark');
            dojo.destroy('semtube-timeline-fragment-marker');
        });

        this.init(); 
    },
    
    initContextMenu:function(){
        var self = this;
        
        cMenu.addAction({
            type: ['videofragmentitem'],
            name: 'removeVideoFragmentItem',
            label: 'Remove this item',
            showIf: function(item) {
                return true;
            },
            onclick: function(item) {
                semlibItems.removeItemFromUri(item.value);
                dojo.behavior.apply();
                return true;
            }
        });

        // Semlibitem: open its webpage if item is not a textfragment
        cMenu.addAction({
            type: ['videofragmentitem'],
            name: 'openVideoFragmentPage',
            label: 'Open Web Page',
            showIf: function(item) {
                return true;
            },
            onclick: function(item) {
                //Youtube doesn't fully support media fragment but can 
                //reproduce video starting from second x with paramenter t=x
                //Should redirect in the youtube page otherwise some content 
                //could be blocked
                var uri = item.value,
                    sTime = semlibVideoAnnotationViewer.getAnnotationTime(uri).startTime,
                    baseuri = uri.split('#')[0],
                    id = baseuri.substring(baseuri.lastIndexOf('/') + 1),
                    youtubeuri = 'http://www.youtube.com/watch?v=' + id + '#t=' + sTime;
                window.open(youtubeuri, 'SemLibOpenedWebPage');
                return true;
            }
        });
        
        // Semlibitem: open its webpage if item is not a textfragment
        cMenu.addAction({
            type: ['videofragmentitem'],
            name: 'playVideoFragmentItem',
            label: 'Play this video fragment',
            showIf: function(item) {
                return true;
            },
            onclick: function(item) {
                self.playFragment(item.value);
                return true;
            }
        });
        
        cMenu.addAction({
            type: ['pundit-my-items'],
            name: 'playVideoFragment',
            label: 'Play this video fragment',
            showIf: function(item) {
                var uri = item.value,
                    rdftype = _PUNDIT['items'].getItemByUri(uri).rdftype;
                for (var i in rdftype){
                    if (rdftype[i] === ns.video || rdftype[i] === ns.video_fragment || rdftype[i] === ns.video_fragment_region)
                        return true;
                } 
                return false;
            },
            onclick: function(item) {
                self.playFragment(item.value);
                return true;
            }
        });
        
        cMenu.addAction({
            type: ['pundit-page-items'],
            name: 'playVideoFragment',
            label: 'Play this video fragment',
            showIf: function(item) {
                var uri = item.value,
                    rdftype = _PUNDIT['items'].getItemByUri(uri).rdftype;
                for (var i in rdftype){
                    if (rdftype[i] === ns.video || rdftype[i] === ns.video_fragment || rdftype[i] === ns.video_fragment_region)
                        return true;
                } 
                return false;
            },
            onclick: function(item) {
                self.playFragment(item.value);
                return true;
            }
        });
        
    },
    
    initBehaviors:function(){
        var self = this;
        
        //BUTTONS
        dojo.connect(dojo.byId("btnLoad"), 'onclick', function(e){
            self.loadVideoFromInput();
        });
        
        dojo.connect(dojo.byId('play'), 'onclick', function(e){
            self.togglePlay();
        });
        
        //PROGRESS BAR
        //Move cursor when clicking on the progress bar
        dojo.connect(dojo.byId("progressBar"), 'onmouseup', function(e){
            self.movePlayerCursor(e);
        });
        
        //Add marker on progress bar when clickin on annotation button
        dojo.connect(dojo.byId("annotate"), 'onclick', function(e){
            self.InsertFrameAnnotation(e);
        });
        
        //TODO This is not used anymore
        dojo.connect(dojo.byId('selRegion'), 'onclick', function(){
            if (dojo.query('#tempMark').length > 0){
                if (dojo.hasClass(dojo.query('#tempMark')[0], 'unsaved')){
                    dojo.query('#canvasTools button').forEach(function(item){
                        item.disabled = false
                    });
                }
            }
        });
        
        dojo.behavior.add({
            '#progressBar div span.markLeft': {
                'onmousedown': function(e){
                    console.log("left mouse down");
                    self.fmarkerLeftMouseDown(e);
                }
            },
            '#progressBar div span.markRight': {
                'onmousedown': function(e){
                    console.log("right mouse down");
                    self.fmarkerMouseDown(e);
                }
            }
        });
        
        
        dojo.connect(window, 'onmousemove',function(e){
            self.WindowMouseMove(e);
        });
        
        dojo.connect(window, 'onmouseup',function(e){
            self.WindowMouseUp(e);
        });
        
        dojo.connect(dojo.byId('addTag'), 'onclick', function(){
            var itemInfo = self.getFragmentInfo(),
                selectors = [],
                parentItemXP = 'http://www.youtube.com/v/' + itemInfo.isPartOf,
                item = {};
                
                selectors.push({
                    sTime : itemInfo.sTime,
                    eTime : itemInfo.eTime,
                    type : 'timeFragment'
                });
                
            if (typeof(itemInfo) !== 'undefined'){
                dojo.query('#canvasTools button').forEach(function(item){
                    item.disabled = true;
                });
                item.data = itemInfo;
                item.data.selectors = selectors;
                item.data.parentItemXP = parentItemXP;
                item.data.rdfData = semlibItems.createBucketForVideo(item).bucket;
                previewer.buildPreviewForItem(item.data);
                semlibItems.addItem(item.data);
            }
                _PUNDIT['commentTag'].initPanel(item.data, 'Comment Tag');
        });
        
        dojo.connect(dojo.byId('saveMarker'), 'onclick', function(){
            var fragmentInfo = self.getFragmentInfo(),
                item = {};
            if (typeof(fragmentInfo) !== 'undefined'){
                dojo.query('#canvasTools button').forEach(function(item){
                    item.disabled = true;
                });
                dojo.destroy('tempMark');
                item.data = fragmentInfo;
                item.data.rdfData = semlibItems.createBucketForVideo(item).bucket;
                previewer.buildPreviewForItem(item.data);
                semlibMyItems.addItem(item.data);
            }
        });

        dojo.connect(dojo.byId('deleteSelected'), 'onclick', function(){
            dojo.destroy('tempMark');
            dojo.destroy('semtube-timeline-fragment-marker');
        });
    },

    resizeVideo:function(){
        var self= this,
            video = dojo.query("object")[0],
            vs = dojo.window.getBox(),
            h = vs.h - 100 - self.timelineHeight,
            //TODO We use fixed ratio as it is not available from YouTube
            ratio = 16 / 9;
        
        dojo.attr(video, {
            "height" : h,
            "width" : h * ratio,
            "data-aspectRatio" : ratio
        });            
    },

    onVideoDimension:function(w,h){
        var self = this;
        if (self.playerLoaded){
            self.resizeVideo();
        }
        self.videoRatioSet = true;
    },

    onPlayerReady:function(){
        var self = this;
        if (self.videoRatioSet === true){
            self.resizeVideo();
        }
        self.playerLoaded = true;
    },
    
    getFragmentTime:function(){
        if(dojo.query("#tempMark").length>0){
            var fragmentInfo = {},
                ml = dojo.query('#tempMark span.markLeft')[0],
                mr = dojo.query('#tempMark span.markRight')[0],
                pb = dojo.byId('progressBar'),
                l = Math.round(dojo.position(ml, false).x - dojo.position(pb,false).x + 9),
                c = Math.round(dojo.position(mr, false).x - dojo.position(pb,false).x),
                st = parseInt(this.pos2time(l) * 100),
                st = st / 100,
                et = parseInt(this.pos2time(c) * 100),
                et = et / 100;
            return [st,et]
        }else{
            return []
        }
    },

    //TODO
    //Reuse and extend image annotation
    //Review the format used to save fragments :(
    getFragmentInfo:function(){
        if(dojo.query("#tempMark").length>0){
            var fragmentInfo = {},
            ml = dojo.query('#tempMark span.markLeft')[0],
            mr = dojo.query('#tempMark span.markRight')[0],
            pb = dojo.byId('progressBar'),
            l = Math.round(dojo.position(ml, false).x - dojo.position(pb,false).x + 9),
            c = Math.round(dojo.position(mr, false).x - dojo.position(pb,false).x),
            st = parseInt(this.pos2time(l) * 100),
            st = st / 100;
            et = parseInt(this.pos2time(c) * 100),
            et = et / 100,
            title = this.videoInfo.entry.title.$t,
            fragmentInfo = {
                sTime: st,
                eTime: et,
                uri: 'http://www.youtube.com/v/' + this.videoId + '#t=' + st + ',' + et,
                type: ['subject'],
                value: 'http://www.youtube.com/v/' + this.videoId + '#t=' + st + ',' + et,
                target: 'http://www.youtube.com/v/' + this.videoId + '#t=' + st + ',' + et,
                pageContext: window.location.href,
                isPartOf: 'http://www.youtube.com/v/' + this.videoId,
                //TODO Improve by taking the closest thumbnail
                depiction: this.videoInfo.entry.media$group.media$thumbnail[0].url,
                description: this.videoInfo.entry.media$group.media$description.$t
            };
            //TODO Handle different type of fragment video region and entire video
            fragmentInfo.rdftype = [ns.video_fragment];
            fragmentInfo.label= 'VF: ' + title + ' [' + st + ',' + et + ']';
            return fragmentInfo;
        }else {
            return {
                uri: 'http://www.youtube.com/v/' + this.videoId,
                type: ['subject'],
                rdftype: [ns.video],
                value: 'http://www.youtube.com/v/' + this.videoId,
                label: 'V: ' + this.videoInfo.entry.title.$t,
                target: 'http://www.youtube.com/v/' + this.videoId,
                depiction: this.videoInfo.entry.media$group.media$thumbnail[0].url,
                description: this.videoInfo.entry.media$group.media$description.$t
            };
        }
    },
    //
    playFragment2:function(mediaFragment){
        dojo.query('.mark').forEach(function(item){
            if (!dojo.hasClass(item, 'unsaved') || !dojo.hasClass(item, 'playing'))
                dojo.destroy(item);
        });
        this.playFragment(mediaFragment);
    },
    playFragment:function(mediaFragment){
        var self=this,
            times = semlibVideoAnnotationViewer.getAnnotationTime(mediaFragment),
            pos_x;
        
        //Remove the current player marker
        if (dojo.query('.mark.playing').length > 0){
            dojo.destroy(dojo.query('.mark.playing')[0]);
        }
        
        if (typeof(times) !== 'undefined'){
            //DEBUG MARCO
            //Now selected marker is no more shown on mouse over
            //dojo.addClass(dojo.query('.mark.fixed')[0], 'playing');
            self.insertMarker(times.startTime, times.endTime, null, 'lightgray', 'playing');
            
            ytPlayer.seekTo(times.startTime, true);
            ytPlayer.play();
            pos_x = (times.startTime)* this.videoWidth / ytPlayer.getDuration();
            this.realOffsetLoaded = pos_x;
        }else{
            ytPlayer.seekTo(0, true);
            ytPlayer.play();
            pos_x = 0;
            this.realOffsetLoaded = pos_x;
        }
    },
    
    InsertFrameAnnotation:function(){
        var self  = this,
            time;
        if (typeof(ytPlayer) !== 'undefined'){
            time = ytPlayer._player.getCurrentTime();
            self.insertMarker(time, time + 1);
            semlibVideoAnnotationViewer.insertTimelineMarker(time, time +1);
            dojo.addClass(dojo.byId('tempMark'), 'unsaved');
            dojo.query('#canvasTools button').forEach(function(item){
                item.disabled = false
            });
        }
    
    },
    setTitle:function(title){
        dojo.html.set('videoTitle', title);
    },

    setVideoLength:function(seconds){
        var self = this;
        dojo.byId('videoTotalTime').innerHTML = self.secToTimeString(seconds);
    },
    
    init:function(){
        var self = this,
            address = document.location.href,
            videoInfo = this.parseUri(address);

        this.isFirstAnn=true;
        this.isRdfVisible=false;
        this.isMovingLeftMarker = false;
        this.fake=false;
        this.markerMouseDown=false;

        this.pbOffLeft = dojo.position(dojo.byId("progressBar")).x

        this.playerCursor=document.getElementById('playerCursor');
        
        this.segmentWidth='1px';
        this.markerMouseDown = false;
	
        if (this.isMediaFragment(address)==true){
            if (videoInfo !== null){
                if (typeof(videoInfo.videoId) !== 'undefined'){
                    
                    this.videoId = videoInfo.videoId;
                    
                    ytPlayer = new pundit.YouTubePlayer("videoDiv");
                    if (typeof(videoInfo.ti) !== 'undefined'){
                        ytPlayer.loadPlayer(videoInfo.videoId, videoInfo.ti);
                    }
                    else
                        ytPlayer.loadPlayer(videoInfo.videoId);
                }
                this.videoId = videoInfo.videoId;
            }
        }
        else {
            ytPlayer = new pundit.YouTubePlayer("videoDiv");
            ytPlayer.loadPlayer(this.videoId);
        }
        //TODO This is useless... does not provide the right dimension but always 4/3 ratio...
        dojo.io.script.get({
            callbackParamName: "callback",
            url: "http://noembed.com/embed?url=http%3A//www.youtube.com/watch%3Fv%3DbDOYN-6gdRE",
            load: function(videoInfo) {
                self.vWidth = videoInfo.width;
                self.vHeight = videoInfo.height;
                self.onVideoDimension();
            },
            error: function(response, ioArgs) {
                self.log("youtube info got an error :(" + error);
            }
        });

        dojo.io.script.get({
            callbackParamName: "callback",
            url: "http://gdata.youtube.com/feeds/api/videos/" + self.videoId + "?alt=json",
            load: function(videoInfo) {
                self.setTitle(videoInfo.entry.title['$t']);
                self.setVideoLength(videoInfo.entry['media$group']['yt$duration'].seconds);
                self.videoInfo = videoInfo;
            },
            error: function(response, ioArgs) {
                self.log("youtube info got an error :(" + error);
                
            }
        });
        self.fireOnVideoPlayerReady();
    },
  
    loadVideoFromInput:function(e){  	
        var vId = "",	
            location = ns.semtubeUri,
            uri = dojo.byId("inputMediaUri").value;
            uriParts, queryPart, params,
            s;
        if (uri.indexOf('www.youtube.com') != -1){		
            if(uri.indexOf('?') != -1){			
                uriParts = uri.split('?');			
                queryPart = uriParts[1];			
                params = new Array();			
                params =  queryPart.split('&');			
                for (var i=0; i< params.length; i++){				
                    s = String(params[i]);				
                    if (s.substr(0,2) =='v='){					
                        vId = s.substring(2);				
                    }			
                }					
            }		
            window.location.href = window.location.href.split('?')[0] + '?id=' + vId;
        }else{
            alert("URI is not correct");
        }
    },

    parseUri:function(uri){
        var videoInfo = {},
            arrayUri = uri.split('?'),
            videoParams,
            timeArray =[];
        if  (arrayUri.length == 2){
            videoParams = arrayUri[1].split('&');
            for (var i = videoParams.length -1 ; i>=0; i--){
                if (videoParams[i].indexOf('id=') == 0){
                    videoInfo.videoId = videoParams[i].substring(3);
                }
                if (videoParams[i].indexOf('t=') == 0){
                    timeArray = videoParams[i].substring(2).split(',');
                    if  (arrayUri.length == 2){
                        videoInfo.ti = timeArray[0];
                        videoInfo.tf = timeArray[1];
                    }
                }
            }
        }
        return videoInfo;
    },
    
    togglePlay:function (){
        if(dojo.hasClass(dojo.byId('play'), 'playing')){
            ytPlayer.pause();
        }
        else {
            ytPlayer.play();
        }
    },
    
    isMediaFragment:function(uri){
        //Todo use construct
        //controlla se contine un media fragment
        if (uri.indexOf("?") == -1) return false;
        else return true;
    },
  
    //prende l'URI e lo splitta in 2 parti e prende tempo iniziale e tempo finale
    getSegmentTime:function(uri) {
        //funzione che splitta l'URI
        var stringaArray = uri.split('#'),
            stringaTimes = stringaArray[1],
            times = stringaTimes.substr(2),
            splitTime = times.split(',');
        return splitTime;
    },
    
    upDateProgressBarBarLoaded:function(bytesTotal, startBytes, bytesLoaded){
        var percentageLoad,
            attributesPlayerLoaded,
            w,
            offsetLoad;
        if (bytesLoaded>0){
            if (startBytes>0){
                if (typeof(realOffsetLoaded) !== 'undefined')
                    this.offsetLoad = this.realOffsetLoaded;
                else
                    this.offsetLoad = this.videoWidth * startBytes / bytesTotal;
                    percentageLoad =  (this.videoWidth - this.offsetLoad) * bytesLoaded / (bytesTotal - startBytes);
            }else{
                this.offsetLoad = this.videoWidth * startBytes / bytesTotal;
                percentageLoad =  (this.videoWidth - this.offsetLoad) * bytesLoaded / bytesTotal;
            }

            dojo.style('playerLoaded',{
                "width": percentageLoad + "px",
                "margin-left": this.offsetLoad + "px"
            });

            w = dojo.position("pundit-timeline-container").w,
            offsetLoad = w * bytesLoaded / bytesTotal;
            dojo.style("semtube-timeline-loaded-marker", 'width', offsetLoad + "px");
        }
    },

    upDateProgressBarBarPlay:function(duration, currentTime){
        if (currentTime>0){
            var offset =  (this.videoWidth)*(currentTime / duration),
                w = dojo.position("pundit-timeline-container").w,
                left = w*(currentTime / duration);;

            dojo.style('playerCursor', 'margin-left', offset -1 + "px")

            //Update Timeline
            dojo.style('semtube-timeline-time-marker', 'left', left + "px");
        }
    },

    secToTimeString:function(s){
        var h,m,s,
            timeStr = "";

        if (s >= 3600){
            h = Math.floor(s / 3600);
            s -= h *3600
        }
        if (s >= 60){
            m = Math.floor(s / 60);
            s -= m * 60;
        }
        if (typeof h !== 'undefined'){
            timeStr = h + ":";
        }
        if (typeof m === 'undefined'){
            timeStr += "00:";
        }else{
            if (m <= 10){
                timeStr += "0"+m+":";
            }else{
                timeStr += m+":";
            }
        }

        if (s <10){
            timeStr += "0" + Math.floor(s);
        }else{
            timeStr += Math.floor(s);
        }
        return timeStr;
    },

    updatePlayTime:function(s){
        var self = this;
        dojo.byId('videoCurrentTime').innerHTML = self.secToTimeString(s);
    },

    movePlayerCursor:function(e){
        var pos_x = e.pageX - dojo.position('progressBar',false).x,
            time = (pos_x/this.videoWidth * ytPlayer.getDuration()) | 0;
        ytPlayer.seekTo(time, true);
        this.realOffsetLoaded = pos_x;
    },

    pos2time:function(pos){
        var time = (pos/this.videoWidth * ytPlayer.getDuration());
        return time;
    },
    
    time2pos:function(time){
        return this.videoWidth/ytPlayer.getDuration() * time;
    },
    
    insertMarkerOld:function(timeStart,timeEnd, name, color, classname){
        var self = this,
            tempMarkDiv;

        //TODO This is not used anymore
        if (typeof classname === 'undefined'){
            classname = "";
        }else{
            zin = 9;
        }
            
        if (typeof(name) === 'undefined'){
            //nascondo eventuali altri marker
            dojo.destroy('tempMark');
            name = 'tempMark';
        }else{
            name = name + Math.floor(Math.random()*1000);
        }
        
        tempMarkDiv  = '<div id="' + name + '" class="mark ' + classname + '" style="position:absolute; z-index:'+zin+'">';
        tempMarkDiv += '<span class="markLeft"></span>';
        tempMarkDiv += '<span class="segment"></span>';
        tempMarkDiv += '<span class="markRight"></span>';
        tempMarkDiv += '</div>';
        
        var duration = ytPlayer.getDuration();
        var markerPosition = this.videoWidth * (timeStart / duration); //dovrebbe andare indietro di 10
        
        dojo.place(tempMarkDiv, dojo.byId('progressBar'), 'first');
        
        //Positionate the div and the image
        dojo.style(dojo.query('#' + name)[0],'left', markerPosition + 'px');
        
        var mleftX = dojo.position(dojo.query('#' + name + ' span.markLeft')[0],false).x - dojo.position(dojo.query('#' + name)[0],false).x - 10;
        
        var w = this.videoWidth * (timeEnd - timeStart) / duration;
        var ls = mleftX +10;
        var lr = ls + w;
        dojo.style(dojo.query('#' + name + ' span.markLeft')[0],{
            left: mleftX + 'px'
        });
        dojo.style(dojo.query('#' + name + ' span.segment')[0],{
            left: ls + 'px',
            width: w + 'px'
        });
        dojo.style(dojo.query('#' + name + ' span.markRight')[0],{
            left: lr + 'px'
        });
        dojo.behavior.apply();
    },

    insertMarker:function(timeStart,timeEnd, name, color, classname){
        var self = this,
            tempMarkDiv,
            name ="tempMark",
            duration = ytPlayer.getDuration(),
            w = this.videoWidth * (timeEnd - timeStart) / duration,
            markerPosition = this.videoWidth * (timeStart / duration); //dovrebbe andare indietro di 10????

        //TODO This is not used anymore
        // if (typeof classname === 'undefined'){
        //     classname = "";
        // }else{
        //     zin = 9;
        // }
            
        // if (typeof(name) === 'undefined'){
        //     //nascondo eventuali altri marker
        //     dojo.destroy('tempMark');
        //     name = 'tempMark';
        // }else{
        //     name = name + Math.floor(Math.random()*1000);
        // }
        dojo.destroy(name);

        tempMarkDiv  = '<div id="' + name + '" class="mark" style="position:absolute; z-index:9">';
        tempMarkDiv += '<div style="position:relative;width:100%">';
        tempMarkDiv += '<span class="markLeft"></span>';
        tempMarkDiv += '<span class="markRight"></span>';
        tempMarkDiv += '</div></div>';
        
        //Positionate the div and the image
        dojo.place(tempMarkDiv, dojo.byId('progressBar'), 'first');
        dojo.style(dojo.query('#' + name)[0],'left', markerPosition + 'px');

        dojo.style(name,{
            left: markerPosition + 'px',
            width: w + 'px'
        });
        dojo.behavior.apply();
    },
    
    fmarkerMouseDown:function(e){
        if (dojo.attr(dojo.query(e.target).parent().parent()[0],'id') === 'tempMark'){
            //DOMhelp.stopDefault(e);
            this.markerMouseDown = true;
            this.isMovingRightMarker = true;
            this.startMouseDown = e.pageX;
            this.movingMarkLeft = dojo.query('#tempMark span.markLeft')[0];
            this.movingMarkRight = dojo.query('#tempMark span.markRight')[0];
            this.movingSegment = dojo.query('#tempMark span.segment')[0];
        }
    },
    
    fmarkerLeftMouseDown:function(e){
        if (dojo.attr(dojo.query(e.target).parent().parent()[0],'id') === 'tempMark'){
            //DOMhelp.stopDefault(e);
            this.markerMouseDown = true;
            this.startMouseDown = e.pageX;
            this.isMovingLeftMarker = true;
            this.movingMarkLeft = dojo.query('#tempMark span.markLeft')[0];
            this.movingMarkRight = dojo.query('#tempMark span.markRight')[0];
            this.movingSegment = dojo.query('#tempMark span.segment')[0];
        }
    },
    
    WindowMouseMove:function(e){
        var self = this;
        if (this.markerMouseDown===true){

            var direction = 1,
                deltaX = 0,
                // TODO is this cross browser?
                
                mrLeft = dojo.position("tempMark",true).x + dojo.position("tempMark",true).w,
                mlLeft = dojo.position("tempMark",true).x,
                // TODO improve this. Avoid query all the time
                divLeft = dojo.position('tempMark').x,   
                pbLeft = dojo.position('progressBar').x;
            this.currMouseDown = e.pageX;
            deltaX = Math.abs(this.startMouseDown - this.currMouseDown);
            if (this.currMouseDown < this.startMouseDown){
                direction = -1;
            }
                
            if (this.isMovingRightMarker === true){
                if ((mrLeft + deltaX*direction < pbLeft + this.videoWidth) && (mrLeft + deltaX*direction > mlLeft)){
                    dojo.style("tempMark", {
                        width: dojo.position('tempMark').w+ deltaX*direction + 'px'
                    });
                }
                this.startMouseDown = this.currMouseDown;
                //Update the position of the fragment on the scrollbar
                semlibVideoAnnotationViewer.updateSelectedFragment(self.getFragmentTime());
            }
            if (this.isMovingLeftMarker == true){
                if ((mlLeft + deltaX*direction > pbLeft) && (mlLeft + deltaX*direction < mrLeft)){
                    console.log(dojo.position('tempMark',true).x)
                    dojo.style("tempMark", {
                        left: dojo.position('tempMark',true).x - pbLeft + deltaX * direction + 'px',
                        width: dojo.position('tempMark',true).w - deltaX * direction + 'px'
                    });
                }
                this.startMouseDown = this.currMouseDown;

                //Update the position of the fragment on the scrollbar
                semlibVideoAnnotationViewer.updateSelectedFragment(self.getFragmentTime());
            }
        }
    },
    
    WindowMouseUp:function(e){
        var self = this;
        self.markerMouseDown=false;
        self.isMovingLeftMarker = false;
        self.isMovingRightMarker = false;
    },
//  TODO Fix BUG annotationsArray ??? is global
    upDateCurrentAnnotations:function(currentTime){
        var currentAnnotations = [],
            annotationsWholeVideo = [],
            diveToHighlight = null;
        if (typeof(annotationsArray[i].startTime) == "undefined" && typeof(annotationsArray[i].endTime) == "undefined"){
            annotationsWholeVideo.push(annotationsArray[i]);
        }else{
            var idNote = annotationsArray[i].id;
            if(annotationsArray[i].endTime < currentTime || annotationsArray[i].startTime > currentTime){
                //M**** Check if this is working
                diveToHighlight = dojo.query("#tabAnnotation #" + idNote).children();
                dojo.removeClass("highlight", diveToHighlight);
                dojo.addClass("my-widget-header", diveToHighlight);
            }
            if(annotationsArray[i].startTime < currentTime && annotationsArray[i].endTime > currentTime){
                currentAnnotations.push(annotationsArray[i]);
                //M**** Check if this is working
                diveToHighlight = dojo.query("#tabAnnotation #" + idNote).children();
                dojo.removeClass("my-widget-header", diveToHighlight);
                dojo.addClass("highlight", diveToHighlight);
            }
        }
    },
    updateSelectedFragment:function(times){
        var self = this;
        dojo.destroy('tempMark');
        self.insertMarker(times[0], times[1]);
    }
});