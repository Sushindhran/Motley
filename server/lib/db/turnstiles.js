var TurnstileStream = require('././turnstile'),
    StationStream = require('././station'),
    CsvStream = require('././csv'),
    stripHeader = require('./stripHeader'),
    request = require('request'),
    fs = require('fs');

module.exports = function(path, callback, options) {
    if ( ! options ) { options = {}; }
    var stream;
    if ( fs.existsSync(path) ) {
        stream = fs.createReadStream(path)
                    .pipe(TurnstileStream())
                    .pipe(StationStream())
                    .pipe(CsvStream());
    } else {
        stream = request.get(path)
                    .pipe(TurnstileStream())
                    .pipe(StationStream())
                    .pipe(CsvStream());
    }

    if (callback) {
        var content = '';
        stream.on('data', function(data) {
            content += data;
        });
        stream.on('end', function() {
            if ( options.header === false ) {
                content = stripHeader(content);
            }
            callback(content);
        });
        stream.on('error', function(err) {
            console.error('error', err);
        });
    }

    return stream;
};
