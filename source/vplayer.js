/*\
title: $:/bj/modules/widgets/vplayer.js
type: application/javascript
module-type: widget



\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */



var Widget = require("$:/bj/modules/widgets/mplayer.js").mplayer;

var MPlayerWidget = function(parseTreeNode,options) {
	Widget.call(this,parseTreeNode,options);
}


/*
Inherit from the base widget class
*/
MPlayerWidget.prototype = Object.create(Widget.prototype);

MPlayerWidget.prototype.tag = "video";

MPlayerWidget.prototype.media = "video/mp4";

exports.vplayer = MPlayerWidget;

})();
