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
 
function startGPS (callback) {
    gpsListener.connect();
    gpsListener.watch();
    gpsListener.on('TPV', function (tpvData) {
        if (tpvData.lat && tpvData.lon) {
            if (!location.lat || !location.lon) {
                location.lat = tpvData.lat;
                location.lon = tpvData.lon;
                callback();
            } else {
                location.lat = tpvData.lat;
                location.lon = tpvData.lon;
            }
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

function loadStore(callback) {
    fs.readFile('store.json', (err, data) => {
        if (err) {
            console.log('Could not load previous data [' + err + ']');
        }
        if (data) {
            store = JSON.parse(data);
        }
        callback();
    });
}

function saveStore() {
    fs.writeFile('store.json', JSON.stringify(store), (err) => {
        if (err) {
            console.log('Save error: ' + err);
        }
    });
}

console.log("Loading previous data..");
loadStore(function() {
    console.log("Getting GPS fix..");
    startGPS(function() {
        console.log('Got GPS fix: ' + location.lat + ' ' + location.lon);
        console.log('Scanning for wifi..');
        startWifi();
    });
});
