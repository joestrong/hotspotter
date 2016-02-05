#!/bin/bash
sudo apt-get update

sudo apt-get install -y gpsd gpsd-clients

# NodeJS 5.5.0
wget https://nodejs.org/dist/latest-v5.x/node-v5.5.0-linux-armv6l.tar.gz
tar xzf node-v5.5.0-linux-armv6l.tar.gz 
rm node-v5.5.0-linux-armv6l.tar.gz
sudo mv node-v5.5.0-linux-armv6l /opt/nodejs
sudo ln -s /opt/nodejs/bin/node /usr/local/bin/node
sudo ln -s /opt/nodejs/bin/npm /usr/local/bin/npm
