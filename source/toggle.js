/*\
title: $:/bj/modules/widgets/toggle.js
type: application/javascript
module-type: widget

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var modname = "toggle";

//-------this block enables the default params values and name change --------
// *** add this var above changing to you 'default external name for the widget
//var modname = "mywidget";
/////////// ----------------- invariant block --------------------- ///////////
var Widget,api,defaults;
try {
	Widget = require("$:/b/modules/widget/baswidget.js").basewidget;
	defaults = $tw.utils.makevars(module);
	modname  = $tw.utils.widgetrename(module,modname);
} catch(e) {
	Widget = require("$:/core/modules/widgets/widget.js").widget;
	defaults = [];
} 
/////////// --------------- end invariant block ------------------ ///////////
// *** add this protoype below the definition of your version of 'thisWidget'
// *** changing the widget name to the actual name *** 

//thisWidget.prototype = new Widget();
//------------------------------ end --------------------------------------


var ToggleWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
	this.addEventListeners([
		{type: "bjm-toggle", handler: "handleToggle"}
	]);
};

/*
Inherit from the base widget class
*/
ToggleWidget.prototype = new Widget();

/*
Render this widget into the DOM
*/
ToggleWidget.prototype.render = function(parent,nextSibling) {
	this.parentDomNode = parent;
	this.computeAttributes();
	this.execute();
	this.renderChildren(parent,nextSibling);
};

/*
Compute the internal state of the widget
*/
ToggleWidget.prototype.execute = function() {
	// Get our parameters
	this.setName = this.getAttribute("name","currentTiddler");
	this.primeValue = this.getAttribute("primeValue");
	this.altValue = this.getAttribute("altValue");
	// Set context variable
	this.setVariable(this.setName,this.primeValue);
	// Construct the child widgets
	this.makeChildWidgets();
};
ToggleWidget.prototype.handleToggle = function(event) {
	console.log("got toggle");
    this.executeToggle();console.log("passed toggle");
	return false; // dont propegate
}
ToggleWidget.prototype.executeToggle = function() {

    var val = this.altValue,nextSibling;
	this.altValue = this.primeValue;
	this.primeValue = val;
	nextSibling = this.findNextSiblingDomNode();
	this.removeChildDomNodes();
	this.setVariable(this.setName,val);
	this.makeChildWidgets();
	this.renderChildren(this.parentDomNode,nextSibling);
};

/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
ToggleWidget.prototype.refresh = function(changedTiddlers) {
	var changedAttributes = this.computeAttributes();
	if(changedAttributes.name  || changedAttributes.primeValue || changedAttributes.altValue) {
		this.refreshSelf();
		return true;
	} else {
		return this.refreshChildren(changedTiddlers);
	}
};


exports[modname] = ToggleWidget;

})();
