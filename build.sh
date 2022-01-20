#!/bin/sh

# cleaning the build dir
sencha ant clean

# building the app
sencha app build $1

# get additional stuff for exist-db
ant build-plus

# build xar
ant xar