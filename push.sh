#!/bin/bash

# Set git user configuration
git config --global user.email "peterdesmondmoore@gmail.com"
git config --global user.name "P"

# Quick git push with custom message
if [ -z "$1" ]; then
    git add .
    git commit -m "Update changes"
    git push
else
    git add .
    git commit -m "$1"
    git push
fi

echo "Done!"

# enter ./push.sh to run the script and push changes to git 
#chmod +x push.sh