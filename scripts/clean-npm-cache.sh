#!/bin/sh

watchman watch-del-all && rm -rf $TMPDIR/react-* && rm -rf node_modules/ && npm cache clean --force && npm install