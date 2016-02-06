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
- Check `store.json` for your results. This file will be loaded the next time you run

# To Do

- [x] Geolocate with USB GPS receiver
- [x] Scan wifi SSIDs nearby
- [x] Record of SSIDs with GPS location
- [x] Record whether wifi networks are protected or public
- [ ] Adjust wifi location based on new data with stronger signal
- [x] Wait for GPS signal before logging any WiFi
- [ ] Add a map UI for plotting the locations of found wifi
