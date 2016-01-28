var scanner = require('node-wifiscanner');

scanner.scan(function(err, data) {
    if (err) {
        console.log('Error: ' + err);
        return;
    }
    if (Array.isArray(data)) {
        for (var i in data) {
            console.log(data[i]['ssid']);
        }
    }
});
