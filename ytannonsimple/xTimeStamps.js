/*\
title: $:/bj/modules/macros/xTimeStamps.js
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

exports.name = "xTimeStamps";

exports.params = [
	{name: "text"},
    {name: "format"}
];

/*
Run the macro
*/
exports.run = function(text, format) {

	return text.replace(/(\d?\d?:?\d?\d:\d\d)/g, format);
};

})();
