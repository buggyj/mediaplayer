/*\
title: $:/bj/modules/widgets/ytplayer.js
type: application/javascript
module-type: widget

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget; 

var fakeytplayerWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};


/*
Inherit from the base widget class
*/
fakeytplayerWidget.prototype = new Widget();
//copyvarWidget.prototype = Object.create(Widget.prototype)


/*
Render this widget 
*/

fakeytplayerWidget.prototype.render = function(parent,nextSibling) {
};



exports.ytplayer = fakeytplayerWidget;
exports.ytplayeran = fakeytplayerWidget;
})();
