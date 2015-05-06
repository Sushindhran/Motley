#!/bin/bash
# Shell script for running nginx on aws

DIRECTORY=/tmp/House-Hunting-Application

#Remove Symlink
if [ -d "$DIRECTORY" ]; then
  echo "Removing existing symlink";
  sudo rm ${DIRECTORY};
fi

# Stop nginx
sudo kill nginx;

# Create Symlink
ln -s `pwd`/target/ /tmp/House-Hunting-Application;

# start nginx
sudo nginx -c `pwd`/nginx.conf;