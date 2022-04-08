/*\
title: $:/bj/modules/widgets/log.js
type: application/javascript
module-type: utils

These functions can be called before creating widgets,
ie when the name of the widget is exported, and so cannot be
included in the basewidget.

\*/
(function(){
/*jslint node: true, browser: true */
/*global $tw: false */

var mseq = function () {};
var vplayer = function () {};
var mplayer = function () {};
var ytplayer = function () {};

exports.bjmseqlog = function () {
	return function () {mseq.apply(console,arguments); }
}
exports.bjvplayerlog = function () {
	return function () {vplayer.apply(console,arguments); }
}
exports.bjmplayerlog = function () {
	return function () {mplayer.apply(console,arguments); }
}
exports.bjytplayerlog = function () {
	return function () {ytplayer.apply(console,arguments); }
}

if ($tw.browser){
	if (!window.$bjlogs) window.$bjlogs = {};
	$bjlogs.setmseq = function (on) { 
			if (on === 0) mseq = function () {};
			else mseq = console.log;
			return on;
	}
	$bjlogs.setvplayer = function (on) { 
			if (on === 0) vplayer = function () {};
			else vplayer = console.log;
			return on;
	}
	$bjlogs.setmplayer = function (on) { 
			if (on === 0) mplayer = function () {};
			else mplayer = console.log;
			return on;
	}
	$bjlogs.setytplayer = function (on) { 
			if (on === 0) ytplayer = function () {};
			else ytplayer = console.log;
			return on;
	}
}
})();

