# Hotspotter

Gather data on nearby wifi hotspots and associated them with a GPS location

# Prerequisites

If you're using a raspberry pi, there's a `rpi-install.sh` script for installing dependancies via APT

- Linux OS
- GPS receiver
- Software:
 - gpsd
 - nodejs v5 & npm

# Usage

- `git clone https://github.com/joestrong/hotspotter.git`
- `cd hotspotter`
- `npm install`
- `node start.js` or `npm start`
- Wait for a GPS fix, then wifi scanning should start
- The file `store.json` will hold your results. This file will be loaded the next time you run
- Run a local webserver in the root folder to get access to a google map with plotted results

# To Do

- [x] Geolocate with USB GPS receiver
- [x] Scan wifi SSIDs nearby
- [x] Record of SSIDs with GPS location
- [x] Record whether wifi networks are protected or public
- [x] Adjust wifi location based on new data with stronger signal
- [x] Wait for GPS signal before logging any WiFi
- [x] Add a map UI for plotting the locations of found wifi
- [ ] Add config file for setting Google Map API Key, and for future settings
- [ ] Add configurable map filters
- [ ] Add configurable map colour coding (e.g. Highlight public wifi)
- [ ] Add configurable highlighting of specific wifi hotspots
- [x] Add conjoining of pins when overlapping occurs on map
- [x] Adjust wifi location based on signal strength, not connection quality
