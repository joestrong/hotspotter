"use strict";

var gpsd = require('node-gpsd');
var scanner = require('node-wifiscanner');
var fs = require('fs');

var location = {};
var store = {};

var gpsListener = new gpsd.Listener({
    port: 2947,
    hostname: 'localhost'
});
 
function startGPS () {
    gpsListener.connect();
    gpsListener.watch();
    gpsListener.on('TPV', function (tpvData) {
        if (tpvData.lat && tpvData.lon) {
            if (!location.lat || !location.lon) {
                console.log('Got GPS fix: ' + tpvData.lat + ' ' + tpvData.lon);
            }
            location.lat = tpvData.lat;
            location.lon = tpvData.lon;
        }
    });
}
 
function stopGPS () {
    gpsListener.unwatch();
    gpsListener.disconnect();
}
 
function startWifi() {
    scanner.scan(function(err, data) {
        if (err) {
            console.log('Error: ' + err);
            return;
        }
        if (Array.isArray(data)) {
            for (var i in data) {
                if (!store[data[i]['ssid']]) {
                    store[data[i]['ssid']] = {
                        ssid: data[i]['ssid'],
                        position: location,
                        signal: data[i]['signal_level'],
                        mac: data[i]['mac'],
                        channel: data[i]['channel'],
                        protected: data[i]['encryption_key'] === 'on' ? true : false
                    };
                    console.log('Found wifi: ' + data[i]['ssid']);
                }
            }
        }
        saveStore();
        setTimeout(startWifi, 1000);
    });
}

function loadStore() {
    fs.readFile('store.json', (err, data) => {
        if (err) {
            console.log('Load error: ' + err);
        }
        if (data) {
            store = JSON.parse(data);
            console.log('Loaded previous data');
        }
    });
}

function saveStore() {
    fs.writeFile('store.json', JSON.stringify(store), (err) => {
        if (err) {
            console.log('Save error: ' + err);
        }
    });
}

console.log("Initialising");
loadStore();
startGPS();
startWifi();
