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
                if (!alreadyLogged(wifi) || hasBetterQuality(wifi)) {
                    store[wifi['mac']] = {
                        ssid: wifi['ssid'],
                        position: { lat: location.lat, lon: location.lon },
                        signal: wifi['signal_level'],
                        quality: qualityAsPercentage(wifi['quality']),
                        mac: wifi['mac'],
                        channel: wifi['channel'],
                        'protected': (wifi['encryption_key'] === 'on')
                    };
                }
            }
        }
        saveStore();
        startWifi();
    });
}

function qualityAsPercentage(string) {
    let parts = string.split('/');
    let percentage = Math.round(parts[0] / parts[1] * 100);
    return percentage;
}

function alreadyLogged(wifi) {
    let alreadyLogged = store[wifi['mac']] ? true : false;
    if (!alreadyLogged) {
        console.log('Found new wifi: ' + wifi['ssid']);
    }
    return alreadyLogged;
}

function hasBetterQuality(wifi) {
    let oldQuality = store[wifi['mac']]['quality'] || 0;
    let newQuality = qualityAsPercentage(wifi['quality']);
    if (newQuality > oldQuality) {
        console.log('Updated wifi: ' + wifi['ssid'] + ' [Quality: ' + oldQuality + ' -> ' + newQuality + ']');
    }
    return (newQuality > oldQuality);
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
    fs.writeFile('store.json', JSON.stringify(store, null, 2), (err) => {
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
