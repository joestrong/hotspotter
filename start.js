var gpsd = require('node-gpsd');
var scanner = require('node-wifiscanner');

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
                        position: location
                    };
                    console.log('Found wifi: ' + data[i]['ssid']);
                }
            }
        }
        setTimeout(startWifi, 1000);
    });
}

console.log("Initialising");
startGPS();
startWifi();
