/*\
title: $:/bj/modules/widgets/staticplayer.js
type: application/javascript
module-type: widget



\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */


var Widget = require("$:/core/modules/widgets/widget.js").widget;

var SPlayerWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
	this.addEventListeners([
	{type: "tm-mstop", handler: "handleStopEvent"},
	{type: "tm-mply", handler: "handlePlayEvent"}]);
};

/*
Inherit from the base widget class
*/
SPlayerWidget.prototype = new Widget();

/*
Render this widget into the DOM
*/
SPlayerWidget.prototype.render = function(parent,nextSibling) {
	var self = this;
	this.currentplayer = false;
	this.parentDomNode = parent;
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

SPlayerWidget.prototype.ourmedia = function(event) {
		var tid;
		if ((tid = this.wiki.getTiddler(event.tiddler)) 
			&& (tid.fields.type === "text/vnd.tiddlywiki")) {
			return true;
		}
		return false;
}
SPlayerWidget.prototype.doAction = function(triggeringWidget,event) {
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
SPlayerWidget.prototype.execute = function() {
	// Get our parameters
    this.timeOut =this.getAttribute("timeOut",2000);//ms
   	this.onStart = this.getAttribute("onStart");
	this.onEnd = this.getAttribute("onEnd");
    // Construct the child widgets
	this.makeChildWidgets();
};
SPlayerWidget.prototype.handleOnTimeOut = function(event) {
		// Check for an empty list
	this.timerId = null;
	return false; // dont propegate
}
/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
SPlayerWidget.prototype.refresh = function(changedTiddlers) {
	var changedAttributes = this.computeAttributes();
	if(changedAttributes["timeOut"] ) {
		this.refreshSelf();
		return true;
	}
	else {
		return this.refreshChildren(changedTiddlers);
	}
};
SPlayerWidget.prototype.handleStartEvent = function(event) {
	var player = this.audiodomNode;
	var self = this,additionalFields,track,tid;
    var duration = this.timeOut
	{
		additionalFields = event;
		if ((tid = this.wiki.getTiddler(additionalFields.tiddler))) {
			if (tid.hasField("st-duration")) {
				duration= parseInt(tid.fields["st-duration"])*1000;
			}
		}	
	}
	try {
		if(this.timerId) {
			clearTimeout(this.timerId);
		}
		this.timerId = setTimeout(	function (){	// Check for an empty list
			self.timerId = null;
					if (self.onEnd){
					self.dispatchEvent({
					type: self.onEnd
					});	
				}
			return false; // dont propegate
		},duration);
		
		if (this.onStart){
			this.dispatchEvent({
			type: this.onStart
		});	
	}
	} catch(e) {};
	

	return false;//always consume event
};
SPlayerWidget.prototype.handleStopEvent = function(event) {
		if(this.timerId) {
			clearTimeout(this.timerId);
		}
		this.timerId = null;
};

exports.staticplayer = SPlayerWidget;

})();
