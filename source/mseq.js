/*\
title: $:/bj/modules/widgets/msequence.js
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
	{type: "tm-mply-restart", handler: "handleReStart"},
	{type: "tm-mply-stick", handler: "handleStick"},
	{type: "tm-mply-unstick", handler: "handleUnStick"},
	{type: "tm-mply-forcenext", handler: "handleForceNext"},
	{type: "tm-mply-next", handler: "handleNextEvent"},
	{type: "tm-mply-move", handler: "handleMoveEvent"},
	{type: "tm-mply-caught", handler: "handleCaughtEvent"},
	{type: "tm-mply-prev", handler: "handlePrevEvent"}]);
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
	if (this.autoStart === "yes")this.doStart();
};

/*
Compute the internal state of the widget
*/
MPlayListWidget.prototype.execute = function() {
	// Compose the list elements
	this.list = this.getTiddlerList();
	this.sticky = false;
	this.n =-1;
	this.autoStart = this.getAttribute("autoStart")
	this.onEnd = this.getAttribute("onEnd");
	this.onEndParam = this.getAttribute("onEndParam");
    this.syntid = this.getAttribute("syntid");
    this.mode = this.getAttribute("mode");
    this.earlyset = this.getAttribute("earlyset");
    this.permissive = this.getAttribute("permissive","false");
		// Construct the child widgets
	this.makeChildWidgets();
};


MPlayListWidget.prototype.getTiddler = function(param) {
	if (this.permissive === "true") return true;
	return this.wiki.getTiddler(param);
}

MPlayListWidget.prototype.getTiddlerList = function() {
	var defaultFilter = "[tag["+this.getAttribute("targetTag")+"]]";
	return this.wiki.filterTiddlers(this.getAttribute("filter",defaultFilter),this);
};
/*
Refresh the widget by ensuring our attributes are up to date
*/
MPlayListWidget.prototype.refresh = function(changedTiddlers) {
	var changedAttributes = this.computeAttributes();
	//alert(this.attributes.filter);
	if(changedAttributes.targetTag || changedAttributes["$tiddler"]) {
		this.list = this.getTiddlerList();
		this.n =-1;
		if (this.autoStart === "yes")this.doStart();
		//this.updatelist();
	}
	return this.refreshChildren(changedTiddlers);
};

/*
Invoke the action associated with this widget
*/

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

MPlayListWidget.prototype.settid = function(i){
	this.wiki.setTextReference(this.syntid,this.list[i],this.getVariable("currentTiddler"));
					
	if (this.syntid.substring(0,17) === "$:/temp/__priv__/") {
		this.dispatchEvent({
			type: "tm-bj-playerRfresh",
			paramObject : {title: this.syntid}
		});
	}	
}
	
MPlayListWidget.prototype.doMove = function(loc) {
	console.log ("doMove "+this.n);
	if (this.mode == "dynamic") this.updatelist();
	if(this.list.length === 0) {
		//do nothing
	} else {
		var tid,i;
		for (i = 0; i < this.list.length; i++) {
			if ((loc == this.list[i]) && (tid = this.getTiddler(this.list[i]))) {
				this.doActions(this,{type:"preStart",tiddler: this.list[i]});
				if (this.earlyset === "true")  {
					this.settid(i);
				}
				this.caught = null;
				this.doActions(this,{type:"start",tiddler: this.list[i]});
				if (this.caught) {
					this.settid(i);
					break;
				}
			}
		}
		this.n = (i == this.list.length ? this.list.length - 1 : i);
	}
}
MPlayListWidget.prototype.doStart = function() {
	console.log ("doStart "+this.n);
	if (this.mode == "dynamic") this.updatelist();
	this.n = -1;
	if(this.list.length === 0) {
		//do nothing
	} else {
		var tid,i;
			if ((this.onEnd) && (this.n == this.list.length -1)){console.log("onend "+this.n);
			if (this.onEndParam) {
				this.dispatchEvent({
				type: this.onEnd,
				param: this.onEndParam
				});
			} else {
				this.dispatchEvent({
				type: this.onEnd
				});
			}	
			return;
		}
		if (this.n == this.list.length -1) { alert (this.list.length);
			//self.doActions(event);//BJ fix!
			return;
		};
		for (i = this.n + 1; i < this.list.length; i++) {
			if ((tid = this.getTiddler(this.list[i]))) {
				this.doActions(this,{type:"preStart",tiddler: this.list[i]});
				this.caught = null;
				if (this.earlyset === "true")  {
					this.settid(i);
				}
				this.doActions(this,{type:"start",tiddler: this.list[i]});
				if (this.caught) { console.log("dostart caught "+i)
					this.settid(i);
					break;
				}
			}
		}
		this.n = (i == this.list.length ? this.list.length - 1 : i);

	}
}

MPlayListWidget.prototype.doNext = function() {
	console.log ("doNext "+this.n);
	if (this.mode == "dynamic") this.updatelist();
	if(this.list.length === 0) {
		//do nothing
	} else {
		var tid,i;
		if ((this.onEnd) && (this.n == this.list.length -1)){
			if (this.onEndParam) {
				this.dispatchEvent({
				type: this.onEnd,
				param: this.onEndParam
				});
			} else {
				this.dispatchEvent({
				type: this.onEnd
				});
			}	
			return;
		}
		for (i = this.n + 1; i < this.list.length; i++) {
			if ((tid = this.getTiddler(this.list[i]))) {
				this.doActions(this,{type:"preStart",tiddler: this.list[i]});
				if (this.earlyset === "true")  {
					this.settid(i);
				}
				this.caught = null;
				this.doActions(this,{type:"start",tiddler: this.list[i]});
				if (this.caught) {
					this.settid(i);
					break;
				}
			}
		}
		
		this.n = (i == this.list.length ? this.list.length - 1 : i);
				

	}
}
MPlayListWidget.prototype.doPrev = function() {
	console.log ("doPrev "+this.n);
	if (this.mode == "dynamic") this.updatelist();
	if(this.list.length === 0) {
		//do nothing
	} else {
		var tid,i;
		
		for (i = this.n - 1 ; i >=0; i--) {
			if ((tid = this.getTiddler(this.list[i]))) {
				this.doActions(this,{type:"preStart",tiddler: this.list[i]});
				if (this.earlyset === "true")  {
					this.settid(i);
				}
				this.caught = null;
				this.doActions(this,{type:"start",tiddler: this.list[i]});
				if (this.caught) {
					this.settid(i);
					break;
				}
			}
		}
		this.n = (i == -1? 0 : i);
	}
}

MPlayListWidget.prototype.doAgain = function() {
	console.log ("doAgain "+this.n);	
	if (this.mode == "dynamic") this.updatelist();
	if(this.list.length === 0) {
		//do nothing
	} else {
		var tid,i;
		
		for (i = this.n; i >=0; i--) {
			if ((tid = this.getTiddler(this.list[i]))) {
				this.doActions(this,{type:"preStart",tiddler: this.list[i]});
                if (this.earlyset === "true")  {
					this.settid(i);
				}
				this.caught = null;
				this.doActions(this,{type:"start",tiddler: this.list[i]});
				if (this.caught) {
					this.settid(i);
				}
			}
		}
		this.n = (i == -1? 0 : i);
	}
}
MPlayListWidget.prototype.handleCaughtEvent = function(event) {
		// Check for an empty list
	this.caught = true;
	return false; // dont propegate
}
MPlayListWidget.prototype.handleReStart = function(event) {
		// Check for an empty list
	this.doStart();
	return false; // dont propegate
}
MPlayListWidget.prototype.handleNextEvent = function(event) {

    if (this.mode == "dynamic") this.updatelist();
	if (this.sticky && this.n==(this.list.length-1)) this.doAgain();
	else this.doNext();
	return false; // dont propegate
}
MPlayListWidget.prototype.handleForceNext = function(event) {
		// Check for an empty list
	this.doNext();
	return false; // dont propegate
}
MPlayListWidget.prototype.handleStick = function(event) {
		// Check for an empty list
	this.sticky=true;
	return false; // dont propegate
}
MPlayListWidget.prototype.handleUnStick = function(event) {
		// Check for an empty list
	this.sticky=false;
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

MPlayListWidget.prototype.doActions = function(triggeringWidget,event) {
	var handled = false;
	// For each child widget
	for(var t=0; t<this.children.length; t++) {
		var child = this.children[t],
			childIsActionWidget = !!child.doAction;
		if(childIsActionWidget) {
			 child.doAction(triggeringWidget,event);
		}
	}
	return;
};

MPlayListWidget.prototype.allowActionPropagation = function() {
	return false;
};
exports["msequence"] = MPlayListWidget;

})();
