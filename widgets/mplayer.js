/*\
title: $:/bj/modules/widgets/mplayer.js
type: application/javascript
module-type: widget



\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */

var tosec = function(time) {
	var times;
	if (typeof(time) != 'string') return isNaN(time)?0:time;
	times = time.split(":");
	if (times.length == 3) {
		return parseFloat(times[0])*3600+parseFloat(times[1])*60+parseFloat(times[2])*1;
	}
	else if (times.length == 2) {
		return parseFloat(times[0])*60+parseFloat(times[1])*1;
	}
	else {
		var val = parseFloat(time);
		return isNaN(val)?0:val;
	}
}


var Widget = require("$:/core/modules/widgets/widget.js").widget;

var MPlayerWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
	this.addEventListeners([
	{type: "tm-mff", handler: "handleFFEvent"},
	{type: "tm-mrw", handler: "handleRWEvent"},
	{type: "tm-mstop", handler: "handleStopEvent"},
	{type: "tm-mpause", handler: "handlePauseEvent"},
	{type: "tm-mvup", handler: "handleVolUpEvent"},
	{type: "tm-msdwn", handler: "handleSdwnEvent"},
	{type: "tm-msup", handler: "handleSupEvent"},
	{type: "tm-mvdwn", handler: "handleVolDwnEvent"},
	{type: "tm-mply", handler: "handlePlayEvent"}]);
};

/*
Inherit from the base widget class
*/
MPlayerWidget.prototype = new Widget();



MPlayerWidget.prototype.tag = "audio";

MPlayerWidget.prototype.media = "audio/mp3";

MPlayerWidget.prototype.playerclass = "bjaudio";
/*
Render this widget into the DOM
*/
MPlayerWidget.prototype.render = function(parent,nextSibling) {
	var self = this;
	this.currentplayer = false;
	this.parentDomNode = parent;
	this.computeAttributes();
	this.execute();
	this.pNode = this.document.createElement(this.el);
	this.audiodomNode = this.document.createElement(this.tag);
	this.audiodomNode.addEventListener("ended",function (event) {
		console.log ("mplayer track ended ");
		if (self.onEnd && !this.finished){
			self.finished = true;
			self.dispatchEvent({
			type: self.onEnd
			});	
		}		
	});
	this.audiodomNode.className = this.playerclass;
	this.pNode.appendChild(this.audiodomNode);	
	this.cNode = this.document.createElement(this.el);
	this.pNode.appendChild(this.cNode);
	// Insert element
	parent.insertBefore(this.pNode,nextSibling);
		this.renderChildren(this.cNode,null);
	this.domNodes.push(this.pNode);
	this.audiodomNode.setAttribute("hidden","true");
	this.cNode.setAttribute("hidden","true");
};

MPlayerWidget.prototype.finished = false;
 
MPlayerWidget.prototype.ourmedia = function(event) {
		var tid  = this.wiki.getTiddler(event.tiddler);
		if ((tid) && (tid.fields.type === this.media)) {
			return true;
		}
		return false;
}
MPlayerWidget.prototype.doAction = function(triggeringWidget,event) {
	if (event.type == "preStart" && this.currentplayer && !this.ourmedia(event)) { 
		console.log ("mplayer preStart not ours");
		this.audiodomNode.setAttribute("hidden","true");
		this.cNode.setAttribute("hidden","true");
		this.currentplayer = false;
		this.handlePauseEvent();
	}
	if (event.type == "start" && this.ourmedia(event)) {
		console.log ("mplayer start ours");
		if (!this.currentplayer) {
			this.currentplayer = true;
			if (this.display =="yes") {
				this.audiodomNode.removeAttribute("hidden");
			}
			if (this.display !=="hide") {
				this.cNode.removeAttribute("hidden");
			}
		}
		this.finished = false;
		this.handleStartEvent(event);
	}

	return true; // Action was invoked
};
/*
Compute the internal state of the widget
*/
MPlayerWidget.prototype.execute = function() {
	// Get our parameters
	this.playbackRate = parseFloat(this.getAttribute("pback",1.0));
	this.volume = 1.0
	this.onStart = this.getAttribute("onStart");
	this.onEnd = this.getAttribute("onEnd");
    this.deltas =parseFloat(this.getAttribute("deltas",10.0));
    this.startTime =this.getAttribute("startTime",0.0);
    this.endTime =this.getAttribute("endTime",-1);    
    this.display =this.getAttribute("display","yes");
    this.durationTime = this.getAttribute("durationTime",100000);
    this.important = this.getAttribute("important");
    this.wait = this.getAttribute("wait");
    this.el = this.getAttribute("el","div");
    this.playerclass = this.getAttribute("class",this.playerclass);
    
    // Construct the child widgets
	this.makeChildWidgets();
};

/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
MPlayerWidget.prototype.refresh = function(changedTiddlers) {
	var changedAttributes = this.computeAttributes();
	if(changedAttributes["startTime"] ) {
		this.refreshSelf();
		return true;
	}
	else {
        if(changedAttributes["onEnd"]) this.onEnd = this.getAttribute("onEnd");
		return this.refreshChildren(changedTiddlers);
	}
};

MPlayerWidget.prototype.updater = function updater(event) {

	this.setVariable("playertime",this.audiodomNode.currentTime.toString());
	//console.log ("aud.cur"+this.audiodomNode.currentTime+"get"+ this.variables["playertime"].value);
	   if(this.playTime > 0 && this.audiodomNode.currentTime > this.beginTime + this.playTime){//if playtime <= 0 play till end
		   //console.log (this.audiodomNode.currentTime+"c-s"+(this.beginTime + this.playTime));

		  // this.audiodomNode.removeEventListener('timeupdate',this.updater);
		   this.handlePauseEvent(event);
	 
			if (this.onEnd && !this.finished){
				this.finished = true;
				this.dispatchEvent({
				type: this.onEnd
				});	
			}
		}		
	};

MPlayerWidget.prototype.handleStartEvent = function(event) {
	var player = this.audiodomNode;
	var self = this,additionalFields,track,tid;
	var canlisener = function()  { 
		console.log ("entered canlisener");
		player.currentTime =  self.beginTime;
		player.removeEventListener('canplay', arguments.callee);
		player.volume =  self.volume * self.equalize;
		console.log ("start player");
		self.audiodomNode.addEventListener('timeupdate', self.updater.bind(self));
		player.play();
	} 
	{
		additionalFields = event;
		if ((tid = this.wiki.getTiddler(additionalFields.tiddler)) ) {
			if (tid.hasField("_canonical_uri")) {
				track = tid.fields._canonical_uri;
			}
			else {
				track = "data:" + tid.fields.type + ";base64," + tid.fields.text;
			}						
			self.equalize = tid.fields.equalize || 1.0;
			//important when values set in widget override those in tid
			self.beginTime = self.important?tosec(self.startTime):tosec(tid.fields.starttime || self.startTime);//note case of letters
			self.stopTime =   self.important?tosec(self.endTime)  :tosec(tid.fields.endtime   || self.endTime);
			if (self.stopTime > 0) {
				self.playTime = self.stopTime - self.beginTime;
			} else {
				self.playTime = self.important?tosec(self.durationTime):tosec(tid.fields.durationtime || self.durationTime);
				self.stopTime = self.beginTime + self.playTime;
			}
			
		}

	}
	try {
		if (player.src != track){
			player.src = track;//if playtime <= 0 play till end
			player.controls ="controls";
			
			player.load();
			player.addEventListener("canplay",canlisener);
			player.addEventListener("error",function()  { 
				//player.currentTime =  self.beginTime;
				player.removeEventListener('canplay', canlisener);
				player.removeEventListener('error', arguments.callee);
				console.log ("error canplay player");
				if (self.onEnd){
					self.dispatchEvent({
					type: self.onEnd
					});	
				}
			})
		} else {
			if (player.currentTime - self.beginTime>0.5||player.currentTime - self.beginTime<0){
				
				player.currentTime =  self.beginTime;
				//player.addEventListener("canplay",canlisener);
			} 
			player.volume =  self.volume * self.equalize;	
			if (!self.wait) player.play();
		}
		if (this.onStart){
			this.dispatchEvent({
			type: this.onStart
			});	
		}

	} catch(e) {console.log(e);};
	
	return false;//always consume event
};
MPlayerWidget.prototype.handleStopEvent = function(event) {
	var player = this.audiodomNode;
console.log("mplayer stopping");
this.finished = true;
	try {
	player.pause();
    player.currentTime = 0;	
   player.removeEventListener('timeupdate',this.updater);
    } catch(e) {};
	return false;//always consume event
};
MPlayerWidget.prototype.handlePlayEvent = function(event) {
	var player = this.audiodomNode;
	try {	
	if (player.paused) {
		console.log ("mplayer start play ");
		player.play();
	}
    } catch(e) {console.log ("mplayer start fail");};
	return false;//always consume event
};
MPlayerWidget.prototype.handlePauseEvent = function(event) {
	var player = this.audiodomNode;
	try {
	if (!player.paused) {
		player.pause();
	}
	} catch(e) {};
	return false;//always consume event
};

MPlayerWidget.prototype.handleVolUpEvent = function(event) {
	var player = this.audiodomNode;
	var self = this,additionalFields,track;
	try {
	if (this.volume < 0.91) {
		this.volume+=0.1;
		player.volume = this.volume * this.equalize;
	}
	} catch(e) {};
	return false;//always consume event
};
MPlayerWidget.prototype.handleVolDwnEvent = function(event) {
	var player = this.audiodomNode;
	var self = this,additionalFields,track;
	try {
	if (this.volume>0.1) {
		this.volume-=0.1;
		player.volume = this.volume * this.equalize;
	}
	} catch(e) {};
	return false;//always consume event
};
MPlayerWidget.prototype.handleFFEvent = function(event) {
	var player = this.audiodomNode;
	try {
	player.currentTime += this.deltas;
	} catch(e) {};
	return false;//always consume event
};
MPlayerWidget.prototype.handleRWEvent = function(event) {
	var player = this.audiodomNode;
	try {
	player.currentTime -= this.deltas;
	} catch(e) {};
	return false;//always consume event
};
MPlayerWidget.prototype.handleSupEvent = function(event) {
	var player = this.audiodomNode;
	var self = this,additionalFields,track;
	try {
	if (this.playbackRate < 3.9) {
		this.playbackRate += 0.1;
		player.playbackRate = this.playbackRate;
	}
	} catch(e) {};
	return false;//always consume event
};
MPlayerWidget.prototype.handleSdwnEvent = function(event) {
	var player = this.audiodomNode;
	var self = this,additionalFields,track;
	try {
	if (this.playbackRate > 0.5) {
		this.playbackRate -= 0.1;
		player.playbackRate = this.playbackRate;
	}
	} catch(e) {};
	return false;//always consume event
};
exports.mplayer = MPlayerWidget;

})();
