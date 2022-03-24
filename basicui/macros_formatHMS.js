/*\
title: $:/bj/modules/macros/formatHMS.js
type: application/javascript
module-type: macro

Macro to return a formatted version of the current time

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

/*
Information about this macro
*/
var fmtHMS = function (secs) {
var sec,min,hr,snds;

    sec = parseInt(secs, 10);
    hr   = Math.floor(sec/3600);
    hr = (hr < 10)?"0"+hr:hr;
    min = Math.floor(sec/60)%60;
     min = (min < 10)?"0"+min:min;
    snds = sec%60;
      snds = (snds < 10)?"0"+snds:snds;
    return [hr,min,snds].join(":");
}
exports.name = "formatHMS";

exports.params = [
	{name: "num"}
];

/*
Run the macro
*/
exports.run = function(num) {
	return fmtHMS(num);
};

})();
