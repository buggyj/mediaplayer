/*\
title: $:/bj/modules/widgets/talkplayer.js
type: application/javascript
module-type: widget



\*/
(function(){

/*jslint node: false, browser: true */
/*global $tw: false */

if($tw.browser && !$tw.node) {
var debug = require("$:/bj/modules/widgets/log.js").bjtplayerlog();
var Widget = require("$:/core/modules/widgets/widget.js").widget;
const glan = lang => window.speechSynthesis.getVoices().find(voice => voice.lang.startsWith(lang));
//console.log(window.speechSynthesis.getVoices());
var TPlayerWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
	this.addEventListeners([
	{type: "tm-mstop", handler: "handleStopEvent"},
	{type: "tm-mpause", handler: "handlePauseEvent"},
	{type: "tm-mply", handler: "handlePlayEvent"}]);
};

/*
Inherit from the base widget class
*/
TPlayerWidget.prototype = new Widget();

TPlayerWidget.prototype.debug = function() {debug.apply(null,arguments);}
/*
Render this widget into the DOM
*/
TPlayerWidget.prototype.render = function(parent,nextSibling) {
	var self = this;
	this.currentplayer = false;
	this.paused = false;
	this.parentDomNode = parent;
	this.watchdog
	this.computeAttributes();
	this.execute();
	this.pNode = this.document.createElement("div");

	this.cNode = this.document.createElement("div");
	this.pNode.appendChild(this.cNode);
	// Insert element
	parent.insertBefore(this.pNode,nextSibling);
	this.renderChildren(this.cNode,null);
	this.domNodes.push(this.pNode);
	this.pNode.setAttribute("hidden","true");
	
};

TPlayerWidget.prototype.ourmedia = function(event) {
		var tid;
		if ((tid = this.wiki.getTiddler(event.tiddler)) 
			&& (tid.fields.type === this.type)) {
			return true;
		}
		return false;
}
TPlayerWidget.prototype.doAction = function(triggeringWidget,event) {
	if (event.type == "preStart" && this.currentplayer && !this.ourmedia(event)) { 
		this.domNodes[0].setAttribute("hidden","true");
		this.currentplayer = false;
		this.handleStopEvent();
	}
	if (event.type == "start" && this.ourmedia(event)) {
		if (!this.currentplayer) {
			this.currentplayer = true;
			this.domNodes[0].removeAttribute("hidden");
		}
		this.handleStartEvent(event);
	}

	return true; // Action was invoked
};
/*
Compute the internal state of the widget
*/
TPlayerWidget.prototype.execute = function() {
	// Get our parameters
    this.timeOut =this.getAttribute("timeOut",2000);//ms
   	this.onStart = this.getAttribute("onStart");
	this.onEnd = this.getAttribute("onEnd");
	this.field = this.getAttribute("field","text");
	this.lang = this.getAttribute("lang","en")
	this.type = this.getAttribute("type","text/plain")
	this.macro = this.getAttribute("macro",null)
    // Construct the child widgets
	this.makeChildWidgets();
};
TPlayerWidget.prototype.handleOnTimeOut = function(event) {
		// Check for an empty list
	this.timerId = null;
	return false; // dont propegate
}
/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
TPlayerWidget.prototype.refresh = function(changedTiddlers) {
	var changedAttributes = this.computeAttributes();
	if(changedAttributes["timeOut"] ) {
		this.refreshSelf();
		return true;
	}
	else {
		return this.refreshChildren(changedTiddlers);
	}
};


TPlayerWidget.prototype.handleStartEvent = function(event) {this.debug ("start")
	var player = this.audiodomNode;
	var self = this,additionalFields,track,tid;
	var summary="error no found";
	var lang = this.lang
    var duration = this.timeOut
	{
		additionalFields = event;
		if ((tid = this.wiki.getTiddler(additionalFields.tiddler))) {
			summary= tid.fields[this.field];
			if (tid.fields.lang) lang = tid.fields.lang
		}	
	}
	clearInterval(this.watchdog);
	speechSynthesis.cancel();
	if (this.macro) summary = $tw.macros[this.macro].run(summary)
    else {
         summary = summary.trim()
        if (!summary.match(/[.!?]$/)&&summary.match(/\S/)) summary += "."
    }
 const chunks = summary.match(/(?:[^.?!]|(?:\.\d+)|(?:\.\w+))+[.?!](?=\s|$)/mg)||""// Split into sentences
 let words
chunks.forEach(chunk => {
    words = new SpeechSynthesisUtterance(chunk);self.debug(chunk)
    words.voice=glan(lang);
    speechSynthesis.speak(words);
});
// this world.onend event is called in some browsers when cancel() is called when word is playin - not in chome
// this is a hack to  stop this, the onend is only attached to a final blank utterance 
words = new SpeechSynthesisUtterance(" ");
    words.voice=glan(lang);
    speechSynthesis.speak(words);
// the above hack may be remove if browsers become consistent in their behavoir     

// the watchdog is needed as there is no final() method when this widget is removed, 
// so instead a check is periodically done to see if it need to stop.
	this.watchdog = setInterval(() => {
		debug('.')
		if (!(self.currentplayer && self.domNodes[0] && self.domNodes[0].isConnected)) {
			clearInterval(self.watchdog);
			speechSynthesis.cancel();
		}
	}, 500);
	var hndler=(event) => {
		clearInterval(this.watchdog);
		event.target.removeEventListener(event.type, hndler);
		self.debug(
		`Utterance has finished being spoken after ${event.elapsedTime} seconds.`,
		)
		if (self.onEnd && self.domNodes[0] && self.domNodes[0].isConnected) 
			self.dispatchEvent({type: self.onEnd})	
	}
	words.addEventListener("end", hndler);

		if (this.onStart){
		this.dispatchEvent({
		type: this.onStart
		});	
			}
	this.paused = false;
	return false;//always consume event
};

TPlayerWidget.prototype.handleStopEvent = function(event) {this.debug ("cancel")
 clearInterval(this.watchdog);
 speechSynthesis.cancel(); this.paused = false;
};
TPlayerWidget.prototype.handlePauseEvent = function(event) {this.debug ("pause")
speechSynthesis.pause();
this.paused=true;
};

TPlayerWidget.prototype.handlePlayEvent = function(event) {this.debug ("play",this.paused)
	try {	
	if (this.paused) {
		this.debug ("resume start play ");
		speechSynthesis.resume();
		this.paused = false;
	}
    } catch(e) {this.debug ("mplayer start fail");};
	return false;//always consume event
};
exports.talkplayer = TPlayerWidget;
}
})();
