#!/bin/bash

# Set git user configuration
git config --global user.email "peterdesmondmoore@gmail.com"
git config --global user.name "P"

# Quick git pull with optional branch argument
if [ -z "$1" ]; then
    git pull
else
    git pull origin "$1"
fi

echo "Done!"


# enter ./pull.sh to run the script and pull changes from the remote repository