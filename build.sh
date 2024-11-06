#!/bin/sh

while getopts "d" flag; do
 case $flag in
   d) # Handle the -d flag
   # run docker
   echo "Running in Docker..."
    # run docker
    docker run --rm -it -v `pwd`:/app --name sencha ghcr.io/bwbohl/sencha-cmd:latest /bin/bash -c "./build.sh testing; exit"
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

exit

