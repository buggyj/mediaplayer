/*\
title: $:/bj/modules/widgets/ytplayer.js
type: application/javascript
module-type: widget



\*/
if($tw.browser)  {
}
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */

var newid = 0;
var debug = require("$:/bj/modules/widgets/log.js").bjytplayerlog();
var Widget = require("$:/core/modules/widgets/widget.js").widget;

var YTrawWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
	this.addEventListeners([
	{type: "tm-mgoto", handler: "handleGoToEvent"},
	{type: "tm-mff", handler: "handleFFEvent"},
	{type: "tm-mrw", handler: "handleRWEvent"},
	{type: "tm-mstop", handler: "handleStopEvent"},
	{type: "tm-mpause", handler: "handlePauseEvent"},
	{type: "tm-mvup", handler: "handleVolUpEvent"},
	{type: "tm-mvdwn", handler: "handleVolDwnEvent"},
	{type: "tm-mply", handler: "handlePlayEvent"}]);
};

/*
Inherit from the base widget class
*/
YTrawWidget.prototype = new Widget();

/*
Render this widget into the DOM
*/
YTrawWidget.prototype.render = function(parent,nextSibling) {
	var self = this;
	this.parentDomNode = parent;
	this.computeAttributes();
	this.execute();
	this.ready = false;
	this.started=false;
	this.currentplayer = false;
	this.pNode = this.document.createElement("div");
	this.ytNode = this.document.createElement("div");
	this.ytNode.id = 'player'+newid;
	this.timer=false;
	this.pNode.appendChild(this.ytNode);	
	this.cNode = this.document.createElement("div");
	this.pNode.appendChild(this.cNode);
	// Insert element
	parent.insertBefore(this.pNode,nextSibling);
		this.renderChildren(this.cNode,null);
	this.domNodes.push(this.pNode);

	 
    this.cNode.setAttribute("class","cno1");	
    this.pNode.setAttribute("class","pno1");
	this.player = new YT.Player('player'+newid, {
		height: 1,//this.height,
		width: 1,//this.width,
		
		playerVars: {'autoplay': 0,  'controls': 1},
		events: {
		  'onReady':  function (event) {
			 // alert("ready");
			 debug ("ytready");
						self.ready = true;
						if (self.src) { //bj maybe add && selF.READY
							var parms = {};
							if (self.start) { parms.startSeconds  =parseInt(self.start);debug("startsec "+parms.startSeconds);} 
							//if (self.end) parms.endSeconds  =parseInt(self.end);
							if (self.src) parms.videoId  =self.src ;
							event.target.loadVideoById(parms);
							//event.target.playVideo();
							self.timer=true;
							 setTimeout(updateTime, 300);
							  function updateTime() {
								try {self.setVariable("playertime",(self.player.getCurrentTime()).toString());} catch(e) {}
								if (self.player.getCurrentTime()>self.end){
										debug (self.end+" api time pause_1 "+event.target.getCurrentTime());
										self.timer=false;
										 if (self.onEnd){debug ("yt send stop_1");
											self.dispatchEvent({
											type: self.onEnd
											});	
										}  else {
											debug ("yt do pause_1");
											self.player.pauseVideo();
										}
									 }
							  else setTimeout(updateTime, 300);
							}
						}
				},
		  'onStateChange': function (event) {
			self.setVariable("playertime",(event.target.getCurrentTime()).toString());
			debug("playertimes onstatechange",(event.target.getCurrentTime()).toString());
			  debug ("ytstate"+event.data)
				if (event.data == YT.PlayerState.ENDED) {
					if ( event.target.getCurrentTime() < 1) {
						debug ("api time strange "+event.target.getCurrentTime());
						return;
					} else debug (self.end+" api time normal "+event.target.getCurrentTime())
					//self.started=false;
					if (self.onEnd){debug ("yt send stop");
						self.timer=false;
						self.dispatchEvent({
						type: self.onEnd
						});	
					}
					return;	
				} 
				
			},
			'onError':function (event) {
			  debug ("yterror"+event.data);
			  if (self.onEnd){debug ("yt on error send stop");
						self.timer=false;
						self.dispatchEvent({
						type: self.onEnd
						});	
					}
			}
		}
	});

	newid++;
	//self.invokeActions({type:"start"});
	/*function run(uri, player){
		player.src = "file:///media/buggyj/FIRELITE/iTunes/iTunes%20Music/The%20Velvet%20Underground/The%20Velvet%20Underground%20&%20Nico/01%20Sunday%20Morning.mp3"
        player.controls ="controls";
		player.load();
		player.play();
	//}*/

};
YTrawWidget.prototype.onPlayerReady = function (event) {
	self.ready = true;
	if (self.src) { //bj maybe add && selg
		var parms = {};
		if (self.start) {parms.startSeconds  =parseInt(self.start);debug("startsec "+parms.startSeconds);}
		//if (self.end) parms.endSeconds  =parseInt(self.end);
		if (self.src) parms.videoId  =self.src ;
		event.target.loadVideoById(parms);

	}
}
YTrawWidget.prototype.onPlayerStateChange = function (event) {
		if (player.getPlayerState() === 0)
		if (self.onEnd){
			self.dispatchEvent({
			type: self.onEnd
			});	
		}		
	};
YTrawWidget.prototype.ourmedia = function(event) {
		var tid;
		if ((tid = this.wiki.getTiddler(event.tiddler)) && (tid.hasField("_canonical_uri"))
			&& (tid.fields.type === "video/x-youtube")) {
			return true;
		}
		return false;
}
YTrawWidget.prototype.doAction = function(triggeringWidget,event) {
	if (event.type == "preStart" && this.currentplayer && !this.ourmedia(event)) { 

		this.hide();
		this.currentplayer = false;
		this.handlePauseEvent(event);
	}
	//if (event.type == "preStart"  && this.player.getPlayerState && this.player.getPlayerState()==1)	this.player.pauseVideo();
if (event.type == "start" && this.ourmedia(event)) {
		if (!this.currentplayer) {
			this.currentplayer = true;
			this.show();
		}
		this.handleStartEvent(event);

	}
	if (event.type == "final") this.handleStopEvent(event);
	return ; // Action was invoked
};
/*
Compute the internal state of the widget
*/
var xx=0;
YTrawWidget.prototype.execute = function() {
	// Get our parameters
	this.volume = 1.0; 
	this.onEnd = this.getAttribute("onEnd");
    this.deltas = this.getAttribute("deltas",10);
    this.startTime = this.getAttribute("startTime",0.0);
	this.height = this.getAttribute("height",320);
	this.width = this.getAttribute("width",640);
	this.onStart = this.getAttribute("onStart");
    // Construct the child widgets
	this.makeChildWidgets();debug("startytraw "+ this.onStart);
};

/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
YTrawWidget.prototype.refresh = function(changedTiddlers) {
var changedAttributes = this.computeAttributes();
if(changedAttributes.onEnd ) this.onEnd = this.getAttribute("onEnd");
	return this.refreshChildren(changedTiddlers);
};
try {
		YTrawWidget.prototype.config = $tw.wiki.getTiddlerData("$:/bj/modules/widgets/ytplayer/config.json");
		YTrawWidget.prototype.extractid = new RegExp(YTrawWidget.prototype.config.extractidregx);
	} catch(e) {
		debug("invalid config format");
		YTrawWidget.prototype.config = {};
		YTrawWidget.prototype.extractid = /(youtu\.be\/|[?&]v=)([^&]+)/;
	}
YTrawWidget.prototype.handleStartEvent = function(event) {
	var player = this.player;
	var self = this,additionalFields,tid;
	var current = this.src;debug("currenttrack "+current);
	var currenttime=player.getCurrentTime?player.getCurrentTime():0;debug("currenttime "+currenttime);
	additionalFields = event;
	if ((tid = this.wiki.getTiddler(additionalFields.tiddler)) && !!(tid.fields["_canonical_uri"])) {
		if (tid.fields["yt-id"]) self.src = tid.fields["yt-id"];
		else {
			var uri =  tid.fields["_canonical_uri"]||"";
			var exuri = uri.match(self.extractid);
			if (!!exuri && exuri.length == 3) {
				self.src = exuri[2];
			}
			else self.src ="";
		}
		self.start = tid.fields["starttime"]||tid.fields["yt-start"]||0;
		self.end   = tid.fields["endtime"]  ||tid.fields["yt-end"]  ||1000000;
		if (self.end === 0) self.end = 1000000; 
		/*if (tid.fields["yt-start"]) {
			self.start = tid.fields["yt-start"];
			debug ("has starttime " +self.start);
		} else self.start = 0;
		if (tid.fields["yt-end"]) {
			self.end = tid.fields["yt-end"];
			debug ("has endtime " +self.end);
		}else self.end = 1000000;*/
		self.equalize = tid.fields.equalize || 1.0;
		debug ("has equ " +self.equalize);
		
	}	

	try {

		if (self.ready) {
			debug("ready")
			if (this.src) { 
				debug("src")//bj maybe add && selgd
				if (current != this.src) {
					debug ("yt start ready");
					var parms = {};
					if (self.start) parms.startSeconds= parseInt(self.start);
					//if (self.end) parms.endSeconds  =parseInt(self.end);
					if (self.src) parms.videoId  =self.src ;
					player.loadVideoById(parms);
				} else 	if (currenttime - self.start>0.6|currenttime - self.start<-0.2){
					debug ("yt start ready2");
					var parms = {};
					if (self.start) parms.startSeconds= parseInt(self.start);
					//if (self.end) parms.endSeconds  =parseInt(self.end);
					if (self.src) parms.videoId  =self.src ;
					//player.loadVideoById(parms);
					//self.player.pauseVideo();
					self.player.seekTo(0.01+parseInt(self.start));debug("seekto "+self.start);
					if (self.player.getPlayerState()!=100)self.player.playVideo();
					/*self.player.playVideo();
					setTimeout(updateTime, 1000);
							  function updateTime() {
								if (self.player.getCurrentTime()>self.end){
										debug (self.end+" api time pause2 "+self.player.getCurrentTime());
										 self.player.pauseVideo();
										 if (self.onEnd){debug ("yt send stop");
											self.dispatchEvent({
											type: self.onEnd
											});	
										}
									 }
							  else setTimeout(updateTime, 300);}*/
				} else {
					debug("yt continue");
					if (self.player.getPlayerState()!=100)self.player.playVideo();
				}
				if (!self.timer) {
				self.timer=true
				setTimeout(
					function updateTime() {
						var delta = self.end-self.player.getCurrentTime();
						
						if (delta < 0.1 && (delta > -1)){
								debug (self.end+" api time pause3 "+self.player.getCurrentTime());
								 //self.player.pauseVideo();
								 self.timer=false;
								 if (self.onEnd){debug ("yt send stop");
									self.dispatchEvent({
									type: self.onEnd
									});	
								} else {
									debug ("yt do pause");
									self.player.pauseVideo();
								}
							 }
					  else if (self.timer) {setTimeout(updateTime, 300);debug(self.end+"yt setudatetimer"+self.player.getCurrentTime())};
					}, 300)};
				}
		} else debug ("yt start not ready");
		if (self.onStart){
			debug ("yt start sent");
			self.dispatchEvent({type: self.onStart});	
		}
		
	} catch(e) {debug (e)};
	

	return false;//always consume event
};
YTrawWidget.prototype.hide = function() {
	var player = this.player;
	player.setSize (1,1);
	this.cNode.setAttribute("hidden","true");
}
YTrawWidget.prototype.show = function() {
	var player = this.player;
	player.setSize (this.width,this.height);
	this.cNode.removeAttribute("hidden");
	}
YTrawWidget.prototype.handleStopEvent = function(event) {
	var player = this.player;
	try {
	player.stopVideo();
	this.timer=false
	debug("stopped at"+this.player.getCurrentTime().toString())
    } catch(e) {};
	return false;//always consume event
};
YTrawWidget.prototype.handlePlayEvent = function(event) {
	var player = this.player;
	debug("yt play event")
	try {	
	 {
		player.playVideo();
	}
    } catch(e) {};
	return false;//always consume event
};
YTrawWidget.prototype.handlePauseEvent = function(event) {
	var player = this.player;
	try {
	player.pauseVideo();
	this.timer=false;
	this.setVariable("playertime",this.player.getCurrentTime().toString());
	debug("paused at"+this.player.getCurrentTime().toString())
    } catch(e) {};
	return false;//always consume event
};


YTrawWidget.prototype.handleVolUpEvent = function(event) {
	var player = this.player;
	var self = this,additionalFields,track;
	try {
	if (this.volume < 0.91) {
		this.volume+=0.1;
		player.setVolume((this.volume * this.equalize)*100);
	}
	} catch(e) {};
	return false;//always consume event
};
YTrawWidget.prototype.handleVolDwnEvent = function(event) {
	var player = this.player;
	var self = this,additionalFields,track;
	try {
	if (this.volume>0.1) {
		this.volume-=0.1;
		player.setVolume((this.volume * this.equalize)*100);
	}
	} catch(e) {};
	return false;//always consume event
};
YTrawWidget.prototype.handleFFEvent = function(event) {
	var player = this.player;
	try {
		var currentTime = player.getCurrentTime();
		player.seekTo(currentTime +  (1.0*this.deltas), true);
	} catch(e) {};
	return false;//always consume event
};
YTrawWidget.prototype.handleRWEvent = function(event) {
	var player = this.player;
	try {
		var currentTime = player.getCurrentTime();
		player.seekTo(currentTime - this.deltas, true);
	} catch(e) {};
	return false;//always consume event
};
YTrawWidget.prototype.handleGoToEvent = function(event) {
	var player = this.player,time;
	try {
		time = event.paramObject.time||this.start;
		time = toTime(time);
		player.seekTo(time, true);
	} catch(e) {};
	return false;//always consume event
};
exports.ytrawplayer = YTrawWidget;

function toTime (time) {
var hms = time.split(":");
if (hms.length === 1) return time*1;
if (hms.length === 2) return ((hms[0]*60) +(hms[1]*1));
if (hms.length === 3) return ((((hms[0]*60) +(hms[1]*1))*60) + (hms[2]*1));
};
//----------------------------------------------

var YTWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

/*
Inherit from the base widget class
*/
YTWidget.prototype = new Widget();
if($tw.browser)  {
  var tag = document.createElement('script');
  window.onYouTubeIframeAPIReady =  function () {
	  YTWidget.prototype.ready = true;
	  $tw.wiki.setTextReference("$:/temp/ytplayerready","ready");
	  }
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);


 } 
/*
Render this widget into the DOM
*/
YTWidget.prototype.render = function(parent,nextSibling) {
	this.parentDomNode = parent;
	this.computeAttributes();
	this.execute();
	this.renderChildren(parent,nextSibling);
};

/*
Compute the internal state of the widget
*/
YTWidget.prototype.execute = function() {

	if (this.ready) {
		// Make the child widgets
		this.makeChildWidgets([{
			type: "ytrawplayer",
			attributes: this.parseTreeNode.attributes,
			children: this.parseTreeNode.children
		}]);
	}
};


/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
YTWidget.prototype.refresh = function(changedTiddlers) {
	var changedAttributes = this.computeAttributes();
	// Refresh if an attribute has changed, or the type associated with the target tiddler has changed
	if(changedTiddlers["$:/temp/ytplayerready"]) {
		this.refreshSelf();
		return true;
	} else {
		return this.refreshChildren(changedTiddlers);		
	}
};
YTWidget.prototype.doAction = function(triggeringWidget,event) {
	this.doActions(this,event);
	return; // Action was invoked
};

YTWidget.prototype.doActions = function(triggeringWidget,event) {
	for(var t=0; t<this.children.length; t++) {
		var child = this.children[t],
			childIsActionWidget = !!child.doAction;
		if(childIsActionWidget) {
			 child.doAction(triggeringWidget,event);
		}
	}
	return;
};
exports.ytplayeran = YTWidget;
exports.ytplayer = YTWidget;
})();
