#!/bin/sh

while getopts "d" flag; do
 case $flag in
   d) # Handle the -d flag
   # run docker
   echo "Running in Docker..."
    # remove -d from the list of input arguments
    shift $((OPTIND-1)) 
    # set a variable OPTIONS with the remaining input arguments to pass to the build command
    OPTIONS=${@} 
    # run docker
    docker run --rm -it -v `pwd`:/app --name sencha ghcr.io/bwbohl/sencha-cmd:latest ./build.sh $OPTIONS
   exit
   ;;   
   \?)
   # Handle invalid options
   ;;
 esac
done


# cleaning the build dir
sencha ant clean

# building the app
sencha app build $1

# get additional stuff for exist-db
ant build-plus

# build xar
ant xar