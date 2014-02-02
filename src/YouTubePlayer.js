//This should be responsible of loading the player:
//There were some problems:
//Fix all this global variables
dojo.provide("pundit.YouTubePlayer");
dojo.declare("pundit.YouTubePlayer", pundit.BaseComponent, {
    constructor:function(options){
        var self = this;
        self._player;
        self.videoLoaded = false;
        self._playerContainerId = options.playerContainerId || "videoDiv";
        
        self.createCallback([
            'PlayerReady'
        ]);

        (function() {   
            var h = document.getElementsByTagName('head')[0],
            d = document.createElement('script');
            d.type = 'text/javascript',
            d.src = 'http://localhost/~marco/pundit/pundit/semtube/js/swfobject.js';
            h.appendChild(d);
        })();
        return self._player;
    },
    //TODO Add more parameters to this function 
    //enabling to adapt the player dimension to the real video dimension, etc...
    loadPlayer:function(videoId, videoWidth, videoHeight, timeStart, timeEnd) { 
        var self = this,
            params = {
            allowScriptAccess: "always", 
            wmode : "opaque"
        };
        // The element id of the Flash embed
        // also pass videoId using name
        var atts = {
            id: "ytPlayer", 
            name: videoId
        };
        if (timeStart  == undefined){
            videoTimeStart = null;
        }else{
            videoTimeStart = timeStart;
        }
        if (typeof(videoWidth) === 'undefined'){
            videoWidth = 640;
        }
        if (typeof(videoHeight) === 'undefined'){
            videoHeight = 360;
        }

        // All of the magic handled by SWFObject (http://code.google.com/p/swfobject/)
        swfobject.embedSWF("http://www.youtube.com/apiplayer?" +
            "&enablejsapi=1&playerapiid=player1&version=3", 
            self._playerContainerId, videoWidth, videoHeight, "9", null, null, params, atts);    
    },
    
    loadVideoById:function(id){
        var self = this;
        if (self._player) {
            self._player.loadVideoById(id);
        }    
    },
    getDuration:function(){
        var self = this;
        return self._player.getDuration()
    },
    play:function(){
        var self = this;
        if (self._player) {
            self._player.playVideo();
        }
    },
    pause:function(){
        var self = this;
        if (self._player) {
            self._player.pauseVideo();
        }
    },
    seekTo:function(time){
        var self = this;
        if (self._player) {
            self._player.seekTo(time);
        }
    },
    mute:function(){
        var self = this;
        if (self._player) {
            self._player.mute();
        }    
    },
    unmute:function(){
        var self = this;
        if (self._player) {
            self._player.unMute();
        }   
    },
    
    updatePlayTime: function(videoCurrentTimeDiv, playTime){ 
        document.getElementById(videoCurrentTimeDiv).innerHTML = playTime;
    },
    
    //This should be on the superclass
    updatePlayerInfo:function(){
        var self = this;
        if(ytPlayer._player && ytPlayer._player.getDuration) {
            //Transfrm this into registrable callbacks
            //add METHOd to fire callbacks?
            

            semlibVideoPlayer.upDateProgressBarBarPlay(ytPlayer._player.getDuration(), ytPlayer._player.getCurrentTime());
            semlibVideoPlayer.upDateProgressBarBarLoaded(ytPlayer._player.getVideoBytesTotal(), ytPlayer._player.getVideoStartBytes(), ytPlayer._player.getVideoBytesLoaded());
            semlibVideoAnnotationViewer.updateCurrentAnnotations(ytPlayer._player.getCurrentTime());
	  
            //TODO Fix this self get Window ????
            //ytPlayer.updatePlayTime("videoCurrentTime", ytPlayer._player.getCurrentTime());
            semlibVideoPlayer.updatePlayTime(ytPlayer._player.getCurrentTime());
        }
    },
    onPlayerStateChange : function(newState){ 
        //TODO 
        //Fire callback!
        var self = this;
        if (newState==1){
            
            dojo.addClass(dojo.byId('play'), 'playing');
            if (self.videoLoaded === false){
                self.videoLoaded = true;
                var uri = window.location.href,
                    videoInfo;
                    semlibVideoAnnotationViewer.refreshAnnotations();
                if (uri.indexOf('t=') !== -1){
                    videoInfo = semlibVideoPlayer.parseUri(uri);
                    console.log(videoInfo.ti + ' | ' + videoInfo.tf);
                    semlibVideoPlayer.insertMarker(videoInfo.ti,videoInfo.tf,'tempMark','yellow');
                }
            }
        }
	
        if (newState==2){
            dojo.removeClass(dojo.byId('play'), 'playing');
        }
	
        //player.getPlayerState():Number
        //Returns the state of the player. Possible values are unstarted (-1), ended (0), playing (1), paused (2), buffering (3), video cued (5).
	
        if (newState==3){
            if (semlibVideoPlayer.firstBuffer==true){
                        
                semlibVideoPlayer.absoluteBytesTotal = ytplayer.getVideoBytesTotal();
                if (semlibVideoPlayer.mark2ins==true){
                    var duration = semlibVideoPlayer.getDuration();
                    var segmentTimes = semlibVideoPlayer.getSegmentTime(semlibVideoPlayer.p.value);
                    //attenzione a quando il non è stato fatto il play duration = 0
                    var width =(segmentTimes[1]-segmentTimes[0])*480 / duration;
                    var pxWidth = width + 'px';
                    ytplayer.seekTo(segmentTimes[0], true);
                    semlibVideoPlayer.pos_x = (segmentTimes[0])*480 / duration;
                    semlibVideoPlayer.realOffsetLoaded = pos_x;
                    semlibVideoPlayer.mark2ins=false;
					
                }	
                semlibVideoPlayer.firstBuffer=false;
            }
        }
        if (newState==5){
            self._player.playVideo();
        }
    },
    onPlayerError : function(errorCode){ 
        alert("An error occured of type:" + errorCode);
    },
    //TODO
    //Is this ever used?
    ready: function(){
        self.fireOnPlayerReady();
    }
});

//TODO How to handle this dojo style???
function onYouTubePlayerReady(playerId) {
    ytPlayer._player = document.getElementById("ytPlayer");
    ytPlayer._player.addEventListener("onStateChange", "ytPlayer.onPlayerStateChange");
    ytPlayer._player.addEventListener("onError", "ytPlayer._player.onPlayerError");
    
    // This causes the updatePlayerInfo function to be called every 250ms to
    // get fresh data from the player
    setInterval(ytPlayer.updatePlayerInfo, 250);
    // setInterval(ytPlayer.updatePlayerInfo, 250);
    
    ytPlayer.updatePlayerInfo();//????

    
    //Load an initial video into the player
    if (videoTimeStart == null){
		ytPlayer._player.cueVideoById(ytPlayer._player.name);
	}
	else{
		ytPlayer._player.cueVideoById(ytPlayer._player.name,videoTimeStart);
	}
    //ytPlayer._player.onReady();

    //TODO Fix this to use events
    semlibVideoPlayer.fireOnVideoPlayerReady();
    semlibVideoPlayer.onPlayerReady();
}
