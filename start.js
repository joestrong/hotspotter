"use strict";

var gpsd = require('node-gpsd');
var scanner = require('node-wifiscanner');
var fs = require('fs');
var colors = require('colors');

var location = {};
var store = {};
var config = require('./config.js');

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
                if (!alreadyLogged(wifi) || hasBetterSignal(wifi)) {
                    store[wifi['mac']] = {
                        ssid: wifi['ssid'],
                        position: { lat: location.lat, lon: location.lon },
                        signal: parseInt(wifi['signal_level']),
                        quality: qualityAsPercentage(wifi['quality']),
                        mac: wifi['mac'],
                        channel: wifi['channel'],
                        'protected': (wifi['encryption_key'] === 'on'),
                        security: workOutSecurity(wifi)
                    };
                    addTags(wifi);
                } else {
                    checkForMissingData(wifi);
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

function workOutSecurity(wifi) {
    return (wifi['encryption_key'] === 'on') ? (wifi['encryption_type'] ? wifi['encryption_type'] : 'WEP') : '';
}

function alreadyLogged(wifi) {
    let alreadyLogged = store[wifi.mac] ? true : false;
    if (!alreadyLogged) {
        console.log('Found new wifi: ' + wifi.ssid);
        if(workOutSecurity(wifi) === 'WEP') {
            console.log(('Found WEP! SSID: ' + wifi.ssid).black.bgYellow);
        }
    }
    return alreadyLogged;
}

function hasBetterQuality(wifi) {
    let oldQuality = store[wifi.mac]['quality'] || 0;
    let newQuality = qualityAsPercentage(wifi['quality']);
    if (newQuality > oldQuality) {
        console.log('Updated wifi: ' + wifi.ssid + ' [Quality: ' + oldQuality + ' -> ' + newQuality + ']');
    }
    return (newQuality > oldQuality);
}

function hasBetterSignal(wifi) {
    let oldSignal = parseInt(store[wifi.mac]['signal']) || -150;
    let newSignal = parseInt(wifi.signal_level);
    // Sometimes you get signal of 0, not sure why, ignore it
    if (newSignal == 0) {
        return false;
    }
    if (newSignal > oldSignal) {
        console.log('Updated wifi: ' + wifi.ssid + ' [Signal: ' + oldSignal + ' -> ' + newSignal + ']');
        return true;
    }
    return false;
}

function checkForMissingData(wifi) {
    let isProtected = store[wifi.mac].protected;
    let security = store[wifi.mac].security;
    if (isProtected === true && !security) {
        store[wifi.mac].security = workOutSecurity(wifi);
        console.log('Updated wifi: ' + wifi.ssid + ' [Added Security Record]');
        if(workOutSecurity(wifi) === 'WEP') {
            console.log(('Found WEP! SSID: ' + wifi.ssid).black.bgYellow);
        }
    }
    addTags(wifi);
}

function addTags(wifi) {
    let tags = config.tags;
    for (let tag in tags) {
        var tagMatchers = tags[tag];
        for (let i in tagMatchers) {
            var tagMatcher = tagMatchers[i];
            if (wifi.ssid.indexOf(tagMatcher) !== -1 && (!store[wifi.mac].tags || store[wifi.mac].tags.indexOf(tag) === -1)) {
                if (!store[wifi.mac].tags) {
                    store[wifi.mac].tags = [];
                }
                store[wifi.mac].tags.push(tag);
                console.log('Updated wifi: ' + wifi.ssid + ' [Added tag: ' + tag + ']');
            }
        }
    }
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
