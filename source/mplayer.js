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
		if (self.onEnd){
			self.dispatchEvent({
			type: self.onEnd
			});	
		}		
	});
	
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

MPlayerWidget.prototype.ourmedia = function(event) {
		var tid;
		if ((tid = this.wiki.getTiddler(event.tiddler)) 
			&& (tid.fields.type === this.media)) {
			return true;
		}
		return false;
}
MPlayerWidget.prototype.invokeAction = function(triggeringWidget,event) {
	if (event.type == "preStart" && this.currentplayer && !this.ourmedia(event)) { 
		this.audiodomNode.setAttribute("hidden","true");
		this.cNode.setAttribute("hidden","true");
		this.currentplayer = false;
		this.handleStopEvent();
	}
	if (event.type == "start" && this.ourmedia(event)) {
		if (!this.currentplayer) {
			this.currentplayer = true;
			if (this.display =="yes") {
				this.audiodomNode.removeAttribute("hidden");
			}
			if (this.display !=="hide") {
				this.cNode.removeAttribute("hidden");
			}
		}
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
		return this.refreshChildren(changedTiddlers);
	}
};



MPlayerWidget.prototype.handleStartEvent = function(event) {
	var player = this.audiodomNode;
	var self = this,additionalFields,track,tid;

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
	player.src = track+"#t"+self.beginTime+ (self.playTime>0?","+self.stopTime:"");//if playtime <= 0 play till end
	player.controls ="controls";
	
	player.load();
	if (this.onStart){
		this.dispatchEvent({
		type: this.onStart
		});	
	}
	var canlisener = function()  { 
			player.currentTime =  self.beginTime;
			player.removeEventListener('canplay', arguments.callee);
			player.volume =  self.volume * self.equalize;
			console.log ("start player");
			
			self.audiodomNode.addEventListener('timeupdate', function updater(event) {
			self.setVariable("playertime",self.audiodomNode.currentTime.toString());
		    //console.log ("aud.cur"+self.audiodomNode.currentTime+"get"+ self.variables["playertime"].value);
			   if(self.playTime > 0 && self.audiodomNode.currentTime > self.beginTime + self.playTime){//if playtime <= 0 play till end
				   //console.log (self.audiodomNode.currentTime+"c-s"+(self.beginTime + self.playTime))
				   self.audiodomNode.removeEventListener('timeupdate',updater);
				   self.handleStopEvent(event);
			 
					if (self.onEnd){
						self.dispatchEvent({
						type: self.onEnd
						});	
					}
				}		
			});
		} 
	if (true) {
		player.addEventListener("canplay",canlisener);
		player.addEventListener("error",function()  { 
			player.currentTime =  self.beginTime;
			player.removeEventListener('canplay', canlisener);
			player.removeEventListener('error', arguments.callee);
			console.log ("error canplay player");
			if (self.onEnd){
							self.dispatchEvent({
							type: self.onEnd
							});	
			}
		})
	}
	if (!self.wait) player.play();
	} catch(e) {};
	

	return false;//always consume event
};
MPlayerWidget.prototype.handleStopEvent = function(event) {
	var player = this.audiodomNode;
	try {
	player.pause();
    player.currentTime = 0;	
    } catch(e) {};
	return false;//always consume event
};
MPlayerWidget.prototype.handlePlayEvent = function(event) {
	var player = this.audiodomNode;
	try {	
	if (player.paused) {
		console.log ("start play");
		player.play();
	}
    } catch(e) {console.log ("start fail");};
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
