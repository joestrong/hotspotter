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
            let gotFix = !location.lat || !location.lon;
            location.lat = tpvData.lat;
            location.lon = tpvData.lon;
            if (gotFix) {
                callback();
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
                var wifi = data[i];
                if (!store[wifi['mac']]) {
                    store[wifi['mac']] = {
                        ssid: wifi['ssid'],
                        position: location,
                        signal: wifi['signal_level'],
                        mac: wifi['mac'],
                        channel: wifi['channel'],
                        protected: wifi['encryption_key'] === 'on' ? true : false
                    };
                    console.log('Found wifi: ' + wifi['ssid']);
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
