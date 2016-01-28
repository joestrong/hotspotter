var gpsd = require('node-gpsd');
var gpsData = null;

var gpsListener = new gpsd.Listener({
    port: 2947,
    hostname: 'localhost'
});
 
function startGPS () {
    gpsListener.connect();
    gpsListener.watch();
    gpsListener.on('TPV', function (tpvData) {
        gpsData = tpvData;
        console.log(gpsData.lat + " " + gpsData.lon);
    });
}
 
function stopGPS () {
    gpsListener.unwatch();
    gpsListener.disconnect();
}
 
startGPS();
