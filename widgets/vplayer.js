/*\
title: $:/bj/modules/widgets/vplayer.js
type: application/javascript
module-type: widget



\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */



var debug = require("$:/bj/modules/widgets/log.js").bjvplayerlog();
var Widget = require("$:/bj/modules/widgets/mplayer.js").mplayer;

var MPlayerWidget = function(parseTreeNode,options) {
	Widget.call(this,parseTreeNode,options);
}


/*
Inherit from the base widget class
*/
MPlayerWidget.prototype = Object.create(Widget.prototype);

MPlayerWidget.prototype.debug = function () {debug.apply(null,arguments);}

MPlayerWidget.prototype.tag = "video";

MPlayerWidget.prototype.media = "video/mp4";

MPlayerWidget.prototype.playerclass = "bjvideo";

exports.vplayer = MPlayerWidget;

})();
