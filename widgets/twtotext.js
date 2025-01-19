/*\
title: $:/bj/modules/macros/tiddlertexttotext.js
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

exports.name = "tiddlertexttotext";

exports.params = [
	{name: "text"},{name:"mode"}
];
var getValueAsHtmlWikified = function(text,mode) {
	return $tw.wiki.renderText("text/html","text/vnd.tiddlywiki",text,{
		parseAsInline: mode !== "block",
		parentWidget: this
	})
};

exports.run = function(text) {

    let lines = text.replaceAll("$:/","dollarcolonslash").split("\n")
    lines = lines.map((text)=>{
        const tempElement = document.createElement('div')
        tempElement.innerHTML = getValueAsHtmlWikified(text,"block")
        let textContent = tempElement.innerText || tempElement.textContent ||  '';//add a . if there is not a .?!
        textContent = textContent.trim();
        if (!textContent.match(/[.!?]$/)&&textContent.match(/\S/)) textContent += "."
        return textContent
    })
    console.log(lines.join("\n"))
    return lines.join("\n")
};

})();
