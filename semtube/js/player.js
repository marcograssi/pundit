function object(o){
    function F(){}
    F.prototype = o;
    return new F();
};
//Use Parasitic Combination Interface
function inheritPrototype(subType, superType){
    var prototype = object(superType.prototype);   //create object
    prototype.constructor = subType;               //augment object
    subType.prototype = prototype;                 //assign object
};

///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
//Generic Player "Interface"
function BasePlayer(videoContainerDiv,videoId){ 
	this.videoContainerDiv = videoContainerDiv;
	this.videoId = videoId;
};
BasePlayer.prototype.loadPlayer = function(videoId,timeStart,timeEnd) { 
};
BasePlayer.prototype.loadVideoById = function(id) {	 
};
BasePlayer.prototype.seekTo = function(time){ 
};
BasePlayer.prototype.play = function(){ 
};
BasePlayer.prototype.pause = function(){ 
};
BasePlayer.prototype.mute = function(){ 
};
BasePlayer.prototype.unmute = function(){ 
};
BasePlayer.prototype.setVolume = function(){ 
};
BasePlayer.prototype.onPlayerReady = function(){ 
};
//TODO MARCO
//Callback should be catched in the videoplayerlib
BasePlayer.prototype.updatePlayerInfo = function() { 
	// Also check that at least one function exists since when IE unloads the
	  //         // page, it will destroy the SWF before clearing the interval.
   
   if(ytplayer && ytplayer.getDuration) {
      //updateHTML("videoDuration", ytplayer.getDuration());
	  
	  //Transfrm this into registrable callbacks
	  //add METHOd to fire callbacks
	  
      semlibVideoPlayer.upDateProgressBarBarPlay(ytplayer.getDuration(), ytplayer.getCurrentTime());
      semlibVideoPlayer.upDateProgressBarBarLoaded(ytplayer.getVideoBytesTotal(), ytplayer.getVideoStartBytes(), ytplayer.getVideoBytesLoaded());
      //semlibVideoPlayer.upDateCurrentAnnotations(ytplayer.getCurrentTime());
      
      semlibVideoAnnotationViewer.updateCurrentAnnotations(ytplayer.getCurrentTime());
	    
      //
      //ytPlayer.updatePlayTime("videoCurrentTime", ytplayer.getCurrentTime());
      console.log("ANTLDJFSKDF");
      semlibVideoPlayer.updatePlayTime(ytplayer.getCurrentTime());

      // updateHTML("bytesTotal", ytplayer.getVideoBytesTotal());
      // updateHTML("startBytes", ytplayer.getVideoStartBytes() | 0);
      //updateHTML("bytesLoaded", ytplayer.getVideoBytesLoaded());
      //updateHTML("volume", ytplayer.getVolume());
      
      
    }
};
// function updateHTML(elmId, value) {
//     document.getElementById(elmId).innerHTML = value;
// }
// BasePlayer.prototype.updatePlayTime = function(videoCurrentTimeDiv, playTime){ 
// 	document.getElementById(videoCurrentTimeDiv).innerHTML = playTime;
// };
BasePlayer.prototype.onPlayerStateChange = function(newstate){ 
	//Copiare il codice
};
BasePlayer.prototype.onPlayerError = function(errorCode){ 
	//Copiare il codice
};

///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
//YouTubePlayer
var videoLoaded = false;
function YouTubePlayer(videoContainerDiv, videoId){ 
	BasePlayer.call(this, videoContainerDiv, videoId);
	//extend properties...
	//this.other = other;
};
inheritPrototype(YouTubePlayer, BasePlayer);
YouTubePlayer.prototype.loadPlayer = function(videoId,timeStart, timeEnd) { 
	var params = {allowScriptAccess: "always", wmode : "opaque"};
    // The element id of the Flash embed
    // also pass videoId using name!!!
    var atts = {id: "ytPlayer", name: videoId};
    if (timeStart  == undefined){
		videoTimeStart = null;
	}else{
		videoTimeStart = timeStart;
	}
    // All of the magic handled by SWFObject (http://code.google.com/p/swfobject/)
    swfobject.embedSWF("http://www.youtube.com/apiplayer?" +
                       "&enablejsapi=1&playerapiid=player1&version=3", 
                       this.videoContainerDiv, 640, 360, "9", null, null, params, atts);
};
YouTubePlayer.prototype.loadVideoById = function(id) {	 
    if (ytplayer) {
      ytplayer.loadVideoById(id);
      //ytplayer.cueVideoById(id);
    }
};
YouTubePlayer.prototype.seekTo = function(time){
	if (ytplayer) {
      ytplayer.seekTo(time);
    }	
};
YouTubePlayer.prototype.play = function(){
	if (ytplayer) {
      ytplayer.playVideo();
    }
};
YouTubePlayer.prototype.pause = function(){
	if (ytplayer) {
      ytplayer.pauseVideo();
    }
};
YouTubePlayer.prototype.mute = function(){
	if(ytplayer) {
      ytplayer.mute();
    }
};
YouTubePlayer.prototype.unmute = function(){
	if(ytplayer) {
      ytplayer.unMute();
    }
};
YouTubePlayer.prototype.setVolume = function(volume){
	if(isNaN(volume) || volume < 0 || volume > 100) {
      alert("Please enter a valid volume between 0 and 100.");
    }
    else if(ytplayer){
      ytplayer.setVolume(volume);
    }
};
YouTubePlayer.prototype.getPlayerState = function(){ 
	if(ytplayer) {
      return ytplayer.getPlayerState();
    }
};
YouTubePlayer.prototype.onPlayerStateChange = function(newState){ 
    //TODO 
    //Fire callback!

    if (newState==1){
            
        dojo.addClass(dojo.byId('play'), 'playing');
        if (videoLoaded === false){
            videoLoaded = true;
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
					duration = ytplayer.getDuration();
					segmentTimes = semlibVideoPlayer.getSegmentTime(semlibVideoPlayer.p.value);
					//attenzione a quando il non è stato fatto il play duration = 0
					width =(segmentTimes[1]-segmentTimes[0])*480 / duration;
					pxWidth = width + 'px';
					ytplayer.seekTo(segmentTimes[0], true);
					semlibVideoPlayer.pos_x = (segmentTimes[0])*480 / duration;
					semlibVideoPlayer.realOffsetLoaded = pos_x;
					semlibVideoPlayer.mark2ins=false;
					
				}	
	    	semlibVideoPlayer.firstBuffer=false;
		}
	}
        if (newState==5){
            //setTimeout(function(){playVideo();},1000);
            ytplayer.playVideo();
        }
};
YouTubePlayer.prototype.onPlayerError = function(errorCode){ 
	alert("An error occured of type:" + errorCode);
};

//This function is required by YouTube Player API
function onYouTubePlayerReady(playerId) {

    ytplayer = document.getElementById("ytPlayer");
    // This causes the updatePlayerInfo function to be called every 250ms to
    // get fresh data from the player
    setInterval(ytPlayer.updatePlayerInfo, 250);
    ytPlayer.updatePlayerInfo();
    ytplayer.addEventListener("onStateChange", "ytPlayer.onPlayerStateChange");
    ytplayer.addEventListener("onError", "ytPlayer.onPlayerError");
    videoLoaded = false;
    //Load an initial video into the player
	if (videoTimeStart == null){
		ytplayer.cueVideoById(ytplayer.name);
                //ytplayer.loadVideoById(ytplayer.name);
                //ytplayer.mute();

	}
	else{
		ytplayer.cueVideoById(ytplayer.name,videoTimeStart);	
                //ytplayer.loadVideoById(ytplayer.name,videoTimeStart);	
                //ytplayer.mute();
	}
};
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////