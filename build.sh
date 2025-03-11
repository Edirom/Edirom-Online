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

# Welcome
echo "*********************************************"
echo "* Welcome to the Edirom Online build script *"
echo "*********************************************"
echo ""

# set shell to exit if any command fails
set -e

# cleaning the build dir
echo "Cleaning…"
echo "---------"
sencha ant clean

# building the app
echo "Building Edirom Online frontend…"
echo "-----------------"
sencha app build $1

# get additional stuff for exist-db
echo "Copying additional resources to build directory…"
echo "------------------------------------------------"
ant build-plus

# build xar
echo "Packaging Edirom Online as XAR archive…"
echo "---------------------------------------"
ant xar
