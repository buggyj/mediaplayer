#!/bin/bash

# add the root of tw5 
if [  -z "$TW5_ROOT" ]; then
    TW5_ROOT=../../../../../../..
fi

if [  ! -d "$TW5_ROOT" ]; then
    TW5_ROOT=../../../../../../..
fi

# add path to root of plugin
export TIDDLYWIKI_PLUGIN_PATH="${PWD%/*/*/*}"

node $TW5_ROOT/tiddlywiki.js \
	./demoeditytsimple \
	--verbose \
	--server 8088 $:/core/save/all \
	|| exit 1
