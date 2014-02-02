//var videoId="wdjuS17DGlA";
//var videoId= "wRBoP-t4h9A";
var videoWidth = 640;
var videoHeight = 360;
var videoTimeStart = 0;
var annotationsArray = new Array();

 

var sourceStrings = [
"actor",
"action",
"artist",
"author",
"city",
"containsEmotion",
"createdBy",
"depicts",
"director",
"emotionCategory",
"expressEmotion",
"genre",
"gender",
"gesture",
"image",
"maker",
"topic",
"zone",
"sceneDescription",
"sceneLocation"
];

var sourceObjects = [ {
    label: 'name', 
    value: 'foaf:name', 
    url:"http://dsfjklsadjflsd"
},{
    label: 'member', 
    value: 'foaf:member', 
    url:"http://dsfjklsadjflsd"
}, {
    label: 'mailbox', 
    value: 'foaf:mbox'
}, {
    label: 'knows', 
    value: 'foaf:knows'
}, {
    label: 'based near', 
    value: 'foaf:foaf:based_near'
}, {
    label: 'gender', 
    value: 'foaf:gender'
},{
    label: 'based near', 
    value: 'foaf:foaf:based_near'
},{
    label: 'creator', 
    value: 'dc:creator'
},{
    label: 'subject', 
    value: 'dc:subject'
},{
    label: 'publisher', 
    value: 'dc:publisher'
},{
    label: 'contributor', 
    value: 'dc:contributor'
},{
    label: 'date', 
    value: 'dc:date'
},{
    label: 'talk about', 
    value: 'semtube:talkAbout'
},{
    label: 'action', 
    value: 'semtube:action'
},
{
    label: 'time', 
    value: 'semtub:time'
},{
    label: 'about', 
    value: 'rdf:about'
},{
    label: 'see also', 
    value: 'rdfs:seeAlso'
},{
    label: 'topic', 
    value: 'semtub:topic'
},{
    label: 'target', 
    value: 'oac:target'
}
];


prova={
    currentTagInfo : {},
    currentObjectInfo : {},
    tagsStore : [],
    
    //videoId : 'wRBoP-t4h9A',
    videoId : '9oI27uSzxNQ',
    
    self : this,
    currStat : {
        s : {}, 
        p: {}, 
        o: {}
    },
    stats : [],
    init:function(){
        
        //Marker file path
        this.srcMarker = "../src/semtube/playerico/Marker";
        this.srcMarkerL = "../src/semtube/playerico/MarkerL";
        this.srcSelected = "../src/semtube/playerico/selected";
        
        
        //Current Statement
        this.currentStatement;
    
        var ps,i,hl;
        var realOffsetLoaded=0;
        var offsetSelection=0;
        var widthSelection=0;
        var startB=0;
        var mystartB=0;
        var absoluteBytesTotal=0;
        var firstBuffer=true;
        var markerMouseDown;
        var movingMarker;
        var movingSegment;
        var movingMarkerLeft;
        var startMarkerMovePositionX;
        var currentLeftMarkerPositionX;
        var currentRightMarkerPositionX;
        var previousLeftMarkerPositionX;
        var previousRightMarkerPositionX;
        var endMarkerMovePositionX;
        var valueLeftMarker;
        var valueRigthMarker;
        var playerCursor;
        var playerSelected;
        var pb;
        var isMovingLeftMarker;
        var isMovingRightMarker = false;
        var p;
        var pbOffLeft = 0;

        var fake;

        var rightSegment;
        var segmentWidth= '1px';
  
        var play;
        var imgPlay;
        var tggle='';
  
        var annotationStartTime=0;
        var annotationEndTime=0;
        var buttonAnn;
  
        var markerCounter;
  
        var markerDiv=null;
  
        var playerReady = false;
  
        var mark2ins = false;

        var isRdfVisible;
        var startMouseDown;
        var currMouseDown;

        var isFirstAnn;
        
  
        $("#tabset").tabs({});
        $("#tabAnnotation").tabs({});
  
        if(!document.getElementById || !document.createTextNode){
            return;
        }
     
        prova.isFirstAnn=true;
        prova.isRdfVisible=false;
        prova.isMovingLeftMarker = false;
        prova.fake=false;
        prova.markerMouseDown=false;
	
        $("#predicateInput_0").autocomplete({
            //source: sourceStrings
            source: sourceObjects
        });

        $("#progressBar").mouseup(prova.movePlayerCursor);
	
	
        off = $("#progressBar").offset();
        prova.pbOffLeft = off.left;

	
        pbTop = $("#progressBar").offset().top;
        pbLeft = $("#progressBar").offset().left;
	
        $("#playerCursor").attr({
            'left':'0',
            'visibility':'visible',			
            'z-index':'0'
        });

        $("#playerLoaded").attr({
            'left':'0', 
            'z-index':'2',
            'visibility':'visible'
        });
	
        prova.playerCursor=document.getElementById('playerCursor');
        attributesPlayerCursor = "position:absolute;visibility:visible;margin-left:-3px;height:20px;z-index:2;offsetTop:" + pbTop + "px;offsetLeft:" + pbLeft + "px"; 
        prova.playerCursor.setAttribute('style', attributesPlayerCursor);

        $("#annotate").click(prova.InsertFrameAnnotation);
        $("#btnSaveAnn").click(prova.SaveSegmentAnnotation);
        $("#btnLoad").click(prova.loadVideoFromInput);
        DOMhelp.addEvent(window,'mouseup',prova.WindowMouseUp,false);
        DOMhelp.addEvent(window,'mousemove',prova.WindowMouseMove,false);
        prova.segmentWidth='1px';
        prova.markerMouseDown = false;
	
        $("#play").click(prova.togglePlay);
	
        $("#btnTableOrRdf").click(prova.hideShowRdf);
        $("#textOverVideo").click(prova.textOverVideo);
	
        /*  $('#buttonHide_1').click(prova.hideDivv);  */
	
        //X STEFANO!!! Questa cagata va tolta!
        //PER LA MILIONESIMA VOLTA!!! vogliamo dare dei nomi come si deve alle variabili!!!!!!
        //Che cazzo capisce uno leggendo button hide 0!!!!
        $('#buttonHide_0').click(prova.hideDiv);
        $('#buttonHide_1').click(prova.hideDiv);
        $('#buttonHide_2').click(prova.hideDiv);
        $('#buttonHide_3').click(prova.hideDiv);
	
        $('#btnAddTag').click(prova.addTagToAnnotation);
        $('#btnTagsFromText').click(prova.getTagsFromText);
	
        //$("#saveNote").click();
	
        $("#writeRdf").click(prova.saveStatement);
	
        $("#buttonSaveNote").click(prova.saveNote);
	
        $("#cancelStatement").click(prova.emptyStatementInput);
	
        $("#annotateElem_0 span").addClass("divClass");
        //$("#user span").addClass("divClass");
	
        $(window).mousemove(prova.WindowMouseMove);
	
        var address = document.location.href;
	
        if (prova.isMediaFragment(address)==true){
            var videoInfo = prova.parseUri(address);
            console.log(videoInfo);
            if (videoInfo !== null){
                if (typeof(videoInfo.videoId) != 'undefined'){
                    
                    prova.videoId = videoInfo.videoId;
                    
                    ytPlayer = new YouTubePlayer("videoDiv");
                    if (typeof(videoInfo.ti) !== 'undefined'){
                        ytPlayer.loadPlayer(videoInfo.videoId, videoInfo.ti);
                    //prova.insertMarker(videoInfo.ti,videoInfo.tf, 'tempMark', 'yellow');
                    }
                    else
                        ytPlayer.loadPlayer(videoInfo.videoId);
                }
            }
        }
        else {
            ytPlayer = new YouTubePlayer("videoDiv");
            ytPlayer.loadPlayer(prova.videoId);
        } 
	
        //Autocomplete per tagging
        prova.currentTagInfo = {}; //store info about tag retrieved when the tags is select (see select callback of autocomplete
        $('#tagsArea').keyup(prova.attachDbpediaTags);
        prova.currentObjectInfo = {}; //store info about object
        $("#objectInput_0").keyup(prova.attachObjectEntity);
        $('#tagsArea').keyup(prova.attachDbpediaTags);
        prova.currentSubjectInfo = {}; //store info about object
        $("#subjectInput_0").keyup(prova.attachSubjectEntity);
        
    },
  
    loadVideoFromInput:function(e){  	
        var vId = "";	
        var location = stNamespace.stPage;	
        var uri = $("#inputMediaUri").val();	//alert(uri);		
        if (uri.indexOf('www.youtube.com') != -1){		
            if(uri.indexOf('?') != -1){			
                var uriParts = uri.split('?');			
                var queryPart = uriParts[1];			
                var params = new Array();			
                params =  queryPart.split('&');			
                for (i=0; i< params.length; i++){				
                    var s= String(params[i]);				
                    if (s.substr(0,2) =='v='){					
                        vId = s.substring(2);				
                    }			
                }					
            }		
            
            //Clear progress bar from marker
            dojo.query('.mark').forEach(function(item){
                dojo.destroy(item)
                });
            
            ytplayer.loadVideoById(vId);	
            
            ///TODO Fire an event when the video is loaded
            //
            //Empty all the annotations
            prova.videoId = vId;
            semlibVideoAnnotationViewer.annotations = {};
            dojo.query('#annotationWindow .aw_panel').forEach(function(item){
                dojo.destroy(item)
                });
            pundit.fireOnSave();
            
            
            
            
        }else{
            alert("URI is not correct");
        }
    },

    hideDiv:function(e){
  
        //var div = $(this).parent("div").parent("div").children("div:last");
        var div =$(this).parent().parent().parent().parent().children("div:last");
        var triangle = $(this).children("span:last");
        //alert(triangle.attr("class"));
  
        if(div.css("display") != "none"){
            div.effect('blind',{
                direction:'vertical',
                mode:'hide'
            },null);
        }
        else{
            div.effect('blind',{
                direction:'vertical',
                mode:'show'
            },null);
        }
        if(triangle.hasClass("ui-icon-triangle-1-n")){
            triangle.removeClass("ui-icon-triangle-1-n");
            triangle.addClass("ui-icon-triangle-1-s");
        }
        else{
            triangle.removeClass("ui-icon-triangle-1-s");
            triangle.addClass("ui-icon-triangle-1-n");
        }
    },
 
    saveStatement:function(e){
        
        if ($("#subjectInput_0").val().length>0 && $("#predicateInput_0").val().length>0 && $("#objectInput_0").val().length>0){
            var li =$('<li style="border:1px solid #d9dcdd;position:relative;padding:4px; margin-top:2px;">')
            var sub = $('<span style="margin-right:8px;">').html($("#subjectInput_0").val());
            var pre = $('<span style="margin-right:8px;">').html($("#predicateInput_0").val());
            var obj = $('<span style="margin-right:8px;">').html($("#objectInput_0").val());
            li.append(sub).append(pre).append(obj).append($('<span class="ui-icon ui-icon-circle-close" style="display: inline-block;position:absolute;right:0px">').click(prova.removeStatement));
            $('#lstStatement').append(li);
            prova.emptyStatementInput();
        }
        else{
            alert("Statement Incomplete");
        }
    },
    removeStatement:function(){
        $(this).parent().remove();
    },
 
    saveNote:function(e){
        //Annotation object
        var ann = {};
        
        //controllo tempmark e mi salvo tempo iniziale, tempo finale e id (solo id oppure id+t=start,end)
        var target = null;
        
        //Annotation target
        if($("#tempMark").size()){
            var l = $('#tempMark > #markerLeft').offset().left + 10 -$('#progressBar').offset().left;
            var c = $('#tempMark > #marker').offset().left -$('#progressBar').offset().left;
            //}
            var st = parseInt(prova.pos2time(l) * 100);
            st = st / 100;
            var et = parseInt(prova.pos2time(c) * 100);
            et = et / 100;
            target= prova.videoId + "#t=" + st + "," + et;
        }else{
            target= prova.videoId;
        }
        
        
        //creationTime
        
        var currentTime = new Date();
        var month = currentTime.getMonth() + 1;
        var day = currentTime.getDate();
        var year = currentTime.getFullYear();
        var hours = currentTime.getHours();
        var minutes = currentTime.getMinutes();
        var seconds= currentTime.getSeconds();
        var milliseconds = currentTime.getMilliseconds();
        var unixTime = currentTime.getTime();
        var id = "anonymous" + unixTime;
        if (minutes < 10){
            minutes = "0" + minutes;
        }
        if (hours < 10){
            hours = "0" + hours;
        }
        if (seconds < 10){
            seconds = "0" + seconds;
        }
        var dateString= year+"/"+month+"/"+day+" "+ hours+":"+minutes + ":" + seconds;
        var statement= $('#lstStatement').clone();
        statement.find('li span:nth-child(4)').remove();
        statement.removeAttr("id");
        statement.find('li').css('border','0px');
        //statement.removeAttr("id");
        //creo oggetto con tutte le info annotazione che salvo nell'array--------------------------------------------------
	
        //graphicAnnotationArray = new Array();
        //var graphicAnnotationDiv = $("<div>").append($("<div style='background-color:;width:15px;height:15px'>"));
        
        ann.id = id;
        if(st != undefined && et != undefined){
            ann.startTime = st;
            ann.endTime = et;
        }
        ann.target = target;
        ann.comment = $('#commentArea').val();
        ann.tags = [];
        
        $("#tagContainer li div span:nth-child(2)").each(function(index,value) {
            ann.tags.push(value);
        }); //mi prendo tutti i tag negli span
        
        
        ann.statement = statement;
        ann.userName = $("#userName").html();
        ann.date = dateString;
	
        
        //-------------------------------------------------------------------------------------------------------------
        var parentDiv= $("<div>");
        var headerDiv= $("<div class='ui-dialog-subtitlebar ui-widget-header ui-corner-allui-helper-clearfix customHeaderDiv' style='position:relative;'></div>").click(prova.headerClick);
        var divNote= $("#divNote");
        var comment= $("<span style='color:black'>"+ann.comment+"</span>");
        var targetSpan= $("<span style='color:black'>"+ann.target+"</span>");
        var commentDiv= $("<div>").append($("<span style='color:gray;margin-right:8px'>rdfs:comment:</span>")).append(comment);
        var targetDiv= $("<div>").append($("<span style='color:gray;margin-right:8px'>oac:hasTarget:</span>")).append(targetSpan);
        var tagsDiv= $("<div>").append($("<span style='color:gray;margin-right:8px'>tags:hasTag:</span>"));
        $.each(ann.tags, function(index,value){
            tagsDiv.append(value);
        });
        var bodyDiv= $("<div class='customDivBody'></div>");
        bodyDiv.append(targetDiv);
        if(ann.comment != ""){ //controllo sull'array per decidere se visualizzare
            bodyDiv.append(commentDiv);
        }
        if(ann.tags != ""){  //controllo sull'array per decidere se visualizzare
            bodyDiv.append(tagsDiv);
        }
        if(($('#lstStatement li').index()>-1)){ //controllo sull'array per decidere se visualizzare--------mettere controllo sull'array
            bodyDiv.append(ann.statement);
        }
        var noteId= $("<span>").html(ann.id);
        var titleNote= $("<span class='ui-dialog-title'></span>").css({
            'position':'absolute',
            'right':'164px'
        }).html("by: " + ann.userName);
        //var date= $("<span style='color:black'></span>").html("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + ann.date);
        var date= $("<span style='color:black'></span>").html("&nbsp;&nbsp;" + ann.date);
        var imgTriangle= $("<span id='tiangle_1_s' class='ui-icon ui-icon-triangle-1-s' style='display: block;'></span>");
        var buttonHideNote= $("<a class='buttonHide ui-dialog-titlebar-hide ui-corner-all' href='javascript:void(0)' role='button'  ></a>").click(prova.hideDiv).append(imgTriangle); 
        if($("#tempMark").size()){
            var playSegment= $("<span>").append('<img id="imgPlaySmall" src="play.png"/>').click(prova.playSegment);
        }
        else{
            var playSegment= $("<span>").append('<img id="imgPlaySmall" src="play.png"/>').click(prova.wholeVideo);
        }
        
        var myUl = $("<ul>").addClass("lstTools");
        myUl.append($("<li>").append(playSegment));
        myUl.append($("<li>").append(noteId));
        myUl.append($("<li>").css({
            'position':'absolute', 
            'right':'25px'
        }).append(date));
        myUl.append($("<li>").append(buttonHideNote));
        
        //Add the annotation to array of the stored annotation
        if(ann.comment != "" || ann.tags.length > 0 || ($('#lstStatement li').index()>-1)){   //pusho l'oggetto nell'array-------mettere il controllo statement sull'array
            annotationsArray.push(ann);
            
        }else{
            alert("Annotation is uncomplete");
            return;
        }
        
        //Add the annotation to array of the stored annotation
        if(ann.comment != "" || ann.tags.length > 0 || ($('#lstStatement li').index()>-1)){   //pusho l'oggetto nell'array-------mettere il controllo statement sull'array
            annotationsArray.push(ann);
            
        }else{
            alert("Annotation is uncomplete");
            return;
        }
        
        //headerDiv.append(playSegment).append(noteId).append(titleNote).append(date).append(buttonHideNote);
        headerDiv.append(myUl);
        parentDiv.attr('id',ann.id).append(headerDiv).append(bodyDiv);  //X Marco, qui do l'id al div al quale poi, durante la riproduzione, dovrei cambiare il css del bordo nella funzione a riga 1141
        if(($("#commentArea").val().length>0) || ($("#tagsArea span").index()>0) || ($('#lstStatement li').index()>-1)){
            divNote.append(parentDiv);
            $("#commentArea").removeAttr("value");
            $("#tagsArea").removeAttr("value");
            $("#tagContainer").empty();
            $("#lstStatement li").remove();
            parentDiv.draggable({
                revert:true,
                helper:'clone'
            });
            if($("#progressBar #tempMark").size()){
                prova.markerDiv = $("#progressBar #tempMark")[0];
                prova.markerDiv.id = ann.id; 
                //prova.tempMark.style.display="none";
                prova.markerDiv.style.display="none";
            }
        }else{
            alert("Note information are incomplete");
            return;
        }
        
        ann.shapes = [];
        
        for (var i = boxes2.length -1 ; i>=0; i--){
            boxes2[i].shape = "rectangle";
            boxes2[i].xywh = boxes2[i].x + "," + boxes2[i].y + ", " + boxes2[i].w + ", " +boxes2[i].h;
            ann.shapes.push(boxes2[i]);
        }
        for (var j = ellipses.length -1 ; j>=0; j--){
            ellipses[j].shape = "ellipse";
            ellipses[j].xywh = ellipses[j].x + "," + ellipses[j].y + ", " + ellipses[j].w + ", " + ellipses[j].h;
            ann.shapes.push(ellipses[j]);
        }
        for (var j = polygons.length -1 ; j>=0; j--){
            polygons[j].shape = "polygon";
            //ellipses[j].xywh = ellipses[j].x + "," + ellipses[j].y + ", " + ellipses[j].w + ", " + ellipses[j].h;
            ann.shapes.push(polygons[j]);
        }
        
        //empty all the array and clear the canvas
        boxes2 = []; 
        polygons = [];
        ellipses = [];
        clearAll();
        
        $('#subjectInput_0').val('thisVideo');
        
        
        //Save annotation to tripleBucket
        var b = stTripleBucket;
        console.log(ann);
        
    },
    
    
    
    headerClick:function(sender, event){
        //var id= $(this).children('span:nth-child(2n)').html();
        var id = $(this).parent().attr('id');
        //var children = this.childNodes;
	  
        if (prova.markerDiv == null){
        }
        else {
            prova.markerDiv.style.display="none";
        //prova.markerDiv.hide();
        }
        
        if($("#progressBar #tempMark").size()){
            prova.markerDiv = $('#progressBar #tempMark')[0];
            prova.markerDiv.style.display="none";
        //prova.markerDiv.hide();
        }
	
        //INCOMPRENSIBILE
        //prova.markerDiv = document.getElementById(id);  //non mettere "div"
        prova.markerDiv = $("#progressBar #" + id)[0];  //non mettere "div"
        if (prova.markerDiv != null){
            prova.markerDiv.style.display="inline";
        //prova.markerDiv.show();
        }
    },

    wholeVideo:function(e){
        ytplayer.seekTo(0, true);
        ytplayer.playVideo();
    },
 
    playSegment:function(e){
        //qui mi sa che mancano delle variabile
        //var id= $(this).parent("div").children('span:nth-child(2n)').html();
        var id = $(this).parent().parent().parent().parent().attr('id');
        var ann = prova.getAnnotationById(id);
        if (ann != null){
            segmentTimes = prova.getSegmentTime(ann.target);
            ytplayer.seekTo(segmentTimes[0], true);
            ytPlayer.play();
            pos_x = (segmentTimes[0])*480 / duration;
            prova.realOffsetLoaded = pos_x;
        }
    },
    
    
 
 
    emptyStatementInput:function(){
        $("#subjectInput_0").removeAttr("value");
        $("#predicateInput_0").removeAttr("value");
        $("#objectInput_0").removeAttr("value");
    },
    
    hideShowRdf:function(){
        //alert("fkdjslfjsldfjsdlfj");
        if (prova.isRdfVisible== true){
            var divRdf = document.getElementById("divRdf");
            divRdf.style.visibility = "collapse";
            prova.isRdfVisible= false;
            return;
        }
        if (prova.isRdfVisible==false){
            var divRdf = document.getElementById("divRdf");
            divRdf.style.visibility = "visible";
            prova.isRdfVisible= true;
            return;
        }
    },
  
    //RIvedere assolutamente
    parsingAddress:function(uri){
        var fullUri = uri.split('#');
        wwwAddress = fullUri[0];
        var settings = fullUri[1];
        sett= prova.checkSettings(settings);
        if (sett[0]==false){
            alert("Some");
        }
        else{
            if(sett[1]==false){

                prova.videoId = settings.substr(3);

                //alert("we are playing the whole video!!!");

                prova.firstBuffer = true;
                loadPlayer(prova.videoId);
                prova.mark2ins = true;
            }

            else{

                res=prova.parseVideoInfo(settings);

                //alert("we are playing the segment!!!");

                prova.firstBuffer = true;
                prova.videoId=res[0];
                loadPlayer(prova.videoId,res[1]);
                //ytplayer.loadVideoById(id2,splitT[0]);

                prova.mark2ins = true;

            //prova.deleteRow('tbAnn');

            //prova.takeAndPutAnnotation();


            }
        }
    },
   
   
    //$("#buttonHide_0").click.$("annotateElem_0").effect('blind',{direction:'vertical',mode:'hide'},null);
    //RIvedere assolutamente
    checkSettings:function(set2){
        var id3=false;
        var times3 = false;
        if (set2.indexOf("id=")!=-1) {
            id3=true;
        }
        if (set2.indexOf("t=")!=-1) {
            times3=true;
        }
        var res = new Array();
        res[0]=id3;
        res[1]=times3;
        return res;
    },

    //Rivedere assolutamente
    parseUri:function(uri){
        var videoInfo = {};
        var arrayUri = uri.split('?');
        if  (arrayUri.length == 2){
            var videoParams = arrayUri[1].split('&');
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
        if(prova.tggle=='play'){
            ytPlayer.pause();
        }
        else {
            ytPlayer.play();
        }
    },
	
    videoLoad:function(e){
        p=document.getElementById('inputMediaUri');
	
        //check if is media fragment
        if (prova.isMediaFragment(p.value)==true){
		
            segmentTimes = prova.getSegmentTime (p.value);
            prova.firstBuffer = true;
            ytPlayer.loadVideoById(stringaUri);
		
            prova.mark2ins = true;
		
        }
        else{
            ytPlayer.loadVideoById(p.value);
            ytPlayer.play();
        }
    },

    deleteRow:function(tableID) {
            
        var table = tableID;
        var rowCount = table.rows.length;
 
        for(var i=1; i<rowCount; i++) {
            var row = table.rows[i];
            table.deleteRow(i);
            rowCount--;
            i--;
        }
    },

    isMediaFragment:function(uri){
        //controlla se contine un media fragment
        if (uri.indexOf("?") == -1) return false;
        else return true;
    },
  
    //prende l'URI e lo splitta in 2 parti e prende tempo iniziale e tempo finale
    getSegmentTime:function(uri) {
        //funzione che splitta l'URI
        var stringaArray = uri.split('#');
        stringaUri = stringaArray[0];
        var stringaTimes = stringaArray[1];
        var times = stringaTimes.substr(2);
        var splitTime = times.split(',');
        return splitTime;
    },

    //MARCOr01
    //QUesta funzione non viene pi� usata
    //Non usiamo nenache la tabella 
    removeAnnotation:function(e){
        var targ = DOMhelp.getTarget(e);
        var parentTdNode = targ.parentNode;
        var parentTrNode = parentTdNode.parentNode;
        var ParentTableNode = parentTrNode.parentNode;
        ParentTableNode.removeChild(parentTrNode);	
	  
        mdiv = document.getElementById("div_" + parentTrNode.id);
        mDivParent = mdiv.parentNode;
        mDivParent.removeChild(mdiv);
    },
    
    upDateProgressBarBarLoaded:function(bytesTotal, startBytes, bytesLoaded){
        //console.log('bt=' + bytesTotal + ' sb=' + startBytes + ' bl=' + bytesLoaded);
        if (bytesLoaded>0){
            if (startBytes>0){
                if (typeof(realOffsetLoaded) !== 'undefined')
                    offsetLoad = prova.realOffsetLoaded;
                else
                    offsetLoad = videoWidth * startBytes / bytesTotal;
                percentageLoad =  (videoWidth - offsetLoad) * bytesLoaded / (bytesTotal - startBytes);
                
            }
            else{
                offsetLoad = videoWidth * startBytes / bytesTotal;
                percentageLoad =  (videoWidth - offsetLoad) * bytesLoaded / bytesTotal;
            }
            //var attributes= 'background:red;height:20px;width:' + percentualeLoad + 'px;margin-left:' + offsetLoad + 'px;';
            //attributesPlayerLoaded = "position:absolute;visibility:visible;margin-left:0px;height:20px;width:100px;z-index:0;offsetTop:" + pbTop + "px;offsetLeft:" + pbLeft + "px";;
            attributesPlayerLoaded = "position:absolute;visibility:visible;" +
            "height:20px;z-index:0;offsetTop:" + pbTop + "px;offsetLeft:" + pbLeft + "px;" +
            "width:" + percentageLoad + "px;margin-left:" + offsetLoad + "px;";
            //alert(attributesPlayerLoaded);
            $("#playerLoaded").attr('style', attributesPlayerLoaded);
        }
    },
    upDateProgressBarBarPlay:function(duration, currentTime){
        if (currentTime>0){
            offset =  (videoWidth)*(currentTime / duration);
            attributesPlayerCursor = "position:absolute;visibility:visible;" +
            "z-index:2;offsetTop:" + pbTop + "px;offsetLeft:" + pbLeft + 
            "px;margin-left:" + offset + "px";
            $("#playerCursor").attr('style', attributesPlayerCursor);
        }
    },
  
    movePlayerCursor:function(event){
        var pos_x;
        if (event.pageX){
            //pos_x = event.pageX - prova.pbOffLeft;
            pos_x = event.pageX - $('#progressBar').offset().left
        }
        else if (event.clientX){
            c = event.clientX;
            //pos_x = c - prova.pbOffLeft;
            pos_x = c - $('#progressBar').offset().left
        }
	
        time = (pos_x/videoWidth * ytplayer.getDuration()) | 0;
        ytplayer.seekTo(time, true);
        prova.realOffsetLoaded = pos_x;
    },
    InsertFrameAnnotation:function(){
        if (typeof(ytplayer) !== 'undefined'){
            time = ytplayer.getCurrentTime();
            console.log(time);
            //prova.inputFrameTime.value=time;
            prova.insertMarker(time, 0);
            $('#subjectInput_0').val('thisVideoFragment');
            $('#tempMark').addClass('unsaved');
            dojo.query('#canvasTools button').forEach(function(item){
                item.disabled = false
            });
        }
    
    //var buttonSaveSegmentAnnotation $('tempMarker').addClass('unsaved');= document.getElementById('btnSaveAnn');
    //buttonSaveSegmentAnnotation.disabled = false;
    },
    pos2time:function(pos){
        var time = (pos/videoWidth * ytplayer.getDuration());
        return time;
    },
    time2posFake:function(time){
        //var duration=ytplayer.getDuration();
        var pos = (time / 200.08 ) * videoWidth;
        return pos;
    },
    time2pos:function(time){
        if (ytplayer){
            var duration=ytplayer.getDuration();
            var pos = (time / 200.08 ) * videoWidth;
        }
        else{
            var duration=ytplayer.getDuration();
            var pos = (time / duration ) * videoWidth;
        }
	
        return pos;
    },
    SaveSegmentAnnotation:function(){
        if (prova.isFirstAnn){
            prova.isFirstAnn=false;
            var tbAnn = document.getElementById("tbAnn");
            tbAnn.style.visibility = "visible";
            var btnTableOrRdf = document.getElementById("btnTableOrRdf");
            btnTableOrRdf.style.visibility = "visible";
        }
	  
        var l = $('#tempMark > #markerLeft').offset().left + 10 -$('#progressBar').offset().left;
        var c = $('#tempMark > #marker').offset().left -$('#progressBar').offset().left;
        st = parseInt(prova.pos2time(l) * 100);
        st = st / 100;
        et = parseInt(prova.pos2time(c) * 100);
        et = et / 100;
        //id = videoId + "#t=" + inputFrameTime.value + "," + inputEndTime.value ;
        id = prova.videoId + "#t=" + st + "," + et;
	  
	  
        var comment = $('#inputComment').val();
        var property = $('#inputProperty').val();
        var value = $('#inputValue').val();
        prova.SaveOnTable(id,comment,property,value);
	 
	  
        var annRdf = prova.createAnnRdf(id,comment,$("#inputProperty").val(),$("#inputValue").val());
        $('#codeRdf').append(annRdf);

        prova.markerCounter = prova.markerCounter +1;
        //add click event to handle annotated segment visualization
	  
        //var buttonSaveSegmentAnnotation = document.getElementById('btnSaveAnn');
        //buttonSaveSegmentAnnotation.disabled = true;
        $('#inputComment').val('');
        var property = $('#inputProperty').val('');
        var value = $('#inputValue').val('');
    },
    createAnnRdf:function(videoFragId,comment,property,value){
        var videoFragUri = "www.semedia.dibet.univpm.it/semtube/data/video/" + videoFragId;
        var videoId = "www.semedia.dibet.univpm.it/semtube/data/video/" + videoFragId.split('#')[0];
        var res =  '&lt;' + videoFragUri + '&gt;';
        var isPartStat = '&nbsp;&nbsp; ex:isPartOf &lt;' + videoId + '&gt;';
        var commStat = '&nbsp;&nbsp; comment &nbsp;&quot;' + comment + '&quot;';
        var propertyStat = '&nbsp;&nbsp; ex:' + property + '&nbsp;&quot;' + value + '&quot;';
        if (comment.length == 0){
            var annRDF = res + '<br>' + isPartStat + ';<br>' + propertyStat + '.<br><br>';
        }
        else {
            if  (property.length == 0){
                var annRDF = res + '<br>' + isPartStat + ';<br>' + commStat + '.<br><br>';
            }
            else var annRDF = res + '<br>' + isPartStat + ';<br>' + commStat + ';<br>' + propertyStat + '.<br><br>';
        }
	
	
        return annRDF;
    //&lt;videoFragmURI&gt;<br>&nbsp;	ex:isPartOf &lt;videoUri&gt;<br>&nbsp;&nbsp;	ex:actor &nbsp; &quot;Tony Benn&quot;.<br><br>
    },

    insertMarker:function(timeStart,timeEnd, name, color){
        var srcMarker, srcMarkerL, srcSelected;
        if (typeof(name) === 'undefined'){
            //nascondo eventuali altri marker
            $('#tempMark').remove();
            //$('#progressBar > div').hide();
            name = 'tempMark';
            tempMarkDiv = $("<div>").attr('id',name).addClass('mark');
        }else{
            //name = name + Math.floor(Math.random()*1000);
            tempMarkDiv = $("<div>").addClass('mark').addClass('fixed');
        }
        
        if (typeof(color) === 'undefined'){
            srcMarker = this.srcMarker + '.png';
            srcMarkerL = this.srcMarkerL + '.png';
            srcSelected = this.srcSelected + '.png';
        }else{
            srcMarker = this.srcMarker + '_' + color + '.png';
            srcMarkerL = this.srcMarkerL +  '_'  + color + '.png';
            srcSelected = this.srcSelected + '_' + color + '.png';
        }
        
        var annotationBar = document.getElementById('annotationBar');
	  
        duration = ytplayer.getDuration();
        markerPosition = videoWidth * (timeStart / duration) - 10; //dovrebbe andare indietro di 10
        
        marker = $("<img>").attr('src',srcMarker).attr('id','marker').css('z-index',99999999).css('position','absolute').height(20);
        markerLeft = $("<img>").attr('src',srcMarkerL).attr('id','markerLeft').css('z-index',9999999).css('position','absolute').height(20);
        //divSeg = $("<div>").attr('id','divSeg').css('position','absolute');
        segment = $("<img>").attr('src',srcSelected).attr('id','segment').css('z-index',9999999999).css('position','absolute').height(20);
	  
	 
        tempMarkDiv.append(markerLeft).append(segment).append(marker);
        //    
        //    if (prova.fake){
        //        var l = prova.time2pos(time);
        //        tempMarkDiv.offset({
        //            left:l
        //        });
        //    }
	
        tempMarkDiv.appendTo($('#progressBar'));
	
        //TODO markermarkerLeft.width hardcoded to 10
        segment.offset({
            left:markerLeft.offset().left+ 10
        });
    
        var width = videoWidth * (timeEnd - timeStart) / duration;
        segment.width(width);
        
        //TODO markermarkerLeft.width hardcoded to 10
        marker.offset({
            left:markerLeft.offset().left + 10 + segment.width()
        });
        tempMarkDiv.css('position','absolute').css('z-index',10).css('left',markerPosition);
        pbar = $('#progressBar');
        position = pbar.position();
	  
        marker.mousedown(prova.fmarkerMouseDown);
        markerLeft.mousedown(prova.fmarkerLeftMouseDown);
    },
    fmarkerMouseDown:function(e){
        if (e.target.parentElement.id === 'tempMark'){
            DOMhelp.stopDefault(e);
            prova.markerMouseDown = true;
            prova.isMovingRightMarker = true;
            prova.startMouseDown = e.pageX;
            $('#markL').html(markerLeft.offset().left);
            $('#markerRigth').html(marker.offset().left);
            $('#divPb').html(tempMarkDiv.offset().left);
        }
        
    },
    fmarkerLeftMouseDown:function(e){
        if (e.target.parentElement.id === 'tempMark'){
            DOMhelp.stopDefault(e);
            prova.markerMouseDown = true;
            prova.startMouseDown = e.pageX;
            prova.isMovingLeftMarker = true;
            $('#markL').html(markerLeft.offset().left);
            $('#markerRigth').html(marker.offset().left);
            $('#divPb').html(tempMarkDiv.offset().left);
        }
    },
    WindowMouseMove:function(e, info){
        if (prova.markerMouseDown==true){
            // DOMhelp.stopDefault(e);
            // prova.currentMarkerPositionX = e.pageX;
            var direction = 1;
            var currentMouseDown = e.pageX;
            var deltaX = 0;
            if (prova.isMovingRightMarker == true){
                prova.currMouseDown = e.pageX;
                //DOMhelp.stopDefault(e);
                if (prova.currMouseDown < prova.startMouseDown){
                    direction = -1;
                }
                deltaX = Math.abs(prova.startMouseDown - prova.currMouseDown);
                $('#deltaX').html(deltaX);
                //segment.offset({left:markerLeft.offset().left+10});
                if ((marker.offset().left + deltaX*direction < $('#progressBar').offset().left + videoWidth) && (marker.offset().left + deltaX*direction > markerLeft.offset().left + 10)){
                    marker.offset({
                        left:marker.offset().left + deltaX*direction
                    });
                    segment.width(marker.offset().left-markerLeft.offset().left-9);
                }
                //segment.offset({left:markerLeft.offset().left+9});
                prova.startMouseDown = prova.currMouseDown;
            }
            if (prova.isMovingLeftMarker == true){
                prova.currMouseDown = e.pageX;
                //DOMhelp.stopDefault(e);
                if (prova.currMouseDown < prova.startMouseDown){
                    direction = -1;
                }
                deltaX = Math.abs(prova.startMouseDown - prova.currMouseDown);
                $('#deltaX').html(deltaX);
                //segment.offset({left:markerLeft.offset().left+10});
                if ((markerLeft.offset().left + deltaX*direction + 10 > $('#progressBar').offset().left) && (markerLeft.offset().left + deltaX*direction + 10 < marker.offset().left)){
                    markerLeft.offset({
                        left:markerLeft.offset().left + deltaX*direction
                    });
                    segment.width(marker.offset().left-markerLeft.offset().left-9);
                    segment.offset({
                        left:markerLeft.offset().left+10
                    });
                }
                prova.startMouseDown = prova.currMouseDown;
            }
            $('#markL').html(markerLeft.offset().left);
            $('#markerRigth').html(marker.offset().left);
            $('#divPb').html(tempMarkDiv.offset().left);
        }
    },
    WindowMouseUp:function(e){
        //e.preventDefault();
        prova.markerMouseDown=false;
        prova.isMovingLeftMarker = false;
        prova.isMovingRightMarker = false;
    },
    
    
    //TODO MARCO EXPERIMENT WITH TEXT OVER VIDEO
    textOverVideo:function(){
        $('videoContainer').css('position','relative');
        textOverVideoSpan = $('<span>').html("prova").css('color','red').css('z-index',99999999).css('position','absolute').css('left','10').css('top','10');
        textOverVideoSpan.appendTo($('#overVideoDiv'));
        textOverVideoSpan.draggable();
    },
    //////////////////////TAG HANDLING//////////////////////
    addTagToAnnotation:function(e){
        //Questo perch� ora sto facendo del tag normale
        var newTag = $('#tagsArea').val();
        var tagSpan = $("<span style='margin-left:2px;margin-right:2px;margin-top:-2px'>");
        tagSpan.html(newTag);
        tagSpan.attr('about', prova.currentTagInfo.uri);
        //        var tagUl = $('<ul class="lstTools" style="border:1px solid #d9dcdd;"> ');
        //        var imgLi = $('<li>').append($('<span class="ui-icon ui-icon-circle-close" style="display: block;">').click(prova.removeTag));
        //        var spanLi = $('<li>').append(tagSpan);
        //        tagUl.append(imgLi).append(spanLi);
        //        tagSpan.attr('about', prova.currentTagInfo.uri);
        var tagLi = $('<li>');
        var divTag = $('<div style="display:block;margin:2px;border:1px solid #d9dcdd;">').append($('<span class="ui-icon ui-icon-circle-close" style="display: inline-block;">').click(prova.removeTag)).append(tagSpan);
        tagLi.append(divTag);
        
        prova.tagsStore.push(prova.currentTagInfo);
        $('#tagContainer').append(tagLi);
        $('#tagsArea').val('');
        
    },
    removeTag:function(){
        $(this).parent().parent().remove(); 
    }, 
    dbpediaSpotlightFromText:function(text){
        var settings = {      
            'endpoint' : 'http://spotlight.dbpedia.org/rest/annotate',
            //'confidence' : 0.4,
            //'support' : 20
            'confidence' : 0.1,
            'support' : 30
        //'powered_by': 'yes'
        };
        var params = {
            'text': text, 
            'confidence': settings.confidence, 
            'support': settings.support
        };
      
        $.ajax({
            url: settings.endpoint, 
            data: params,
            context: this,
            headers: {
                'Accept': 'application/xhtml+xml'
            },
            success:function(data){
                prova.update(data);
            }
        });
    },
    
    update:function(response) { 
        var content = $(response).find("div");  //the div with the annotated text
        //$(content).appendTo($("#comment"));
        //var dbpediaHTML = content[0].innerHTML;
        var refs = content.find("a");
        for (i=0;i<refs.size();i++)
        {
            // var ref = $(refs[i]);
            // 		var myhref = ref.href;
            // 		var inner = ref.innerHTML;
            var ref = refs[i];
            var uri = ref.href;
            var label = ref.innerHTML;
            var tagSpan = $("<span style='margin-left:2px;margin-right:2px;margin-top:-2px'>");
            tagSpan.html(label);
            tagSpan.attr('about', uri);
            //        var tagUl = $('<ul class="lstTools" style="border:1px solid #d9dcdd;"> ');
            //        var imgLi = $('<li>').append($('<span class="ui-icon ui-icon-circle-close" style="display: block;">').click(prova.removeTag));
            //        var spanLi = $('<li>').append(tagSpan);
            //        tagUl.append(imgLi).append(spanLi);
            //        tagSpan.attr('about', prova.currentTagInfo.uri);
            var tagLi = $('<li>');
            var divTag = $('<div style="display:block;margin:2px;border:1px solid #d9dcdd;">').append($('<span class="ui-icon ui-icon-circle-close" style="display: inline-block;">').click(prova.removeTag)).append(tagSpan);
            tagLi.append(divTag);
            prova.currentTagInfo.uri ={};
            prova.currentTagInfo.uri = uri;
            prova.currentTagInfo.label ={};
            prova.currentTagInfo.label = label;
            prova.tagsStore.push(prova.currentTagInfo);
            $('#tagContainer').append(tagLi);
        //$('#tagContainer').append(ref);
        // var r = $(refs[i]);
        // 	$(r).html(inner).appendTo($('#tagContainer'));
		
        }
    },
    dbpediaName:function(text){
        var settings = {      
            'endpoint' : 'http://lookup.dbpedia.org/api/search.asmx/PrefixSearch'
        //'powered_by': 'yes'
        };
        var params = {
            'QueryString': text 
        };
      
        $.ajax({
            url: settings.endpoint, 
            data: params,
            context: this,
            headers: {
                'Accept': 'application/xhtml+xml'
            },
            success:function(data){
                alert(data);
            }
        });
    },
    getTagsFromText:function(e){
        var text = $('#commentArea').val();
        if (text != '' ){
            prova.dbpediaSpotlightFromText(text);
        }
    },

    GenialupDateCurrentAnnotations:function(currentTime){
        var currentAnnotations = [];
        var annotationsWholeVideo = [];
        var l = annotationsArray.length-1;
        for (i=0; i<=l; i++){
            if (typeof(annotationsArray[i].startTime) == "undefined" && typeof(annotationsArray[i].endTime) == "undefined"){
                annotationsWholeVideo.push(annotationsArray[i]);
                return;
            }else{
                var idNote = annotationsArray[i].id;
                var mediaFragmentSplit = [];
                mediaFragmentSplit = idNote.split('#');
                var timeSplit = [];
                timeSplit = mediaFragmentSplit[1].split('=');
                var startTimeEndTimeSplit = [];
                startTimeEndTimeSplit = timeSplit[1].split(',');
                var startHavePoint = false;
                var endHavePoint = false;
                if(startTimeEndTimeSplit[0].indexOf('.') != -1){
                    startHavePoint = true;
                    var startTimeSplit = [];
                    startTimeSplit = startTimeEndTimeSplit[0].split('.')
                }
                if(startTimeEndTimeSplit[1].indexOf('.') != -1){
                    endHavePoint = true;
                    var endTimeSplit = [];
                    endTimeSplit = startTimeEndTimeSplit[1].split('.')
                }
                if(annotationsArray[i].endTime < currentTime){
                    if(startHavePoint == false && endHavePoint == false){
                        var diveToHighlight = $("#" + mediaFragmentSplit[0] + "\\#t\\=" + startTimeEndTimeSplit[0] + "\\," + startTimeEndTimeSplit[1]);
                        diveToHighlight.children().addClass('ui-widget-header').removeClass('highlight');
                    //case1 = true;
					
                    }else{
                        if(startHavePoint == true && endHavePoint == false){
                            var diveToHighlight = $("#" + mediaFragmentSplit[0] + "\\#t\\=" + startTimeSplit[0] + "\\." + startTimeSplit[1] + "\\," + startTimeEndTimeSplit[1]);
                            diveToHighlight.children().addClass('ui-widget-header').removeClass('highlight');
                        //case2 = true;
						
                        }
                        if(startHavePoint == false && endHavePoint == true){
                            var diveToHighlight = $("#" + mediaFragmentSplit[0] + "\\#t\\=" + startTimeEndTimeSplit[0] + "\\," + endTimeSplit[0] + "\\." + endTimeSplit[1]);
                            diveToHighlight.children().removeClass('ui-widget-header').addClass('highlight');
                        //case3 = true;
						
                        }else{
                            var diveToHighlight = $("#" + mediaFragmentSplit[0] + "\\#t\\=" + startTimeSplit[0] + "\\." + startTimeSplit[1] + "\\," + endTimeSplit[0] + "\\." + endTimeSplit[1]);
                            diveToHighlight.children('div:nth-child(1)').addClass('ui-widget-header').removeClass('highlight');
                        //case4 = true;
						
                        }
                    }
					
                }
                if(annotationsArray[i].startTime < currentTime && annotationsArray[i].endTime > currentTime){
                    currentAnnotations.push(annotationsArray[i]);
                    if(startHavePoint == false && endHavePoint == false){
                        var diveToHighlight = $("#" + mediaFragmentSplit[0] + "\\#t\\=" + startTimeEndTimeSplit[0] + "\\," + startTimeEndTimeSplit[1]);
                        diveToHighlight.children().removeClass('ui-widget-header').addClass('highlight');
                    //case1 = true;
					
                    }else{
                        if(startHavePoint == true && endHavePoint == false){
                            var diveToHighlight = $("#" + mediaFragmentSplit[0] + "\\#t\\=" + startTimeSplit[0] + "\\." + startTimeSplit[1] + "\\," + startTimeEndTimeSplit[1]);
                            diveToHighlight.children().removeClass('ui-widget-header').addClass('highlight');
                        //case2 = true;
						
                        }
                        if(startHavePoint == false && endHavePoint == true){
                            var diveToHighlight = $("#" + mediaFragmentSplit[0] + "\\#t\\=" + startTimeEndTimeSplit[0] + "\\," + endTimeSplit[0] + "\\." + endTimeSplit[1]);
                            diveToHighlight.children().removeClass('ui-widget-header').addClass('highlight');
                        //case3 = true;
						
                        }else{
                            var diveToHighlight = $("#" + mediaFragmentSplit[0] + "\\#t\\=" + startTimeSplit[0] + "\\." + startTimeSplit[1] + "\\," + endTimeSplit[0] + "\\." + endTimeSplit[1]);
                            diveToHighlight.children().removeClass('ui-widget-header').addClass('highlight');
                        //case4 = true;
						
                        }
                    }
                }
            }
        }
        prova.displayCurrentAnnotations(currentAnnotations,annotationsWholeVideo);
    },
    
    upDateCurrentAnnotations:function(currentTime){
        var currentAnnotations = [];
        var annotationsWholeVideo = [];
        var l = annotationsArray.length-1;
        var diveToHighlight = null;
        for (var i=0; i<=l; i++){
            if (typeof(annotationsArray[i].startTime) == "undefined" && typeof(annotationsArray[i].endTime) == "undefined"){
                annotationsWholeVideo.push(annotationsArray[i]);
            }else{
                var idNote = annotationsArray[i].id;
                
                if(annotationsArray[i].endTime < currentTime || annotationsArray[i].startTime > currentTime){
                    //alert("#tabAnnotation #" + idNote + ' div:first');
                    diveToHighlight = $("#tabAnnotation #" + idNote);
                    diveToHighlight.children().addClass('ui-widget-header').removeClass('highlight');
                    
					
                }
                if(annotationsArray[i].startTime < currentTime && annotationsArray[i].endTime > currentTime){
                    currentAnnotations.push(annotationsArray[i]);
                    
                    diveToHighlight = $("#tabAnnotation #" + idNote);
                    diveToHighlight.children().removeClass('ui-widget-header').addClass('highlight');
                    
                }
            }
        }
        prova.displayCurrentAnnotations(currentAnnotations,annotationsWholeVideo);
    },

    displayCurrentAnnotations: function(arrayToShow,arrayWholeVideo){
        
        var annotationNumbers = arrayToShow.length;
        var wholeVideoAnnotations = arrayWholeVideo.length;
        if (annotationNumbers === 1){
            $("#currentAnnotation").html(" 1 note");
        }else{
            $("#currentAnnotation").html(annotationNumbers + " notes");
        }
        if (wholeVideoAnnotations === 1){
            $("#noteWholeVideo").html("There are: ") 
            $("#numberWholeVideo").html(wholeVideoAnnotations + " note about whole video");
        }else{
            $("#noteWholeVideo").html("There are: ")
            $("#numberWholeVideo").html(wholeVideoAnnotations + " notes about whole video");
        }
        
        //Manage graphical annotation
        clearCanvasAnnotation();
        if (typeof(arrayToShow) !== 'undefined'){
            for (var i=arrayToShow.length - 1; i>=0; i--){
                if ((typeof(arrayToShow[i].shapes) !== 'undefined') && (arrayToShow[i].shapes.length > 0)){
                    drawShapes(arrayToShow[i].shapes);
                }
            }
        }
    },
    
    getAnnotationById: function(id){
        for (i=0;i< annotationsArray.length;i++)
        {
            // var ref = $(refs[i]);
            //      var myhref = ref.href;
            //      var inner = ref.innerHTML;
            if (annotationsArray[i].id === id){
                return annotationsArray[i];   
            }else{
        }
            
        }    
    },
    
    //SEMANTIC TAGGING
    attachDbpediaTags: function(e){
        text = $('#tagsArea').val();
        var settings = {      
            'endpoint' : stNamespace.stDbpediaProxy
        //'powered_by': 'yes'
        };
        var params = {
            'text': text 
        };
        
        
        
        $.ajax({
            url: settings.endpoint, 
            data: params,
            context: this,
            headers: {
                'Accept': 'application/xhtml+xml'
            },
            success:function(data){
                prova.processTags(data);
            }
        });
    },
            
    processTags:function(data){
        var semanticTags = [];
        $(data).find("Result").each(function(){
            var info = {};
            info.label = $(this).find("label:first").text();
            info.uri = $(this).find("URI:first").text();
            info.description = $(this).find("description:first").text();
            semanticTags.push(info);
        });
                
        $("#tagsArea").autocomplete({
            //source: sourceStrings
            source: semanticTags,
            select: function(event, ui) {
                prova.currentTagInfo.uri ={};
                prova.currentTagInfo.uri = ui.item.uri;
                prova.currentTagInfo.label ={};
                prova.currentTagInfo.label = ui.item.label;
                prova.currentTagInfo.value ={};
                prova.currentTagInfo.value = ui.item.value;
                prova.currentTagInfo.description ={};
                prova.currentTagInfo.description = ui.item.description;
                if(ui.item){
                    $('#tagsArea').val(ui.item.value);
                }
                $('#tagsArea').submit();
            }
        });
        var val = $("#tagsArea").val();
        $("#tagsArea").autocomplete( "search" , val);
    },
    
    //SEMANTIC TAGGING
    attachObjectEntity: function(e){
        text = $(this).val();
        var settings = {      
            'endpoint' : stNamespace.stDbpediaProxy
        //'powered_by': 'yes'
        };
        var params = {
            'text': text 
        };
        $(this).parent().parent().addClass('loading');
        $.ajax({
            url: settings.endpoint, 
            data: params,
            context: this,
            headers: {
                'Accept': 'application/xhtml+xml'
            },
            success:function(data){
                prova.processObjects(data);
                $(this).parent().parent().removeClass('loading');
            }
        });
    },
            
    processObjects:function(data){
        var semanticTags = [];
        $(data).find("Result").each(function(){
            var info = {};
            info.label = $(this).find("label:first").text();
            info.uri = $(this).find("URI:first").text();
            info.description = $(this).find("description:first").text();
            semanticTags.push(info);
        });
        
        
        $("#objectInput_0").autocomplete({
            source: semanticTags,
            select: function(event, ui) {
                
                if(ui.item){
                    $('#objectInput_0').val(ui.item.value);
                    
                }
                $('#objectInput_0').submit();
                prova.currStat.p = ui.item;
                $(this).parent().parent().children().eq(1).removeClass('unchecked');
                $(this).parent().parent().children().eq(1).addClass('checked');
            }
        });
        
        var val = $("#objectInput_0").val();
        $("#objectInput_0").autocomplete( "search" , val);
               
    },
    
    attachSubjectEntity: function(e){
        text = $(this).val();
        var settings = {      
            'endpoint' : stNamespace.stDbpediaProxy
        //'powered_by': 'yes'
        };
        var params = {
            'text': text 
        };
        
        $(this).parent().parent().addClass('loading');
        $.ajax({
            url: settings.endpoint, 
            data: params,
            context: this,
            headers: {
                //'Accept': 'application/xhtml+xml'
                'Accept': 'application/json'
            },
            success:function(data){
                console.log(data);
                $(this).parent().parent().removeClass('loading');
                prova.processSubject(data);
            }
        });
    },
            
    processSubject:function(data){
        var semanticTags = [];
        $(data).find("Result").each(function(){
            var info = {};
            info.label = $(this).find("label:first").text();
            info.uri = $(this).find("URI:first").text();
            info.description = $(this).find("description:first").text();
            semanticTags.push(info);
        });
        
        $("#subjectInput_0").autocomplete({
            source: semanticTags,
            select: function(event, ui) {
                if(ui.item){
                    $('#subjectInput_0').val(ui.item.value);
                    
                    prova.currStat.s = ui.item;
                }
                $('#subjectInput_0').submit();
                $(this).parent().parent().children().eq(1).removeClass('unchecked');
                $(this).parent().parent().children().eq(1).addClass('checked');
            }
            
        });
        var val = $("#subjectInput_0").val();
        $("#subjectInput_0").autocomplete( "search" , val);
               
    }
    
};
$(document).ready(function(){
    prova.init();
});
