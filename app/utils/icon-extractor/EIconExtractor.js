var fs = require('fs');
var child_process = require('child_process');
var _ = require('lodash');
var os = require('os');
var path = require('path');


function EIconExtractor() {

    this.getIcon = function (context, path, callback) {
        var iconDataBuffer = "";
        let iconProcess = child_process.spawn(getPlatformIconProcess(), ['-x']);
        var json = JSON.stringify({context: context, path: path}) + "\n";
        iconProcess.stdin.write(json);
        iconProcess.stdout.on('data', function (data) {

            var str = (new Buffer(data, 'utf8')).toString('utf8');

            iconDataBuffer += str;

            //Bail if we don't have a complete string to parse yet.
            if (!_.endsWith(str, '\n')) {
                return;
            }

            //We might get more than one in the return, so we need to split that too.
            _.each(iconDataBuffer.split('\n'), function (buf) {

                if (!buf || buf.length == 0) {
                    return;
                }

                try {
                    callback(JSON.parse(iconDataBuffer))
                } catch (ex) {
                    callback(null, ex)
                }

            });
        });
    };


    function getPlatformIconProcess() {
        if (os.type() == 'Windows_NT') {
            return path.join(__dirname, '/bin/IconExtractor.exe');
            //Do stuff here to get the icon that doesn't have the shortcut thing on it
        } else {
            throw('This platform (' + os.type() + ') is unsupported =(');
        }
    }

}

module.exports = new EIconExtractor();
