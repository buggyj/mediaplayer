/*\
title: $:/bj/modules/widgets/plylist.js
type: application/javascript
module-type: widget



\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var MPlayListWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
		this.addEventListeners([
	{type: "tm-ply-next", handler: "handleNextEvent"},
	{type: "tm-ply-move", handler: "handleMoveEvent"},
	{type: "tm-ply-prev", handler: "handlePrevEvent"}]);
};
/*
Inherit from the base widget class
*/
MPlayListWidget.prototype = new Widget();

/*
Render this widget into the DOM
*/
MPlayListWidget.prototype.render = function(parent,nextSibling) {
	this.parentDomNode = parent;
	this.computeAttributes();
	this.execute();
	this.renderChildren(parent,nextSibling);
};

/*
Compute the internal state of the widget
*/
MPlayListWidget.prototype.execute = function() {
	// Compose the list elements
	this.list = this.getTiddlerList();
	this.n =-1;
    this.syntid = this.getAttribute("syntid");
    this.mode = this.getAttribute("mode");
		// Construct the child widgets
	this.makeChildWidgets();
};

MPlayListWidget.prototype.getTiddlerList = function() {
	var defaultFilter = "[tag["+this.getVariable("currentTiddler")+"]]";
	return this.wiki.filterTiddlers(this.getAttribute("filter",defaultFilter),this);
};
/*
Refresh the widget by ensuring our attributes are up to date
*/
MPlayListWidget.prototype.refresh = function(changedTiddlers) {
	var changedAttributes = this.computeAttributes();
	//alert(this.attributes.filter);
	if(changedAttributes.filter || changedAttributes["$tiddler"]) {
		this.refreshSelf();
		return true;
	}
	return this.refreshChildren(changedTiddlers);
};

/*
Invoke the action associated with this widget
*/
MPlayListWidget.prototype.invokeMsgAction = function(param) {
	this.doNext();
	return param;
};
MPlayListWidget.prototype.updatelist = function() {
	var list,n,i,curr = this.list[this.n];
	list = this.getTiddlerList();
	for ( i = 0; i < list.length; i++) {
		if (list[i] === curr) break;
	}
	if (i === list.length) i = 0;
	this.n = i;
	this.list = list;
}
	
MPlayListWidget.prototype.doMove = function(loc) {
	if (this.mode == "dynamic") this.updatelist();
	if(this.list.length === 0) {
		//do nothing
	} else {
		var tid,uri,i;
		for (i = 0; i < this.list.length; i++) {
			if ((loc == this.list[i])) {
				this.wiki.setTextReference(this.syntid,this.list[i],this.getVariable("currentTiddler"));
				break;
			}
		}
		this.n = (i == this.list.length ? this.list.length - 1 : i);
	}
}
MPlayListWidget.prototype.doStart = function() {
	if (this.mode == "dynamic") this.updatelist();
	this.n = -1;
	if(this.list.length === 0) {
		//do nothing
	} else {
		var tid,uri,i;
		if (this.n == this.list.length -1) {
			self.invokeActions(this,event);
			return;
		};
		for (i = this.n + 1; i < this.list.length; i++) {
			if ((tid = this.wiki.getTiddler(this.list[i])) ) {
				this.wiki.setTextReference(this.syntid,this.list[i],this.getVariable("currentTiddler"));
				break;
			}
		}
		this.n = (i == this.list.length ? this.list.length - 1 : i);
	}
}
MPlayListWidget.prototype.doNext = function() {
	if (this.mode == "dynamic") this.updatelist();
	if(this.list.length === 0) {
		//do nothing
	} else {
		var tid,uri,i;
		if (this.n == this.list.length -1) {
			self.invokeActions(this,event);
			return;
		}
		for (i = this.n + 1; i < this.list.length; i++) {
			if ((tid = this.wiki.getTiddler(this.list[i]))) {
				this.wiki.setTextReference(this.syntid,this.list[i],this.getVariable("currentTiddler"));
				break;
			}
		}
		this.n = (i == this.list.length ? this.list.length - 1 : i);
	}
}
MPlayListWidget.prototype.doPrev = function() {
	if (this.mode == "dynamic") this.updatelist();
	if(this.list.length === 0) {
		//do nothing
	} else {
		var tid,uri,i;
		
		for (i = this.n - 1 ; i >=0; i--) {
			if ((tid = this.wiki.getTiddler(this.list[i])) && (tid.hasField("_canonical_uri"))) {
				uri = tid.fields._canonical_uri;
				this.dispatchEvent({
					type: "tm-mstart",
					paramObject : {track : uri,equalize : tid.fields.equalize}
				});
				this.wiki.setTextReference(this.syntid,this.list[i],this.getVariable("currentTiddler"));
				
				if (this.syntid.substring(0,13) === "$:/temp/priv/") {
					this.dispatchEvent({
						type: "tm-bj-playerRfresh",
						paramObject : {title: this.syntid}
					});
				}
				break;
			}
		}
		this.n = (i == -1? 0 : i);
	}
}
MPlayListWidget.prototype.handleNextEvent = function(event) {
		// Check for an empty list
	this.doNext();
	return false; // dont propegate
}
MPlayListWidget.prototype.handleMoveEvent = function(event) {
		// Check for an empty list
	this.doMove(event.navigateTo);
	return false; // dont propegate
}
MPlayListWidget.prototype.handlePrevEvent = function(event) {
		// Check for an empty list
	this.doPrev();
	return false; // dont propegate
	
	
}
exports["action-playlist2"] = MPlayListWidget;

})();
